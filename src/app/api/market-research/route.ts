import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const NATIONAL_ROLES = ["MCP", "MCVP", "ADMIN"];

function getCorsHeaders(req: NextRequest) {
  const origin = req.headers.get("origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
  };
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(req) });
}

interface ResearchItem {
  name: string;
  phone: string;
  address: string;
  website?: string;
}

export async function GET(req: NextRequest) {
  const cors = getCorsHeaders(req);
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz! Lütfen CRM sistemine giriş yaptığınızdan emin olun." }, { status: 401, headers: cors });

  const user = session.user as any;
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || "";
  const keyword = searchParams.get("keyword") || "";

  if (!city.trim() || !keyword.trim()) {
    return NextResponse.json({ error: "Lütfen şehir ve anahtar kelime belirtin." }, { status: 400, headers: cors });
  }

  const queryKey = `${city.trim()}_${keyword.trim()}`.toLowerCase();

  // 1. Kota Bilgisini Al / Oluştur
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  let quota = await prisma.apiQuotaUsage.findUnique({ where: { monthKey } });
  if (!quota) {
    quota = await prisma.apiQuotaUsage.create({
      data: { monthKey, count: 0, maxLimit: 4000 }
    });
  }

  // 2. Cache Kontrolü (30 gün)
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
  const cached = await prisma.marketResearchCache.findUnique({ where: { queryKey } });

  let items: ResearchItem[] = [];
  let isFromCache = false;

  if (cached && cached.createdAt > thirtyDaysAgo) {
    try {
      items = JSON.parse(cached.results);
      isFromCache = true;
    } catch (e) {
      console.error("Cache ayrıştırma hatası:", e);
    }
  }

  // 3. Cache'de yoksa veya eskiyse Arama Yap
  if (!isFromCache) {
    if (quota.count >= quota.maxLimit) {
      return NextResponse.json({
        error: "Aylık ücretsiz API kotanız (4000) dolmuştur. Bütçe aşımı olmaması için yeni dış aramalar engellendi.",
        quota: { used: quota.count, maxLimit: quota.maxLimit, fromCache: false }
      }, { status: 429, headers: cors });
    }

    // Google Places API kontrolü
    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (googleApiKey) {
      try {
        const queryStr = `${keyword} in ${city}, Turkey`;
        const googleRes = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(queryStr)}&key=${googleApiKey}&language=tr`);
        const googleData = await googleRes.json();

        if (googleData.results) {
          items = googleData.results.slice(0, 25).map((r: any) => ({
            name: r.name || "",
            phone: r.formatted_phone_number || "",
            address: r.formatted_address || city,
          }));
        }

        // Kotayı artır
        await prisma.apiQuotaUsage.update({
          where: { monthKey },
          data: { count: { increment: 1 } }
        });
        quota.count += 1;
      } catch (err) {
        console.error("Google Places arama hatası:", err);
      }
    } else {
      // Google API key yoksa veya ücretsiz fallback OpenStreetMap Nominatim
      try {
        const queryStr = `${keyword} ${city}`;
        const osmRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryStr)}&format=json&addressdetails=1&extratags=1&limit=25`, {
          headers: { 'User-Agent': 'AIESEC-CRM-B2B/1.0' }
        });
        const osmData = await osmRes.json();

        if (Array.isArray(osmData)) {
          items = osmData.map((r: any) => ({
            name: r.display_name?.split(',')[0] || r.name || keyword,
            phone: r.extratags?.contact?.phone || r.extratags?.phone || "",
            address: r.display_name || city,
          }));
        }
      } catch (err) {
        console.error("OSM arama hatası:", err);
      }
    }

    // Bulunan sonuçları önbelleğe kaydet
    if (items.length > 0) {
      const nowTs = Math.floor(Date.now() / 1000);
      await prisma.marketResearchCache.upsert({
        where: { queryKey },
        update: { results: JSON.stringify(items), createdAt: nowTs },
        create: { queryKey, results: JSON.stringify(items), createdAt: nowTs }
      });
    }
  }

  // 4. CRM Eşleşme (Çakışma) Kontrolü
  const allCompanies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      phone: true,
      status: true,
      chapter: true,
      updatedAt: true,
      managers: { select: { id: true, name: true } }
    }
  });

  const enrichedItems = items.map(item => {
    const normPhone = item.phone?.replace(/[\s\-\(\)\+]/g, '').replace(/^90/, '').replace(/^0/, '') || '';
    const normName = item.name?.toLowerCase().trim() || '';

    const match = allCompanies.find(c => {
      const cPhone = (c.phone || '').replace(/[\s\-\(\)\+]/g, '').replace(/^90/, '').replace(/^0/, '');
      const phoneMatch = normPhone && cPhone && (normPhone.includes(cPhone) || cPhone.includes(normPhone)) && normPhone.length >= 7;
      const cName = (c.name || '').toLowerCase().trim();
      const nameMatch = normName && cName && (normName === cName || (normName.length > 5 && cName.includes(normName)) || (cName.length > 5 && normName.includes(cName)));
      return phoneMatch || nameMatch;
    });

    let matchStatus: 'NONE' | 'SAME_CHAPTER' = 'NONE';
    let matchedCompany = null;

    if (match) {
      // Kullanıcı kuralı: "başka şubede kayıtlı olduğu gözükmesin"
      const isUserChapter = NATIONAL_ROLES.includes(user.role) || match.chapter === user.chapter;
      if (isUserChapter) {
        matchStatus = 'SAME_CHAPTER';
        matchedCompany = {
          id: match.id,
          name: match.name,
          status: match.status,
          chapter: match.chapter,
          managers: match.managers,
          lastActivityDate: match.updatedAt
        };
      }
    }

    return {
      ...item,
      matchStatus,
      matchedCompany
    };
  });

  return NextResponse.json({
    items: enrichedItems,
    quota: {
      used: quota.count,
      maxLimit: quota.maxLimit,
      fromCache: isFromCache,
    }
  }, { headers: cors });
}

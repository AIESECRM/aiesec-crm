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

export async function GET(req: NextRequest) {
  const cors = getCorsHeaders(req);
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401, headers: cors });

  const user = session.user as any;
  const { searchParams } = new URL(req.url);
  const chapter = searchParams.get("chapter");
  const status = searchParams.get("status");

  const where: any = {};

  if (!NATIONAL_ROLES.includes(user.role)) {
    where.chapter = user.chapter;
  } else if (chapter) {
    where.chapter = chapter;
  }

  if (status) where.status = status;

  const companies = await prisma.company.findMany({
    where,
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { contacts: true, activities: true, offers: true } },
      managers: { select: { id: true, name: true, image: true, role: true, chapter: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ companies }, { headers: cors });
}

export async function POST(req: NextRequest) {
  const cors = getCorsHeaders(req);
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401, headers: cors });

    const user = session.user as any;
    const { name, phone, email, status, notes, chapter, documentUrl, documentName, products, linkedinUrl } = await req.json();

    if (!name) return NextResponse.json({ error: "Şirket adı zorunludur!" }, { status: 400, headers: cors });

    const companyChapter = NATIONAL_ROLES.includes(user.role) ? chapter : user.chapter;

    // Şube ve telefon bazlı çift kayıt engeli
    if (companyChapter) {
      const existingInChapter = await prisma.company.findMany({
        where: { chapter: companyChapter }
      });
      const normPhone = (phone || '').replace(/[\s\-\(\)\+]/g, '').replace(/^90/, '').replace(/^0/, '');
      const normName = name.toLowerCase().trim();

      const duplicate = existingInChapter.find(c => {
        const cPhone = (c.phone || '').replace(/[\s\-\(\)\+]/g, '').replace(/^90/, '').replace(/^0/, '');
        const phoneMatch = normPhone && cPhone && (normPhone.includes(cPhone) || cPhone.includes(normPhone)) && normPhone.length >= 7;
        const cName = (c.name || '').toLowerCase().trim();
        const nameMatch = normName === cName;
        return phoneMatch || nameMatch;
      });

      if (duplicate) {
        return NextResponse.json({
          error: `Bu işletme (${duplicate.name}) şubenizde zaten kayıtlı! (Durum: ${duplicate.status})`
        }, { status: 409, headers: cors });
      }
    }

    const company = await prisma.company.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        status: status || "NO_ANSWER",
        notes: notes || null,
        chapter: companyChapter || null,
        products: products || null,
        linkedinUrl: linkedinUrl || null,
        createdById: parseInt(user.id, 10),
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
        managers: {
          connect: { id: parseInt(user.id, 10) }
        },
        documents: documentUrl ? {
          create: {
            name: documentName || 'Belge',
            url: documentUrl,
            createdAt: Math.floor(Date.now() / 1000)
          }
        } : undefined
      },
    });

    return NextResponse.json({ success: true, company }, { headers: cors });
    
  } catch (error: any) {
    console.error("Şirket ekleme hatası:", error);
    return NextResponse.json(
      { error: "Şirket eklenirken bir hata oluştu.", details: error.message }, 
      { status: 500, headers: cors }
    );
  }
}

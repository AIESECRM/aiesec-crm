import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ────────────────────────────────────────────────
// Sütun başlığı → alan adı eşleştirme tablosu
// ────────────────────────────────────────────────
const COLUMN_MAP: Record<string, string> = {
  // name
  name: "name",
  "şirket adı": "name",
  "sirket adi": "name",
  "şirket": "name",
  sirket: "name",
  company: "name",
  "company name": "name",

  // phone
  phone: "phone",
  telefon: "phone",
  "tel no": "phone",
  tel: "phone",

  // email
  email: "email",
  "e-posta": "email",
  eposta: "email",
  mail: "email",

  // category
  category: "category",
  sektör: "category",
  sektor: "category",
  kategori: "category",
  sector: "category",
  industry: "category",

  // location
  location: "location",
  konum: "location",
  şehir: "location",
  sehir: "location",
  city: "location",
  adres: "location",

  // website
  website: "website",
  web: "website",
  "web sitesi": "website",
  url: "website",

  // linkedinUrl
  linkedin: "linkedinUrl",
  linkedinurl: "linkedinUrl",
  "linkedin url": "linkedinUrl",
  "linkedin adresi": "linkedinUrl",

  // status
  status: "status",
  durum: "status",

  // notes
  notes: "notes",
  notlar: "notes",
  not: "notes",
  note: "notes",

  // products
  products: "products",
  ürünler: "products",
  urunler: "products",
  product: "products",
  ürün: "products",
  urun: "products",
};

const VALID_STATUSES = ["POSITIVE", "NEGATIVE", "NO_ANSWER", "CALL_AGAIN", "MEETING_PLANNED"];
const STATUS_TR_MAP: Record<string, string> = {
  pozitif: "POSITIVE",
  negatif: "NEGATIVE",
  "cevap yok": "NO_ANSWER",
  "tekrar ara": "CALL_AGAIN",
  "toplantı planlandı": "MEETING_PLANNED",
  "toplanti planlandi": "MEETING_PLANNED",
};

function normalizeStatus(val: string): string {
  const upper = val.toUpperCase().trim();
  if (VALID_STATUSES.includes(upper)) return upper;
  const lower = val.toLowerCase().trim();
  return STATUS_TR_MAP[lower] || "NO_ANSWER";
}

function normalizeProducts(val: string): string {
  const VALID = ["GTE", "GTA", "EWA", "GV"];
  return val
    .toUpperCase()
    .split(/[,;|\/]/)
    .map((p) => p.trim())
    .filter((p) => VALID.includes(p))
    .join(",");
}

// ────────────────────────────────────────────────
// GET — Boş şablon Excel dosyası döner
// ────────────────────────────────────────────────
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

  const wb = XLSX.utils.book_new();
  const headers = [
    "name",
    "phone",
    "email",
    "category",
    "location",
    "website",
    "linkedin",
    "status",
    "notes",
    "products",
  ];
  const exampleRow = [
    "Örnek Şirket A.Ş.",
    "+90 212 555 00 00",
    "info@ornek.com",
    "Teknoloji",
    "İstanbul",
    "https://ornek.com",
    "https://linkedin.com/company/ornek",
    "NO_ANSWER",
    "Görüşme yapılacak",
    "GTE,GTA",
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);

  // Sütun genişlikleri
  ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 4, 18) }));

  XLSX.utils.book_append_sheet(wb, ws, "Şirketler");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="sirket-sablon.xlsx"',
    },
  });
}

// ────────────────────────────────────────────────
// POST — Dosyayı parse et, şirketleri ekle
// ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

    const user = session.user as any;
    const NATIONAL_ROLES = ["MCP", "MCVP", "ADMIN"];

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const chapterOverride = formData.get("chapter") as string | null;

    if (!file) return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buffer, { type: "buffer" });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];

    // JSON'a çevir (boş satırları atla)
    const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

    if (rows.length === 0) {
      return NextResponse.json({ error: "Dosya boş veya okunamadı." }, { status: 400 });
    }

    // Sütun başlıklarını normalize et
    const normalizedRows = rows.map((row) => {
      const mapped: Record<string, string> = {};
      for (const [key, val] of Object.entries(row)) {
        const normalKey = COLUMN_MAP[key.toLowerCase().trim()];
        if (normalKey) {
          mapped[normalKey] = String(val).trim();
        }
      }
      return mapped;
    });

    const companyChapter = NATIONAL_ROLES.includes(user.role) ? chapterOverride : user.chapter;

    let added = 0;
    const errors: { row: number; name: string; reason: string }[] = [];

    for (let i = 0; i < normalizedRows.length; i++) {
      const row = normalizedRows[i];
      const name = row.name;

      if (!name) {
        errors.push({ row: i + 2, name: "—", reason: "Şirket adı boş" });
        continue;
      }

      try {
        await prisma.company.create({
          data: {
            name,
            phone: row.phone || null,
            email: row.email || null,
            category: row.category || null,
            location: row.location || null,
            website: row.website || null,
            linkedinUrl: row.linkedinUrl || null,
            status: (normalizeStatus(row.status || "") as any) || "NO_ANSWER",
            notes: row.notes || null,
            products: row.products ? normalizeProducts(row.products) : null,
            chapter: (companyChapter as any) || null,
            createdById: parseInt(user.id, 10),
            createdAt: Math.floor(Date.now() / 1000),
            updatedAt: Math.floor(Date.now() / 1000),
            managers: {
              connect: { id: parseInt(user.id, 10) },
            },
          },
        });
        added++;
      } catch (err: any) {
        errors.push({ row: i + 2, name, reason: err.message || "Bilinmeyen hata" });
      }
    }

    return NextResponse.json({ success: true, added, errors, total: rows.length });
  } catch (error: any) {
    console.error("Bulk import hatası:", error);
    return NextResponse.json(
      { error: "İçe aktarma sırasında hata oluştu.", details: error.message },
      { status: 500 }
    );
  }
}

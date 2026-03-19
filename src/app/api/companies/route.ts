import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const NATIONAL_ROLES = ["MCP", "MCVP", "ADMIN"];

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

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

  return NextResponse.json({ companies });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

    const user = session.user as any;
    const { name, phone, email, status, notes, chapter, documentUrl, documentName } = await req.json();

    if (!name) return NextResponse.json({ error: "Şirket adı zorunludur!" }, { status: 400 });

    const companyChapter = NATIONAL_ROLES.includes(user.role) ? chapter : user.chapter;

    const company = await prisma.company.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        status: status || "NO_ANSWER",
        notes: notes || null,
        chapter: companyChapter || null,
        // HATA BURADAYDI: user.id string olduğu için integer'a çevirmemiz gerekiyor
        createdById: parseInt(user.id, 10), 
        // Şemada default(0) olduğu için şu anki zamanı manuel atamakta fayda var
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

    return NextResponse.json({ success: true, company });
    
  } catch (error: any) {
    // Eğer veritabanı veya başka bir aşamada hata çıkarsa sunucunun çökmesini engelliyoruz
    console.error("Şirket ekleme hatası:", error);
    return NextResponse.json(
      { error: "Şirket eklenirken bir hata oluştu.", details: error.message }, 
      { status: 500 }
    );
  }
}

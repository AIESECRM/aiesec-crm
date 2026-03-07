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
      creator: { select: { id: true, name: true } },
      _count: { select: { contacts: true, activities: true, offers: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ companies });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

  const user = session.user as any;
  const { name, phone, email, status, notes, chapter } = await req.json();

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
      createdById: user.id,
    },
  });

  return NextResponse.json({ success: true, company });
}
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const NATIONAL_ROLES = ["MCP", "MCVP", "ADMIN"];
const CHAPTER_ROLES = ["LCVP", "LCP"];

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

  const user = session.user as any;
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const type = searchParams.get("type");

  const where: any = {};

  if (companyId) {
    where.companyId = companyId;
  } else if (NATIONAL_ROLES.includes(user.role)) {
    // Tüm şubeleri görebilir
  } else if (CHAPTER_ROLES.includes(user.role)) {
    // Sadece kendi şubesi
    where.company = { chapter: user.chapter };
  } else {
    // TM/TL sadece kendi aktiviteleri
    where.userId = user.id;
  }

  if (type) where.type = type;

  const activities = await prisma.activity.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, role: true } },
      company: { select: { id: true, name: true, chapter: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ activities });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

  const user = session.user as any;
  const { type, note, date, companyId } = await req.json();

  if (!type || !companyId) {
    return NextResponse.json({ error: "Tür ve şirket zorunludur!" }, { status: 400 });
  }

  const activity = await prisma.activity.create({
    data: {
      type,
      notes: note || null,
      scheduledAt: date ? new Date(date) : new Date(),
      userId: user.id,
      companyId: companyId,
    },
  });

  return NextResponse.json({ success: true, activity });
}
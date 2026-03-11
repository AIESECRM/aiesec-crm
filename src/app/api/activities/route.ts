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
    where.companyId = parseInt(companyId);
  } else if (NATIONAL_ROLES.includes(user.role)) {
    // Tüm şubeleri görebilir
  } else if (CHAPTER_ROLES.includes(user.role)) {
    where.company = { chapter: user.chapter };
  } else {
    where.userId = parseInt(user.id);
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
  const { type, note, date, companyId, userId } = await req.json();

  if (!type || !companyId) {
    return NextResponse.json({ error: "Tür ve şirket zorunludur!" }, { status: 400 });
  }

  const targetUserId = (userId && NATIONAL_ROLES.includes(user.role)) ? parseInt(userId) : parseInt(user.id);

  const activity = await prisma.activity.create({
    data: {
      type,
      note: note || null,
      date: date ? Math.floor(new Date(date).getTime() / 1000) : Math.floor(Date.now() / 1000),
      userId: targetUserId,
      companyId: parseInt(companyId),
      createdAt: Math.floor(Date.now() / 1000),
    },
  });

  if (targetUserId !== parseInt(user.id)) {
    const typeLabel = {
      COLD_CALL: 'Cold Call',
      MEETING: 'Toplantı',
      EMAIL: 'E-posta',
      TASK: 'Görev',
      PROPOSAL: 'Teklif İletimi',
      POSTPONED: 'Ertelenmiş İşlem',
      FOLLOW_UP: 'Takip'
    }[type as string] || type;

    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'COMPANY_UPDATED',
        title: 'Yeni Aktivite Atandı',
        message: `${user.name} size yeni bir aktivite atadı: ${typeLabel}`,
        createdAt: Math.floor(Date.now() / 1000)
      }
    });
  }

  return NextResponse.json({ success: true, activity });
}
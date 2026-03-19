import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyUser, notifyManagers } from "@/lib/notifications";

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
      user: { select: { id: true, name: true, role: true, image: true } },
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
  const { type, note, date, companyId, userId, isPlanned } = await req.json();

  if (!type || !companyId) {
    return NextResponse.json({ error: "Tür ve şirket zorunludur!" }, { status: 400 });
  }

  const targetUserId = userId ? parseInt(userId) : parseInt(user.id);

  // Gelen tarih bozuksa veya yoksa (NaN), o anki zamanı kullan
  const parsedTime = date ? new Date(date).getTime() : NaN;
  const activityDate = !isNaN(parsedTime) ? Math.floor(parsedTime / 1000) : Math.floor(Date.now() / 1000);

  // Veritabanına Kayıt
  const activity = await prisma.activity.create({
    data: {
      type,
      note: note || null,
      date: activityDate,
      userId: targetUserId,
      companyId: parseInt(companyId),
      createdAt: Math.floor(Date.now() / 1000),
      isPlanned: isPlanned || false, 
    },
    include: { company: true } 
  });

  const typeLabel = {
    COLD_CALL: 'Cold Call',
    MEETING: 'Toplantı',
    EMAIL: 'E-posta',
    TASK: 'Görev',
    PROPOSAL: 'Teklif İletimi',
    POSTPONED: 'Ertelenmiş İşlem',
    FOLLOW_UP: 'Takip'
  }[type as string] || type;

  // Bildirim Mantığı
  if (isPlanned && targetUserId) {
    const dateStr = !isNaN(parsedTime) 
      ? new Date(parsedTime).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) 
      : 'Belirtilmedi';
      
    await notifyUser(
      targetUserId,
      'NEW_ACTIVITY',
      'Yeni Aktivite Planlandı 📅',
      `${activity.company?.name || 'Bir şirket'} için ${dateStr} tarihine bir ${typeLabel} planlandı. Notlar: ${note || '-'}`,
      parseInt(companyId)
    );
  } else if (targetUserId !== parseInt(user.id)) {
    await notifyUser(
      targetUserId,
      'COMPANY_UPDATED',
      'Yeni Aktivite Atandı',
      `${user.name} size yeni bir aktivite atadı: ${typeLabel}`
    );
  }

  // Şirket menajerlerine bildirim
  await notifyManagers(
    parseInt(companyId),
    'COMPANY_UPDATED',
    'Yeni Aktivite Kaydı',
    `${user.name} tarafından yeni bir aktivite girildi.`,
    parseInt(user.id)
  );

  // Şirketin güncellenme tarihini (updatedAt) değiştir
  await prisma.company.update({
    where: { id: parseInt(companyId) },
    data: { updatedAt: Math.floor(Date.now() / 1000) }
  });

  return NextResponse.json({ success: true, activity });
}

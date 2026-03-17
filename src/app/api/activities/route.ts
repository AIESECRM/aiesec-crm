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
  // 1. Gelen verilerden isPlanned alanını da alıyoruz
  const { type, note, date, companyId, userId, isPlanned } = await req.json();

  if (!type || !companyId) {
    return NextResponse.json({ error: "Tür ve şirket zorunludur!" }, { status: 400 });
  }

  // DOĞRU TANIM: Eğer bir userId seçilmişse onu hedef al, yoksa işlemi yapanı.
  const targetUserId = userId ? parseInt(userId) : parseInt(user.id);
  const activityDate = date ? Math.floor(new Date(date).getTime() / 1000) : Math.floor(Date.now() / 1000);

  // 2. isPlanned bilgisini veritabanına kaydediyoruz
  const activity = await prisma.activity.create({
    data: {
      type,
      note: note || null,
      date: activityDate,
      userId: targetUserId,
      companyId: parseInt(companyId),
      createdAt: Math.floor(Date.now() / 1000),
      isPlanned: isPlanned || false, // EĞER PLANLIYSA TRUE OLARAK KAYDET
    },
    include: { company: true } // Bildirimde şirket adını kullanabilmek için şirketi dahil ediyoruz
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

  // 3. Bildirim Mantığı
  if (isPlanned && targetUserId) {
    // EĞER AKTİVİTE PLANLIYSA: Yeni oluşturduğumuz NEW_ACTIVITY tipinde bildirim gönder
    const dateStr = date ? new Date(date).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : 'Belirtilmedi';
    
    await notifyUser(
      targetUserId,
      'NEW_ACTIVITY', // Yeni ikonumuz ve rengimiz çıkacak
      'Yeni Aktivite Planlandı 📅',
      `${activity.company?.name || 'Bir şirket'} için ${dateStr} tarihine bir ${typeLabel} planlandı. Notlar: ${note || '-'}`
    );
  } else if (targetUserId !== parseInt(user.id)) {
    // EĞER PLANLI DEĞİL AMA BAŞKASINA ATANMIŞSA: Eski mantığın çalışsın
    await notifyUser(
      targetUserId,
      'COMPANY_UPDATED',
      'Yeni Aktivite Atandı',
      `${user.name} size yeni bir aktivite atadı: ${typeLabel}`
    );
  }

  // 4. Şirket menajerlerini genel olarak bilgilendir
  await notifyManagers(
    parseInt(companyId),
    'COMPANY_UPDATED',
    'Yeni Aktivite Kaydı',
    `${user.name} tarafından yeni bir aktivite girildi.`,
    parseInt(user.id)
  );

  return NextResponse.json({ success: true, activity });
}

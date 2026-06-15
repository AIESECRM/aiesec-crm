import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendInactiveCompanyNotification } from "@/lib/mail";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Bu endpoint bir cron job tarafından çağrılmalıdır (ör: Vercel Cron, external cron)
// GET /api/cron/notify-inactive?key=SECRET
export async function GET(req: NextRequest) {
  // Basit güvenlik: CRON_SECRET ile koruma
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  if (key !== process.env.CRON_SECRET && process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const now = Math.floor(Date.now() / 1000);
  const threeDaysAgo = now - 3 * 24 * 60 * 60;

  // Tekrar Ara ve Cevap Yok statüsündeki, 3 gündür güncellenmemiş ve
  // son 3 gün içinde bildirim gönderilmemiş şirketleri bul
  const inactiveCompanies = await prisma.company.findMany({
    where: {
      status: { in: ["CALL_AGAIN", "NO_ANSWER"] },
      updatedAt: { lt: threeDaysAgo },
      lastNotifiedAt: { lt: threeDaysAgo },
    },
    include: {
      managers: {
        where: { status: "ACTIVE" },
        select: {
          id: true,
          name: true,
          email: true,
          emailNotifications: true,
        },
      },
    },
  });

  if (inactiveCompanies.length === 0) {
    return NextResponse.json({ message: "Bildirilecek şirket yok", count: 0 });
  }

  // Menajer başına şirketleri grupla
  const managerMap = new Map<
    number,
    {
      id: number;
      name: string;
      email: string;
      emailNotifications: boolean;
      companies: { id: number; name: string; status: string; daysSince: number }[];
    }
  >();

  for (const company of inactiveCompanies) {
    const daysSince = Math.floor((now - company.updatedAt) / (24 * 60 * 60));

    for (const manager of company.managers) {
      if (!managerMap.has(manager.id)) {
        managerMap.set(manager.id, {
          ...manager,
          companies: [],
        });
      }
      managerMap.get(manager.id)!.companies.push({
        id: company.id,
        name: company.name,
        status: company.status,
        daysSince,
      });
    }
  }

  let notificationCount = 0;
  let emailCount = 0;

  // Her menajer için bildirim oluştur
  for (const [managerId, data] of managerMap) {
    const companyNames = data.companies.map((c) => c.name).join(", ");
    const count = data.companies.length;

    // Zil ikonu bildirimi oluştur
    await prisma.notification.create({
      data: {
        userId: managerId,
        type: "INACTIVE_COMPANY",
        title: `${count} şirket dikkatinizi bekliyor`,
        message: `Şu şirketlere 3 gündür işlem yapılmadı: ${companyNames}`,
        companyId: data.companies[0]?.id || null,
        read: false,
        createdAt: now,
      },
    });
    notificationCount++;

    // E-posta bildirimi (açıksa)
    if (data.emailNotifications) {
      try {
        await sendInactiveCompanyNotification(data.email, data.name, data.companies);
        emailCount++;
      } catch (err) {
        console.error(`[Cron] Mail gönderilemedi: ${data.email}`, err);
      }
    }
  }

  // Bildirilen şirketlerin lastNotifiedAt güncelle
  const companyIds = inactiveCompanies.map((c) => c.id);
  await prisma.company.updateMany({
    where: { id: { in: companyIds } },
    data: { lastNotifiedAt: now },
  });

  return NextResponse.json({
    message: "Bildirimler gönderildi",
    companiesProcessed: inactiveCompanies.length,
    notificationsSent: notificationCount,
    emailsSent: emailCount,
  });
}

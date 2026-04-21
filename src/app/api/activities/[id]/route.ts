import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

  const { id } = await params;
  const user = session.user as any;

  const { note, type, isPlanned, date } = await req.json();

  try {
    const activity = await prisma.activity.update({
      where: { id: parseInt(id) },
      data: {
        ...(note !== undefined && { note }),
        ...(type && { type }),
        // isPlanned bilgisi gelmişse (true veya false) güncelle
        ...(isPlanned !== undefined && { isPlanned }),
        // date bilgisi gelmişse güncelle (timestamp olarak beklenir)
        ...(date !== undefined && { date: parseInt(date) }),
      },
    });

    await logAudit(user.id, "UPDATE_ACTIVITY", id, undefined, JSON.stringify(activity));

    // Şirketin güncellenme tarihini de güncelle
    await prisma.company.update({
      where: { id: activity.companyId },
      data: { updatedAt: Math.floor(Date.now() / 1000) }
    });

    return NextResponse.json({ success: true, activity });
  } catch (error) {
    console.error("Aktivite güncellenirken hata oluştu:", error);
    return NextResponse.json({ error: "Güncelleme başarısız oldu." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

  const { id } = await params;
  const user = session.user as any;

  const activity = await prisma.activity.delete({ where: { id: parseInt(id) } });

  await logAudit(user.id, "DELETE_ACTIVITY", id);

  // Şirketin güncellenme tarihini de güncelle
  await prisma.company.update({
    where: { id: activity.companyId },
    data: { updatedAt: Math.floor(Date.now() / 1000) }
  });

  return NextResponse.json({ success: true });
}
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// E-posta bildirim ayarını güncelle
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });
  }

  const userId = parseInt((session.user as any).id);
  const { emailNotifications } = await req.json();

  if (typeof emailNotifications !== "boolean") {
    return NextResponse.json({ error: "Geçersiz değer" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { emailNotifications },
  });

  return NextResponse.json({ success: true, emailNotifications });
}

// Mevcut ayarları getir
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });
  }

  const userId = parseInt((session.user as any).id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailNotifications: true },
  });

  return NextResponse.json({ emailNotifications: user?.emailNotifications ?? true });
}

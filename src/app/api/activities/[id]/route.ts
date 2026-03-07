import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

  const { id } = await params;
  const { note, type } = await req.json();

  const activity = await prisma.activity.update({
    where: { id: Number(id) },
    data: {
      ...(note !== undefined && { note }),
      ...(type && { type }),
    },
  });

  return NextResponse.json({ success: true, activity });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

  const { id } = await params;
  const user = session.user as any;

  const activity = await prisma.activity.findUnique({ where: { id: Number(id) } });
  if (!activity) return NextResponse.json({ error: "Aktivite bulunamadı!" }, { status: 404 });

  const canDeleteAll = ["LCVP", "LCP", "MCVP", "MCP", "ADMIN"].includes(user.role);
  if (!canDeleteAll && activity.userId !== Number(user.id)) {
    return NextResponse.json({ error: "Bu aktiviteyi silme yetkiniz yok!" }, { status: 403 });
  }

  await prisma.activity.delete({ where: { id: Number(id) } });

  return NextResponse.json({ success: true });
}
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

  const { note, type } = await req.json();

  const activity = await prisma.activity.update({
    where: { id: parseInt(id) },
    data: {
      ...(note !== undefined && { note }),
      ...(type && { type }),
    },
  });

  await logAudit(user.id, "UPDATE_ACTIVITY", id, undefined, JSON.stringify(activity));

  return NextResponse.json({ success: true, activity });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

  const { id } = await params;
  const user = session.user as any;

  await prisma.activity.delete({ where: { id: parseInt(id) } });

  await logAudit(user.id, "DELETE_ACTIVITY", id);

  return NextResponse.json({ success: true });
}
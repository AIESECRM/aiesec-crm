import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { verifyActivityAccess } from "@/lib/authz";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

  const { id } = await params;
  const user = session.user as any;

  // SECURITY: Prevent IDOR attacks
  const hasAccess = await verifyActivityAccess(user.id, id);
  if (!hasAccess) return NextResponse.json({ error: "Bu aktiviteyi düzenleme yetkiniz yok!" }, { status: 403 });

  const { note, type, status } = await req.json();

  const activity = await prisma.activity.update({
    where: { id: id },
    data: {
      ...(note !== undefined && { notes: note }),
      ...(type && { type }),
      ...(status && { status }),
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

  // SECURITY: Prevent IDOR attacks
  const hasAccess = await verifyActivityAccess(user.id, id);
  if (!hasAccess) return NextResponse.json({ error: "Bu aktiviteyi silme yetkiniz yok!" }, { status: 403 });

  await prisma.activity.delete({ where: { id: id } });

  await logAudit(user.id, "DELETE_ACTIVITY", id);

  return NextResponse.json({ success: true });
}
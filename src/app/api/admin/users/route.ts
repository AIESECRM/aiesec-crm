import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const APPROVER_ROLES = ["ADMIN", "MCP", "MCVP", "LCP", "LCVP"];

export async function GET(req: NextRequest) {
  const session = await auth();
  const sessionUser = session?.user as any;
  if (!session?.user || !APPROVER_ROLES.includes(sessionUser.role)) {
    return NextResponse.json({ error: "Yetkisiz erişim!" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const chapter = searchParams.get("chapter");
  const status = searchParams.get("status");

  const where: any = {};

  // LCP/LCVP sadece kendi şubesini görebilir
  if (sessionUser.role === "LCP" || sessionUser.role === "LCVP") {
    where.chapter = sessionUser.chapter;
  } else if (chapter) {
    where.chapter = chapter;
  }

  if (status) where.status = status;

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      chapter: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  const sessionUser = session?.user as any;
  if (!session?.user || !APPROVER_ROLES.includes(sessionUser.role)) {
    return NextResponse.json({ error: "Yetkisiz erişim!" }, { status: 403 });
  }

  const { userId, action, role } = await req.json();

  if (action === "approve") {
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { status: "ACTIVE" },
    });
    return NextResponse.json({ success: true, message: "Kullanıcı onaylandı!" });
  }

  if (action === "reject") {
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { status: "REJECTED" },
    });
    return NextResponse.json({ success: true, message: "Kullanıcı reddedildi!" });
  }

  if (action === "change-role") {
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role },
    });
    return NextResponse.json({ success: true, message: "Rol güncellendi!" });
  }

  return NextResponse.json({ error: "Geçersiz işlem!" }, { status: 400 });
}
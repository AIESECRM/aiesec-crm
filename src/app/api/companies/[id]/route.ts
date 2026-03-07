import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id: Number(id) },
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { contacts: true, activities: true, offers: true } },
    },
  });

  if (!company) return NextResponse.json({ error: "Şirket bulunamadı!" }, { status: 404 });

  return NextResponse.json({ company });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

  const { id } = await params;
  const { name, phone, email, status, notes, chapter } = await req.json();

  const company = await prisma.company.update({
    where: { id: Number(id) },
    data: {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
      ...(chapter !== undefined && { chapter }),
      updatedAt: Math.floor(Date.now() / 1000),
    },
  });

  return NextResponse.json({ success: true, company });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

  const { id } = await params;

  await prisma.company.delete({ where: { id: Number(id) } });

  return NextResponse.json({ success: true });
}
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyManagers } from "@/lib/notifications";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const NATIONAL_ROLES = ["MCP", "MCVP", "ADMIN"];

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

  const user = session.user as any;
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  const where: any = {};

  if (companyId) {
    where.companyId = companyId;
  } else if (!NATIONAL_ROLES.includes(user.role)) {
    where.company = { chapter: user.chapter };
  }

  const contacts = await prisma.contact.findMany({
    where,
    include: {
      company: { select: { id: true, name: true, chapter: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ contacts });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

  const { name, email, phone, companyId } = await req.json();

  if (!name || !companyId) {
    return NextResponse.json({ error: "İsim ve şirket zorunludur!" }, { status: 400 });
  }

  const contact = await prisma.contact.create({
    data: {
      name,
      email: email || null,
      phone: phone || null,
      companyId: parseInt(companyId),
    },
  });

  // Menajerleri bilgilendir
  await notifyManagers(
    parseInt(companyId),
    'COMPANY_UPDATED',
    'Yeni Bağlantı Kişisi Eklendi',
    `${(session.user as any).name} tarafından "${contact.name}" eklendi.`,
    parseInt((session.user as any).id)
  );

  return NextResponse.json({ success: true, contact });
}
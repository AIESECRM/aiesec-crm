import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { verifyCompanyAccess } from "@/lib/authz";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

  const { id } = await params;
  const user = session.user as any;

  const hasAccess = await verifyCompanyAccess(user.id, id);
  if (!hasAccess) return NextResponse.json({ error: "Bu şirketi görme yetkiniz yok!" }, { status: 403 });

  const company = await prisma.company.findUnique({
    where: { id: parseInt(id) },
    include: {
      createdBy: { select: { id: true, name: true } },
      managers: { select: { id: true, name: true } },
      _count: { select: { contacts: true, activities: true, offers: true } },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!company) return NextResponse.json({ error: "Şirket bulunamadı!" }, { status: 404 });

  return NextResponse.json({ company });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

  const { id } = await params;
  const user = session.user as any;

  const hasAccess = await verifyCompanyAccess(user.id, id);
  if (!hasAccess) return NextResponse.json({ error: "Bu şirketi düzenleme yetkiniz yok!" }, { status: 403 });

  const { name, phone, email, status, notes, chapter, category, location, domain, taxId, website } = await req.json();

  const company = await prisma.company.update({
    where: { id: parseInt(id) },
    data: {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
      ...(chapter !== undefined && { chapter }),
      ...(category !== undefined && { category }),
      ...(location !== undefined && { location }),
      ...(domain !== undefined && { domain }),
      ...(taxId !== undefined && { taxId }),
      ...(website !== undefined && { website }),
      updatedAt: Math.floor(Date.now() / 1000),
    },
  });

  await logAudit(user.id, "UPDATE_COMPANY", id, undefined, JSON.stringify(company));

  return NextResponse.json({ success: true, company });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

  const { id } = await params;
  const user = session.user as any;

  const hasAccess = await verifyCompanyAccess(user.id, id);
  if (!hasAccess) return NextResponse.json({ error: "Bu şirketi silme yetkiniz yok!" }, { status: 403 });

  await prisma.company.delete({ where: { id: parseInt(id) } });

  await logAudit(user.id, "DELETE_COMPANY", id);

  return NextResponse.json({ success: true });
}
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

  // SECURITY: Prevent IDOR attacks
  const hasAccess = await verifyCompanyAccess(user.id, id);
  if (!hasAccess) return NextResponse.json({ error: "Bu şirketi görme yetkiniz yok!" }, { status: 403 });

  const company = await prisma.company.findUnique({
    where: { id: id },
    include: {
      creator: { select: { id: true, name: true } },
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
  const user = session.user as any;

  // SECURITY: Prevent IDOR attacks
  const hasAccess = await verifyCompanyAccess(user.id, id);
  if (!hasAccess) return NextResponse.json({ error: "Bu şirketi düzenleme yetkiniz yok!" }, { status: 403 });

  const { name, phone, email, status, notes, chapter } = await req.json();

  const company = await prisma.company.update({
    where: { id: id },
    data: {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
      ...(chapter !== undefined && { chapter }),
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

  // SECURITY: Only ADMIN, MCP or branch owners (via chapter) through verifyCompanyAccess logic
  const hasAccess = await verifyCompanyAccess(user.id, id);
  if (!hasAccess) return NextResponse.json({ error: "Bu şirketi silme yetkiniz yok!" }, { status: 403 });

  await prisma.company.delete({ where: { id: id } });

  await logAudit(user.id, "DELETE_COMPANY", id);

  return NextResponse.json({ success: true });
}
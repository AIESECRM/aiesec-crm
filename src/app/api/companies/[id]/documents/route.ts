import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { verifyCompanyAccess } from "@/lib/authz";
import { logAudit } from "@/lib/audit";
import { notifyManagers } from "@/lib/notifications";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

  const { id } = await params;
  const user = session.user as any;

  const hasAccess = await verifyCompanyAccess(user.id, id);
  if (!hasAccess) return NextResponse.json({ error: "Bu şirkete doküman ekleme yetkiniz yok!" }, { status: 403 });

  const { name, url } = await req.json();

  if (!url) return NextResponse.json({ error: "Doküman URL'i eksik!" }, { status: 400 });

  const document = await prisma.companyDocument.create({
    data: {
      name: name || 'Doküman',
      url,
      companyId: parseInt(id),
      createdAt: Math.floor(Date.now() / 1000),
    },
  });

  await logAudit(user.id, "ADD_DOCUMENT", id, undefined, JSON.stringify(document));

  // Menajerleri bilgilendir
  await notifyManagers(
    parseInt(id),
    'COMPANY_UPDATED',
    'Yeni Doküman Yüklendi',
    `${user.name} tarafından "${document.name}" yüklendi.`,
    parseInt(user.id)
  );

  return NextResponse.json({ success: true, document });
}

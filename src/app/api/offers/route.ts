import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { verifyCompanyAccess } from "@/lib/authz";
import { logAudit } from "@/lib/audit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const NATIONAL_ROLES = ["MCP", "MCVP", "ADMIN"];
const ALLOWED_ROLES = ["LCVP", "LCP", "MCVP", "MCP", "ADMIN"];

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

  const user = session.user as any;

  if (!ALLOWED_ROLES.includes(user.role)) {
    return NextResponse.json({ error: "Bu sayfaya erişim yetkiniz yok!" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  const product = searchParams.get("product");
  const openStatus = searchParams.get("openStatus");
  const chapter = searchParams.get("chapter");

  const where: any = {};

  if (companyId) {
    where.companyId = companyId;
    // SECURITY: Ensure user has access to this specific company's offers
    const hasAccess = await verifyCompanyAccess(user.id, companyId);
    if (!hasAccess) return NextResponse.json({ error: "Bu şirketin tekliflerini görme yetkiniz yok!" }, { status: 403 });
  } else if (!NATIONAL_ROLES.includes(user.role)) {
    // SECURITY: Regional filtering
    where.company = { chapter: user.chapter };
  } else if (chapter) {
    where.company = { chapter };
  }

  if (product) where.product = product;
  if (openStatus) where.openStatus = openStatus;

  const offers = await prisma.offer.findMany({
    where,
    include: {
      company: { select: { id: true, name: true, chapter: true } },
      creator: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const newOpen = offers.filter(o => o.openStatus === "NEW_OPEN").length;
  const reOpen = offers.filter(o => o.openStatus === "RE_OPEN").length;
  const totalOpen = newOpen + reOpen;

  return NextResponse.json({ offers, stats: { newOpen, reOpen, totalOpen } });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

  const user = session.user as any;

  if (!ALLOWED_ROLES.includes(user.role)) {
    return NextResponse.json({ error: "Teklif ekleme yetkiniz yok!" }, { status: 403 });
  }

  const { title, product, duration, openStatus, value, companyId, contactId } = await req.json();

  if (!title || !product || !duration || !companyId) {
    return NextResponse.json({ error: "Başlık, ürün, dönem ve şirket zorunludur!" }, { status: 400 });
  }

  // SECURITY: Prevent adding offers to companies user doesn't manage
  const hasAccess = await verifyCompanyAccess(user.id, companyId);
  if (!hasAccess) return NextResponse.json({ error: "Bu şirkete teklif ekleme yetkiniz yok!" }, { status: 403 });

  const offer = await prisma.offer.create({
    data: {
      title,
      product,
      duration,
      openStatus: openStatus || "NEW_OPEN",
      value: value ? Number(value) : null,
      companyId: companyId,
      createdById: user.id,
      contactId: contactId || null,
    },
  });

  await logAudit(user.id, "CREATE_OFFER", offer.id, undefined, JSON.stringify(offer));

  return NextResponse.json({ success: true, offer });
}
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CompaniesClient from "./CompaniesClient";

const NATIONAL_ROLES = ['MCP', 'MCVP', 'ADMIN'];
const CHAPTER_ROLES = ['LCVP', 'LCP', 'TL'];

export default async function CompaniesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user as any;

  // 1. Companies Query
  const compWhere: any = {};
  if (!NATIONAL_ROLES.includes(user.role)) {
    compWhere.chapter = user.chapter;
  }
  
  const companies = await prisma.company.findMany({
    where: compWhere,
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { contacts: true, activities: true, offers: true } },
      managers: { select: { id: true, name: true, image: true, role: true, chapter: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // 2. Activities Query
  const actWhere: any = {};
  if (CHAPTER_ROLES.includes(user.role)) {
    actWhere.company = { chapter: user.chapter };
  } else if (!NATIONAL_ROLES.includes(user.role)) {
    actWhere.userId = parseInt(user.id);
  }
  
  const activities = await prisma.activity.findMany({
    where: actWhere,
    include: {
      user: { select: { id: true, name: true, role: true, image: true } },
      company: { select: { id: true, name: true, chapter: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // JSON serileştirme (Date objeleri vs. için)
  const serializedCompanies = JSON.parse(JSON.stringify(companies));
  const serializedActivities = JSON.parse(JSON.stringify(activities));

  return (
    <CompaniesClient 
      initialCompanies={serializedCompanies} 
      initialActivities={serializedActivities} 
      user={user} 
    />
  );
}
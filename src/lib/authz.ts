import prisma from '@/lib/prisma';

export async function verifyCompanyAccess(userId: string, companyId: string): Promise<boolean> {
    try {
        const dbUser = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
        if (!dbUser) return false;

        if (['MCP', 'MCVP', 'ADMIN'].includes(dbUser.role)) return true;

        const company = await prisma.company.findUnique({
            where: { id: parseInt(companyId) },
            include: { managers: { select: { id: true } } }
        });

        if (!company) return false;

        if (['LCP', 'LCVP', 'TL'].includes(dbUser.role)) {
            return company.chapter === dbUser.chapter;
        }

        if (dbUser.role === 'TM') {
            return company.managers.some((m: any) => m.id === dbUser.id) || company.createdById === dbUser.id;
        }

        return false;
    } catch (error) {
        console.error('Authorization Error (verifyCompanyAccess):', error);
        return false;
    }
}

export async function verifyActivityAccess(userId: string, activityId: string): Promise<boolean> {
    try {
        const activity = await prisma.activity.findUnique({
            where: { id: parseInt(activityId) },
            select: { companyId: true, userId: true }
        });
        if (!activity) return false;

        if (activity.userId === parseInt(userId)) return true;

        return verifyCompanyAccess(userId, String(activity.companyId));
    } catch (error) {
        console.error('Authorization Error (verifyActivityAccess):', error);
        return false;
    }
}

export async function verifyProposalAccess(userId: string, proposalId: string): Promise<boolean> {
    // Proposal kaldırıldı
    return true;
}

export async function verifyContactAccess(userId: string, contactId: string): Promise<boolean> {
    try {
        const contact = await prisma.contact.findUnique({
            where: { id: parseInt(contactId) },
            select: { companyId: true }
        });
        if (!contact) return false;
        return verifyCompanyAccess(userId, String(contact.companyId));
    } catch (error) {
        console.error('Authorization Error (verifyContactAccess):', error);
        return false;
    }
}
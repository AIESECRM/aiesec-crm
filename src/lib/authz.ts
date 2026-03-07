import prisma from '@/lib/prisma';

export async function verifyCompanyAccess(userId: string, companyId: string): Promise<boolean> {
    try {
        const dbUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!dbUser) return false;

        // MCP, MCVP and ADMIN can access all companies
        if (['MCP', 'MCVP', 'ADMIN'].includes(dbUser.role)) return true;

        const company = await prisma.company.findUnique({
            where: { id: companyId },
            include: { managers: { select: { id: true } } }
        });

        if (!company) return false;

        // Chapter check for regional roles
        if (['LCP', 'LCVP', 'TL'].includes(dbUser.role)) {
            return company.chapter === dbUser.chapter;
        }

        // TM check (must be an assigned manager)
        if (dbUser.role === 'TM') {
            return company.managers.some(m => m.id === dbUser.id);
        }

        return false;
    } catch (error) {
        console.error('Authorization Error (verifyCompanyAccess):', error);
        return false;
    }
}

export async function verifyActivityAccess(userId: string, activityId: string): Promise<boolean> {
    try {
        const activity = await prisma.activity.findUnique({ where: { id: activityId }, select: { companyId: true, userId: true } });
        if (!activity) return false;

        // Activity owner always has access
        if (activity.userId === userId) return true;

        return verifyCompanyAccess(userId, activity.companyId);
    } catch (error) {
        console.error('Authorization Error (verifyActivityAccess):', error);
        return false;
    }
}

export async function verifyProposalAccess(userId: string, proposalId: string): Promise<boolean> {
    try {
        const proposal = await prisma.proposal.findUnique({ where: { id: proposalId }, select: { companyId: true, ownerId: true } });
        if (!proposal) return false;

        // Proposal owner always has access
        if (proposal.ownerId === userId) return true;

        return verifyCompanyAccess(userId, proposal.companyId);
    } catch (error) {
        console.error('Authorization Error (verifyProposalAccess):', error);
        return false;
    }
}

export async function verifyContactAccess(userId: string, contactId: string): Promise<boolean> {
    try {
        const contact = await prisma.contact.findUnique({ where: { id: contactId }, select: { companyId: true } });
        if (!contact) return false;
        return verifyCompanyAccess(userId, contact.companyId);
    } catch (error) {
        console.error('Authorization Error (verifyContactAccess):', error);
        return false;
    }
}

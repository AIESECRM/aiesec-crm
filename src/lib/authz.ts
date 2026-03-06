import prisma from '@/lib/prisma';

export async function verifyCompanyAccess(userId: string, companyId: string): Promise<boolean> {
    try {
        const dbUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!dbUser) return false;

        // MCP and MCVP can access all companies
        if (dbUser.role === 'MCP' || dbUser.role === 'MCVP') return true;

        let whereClause: any = { id: companyId };

        if (dbUser.role === 'TeamMember') {
            whereClause.managers = { some: { id: dbUser.id } };
        } else if (dbUser.role === 'LCP' || dbUser.role === 'LCVP') {
            whereClause.managers = { some: { branchId: dbUser.branchId } };
        } else if (dbUser.role === 'TeamLeader') {
            whereClause.managers = { some: { teamId: dbUser.teamId } };
        }

        const company = await prisma.company.findFirst({
            where: whereClause,
            select: { id: true }
        });

        return !!company;
    } catch (error) {
        console.error('Authorization Error (verifyCompanyAccess):', error);
        return false;
    }
}

export async function verifyActivityAccess(userId: string, activityId: string): Promise<boolean> {
    try {
        const activity = await prisma.activity.findUnique({ where: { id: activityId }, select: { companyId: true } });
        if (!activity) return false;
        return verifyCompanyAccess(userId, activity.companyId);
    } catch (error) {
        console.error('Authorization Error (verifyActivityAccess):', error);
        return false;
    }
}

export async function verifyProposalAccess(userId: string, proposalId: string): Promise<boolean> {
    try {
        const proposal = await prisma.proposal.findUnique({ where: { id: proposalId }, select: { companyId: true } });
        if (!proposal) return false;
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

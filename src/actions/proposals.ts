'use server'

import prisma from '@/lib/prisma'
import { Proposal } from '@/types'
import { verifyCompanyAccess, verifyProposalAccess } from '@/lib/authz'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const proposalSchema = z.object({
    companyId: z.string().optional(),
    title: z.string().optional(),
    value: z.number().optional(),
    currency: z.string().optional(),
    stage: z.enum(['new_lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).optional(),
    probability: z.number().min(0).max(100).optional(),
    ownerId: z.string().optional(),
    ownerName: z.string().optional(),
    nextAction: z.string().optional().nullable(),
    contactId: z.string().optional().nullable(),
});

// Map Prisma Proposal to Frontend shape
function mapProposal(prismaProposal: any): Proposal {
    return {
        ...prismaProposal,
    }
}

export async function getProposalsByCompany(companyId: string, userId: string): Promise<Proposal[]> {
    try {
        if (!userId) return [];
        const hasAccess = await verifyCompanyAccess(userId, companyId);
        if (!hasAccess) return [];

        const proposals = await prisma.proposal.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' }
        })
        return proposals.map(mapProposal)
    } catch (error) {
        console.error(`Failed to fetch proposals for company ${companyId}:`, error)
        return []
    }
}

export async function getAllProposals(userId: string): Promise<Proposal[]> {
    try {
        const dbUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!dbUser) return [];

        let whereClause: any = {};
        if (dbUser.role === 'TeamMember') {
            whereClause = { company: { managers: { some: { id: dbUser.id } } } };
        } else if (dbUser.role === 'LCP' || dbUser.role === 'LCVP') {
            whereClause = { company: { managers: { some: { branchId: dbUser.branchId } } } };
        } else if (dbUser.role === 'TeamLeader') {
            whereClause = { company: { managers: { some: { teamId: dbUser.teamId } } } };
        }

        const proposals = await prisma.proposal.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        })
        return proposals.map(mapProposal)
    } catch (error) {
        console.error('Failed to fetch all proposals:', error)
        return []
    }
}

export async function createProposal(data: Partial<Proposal> & { ownerId: string, ownerName: string, title: string }, userId: string): Promise<Proposal | null> {
    try {
        const validation = proposalSchema.safeParse(data);
        if (!validation.success) {
            console.error('Validation error:', validation.error.issues);
            return null;
        }

        if (!userId || !data.companyId) return null;
        const hasAccess = await verifyCompanyAccess(userId, data.companyId);
        if (!hasAccess) return null;

        const newProposal = await prisma.proposal.create({
            data: {
                companyId: data.companyId!,
                title: data.title || 'Yeni Teklif',
                value: data.value || 0,
                currency: data.currency || 'TRY',
                stage: data.stage || 'proposal',
                probability: 50, // Default for now
                ownerId: data.ownerId,
                ownerName: data.ownerName,
                nextAction: 'Takip',
                contactId: data.contactId,
            }
        })

        await logAudit(
            userId,
            'CREATE_PROPOSAL',
            newProposal.id,
            undefined,
            JSON.stringify(newProposal)
        )

        return mapProposal(newProposal)
    } catch (error) {
        console.error('Failed to create proposal:', error)
        return null
    }
}

export async function updateProposal(id: string, data: Partial<Proposal>, userId: string): Promise<Proposal | null> {
    try {
        const validation = proposalSchema.safeParse(data);
        if (!validation.success) {
            console.error('Validation error:', validation.error.issues);
            return null;
        }

        if (!userId) return null;
        const hasAccess = await verifyProposalAccess(userId, id);
        if (!hasAccess) return null;

        const existing = await prisma.proposal.findUnique({ where: { id } });

        const updated = await prisma.proposal.update({
            where: { id },
            data: {
                value: data.value,
                currency: data.currency,
                stage: data.stage,
                title: data.title,
                probability: data.probability,
                ownerId: data.ownerId,
                ownerName: data.ownerName,
            }
        });

        // Automated Stage Triggers -> Notification
        if (existing && data.stage && existing.stage !== data.stage && data.stage === 'closed_won') {
            await prisma.notification.create({
                data: {
                    userId: updated.ownerId,
                    title: 'Teklif Kazanıldı! 🎉',
                    message: `${updated.title} adlı teklif başarıyla "Kazanıldı" aşamasına taşındı.`,
                    type: 'success',
                    read: false,
                }
            });
        }

        await logAudit(
            userId,
            'UPDATE_PROPOSAL',
            updated.id,
            undefined,
            JSON.stringify(updated)
        )

        return mapProposal(updated)
    } catch (error) {
        console.error(`Failed to update proposal ${id}:`, error)
        return null
    }
}

export async function deleteProposal(id: string, userId: string): Promise<boolean> {
    try {
        if (!userId) return false;
        const hasAccess = await verifyProposalAccess(userId, id);
        if (!hasAccess) return false;

        await prisma.proposal.delete({
            where: { id }
        })

        await logAudit(
            userId,
            'DELETE_PROPOSAL',
            id
        )

        return true
    } catch (error) {
        console.error(`Failed to delete proposal ${id}:`, error)
        return false
    }
}

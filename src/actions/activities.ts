'use server'

import prisma from '@/lib/prisma'
import { Activity, ActivityComment } from '@/types'
import { verifyCompanyAccess, verifyActivityAccess } from '@/lib/authz'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const activitySchema = z.object({
    companyId: z.string().optional(),
    userId: z.string().optional(),
    userName: z.string().optional(),
    type: z.enum(['cold_call', 'postponed', 'meeting', 'proposal', 'task']).optional(),
    status: z.enum(['pending', 'completed', 'canceled']).optional(),
    notes: z.string().optional().nullable(),
    scheduledAt: z.union([z.date(), z.string()]).optional().nullable(),
    completedAt: z.union([z.date(), z.string()]).optional().nullable(),
    contactId: z.string().optional().nullable(),
});

// Map Prisma Activity + Comments to Frontend shape
function mapActivity(prismaActivity: any): Activity {
    return {
        ...prismaActivity,
        type: prismaActivity.type as any,
        status: prismaActivity.status as any,
        comments: prismaActivity.comments?.map((c: any) => ({
            ...c,
            createdAt: c.createdAt
        })) || []
    }
}

export async function getActivitiesByCompany(companyId: string, userId: string): Promise<Activity[]> {
    try {
        if (!userId) return [];
        const hasAccess = await verifyCompanyAccess(userId, companyId);
        if (!hasAccess) return [];

        const activities = await prisma.activity.findMany({
            where: { companyId },
            include: {
                comments: {
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return activities.map(mapActivity)
    } catch (error) {
        console.error('Failed to fetch activities:', error)
        return []
    }
}

export async function getAllActivities(userId: string): Promise<Activity[]> {
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

        const activities = await prisma.activity.findMany({
            where: whereClause,
            include: {
                comments: {
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return activities.map(mapActivity)
    } catch (error) {
        console.error('Failed to fetch all activities:', error)
        return []
    }
}

export async function createActivity(data: Partial<Activity>, userId: string): Promise<Activity | null> {
    try {
        const validation = activitySchema.safeParse(data);
        if (!validation.success) {
            console.error('Validation error:', validation.error.issues);
            return null;
        }

        if (!userId || !data.companyId) return null;
        const hasAccess = await verifyCompanyAccess(userId, data.companyId);
        if (!hasAccess) return null;

        const newActivity = await prisma.activity.create({
            data: {
                companyId: data.companyId!,
                userId: data.userId!,
                userName: data.userName!,
                type: data.type || 'task',
                status: data.status || 'pending',
                notes: data.notes || '',
                scheduledAt: data.scheduledAt,
                completedAt: data.completedAt,
                contactId: data.contactId,
            },
            include: {
                comments: true
            }
        })

        await logAudit(
            userId,
            'CREATE_ACTIVITY',
            newActivity.id,
            undefined,
            JSON.stringify(newActivity)
        )

        return mapActivity(newActivity)
    } catch (error) {
        console.error('Failed to create activity:', error)
        return null
    }
}

export async function updateActivity(id: string, data: Partial<Activity>, userId: string): Promise<Activity | null> {
    try {
        const validation = activitySchema.safeParse(data);
        if (!validation.success) {
            console.error('Validation error:', validation.error.issues);
            return null;
        }

        if (!userId) return null;
        const hasAccess = await verifyActivityAccess(userId, id);
        if (!hasAccess) return null;

        const updated = await prisma.activity.update({
            where: { id },
            data: {
                type: data.type,
                status: data.status,
                notes: data.notes,
                completedAt: data.completedAt,
                scheduledAt: data.scheduledAt
            },
            include: { comments: true }
        })

        await logAudit(
            userId,
            'UPDATE_ACTIVITY',
            updated.id,
            undefined, // Optionally pass existing object here, skipped for brevity
            JSON.stringify(updated)
        )

        return mapActivity(updated)
    } catch (error) {
        console.error(`Failed to update activity ${id}:`, error)
        return null
    }
}

export async function addActivityComment(activityId: string, author: string, text: string, userId: string): Promise<ActivityComment | null> {
    try {
        if (!userId) return null;
        const hasAccess = await verifyActivityAccess(userId, activityId);
        if (!hasAccess) return null;

        const newComment = await prisma.activityComment.create({
            data: {
                activityId,
                author,
                text
            }
        })

        await logAudit(
            userId,
            'ADD_ACTIVITY_COMMENT',
            activityId,
            undefined,
            JSON.stringify(newComment)
        )

        return newComment
    } catch (error) {
        console.error(`Failed to add comment to activity ${activityId}:`, error)
        return null
    }
}

export async function deleteActivity(id: string, userId: string): Promise<boolean> {
    try {
        if (!userId) return false;
        const hasAccess = await verifyActivityAccess(userId, id);
        if (!hasAccess) return false;

        // Delete associated comments first due to ForeignKey constraints
        await prisma.activityComment.deleteMany({
            where: { activityId: id }
        })

        await prisma.activity.delete({
            where: { id }
        })

        await logAudit(
            userId,
            'DELETE_ACTIVITY',
            id
        )

        return true
    } catch (error) {
        console.error(`Failed to delete activity ${id}:`, error)
        return false
    }
}

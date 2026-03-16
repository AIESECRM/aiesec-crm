'use server'

import prisma from '@/lib/prisma'
import { notifyUser, notifyManagers } from "@/lib/notifications";

export async function getActivitiesByCompany(companyId: string, userId: string) {
    try {
        const activities = await prisma.activity.findMany({
            where: { companyId: parseInt(companyId) },
            include: {
                user: { select: { id: true, name: true, role: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return activities;
    } catch (error) {
        console.error('Failed to fetch activities:', error);
        return [];
    }
}

export async function getAllActivities(userId: string) {
    try {
        const dbUser = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
        if (!dbUser) return [];

        let whereClause: any = {};
        if (dbUser.role === 'TM' || dbUser.role === 'TL') {
            whereClause = { userId: parseInt(userId) };
        } else if (dbUser.role === 'LCP' || dbUser.role === 'LCVP') {
            whereClause = { company: { chapter: dbUser.chapter } };
        }

        const activities = await prisma.activity.findMany({
            where: whereClause,
            include: {
                user: { select: { id: true, name: true, role: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return activities;
    } catch (error) {
        console.error('Failed to fetch all activities:', error);
        return [];
    }
}

export async function createActivity(data: any, userId: string) {
    try {
        if (!userId || !data.companyId) return null;
        const newActivity = await prisma.activity.create({
            data: {
                companyId: parseInt(data.companyId),
                userId: parseInt(userId),
                type: data.type || 'COLD_CALL',
                note: data.notes || data.note || '',
                date: Math.floor(Date.now() / 1000),
                createdAt: Math.floor(Date.now() / 1000),
            }
        });
        await notifyManagers(
            parseInt(data.companyId),
            'COMPANY_UPDATED',
            'Yeni Aktivite Kaydı',
            'Yeni bir aktivite girildi.',
            parseInt(userId)
        );
        if (data.assignedUserId && parseInt(data.assignedUserId) !== parseInt(userId)) {
            await notifyUser(
                parseInt(data.assignedUserId),
                'COMPANY_UPDATED',
                'Yeni Görev Planlandı 📅',
                `Size yeni bir aktivite atandı.`
            );
        }
        
        return newActivity;
    } catch (error) {
        console.error('Failed to create activity:', error);
        return null;
    }
}

export async function updateActivity(id: string, data: any, userId: string) {
    try {
        const updated = await prisma.activity.update({
            where: { id: parseInt(id) },
            data: {
                type: data.type,
                note: data.notes || data.note,
            }
        });
        return updated;
    } catch (error) {
        console.error(`Failed to update activity ${id}:`, error);
        return null;
    }
}

export async function deleteActivity(id: string, userId: string) {
    try {
        await prisma.activity.delete({
            where: { id: parseInt(id) }
        });
        return true;
    } catch (error) {
        console.error(`Failed to delete activity ${id}:`, error);
        return false;
    }
}

export async function addActivityComment(activityId: string, author: string, text: string, userId: string) {
    return null;
}

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

        // 1. Tarihi ayarla: Gelen bir tarih varsa onu, yoksa şu anki zamanı kullan
        const activityDate = data.date ? Math.floor(new Date(data.date).getTime() / 1000) : Math.floor(Date.now() / 1000);

        // 2. Aktiviteyi oluştur (isPlanned desteği eklendi)
        const newActivity = await prisma.activity.create({
            data: {
                companyId: parseInt(data.companyId),
                userId: parseInt(userId),
                type: data.type || 'COLD_CALL',
                note: data.notes || data.note || '',
                date: activityDate,
                isPlanned: data.isPlanned || false, // EĞER PLANLIYSA TRUE KAYDEDER
                createdAt: Math.floor(Date.now() / 1000),
            }
        });

        // 3. Menajerlere genel bildirim
        await notifyManagers(
            parseInt(data.companyId),
            'COMPANY_UPDATED',
            'Yeni Aktivite Kaydı',
            'Yeni bir aktivite girildi.',
            parseInt(userId)
        );

        // 4. Hedef Kullanıcıyı Belirle ve Bildirim Gönder
        const targetUserId = data.assignedUserId ? parseInt(data.assignedUserId) : parseInt(userId);

        if (data.isPlanned && targetUserId) {
            // Planlı aktiviteyse yeni bildirim türümüzü kullan
            await notifyUser(
                targetUserId,
                'NEW_ACTIVITY',
                'Yeni Aktivite Planlandı 📅',
                `Size ileri tarihli yeni bir aktivite atandı.`
            );
        } else if (targetUserId !== parseInt(userId)) {
            // Planlı değil ama başkasına atanmışsa
            await notifyUser(
                targetUserId,
                'COMPANY_UPDATED',
                'Yeni Görev Atandı',
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
                isPlanned: data.isPlanned, // Anasayfadan tamamlandığında 'false' yapabilmek için eklendi
                date: data.date,           // Tamamlanma tarihini güncelleyebilmek için eklendi
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
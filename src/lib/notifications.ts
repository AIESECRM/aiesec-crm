import prisma from '@/lib/prisma';

// Belirli bir şubedeki LCP/LCVP + tüm MCP/MCVP/ADMIN'lere bildirim gönder
export async function notifyLeaders(
    chapter: string | null,
    type: 'NEW_OFFER' | 'COMPANY_UPDATED' | 'NEW_USER' | 'USER_APPROVED' | 'USER_REJECTED',
    title: string,
    message: string,
    excludeUserId?: number
) {
    try {
        // MCP/MCVP/ADMIN - hepsine gönder
        const nationalLeaders = await prisma.user.findMany({
            where: {
                role: { in: ['MCP', 'MCVP', 'ADMIN'] },
                status: 'ACTIVE',
                ...(excludeUserId ? { id: { not: excludeUserId } } : {})
            },
            select: { id: true }
        });

        // Şubenin LCP/LCVP'si
        const chapterLeaders = chapter ? await prisma.user.findMany({
            where: {
                role: { in: ['LCP', 'LCVP'] },
                chapter: chapter as any,
                status: 'ACTIVE',
                ...(excludeUserId ? { id: { not: excludeUserId } } : {})
            },
            select: { id: true }
        }) : [];

        const allRecipients = [
            ...nationalLeaders.map(u => u.id),
            ...chapterLeaders.map(u => u.id)
        ];

        // Duplicate kaldır
        const uniqueRecipients = [...new Set(allRecipients)];

        if (uniqueRecipients.length === 0) return;

        await prisma.notification.createMany({
            data: uniqueRecipients.map(userId => ({
                userId,
                type,
                title,
                message,
                read: false,
                createdAt: Math.floor(Date.now() / 1000),
            }))
        });
    } catch (error) {
        console.error('Failed to create notifications:', error);
    }
}

// Tek bir kullanıcıya bildirim gönder
export async function notifyUser(
    userId: number,
    type: 'NEW_OFFER' | 'COMPANY_UPDATED' | 'NEW_USER' | 'USER_APPROVED' | 'USER_REJECTED',
    title: string,
    message: string
) {
    try {
        await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                read: false,
                createdAt: Math.floor(Date.now() / 1000),
            }
        });
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
}
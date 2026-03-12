'use server'

import prisma from '@/lib/prisma'

export async function sendMessage(senderId: number, receiverId: number, content: string) {
    try {
        const message = await (prisma as any).message.create({
            data: {
                senderId,
                receiverId,
                content,
                createdAt: Math.floor(Date.now() / 1000)
            }
        });
        return { success: true, message };
    } catch (error) {
        console.error('Failed to send message:', error);
        return { success: false, error: 'Mesaj gönderilemedi' };
    }
}

export async function getMessages(userId1: number, userId2: number) {
    try {
        const messages = await (prisma as any).message.findMany({
            where: {
                OR: [
                    { senderId: userId1, receiverId: userId2 },
                    { senderId: userId2, receiverId: userId1 }
                ]
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        return messages;
    } catch (error) {
        console.error('Failed to get messages:', error);
        return [];
    }
}

export async function getUnreadMessageCount(userId: number) {
    try {
        const count = await (prisma as any).message.count({
            where: {
                receiverId: userId,
                isRead: false
            }
        });
        return count;
    } catch (error) {
        console.error('Failed to get unread count:', error);
        return 0;
    }
}

export async function markAsRead(receiverId: number, senderId: number) {
    try {
        await (prisma as any).message.updateMany({
            where: {
                receiverId,
                senderId,
                isRead: false
            },
            data: {
                isRead: true
            }
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to mark messages as read:', error);
        return { success: false };
    }
}

export async function getRecentConversations(userId: number) {
    try {
        const messages = await (prisma as any).message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                sender: { select: { id: true, name: true, email: true, role: true } },
                receiver: { select: { id: true, name: true, email: true, role: true } }
            }
        });

        const usersMap = new Map();
        
        messages.forEach((msg: any) => {
            const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            const partner = msg.senderId === userId ? msg.receiver : msg.sender;
            
            if (!usersMap.has(partnerId)) {
                usersMap.set(partnerId, {
                    user: partner,
                    lastMessage: msg,
                    unreadCount: msg.receiverId === userId && !msg.isRead ? 1 : 0
                });
            } else if (msg.receiverId === userId && !msg.isRead) {
                const existing = usersMap.get(partnerId);
                existing.unreadCount += 1;
            }
        });

        return Array.from(usersMap.values());
    } catch (error) {
        console.error('Failed to get conversations:', error);
        return [];
    }
}

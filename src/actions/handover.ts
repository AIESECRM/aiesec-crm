'use server'

import prisma from '@/lib/prisma'

export async function executeHandover(fromUserId: string, toUserId: string, executorId: string, reason: string) {
    try {
        const fromId = parseInt(fromUserId);
        const toId = parseInt(toUserId);
        const execId = parseInt(executorId);

        const toUser = await prisma.user.findUnique({ where: { id: toId } });
        if (!toUser) throw new Error("Hedef kullanıcı bulunamadı.");

        await prisma.$transaction(async (tx: any) => {
            // 1. Şirketlerin createdById'sini aktar
            await tx.company.updateMany({
                where: { createdById: fromId },
                data: { createdById: toId }
            });

            // 2. Aktiviteleri aktar
            await tx.activity.updateMany({
                where: { userId: fromId },
                data: { userId: toId }
            });

            // 3. Teklifleri aktar
            await tx.offer.updateMany({
                where: { createdById: fromId },
                data: { createdById: toId }
            });

            // 3.5 Menajerlikleri (managers) aktar (Many-to-Many olduğu için tek tek)
            const managedCompanies = await tx.company.findMany({
                where: { managers: { some: { id: fromId } } },
                select: { id: true }
            });
            for (const company of managedCompanies) {
                await tx.company.update({
                    where: { id: company.id },
                    data: {
                        managers: {
                            disconnect: { id: fromId },
                            connect: { id: toId }
                        }
                    }
                });
            }

            // 4. HandoverHistory kaydı
            await tx.handoverHistory.create({
                data: {
                    fromUserId: fromId,
                    toUserId: toId,
                    reason: reason || null,
                    timestamp: Math.floor(Date.now() / 1000)
                }
            });

            // 5. AuditLog kaydı
            await tx.auditLog.create({
                data: {
                    userId: execId,
                    actionType: 'HANDOVER_PORTFOLIO',
                    entityId: String(fromId),
                    oldVal: String(fromId),
                    newVal: String(toId),
                    timestamp: Math.floor(Date.now() / 1000)
                }
            });
        });

        return { success: true };
    } catch (error: any) {
        console.error('Handover failed:', error);
        return { success: false, error: error.message };
    }
}
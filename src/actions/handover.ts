'use server'

import prisma from '@/lib/prisma'

export async function executeHandover(fromUserId: string, toUserId: string, executorId: string, reason: string) {
    try {
        const toUser = await prisma.user.findUnique({ where: { id: toUserId } });
        if (!toUser) throw new Error("Hedef kullanıcı bulunamadı.");

        await prisma.$transaction(async (tx) => {
            // 1. Get companies managed by fromUserId
            const oldCompanies = await tx.company.findMany({
                where: { managers: { some: { id: fromUserId } } },
                select: { id: true }
            });

            // 2. Transfer Company managers
            for (const company of oldCompanies) {
                await tx.company.update({
                    where: { id: company.id },
                    data: {
                        managers: {
                            disconnect: { id: fromUserId },
                            connect: { id: toUserId }
                        }
                    }
                });
            }

            // 3. Transfer Proposals (String comparison since ownerId is String/UUID)
            // Note: ownerName is sometimes used for denormalization
            await tx.proposal.updateMany({
                where: { ownerId: fromUserId },
                data: {
                    ownerId: toUserId,
                    ownerName: toUser.name
                }
            });

            // 4. Transfer Activities
            await tx.activity.updateMany({
                where: { userId: fromUserId },
                data: {
                    userId: toUserId
                }
            });

            // 5. Log HandoverHistory
            await tx.handoverHistory.create({
                data: {
                    fromUserId,
                    toUserId,
                    reason,
                }
            });

            // 6. AuditLog
            await tx.auditLog.create({
                data: {
                    userId: executorId,
                    actionType: 'HANDOVER_PORTFOLIO',
                    entityId: fromUserId,
                    oldVal: fromUserId,
                    newVal: toUserId
                }
            });
        });

        return { success: true };
    } catch (error: any) {
        console.error('Handover failed:', error);
        return { success: false, error: error.message };
    }
}

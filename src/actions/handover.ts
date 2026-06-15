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
            // Menajerlikleri (managers) aktar — Raw SQL ile tek seferde
            // Önce hedef kullanıcıyı, kaynak kullanıcının olduğu tüm şirketlere ekle (zaten varsa atla)
            await tx.$executeRawUnsafe(
                `INSERT IGNORE INTO \`_CompanyManagers\` (A, B)
                 SELECT A, ? FROM \`_CompanyManagers\` WHERE B = ?`,
                toId, fromId
            );
            // Sonra kaynak kullanıcının tüm manager bağlantılarını sil
            await tx.$executeRawUnsafe(
                `DELETE FROM \`_CompanyManagers\` WHERE B = ?`,
                fromId
            );

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
        }, {
            maxWait: 10000,  // Transaction başlaması için max bekleme: 10sn
            timeout: 30000,  // Transaction çalışma süresi: 30sn
        });

        return { success: true };
    } catch (error: any) {
        console.error('Handover failed:', error);
        return { success: false, error: error.message };
    }
}
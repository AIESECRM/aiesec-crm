import prisma from './prisma';

export async function logAudit(userId: string, actionType: string, entityId: string, oldVal?: string, newVal?: string, ipAddress?: string) {
    try {
        await prisma.auditLog.create({
            data: {
                userId: parseInt(userId),
                actionType,
                entityId,
                oldVal,
                newVal,
                ipAddress,
                timestamp: Math.floor(Date.now() / 1000)
            }
        });
    } catch (error) {
        console.error('Audit logging failed:', error);
    }
}
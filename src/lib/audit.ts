import prisma from './prisma';

export async function logAudit(userId: string, actionType: string, entityId: string, oldVal?: string, newVal?: string, ipAddress?: string) {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                actionType,
                entityId,
                oldVal,
                newVal,
                ipAddress
            }
        });
    } catch (error) {
        console.error('Audit logging failed:', error);
    }
}

'use server'

import prisma from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { verifyCompanyAccess } from '@/lib/authz'

function mapCompany(prismaCompany: any) {
    return {
        ...prismaCompany,
        assignedManagerIds: prismaCompany.managers?.map((m: any) => m.id) || []
    }
}

export async function getCompanies(userId: string) {
    try {
        const dbUser = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
        if (!dbUser) return [];

        let whereClause: any = {};
        if (dbUser.role === 'TM') {
            whereClause = { managers: { some: { id: parseInt(userId) } } };
        } else if (dbUser.role === 'LCP' || dbUser.role === 'LCVP' || dbUser.role === 'TL') {
            whereClause = { chapter: dbUser.chapter };
        }

        const companies = await prisma.company.findMany({
            where: whereClause,
            include: { managers: true },
            orderBy: { createdAt: 'desc' }
        });

        return companies.map(mapCompany);
    } catch (error) {
        console.error('Failed to fetch companies:', error);
        return [];
    }
}

export async function getCompanyById(id: string, userId: string) {
    try {
        if (!userId) return null;
        const hasAccess = await verifyCompanyAccess(userId, id);
        if (!hasAccess) return null;

        const company = await prisma.company.findUnique({
            where: { id: parseInt(id) },
            include: { managers: true }
        });

        if (!company) return null;
        return mapCompany(company);
    } catch (error) {
        console.error(`Failed to fetch company ${id}:`, error);
        return null;
    }
}

export async function createCompany(data: any, creatorId: string) {
    try {
        if (data.domain || data.taxId) {
            const existing = await prisma.company.findFirst({
                where: {
                    OR: [
                        data.domain ? { domain: data.domain } : undefined,
                        data.taxId ? { taxId: data.taxId } : undefined
                    ].filter(Boolean) as any
                }
            });
            if (existing) {
                if (existing.domain === data.domain) return { success: false, error: 'Bu domain ile kayıtlı bir şirket zaten var.' };
                if (existing.taxId === data.taxId) return { success: false, error: 'Bu vergi numarası ile kayıtlı bir şirket zaten var.' };
            }
        }

        const dbUser = await prisma.user.findUnique({ where: { id: parseInt(creatorId) } });

        const newCompany = await prisma.company.create({
            data: {
                name: data.name!,
                category: data.category || null,
                location: data.location || null,
                phone: data.phone || null,
                email: data.email || null,
                website: data.website || null,
                domain: data.domain || null,
                taxId: data.taxId || null,
                status: data.status || 'NO_ANSWER',
                notes: data.notes || null,
                chapter: data.chapter || dbUser?.chapter || null,
                createdById: parseInt(creatorId),
                createdAt: Math.floor(Date.now() / 1000),
                updatedAt: Math.floor(Date.now() / 1000),
                managers: {
                    connect: { id: parseInt(creatorId) }
                }
            },
            include: { managers: true }
        });

        await logAudit(creatorId, 'CREATE_COMPANY', String(newCompany.id), undefined, JSON.stringify({ name: newCompany.name, status: newCompany.status, category: newCompany.category }));

        return { success: true, data: mapCompany(newCompany) };
    } catch (error: any) {
        console.error('Failed to create company:', error);
        return { success: false, error: error.message || 'Bilinmeyen bir hata oluştu.' };
    }
}

export async function updateCompanyManagers(companyId: string, managerIds: string[], userId: string) {
    try {
        const hasAccess = await verifyCompanyAccess(userId, companyId);
        if (!hasAccess) return false;

        await prisma.company.update({
            where: { id: parseInt(companyId) },
            data: {
                managers: {
                    set: managerIds.map(id => ({ id: parseInt(id) }))
                }
            }
        });
        return true;
    } catch (error) {
        console.error(`Failed to update managers for company ${companyId}:`, error);
        return false;
    }
}

export async function updateCompany(id: string, data: any, userId: string) {
    try {
        if (!userId) return { success: false, error: 'Unauthorized' };

        const hasAccess = await verifyCompanyAccess(userId, id);
        if (!hasAccess) return { success: false, error: 'Unauthorized' };

        if (data.domain || data.taxId) {
            const existing = await prisma.company.findFirst({
                where: {
                    id: { not: parseInt(id) },
                    OR: [
                        data.domain ? { domain: data.domain } : undefined,
                        data.taxId ? { taxId: data.taxId } : undefined
                    ].filter(Boolean) as any
                }
            });
            if (existing) {
                if (existing.domain === data.domain) return { success: false, error: 'Bu domain ile kayıtlı bir şirket zaten var.' };
                if (existing.taxId === data.taxId) return { success: false, error: 'Bu vergi numarası ile kayıtlı bir şirket zaten var.' };
            }
        }

        const updated = await prisma.company.update({
            where: { id: parseInt(id) },
            data: {
                name: data.name,
                category: data.category || null,
                location: data.location || null,
                phone: data.phone || null,
                email: data.email || null,
                website: data.website || null,
                domain: data.domain || null,
                taxId: data.taxId || null,
                status: data.status,
                notes: data.notes || null,
                chapter: data.chapter,
                updatedAt: Math.floor(Date.now() / 1000),
            },
            include: { managers: true }
        });

        await logAudit(userId, 'UPDATE_COMPANY', String(updated.id), undefined, JSON.stringify({ name: updated.name, status: updated.status, category: updated.category }));

        return { success: true, data: mapCompany(updated) };
    } catch (error: any) {
        console.error(`Failed to update company ${id}:`, error);
        return { success: false, error: 'Güncelleme başarısız oldu.' };
    }
}

export async function deleteCompany(id: string, userId: string) {
    try {
        if (!userId) return false;
        const hasAccess = await verifyCompanyAccess(userId, id);
        if (!hasAccess) return false;

        await prisma.company.delete({ where: { id: parseInt(id) } });
        await logAudit(userId, 'DELETE_COMPANY', id);
        return true;
    } catch (error) {
        console.error(`Failed to delete company ${id}:`, error);
        return false;
    }
}
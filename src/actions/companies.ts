'use server'

import prisma from '@/lib/prisma'
import { Company, User } from '@/types'
import { logAudit } from '@/lib/audit'
import { verifyCompanyAccess } from '@/lib/authz'
import { z } from 'zod'

const companySchema = z.object({
    name: z.string().min(2, "Şirket adı en az 2 karakter olmalıdır"),
    category: z.string().min(1, "Sektör zorunludur"),
    location: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().email("Geçerli bir e-posta adresi girin").optional().nullable().or(z.literal('')),
    website: z.string().url("Geçerli bir web adresi girin").optional().nullable().or(z.literal('')),
    domain: z.string().optional().nullable(),
    taxId: z.string().optional().nullable(),
    status: z.string().optional(),
    notes: z.string().optional().nullable()
});

// Map a Prisma Company (with nested managers) to our Frontend Company type
function mapCompany(prismaCompany: any): Company {
    return {
        ...prismaCompany,
        role: prismaCompany.role as any, // Not used strictly in Company interface but just in case
        // Extract strictly the IDs of the managers for the frontend
        assignedManagerIds: prismaCompany.managers?.map((m: any) => m.id) || []
    }
}

export async function getCompanies(userId: string): Promise<Company[]> {
    try {
        const dbUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!dbUser) return [];

        let whereClause: any = {};
        if (dbUser.role === 'TeamMember') {
            whereClause = { managers: { some: { id: dbUser.id } } };
        } else if (dbUser.role === 'LCP' || dbUser.role === 'LCVP') {
            whereClause = { managers: { some: { branchId: dbUser.branchId } } };
        } else if (dbUser.role === 'TeamLeader') {
            whereClause = { managers: { some: { teamId: dbUser.teamId } } };
        }

        const companies = await prisma.company.findMany({
            where: whereClause,
            include: {
                managers: true, // Fetch the assigned managers
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return companies.map(mapCompany)
    } catch (error) {
        console.error('Failed to fetch companies:', error)
        return []
    }
}

export async function getCompanyById(id: string, userId: string): Promise<Company | null> {
    try {
        if (!userId) return null;
        const hasAccess = await verifyCompanyAccess(userId, id);
        if (!hasAccess) return null;

        const company = await prisma.company.findUnique({
            where: { id },
            include: {
                managers: true,
            }
        })

        if (!company) return null
        return mapCompany(company)
    } catch (error) {
        console.error(`Failed to fetch company ${id}:`, error)
        return null
    }
}

export async function createCompany(data: Partial<Company>, creatorId: string): Promise<{ success: boolean, data?: Company, error?: string }> {
    try {
        const validation = companySchema.safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message };
        }

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
                if (existing.domain === data.domain) return { success: false, error: 'Bu domain (alan adı) ile kayıtlı bir şirket zaten var.' };
                if (existing.taxId === data.taxId) return { success: false, error: 'Bu vergi numarası ile kayıtlı bir şirket zaten var.' };
            }
        }

        const newCompany = await prisma.company.create({
            data: {
                name: data.name!,
                category: data.category!,
                location: data.location || '',
                phone: data.phone || '',
                email: data.email || '',
                website: data.website || '',
                domain: data.domain || null,
                taxId: data.taxId || null,
                status: data.status || 'aktif',
                notes: data.notes || '',
                managers: {
                    connect: { id: creatorId }
                }
            },
            include: {
                managers: true
            }
        });

        await logAudit(
            creatorId,
            'CREATE_COMPANY',
            newCompany.id,
            undefined,
            JSON.stringify({ name: newCompany.name, status: newCompany.status, category: newCompany.category })
        );

        return { success: true, data: mapCompany(newCompany) };
    } catch (error: any) {
        console.error('Failed to create company:', error)
        return { success: false, error: error.message || 'Bilinmeyen bir hata oluştu.' };
    }
}

export async function updateCompanyManagers(companyId: string, managerIds: string[], userId: string): Promise<boolean> {
    try {
        const hasAccess = await verifyCompanyAccess(userId, companyId);
        if (!hasAccess) return false;

        await prisma.company.update({
            where: { id: companyId },
            data: {
                managers: {
                    set: managerIds.map(id => ({ id })) // Replaces the entire relation list with the new IDs
                }
            }
        })
        return true
    } catch (error) {
        console.error(`Failed to update managers for company ${companyId}:`, error)
        return false
    }
}

export async function updateCompany(id: string, data: Partial<Company>, userId: string): Promise<{ success: boolean, data?: Company, error?: string }> {
    try {
        if (!userId) return { success: false, error: 'Unauthorized' };

        const hasAccess = await verifyCompanyAccess(userId, id);
        if (!hasAccess) return { success: false, error: 'Unauthorized' };

        const validation = companySchema.safeParse(data);
        if (!validation.success) {
            return { success: false, error: validation.error.issues[0].message };
        }

        if (data.domain || data.taxId) {
            const existing = await prisma.company.findFirst({
                where: {
                    id: { not: id },
                    OR: [
                        data.domain ? { domain: data.domain } : undefined,
                        data.taxId ? { taxId: data.taxId } : undefined
                    ].filter(Boolean) as any
                }
            });
            if (existing) {
                if (existing.domain === data.domain) return { success: false, error: 'Bu domain (alan adı) ile kayıtlı bir şirket zaten var.' };
                if (existing.taxId === data.taxId) return { success: false, error: 'Bu vergi numarası ile kayıtlı bir şirket zaten var.' };
            }
        }

        const updated = await prisma.company.update({
            where: { id },
            data: {
                name: data.name,
                category: data.category,
                location: data.location,
                phone: data.phone,
                email: data.email,
                website: data.website,
                domain: data.domain,
                taxId: data.taxId,
                status: data.status,
                notes: data.notes,
            },
            include: {
                managers: true
            }
        });

        await logAudit(
            userId,
            'UPDATE_COMPANY',
            updated.id,
            undefined,
            JSON.stringify({ name: updated.name, status: updated.status, category: updated.category })
        );

        return { success: true, data: mapCompany(updated) };
    } catch (error: any) {
        console.error(`Failed to update company ${id}:`, error);
        return { success: false, error: 'Güncelleme başarısız oldu.' };
    }
}

export async function deleteCompany(id: string, userId: string): Promise<boolean> {
    try {
        if (!userId) return false;
        const hasAccess = await verifyCompanyAccess(userId, id);
        if (!hasAccess) return false;

        // Cascade delete should handle related entities depending on schema, otherwise manual deletion might be needed.
        // Assumes Prisma Schema is set up with onDelete: Cascade for contacts, proposals, activities.
        await prisma.company.delete({
            where: { id }
        });

        await logAudit(
            userId,
            'DELETE_COMPANY',
            id
        );

        return true;
    } catch (error) {
        console.error(`Failed to delete company ${id}:`, error);
        return false;
    }
}

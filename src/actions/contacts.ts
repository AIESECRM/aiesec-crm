'use server'

import prisma from '@/lib/prisma'
import { Contact } from '@/types'
import { verifyCompanyAccess, verifyContactAccess } from '@/lib/authz'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const contactSchema = z.object({
    companyId: z.string().optional(),
    name: z.string().optional(),
    email: z.string().email("Geçerli bir e-posta girin").optional().nullable().or(z.literal('')),
    phone: z.string().optional().nullable(),
    position: z.string().optional().nullable(),
    isPrimary: z.boolean().optional(),
});

// Map Prisma Contact to Frontend shape
function mapContact(prismaContact: any): Contact {
    return {
        ...prismaContact,
    }
}

export async function getContactsByCompany(companyId: string, userId: string): Promise<Contact[]> {
    try {
        if (!userId) return [];
        const hasAccess = await verifyCompanyAccess(userId, companyId);
        if (!hasAccess) return [];

        const contacts = await prisma.contact.findMany({
            where: { companyId },
            orderBy: { isPrimary: 'desc', createdAt: 'desc' }
        })
        return contacts.map(mapContact)
    } catch (error) {
        console.error(`Failed to fetch contacts for company ${companyId}:`, error)
        return []
    }
}

export async function createContact(data: Partial<Contact>, userId: string): Promise<Contact | null> {
    try {
        const validation = contactSchema.safeParse(data);
        if (!validation.success) {
            console.error('Validation error:', validation.error.issues);
            return null;
        }

        if (!userId || !data.companyId) return null;
        const hasAccess = await verifyCompanyAccess(userId, data.companyId);
        if (!hasAccess) return null;

        const newContact = await prisma.contact.create({
            data: {
                companyId: data.companyId!,
                name: data.name!,
                email: data.email,
                phone: data.phone,
                position: data.position,
                isPrimary: data.isPrimary || false,
            }
        })

        await logAudit(
            userId,
            'CREATE_CONTACT',
            newContact.id,
            undefined,
            JSON.stringify(newContact)
        )

        return mapContact(newContact)
    } catch (error) {
        console.error('Failed to create contact:', error)
        return null
    }
}

export async function updateContact(id: string, data: Partial<Contact>, userId: string): Promise<Contact | null> {
    try {
        const validation = contactSchema.safeParse(data);
        if (!validation.success) {
            console.error('Validation error:', validation.error.issues);
            return null;
        }

        if (!userId) return null;
        const hasAccess = await verifyContactAccess(userId, id);
        if (!hasAccess) return null;

        const updated = await prisma.contact.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                position: data.position,
                isPrimary: data.isPrimary,
            }
        })

        await logAudit(
            userId,
            'UPDATE_CONTACT',
            updated.id,
            undefined,
            JSON.stringify(updated)
        )

        return mapContact(updated)
    } catch (error) {
        console.error(`Failed to update contact ${id}:`, error)
        return null
    }
}

export async function deleteContact(id: string, userId: string): Promise<boolean> {
    try {
        if (!userId) return false;
        const hasAccess = await verifyContactAccess(userId, id);
        if (!hasAccess) return false;

        await prisma.contact.delete({
            where: { id }
        })

        await logAudit(
            userId,
            'DELETE_CONTACT',
            id
        )

        return true
    } catch (error) {
        console.error(`Failed to delete contact ${id}:`, error)
        return false
    }
}

export async function getAllContacts(userId: string): Promise<Contact[]> {
    try {
        const dbUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!dbUser) return [];

        let whereClause: any = {};
        if (dbUser.role === 'TeamMember') {
            whereClause = { company: { managers: { some: { id: dbUser.id } } } };
        } else if (dbUser.role === 'LCP' || dbUser.role === 'LCVP') {
            whereClause = { company: { managers: { some: { branchId: dbUser.branchId } } } };
        } else if (dbUser.role === 'TeamLeader') {
            whereClause = { company: { managers: { some: { teamId: dbUser.teamId } } } };
        }

        const contacts = await prisma.contact.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });
        return contacts.map(mapContact);
    } catch (error) {
        console.error('Failed to fetch all contacts:', error);
        return [];
    }
}

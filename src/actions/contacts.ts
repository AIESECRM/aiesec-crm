'use server'

import prisma from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

export async function getContactsByCompany(companyId: string, userId: string) {
    try {
        if (!userId) return [];

        const contacts = await prisma.contact.findMany({
            where: { companyId: parseInt(companyId) },
            orderBy: { createdAt: 'desc' }
        });
        return contacts;
    } catch (error) {
        console.error(`Failed to fetch contacts for company ${companyId}:`, error);
        return [];
    }
}

export async function createContact(data: any, userId: string) {
    try {
        if (!userId || !data.companyId) return null;

        const newContact = await prisma.contact.create({
            data: {
                companyId: parseInt(data.companyId),
                name: data.name!,
                email: data.email || null,
                phone: data.phone || null,
                position: data.position || null,
                createdAt: Math.floor(Date.now() / 1000),
            }
        });

        await logAudit(userId, 'CREATE_CONTACT', String(newContact.id), undefined, JSON.stringify(newContact));

        return newContact;
    } catch (error) {
        console.error('Failed to create contact:', error);
        return null;
    }
}

export async function updateContact(id: string, data: any, userId: string) {
    try {
        if (!userId) return null;

        const updated = await prisma.contact.update({
            where: { id: parseInt(id) },
            data: {
                name: data.name,
                email: data.email || null,
                phone: data.phone || null,
                position: data.position || null,
            }
        });

        await logAudit(userId, 'UPDATE_CONTACT', String(updated.id), undefined, JSON.stringify(updated));

        return updated;
    } catch (error) {
        console.error(`Failed to update contact ${id}:`, error);
        return null;
    }
}

export async function deleteContact(id: string, userId: string) {
    try {
        if (!userId) return false;

        await prisma.contact.delete({ where: { id: parseInt(id) } });
        await logAudit(userId, 'DELETE_CONTACT', id);
        return true;
    } catch (error) {
        console.error(`Failed to delete contact ${id}:`, error);
        return false;
    }
}

export async function getAllContacts(userId: string) {
    try {
        const dbUser = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
        if (!dbUser) return [];

        let whereClause: any = {};
        if (dbUser.role === 'TM' || dbUser.role === 'TL') {
            whereClause = { company: { createdById: parseInt(userId) } };
        } else if (dbUser.role === 'LCP' || dbUser.role === 'LCVP') {
            whereClause = { company: { chapter: dbUser.chapter } };
        }

        const contacts = await prisma.contact.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });
        return contacts;
    } catch (error) {
        console.error('Failed to fetch all contacts:', error);
        return [];
    }
}
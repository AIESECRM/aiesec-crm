'use server'

import prisma from '@/lib/prisma'
import { User, UserRole } from '@/types'

// Map Prisma User to Frontend User type
function mapUser(prismaUser: any): User {
    return {
        id: prismaUser.id,
        name: prismaUser.name,
        email: prismaUser.email,
        role: prismaUser.role as UserRole,
        avatar: prismaUser.avatar || undefined,
        branchId: prismaUser.branchId || undefined,
        chapter: prismaUser.chapter || undefined,
        status: prismaUser.status || undefined,
        teamId: prismaUser.teamId || undefined,
        createdAt: prismaUser.createdAt,
    }
}

export async function getAllUsers(): Promise<User[]> {
    try {
        const users = await prisma.user.findMany({
            orderBy: { name: 'asc' }
        });
        return users.map(mapUser);
    } catch (error) {
        console.error('Failed to fetch all users:', error);
        return [];
    }
}

export async function getUserById(id: string): Promise<User | null> {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        return user ? mapUser(user) : null;
    } catch (error) {
        console.error(`Failed to fetch user ${id}:`, error);
        return null;
    }
}

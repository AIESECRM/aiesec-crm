'use server'

import prisma from '@/lib/prisma'
import { User } from '@/types'

// Map Prisma User to Frontend User type
function mapUser(prismaUser: any): User {
    return {
        id: prismaUser.id,
        name: prismaUser.name,
        email: prismaUser.email,
        role: prismaUser.role as User['role'],
        avatar: prismaUser.avatar || undefined,
        branchId: prismaUser.branchId || undefined,
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

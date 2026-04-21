'use server'

import prisma from '@/lib/prisma'

function mapUser(prismaUser: any) {
    return {
        id: prismaUser.id,
        name: prismaUser.name,
        email: prismaUser.email,
        role: prismaUser.role,
        image: prismaUser.image,
        chapter: prismaUser.chapter || undefined,
        status: prismaUser.status || undefined,
        createdAt: prismaUser.createdAt,
    }
}

export async function getAllUsers() {
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

export async function getUserById(id: string) {
    try {
        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
        return user ? mapUser(user) : null;
    } catch (error) {
        console.error(`Failed to fetch user ${id}:`, error);
        return null;
    }
}
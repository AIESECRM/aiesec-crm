'use server'

import prisma from '@/lib/prisma'
import { User } from '@/types'

export async function loginWithEmail(email: string): Promise<User | null> {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) return null

        // Map Prisma User to Frontend User type
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as User['role'],
            avatar: user.avatar || undefined,
            branchId: user.branchId || undefined,
            teamId: user.teamId || undefined,
            createdAt: user.createdAt,
        }
    } catch (error) {
        console.error('Login Error:', error)
        return null
    }
}

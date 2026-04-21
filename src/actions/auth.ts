'use server'

import prisma from '@/lib/prisma'

export async function loginWithEmail(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) return null

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            chapter: user.chapter,
            status: user.status,
            createdAt: user.createdAt,
        }
    } catch (error) {
        console.error('Login Error:', error)
        return null
    }
}
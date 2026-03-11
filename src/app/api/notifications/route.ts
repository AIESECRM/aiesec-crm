import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

    const userId = parseInt((session.user as any).id);

    const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
    });

    const unreadCount = await prisma.notification.count({
        where: { userId, read: false }
    });

    return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

    const userId = parseInt((session.user as any).id);
    const { notificationId, markAll } = await req.json();

    if (markAll) {
        await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true }
        });
    } else if (notificationId) {
        await prisma.notification.update({
            where: { id: parseInt(notificationId) },
            data: { read: true }
        });
    }

    return NextResponse.json({ success: true });
}
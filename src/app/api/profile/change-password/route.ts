import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Yetkisiz!" }, { status: 401 });

    const userId = parseInt((session.user as any).id);
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: "Tüm alanları doldurun!" }, { status: 400 });
    }

    if (newPassword.length < 8) {
        return NextResponse.json({ error: "Yeni şifre en az 8 karakter olmalıdır!" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
        return NextResponse.json({ error: "Kullanıcı bulunamadı!" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
        return NextResponse.json({ error: "Mevcut şifre yanlış!" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true, message: "Şifre başarıyla güncellendi!" });
}
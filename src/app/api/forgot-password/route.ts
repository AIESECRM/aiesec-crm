import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetCode } from "@/lib/mail";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const resetCodes = new Map<string, { code: string; expiresAt: number }>();

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { action } = body;

    if (action === "send-code") {
        const { email } = body;
        if (!email) return NextResponse.json({ error: "Email zorunludur!" }, { status: 400 });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return NextResponse.json({ error: "Bu email ile kayıtlı hesap bulunamadı!" }, { status: 404 });

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000;

        resetCodes.set(email, { code, expiresAt });

        await sendPasswordResetCode(email, code, user.name);

        return NextResponse.json({ success: true });
    }

    if (action === "reset-password") {
        const { email, code, newPassword } = body;

        const stored = resetCodes.get(email);
        if (!stored) return NextResponse.json({ error: "Kod bulunamadı, tekrar deneyin!" }, { status: 400 });
        if (Date.now() > stored.expiresAt) {
            resetCodes.delete(email);
            return NextResponse.json({ error: "Kodun süresi doldu!" }, { status: 400 });
        }
        if (stored.code !== code) return NextResponse.json({ error: "Hatalı kod!" }, { status: 400 });
        if (!newPassword || newPassword.length < 8) return NextResponse.json({ error: "Şifre en az 8 karakter olmalıdır!" }, { status: 400 });

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });

        resetCodes.delete(email);
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Geçersiz işlem!" }, { status: 400 });
}
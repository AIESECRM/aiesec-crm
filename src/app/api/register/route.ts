import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationCode } from "@/lib/mail";
import bcrypt from "bcryptjs";
import type { UserStatus } from "@prisma/client";
export const runtime = 'nodejs';

const verificationCodes = new Map<string, { code: string; data: any; expiresAt: number }>();

const ADMIN_ROLES = ["LCVP", "LCP", "MCVP", "MCP", "ADMIN"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "send-code") {
      const { name, email, password, role, chapter, phone } = body;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { error: "Bu email zaten kayıtlı!" },
          { status: 400 }
        );
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000;

      verificationCodes.set(email, {
        code,
        data: { name, email, password, role, chapter, phone },
        expiresAt,
      });

      await sendVerificationCode(email, code, name);

      return NextResponse.json({ success: true, message: "Doğrulama kodu gönderildi!" });
    }

    if (action === "verify-code") {
      const { email, code } = body;

      const stored = verificationCodes.get(email);

      if (!stored) {
        return NextResponse.json(
          { error: "Kod bulunamadı, tekrar kayıt olun!" },
          { status: 400 }
        );
      }

      if (Date.now() > stored.expiresAt) {
        verificationCodes.delete(email);
        return NextResponse.json(
          { error: "Kodun süresi doldu, tekrar deneyin!" },
          { status: 400 }
        );
      }

      if (stored.code !== code) {
        return NextResponse.json(
          { error: "Hatalı kod!" },
          { status: 400 }
        );
      }

      const { name, email: userEmail, password, role, chapter, phone } = stored.data;
      const hashedPassword = await bcrypt.hash(password, 12);

      // ADMIN rolleri direkt PENDING, onay admin panelinden gelecek
      // TM/TL de PENDING, onay LCVP/LCP'den gelecek
      const status = "PENDING";

      const user = await prisma.user.create({
        data: {
          name,
          email: userEmail,
          password: hashedPassword,
          role: role || "TM",
          chapter: chapter || null,
          status: "PENDING" as UserStatus,
          createdAt: Math.floor(Date.now() / 1000),
          updatedAt: Math.floor(Date.now() / 1000),
        },
      });

      verificationCodes.delete(email);

      return NextResponse.json({
        success: true,
        message: ADMIN_ROLES.includes(role)
          ? "Hesabınız oluşturuldu! Admin onayı bekleniyor."
          : "Hesabınız oluşturuldu! Şube yöneticinizin onayı bekleniyor.",
        userId: user.id,
      });
    }

    return NextResponse.json({ error: "Geçersiz işlem!" }, { status: 400 });

  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Sunucu hatası!" },
      { status: 500 }
    );
  }
}
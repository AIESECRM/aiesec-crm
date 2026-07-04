import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ALLOWED_ORIGINS = [
  "chrome-extension://",
  "http://localhost:3000",
  "https://aiesecrm.com",
];

function getCorsHeaders(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const isAllowed = ALLOWED_ORIGINS.some(o => origin.startsWith(o)) || origin.endsWith(".vercel.app");
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "https://aiesecrm.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(req) });
}

export async function POST(req: NextRequest) {
  const cors = getCorsHeaders(req);

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email ve şifre gereklidir." },
        { status: 400, headers: cors }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email as string },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Email veya şifre hatalı." },
        { status: 401, headers: cors }
      );
    }

    const isValid = await bcrypt.compare(password as string, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Email veya şifre hatalı." },
        { status: 401, headers: cors }
      );
    }

    if (user.status === "INACTIVE") {
      return NextResponse.json(
        { error: "Hesabınız pasife alınmıştır." },
        { status: 403, headers: cors }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Hesabınız henüz onaylanmamış." },
        { status: 403, headers: cors }
      );
    }

    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret-change-me";

    const token = jwt.sign(
      {
        id: String(user.id),
        email: user.email,
        name: user.name,
        role: user.role,
        chapter: user.chapter,
        status: user.status,
      },
      secret,
      { expiresIn: "30d" }
    );

    return NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          chapter: user.chapter,
        },
      },
      { headers: cors }
    );
  } catch (error: any) {
    console.error("Extension token error:", error);
    return NextResponse.json(
      { error: "Sunucu hatası oluştu." },
      { status: 500, headers: cors }
    );
  }
}

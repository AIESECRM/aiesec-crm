import { NextRequest } from "next/server";
import { auth } from "@/auth";
import jwt from "jsonwebtoken";

/**
 * Chrome eklentisi ve web session'dan kullanıcı doğrulama.
 * Önce Authorization: Bearer <token> header'ını kontrol eder (eklenti),
 * sonra NextAuth session'ını kontrol eder (web).
 */
export async function getAuthUser(req: NextRequest): Promise<{
  id: string;
  name: string;
  email: string;
  role: string;
  chapter: string | null;
} | null> {
  // 1. Bearer token kontrolü (Chrome eklentisi)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret-change-me";
      const decoded = jwt.verify(token, secret) as any;
      if (decoded?.id && decoded?.email) {
        return {
          id: decoded.id,
          name: decoded.name || "",
          email: decoded.email,
          role: decoded.role || "TM",
          chapter: decoded.chapter || null,
        };
      }
    } catch {
      // Token geçersiz veya süresi dolmuş — session'a düş
    }
  }

  // 2. NextAuth session kontrolü (web tarayıcı)
  const session = await auth();
  if (session?.user) {
    const user = session.user as any;
    return {
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      role: user.role || "TM",
      chapter: user.chapter || null,
    };
  }

  return null;
}

/**
 * CORS headers — Chrome eklentisi origin'lerini de destekler.
 */
const ALLOWED_ORIGINS = [
  "chrome-extension://",
  "http://localhost:3000",
  "https://aiesecrm.com",
];

export function getCorsHeaders(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const isAllowed =
    ALLOWED_ORIGINS.some((o) => origin.startsWith(o)) ||
    origin.endsWith(".vercel.app");

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "https://aiesecrm.com",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
  };
}

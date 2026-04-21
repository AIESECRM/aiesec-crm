import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === "/login";
  const isRegisterPage = req.nextUrl.pathname === "/login/register";
  const isWaitingPage = req.nextUrl.pathname === "/onay-bekleniyor";

  if (!isLoggedIn && !isLoginPage && !isRegisterPage && !isWaitingPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && (isLoginPage || isRegisterPage)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo|manifest\\.webmanifest|.*\\.svg$|.*\\.png$|.*\\.ico$).*)"],
};
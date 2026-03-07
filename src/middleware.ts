import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const { pathname } = req.nextUrl;

  const isPublicPage = pathname === "/login" || pathname === "/login/register" || pathname === "/onay-bekleniyor";
  
  if (!isLoggedIn && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/yonetim")) {
    const authorizedRoles = ["LCVP", "LCP", "MCVP", "MCP", "ADMIN"];
    if (!authorizedRoles.includes(userRole as string)) {
      return NextResponse.redirect(new URL("/", req.url)); 
    }
  }

  if (isLoggedIn && (pathname === "/login" || pathname === "/login/register")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo|manifest\\.webmanifest|.*\\.svg$|.*\\.png$|.*\\.ico$).*)"],
};

import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin-auth";

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const password = process.env.ADMIN_PASSWORD;
  const token = request.cookies.get(ADMIN_COOKIE)?.value;

  if (!password || token !== password) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};

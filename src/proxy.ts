import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyToken } from "@/lib/auth";

// Server-side guard for /admin pages (the admin APIs check the token themselves)
export async function proxy(req: NextRequest) {
  if (req.nextUrl.pathname === "/admin/login") return NextResponse.next();
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const session = token ? await verifyToken(token) : null;
  if (session?.role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };

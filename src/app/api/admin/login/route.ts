import { z } from "zod";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_EMAIL, ADMIN_PASSWORD, safeEqual, signToken } from "@/lib/auth";
import { fail, parse } from "@/lib/http";

const schema = z.object({ email: z.string().trim().toLowerCase(), password: z.string() });

export async function POST(req: Request) {
  const p = await parse(req, schema);
  if ("error" in p) return p.error;

  const good =
    safeEqual(p.data.email, ADMIN_EMAIL.toLowerCase()) && safeEqual(p.data.password, ADMIN_PASSWORD);
  if (!good) return fail("Incorrect admin email or password", 401);

  const token = await signToken({ id: 0, role: "admin" });
  const res = NextResponse.json({ token });
  // Cookie lets the server guard /admin pages; API clients can use the Bearer token instead
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

import { SignJWT, jwtVerify } from "jose";
import { createHash, timingSafeEqual } from "node:crypto";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-only-secret-change-me-please-32chars"
);

export type Session = { id: number; role: "user" | "admin" };

export const ADMIN_COOKIE = "admin_token";

export function signToken(s: Session) {
  return new SignJWT({ role: s.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(s.id))
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    const role = payload.role === "admin" ? "admin" : "user";
    return { id: Number(payload.sub), role };
  } catch {
    return null; // bad signature, expired, malformed
  }
}

function readToken(req: Request): string | null {
  const h = req.headers.get("authorization");
  if (h?.startsWith("Bearer ")) return h.slice(7);
  const cookie = req.headers.get("cookie") ?? "";
  const m = cookie.match(new RegExp(`${ADMIN_COOKIE}=([^;]+)`));
  return m ? m[1] : null;
}

/** Returns the session for a logged-in visitor (or admin), else null. */
export async function getSession(req: Request) {
  const t = readToken(req);
  return t ? verifyToken(t) : null;
}

/** Same as getSession, but only for role "user" tokens. */
export async function getUser(req: Request) {
  const s = await getSession(req);
  return s?.role === "user" ? s : null;
}

export async function getAdmin(req: Request) {
  const s = await getSession(req);
  return s?.role === "admin" ? s : null;
}

/** Constant-time string compare (avoids timing leaks on the admin password). */
export function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@events.com";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Admin@123";

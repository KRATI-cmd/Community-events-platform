import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { fail, ok, parse } from "@/lib/http";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  const p = await parse(req, schema);
  if ("error" in p) return p.error;
  const { email, password } = p.data;

  if (db.prepare("SELECT 1 FROM users WHERE email = ?").get(email)) {
    return fail("An account with this email already exists", 409);
  }
  const hash = await bcrypt.hash(password, 10);
  const r = db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)").run(email, hash);
  const id = Number(r.lastInsertRowid);
  const token = await signToken({ id, role: "user" });
  return ok({ token, user: { id, email } }, 201);
}

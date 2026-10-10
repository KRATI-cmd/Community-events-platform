import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { fail, ok, parse } from "@/lib/http";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  const p = await parse(req, schema);
  if ("error" in p) return p.error;
  const { email, password } = p.data;

  const user = db
    .prepare("SELECT id, email, password_hash FROM users WHERE email = ?")
    .get(email) as { id: number; email: string; password_hash: string } | undefined;

  // Same message for "no user" and "wrong password" so emails can't be probed
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return fail("Incorrect email or password", 401);
  }
  const token = await signToken({ id: user.id, role: "user" });
  return ok({ token, user: { id: user.id, email: user.email } });
}

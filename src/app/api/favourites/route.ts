import { z } from "zod";
import { db } from "@/lib/db";
import { CATEGORIES } from "@/lib/constants";
import { getUser } from "@/lib/auth";
import { ok, parse, unauthorized } from "@/lib/http";

const read = (userId: number) =>
  (db.prepare("SELECT category FROM user_categories WHERE user_id = ? ORDER BY category").all(userId) as { category: string }[])
    .map((r) => r.category);

export async function GET(req: Request) {
  const user = await getUser(req);
  if (!user) return unauthorized();
  return ok({ categories: read(user.id) });
}

const schema = z.object({ categories: z.array(z.enum(CATEGORIES)).max(CATEGORIES.length) });

// Replaces the whole list in one transaction
export async function PUT(req: Request) {
  const user = await getUser(req);
  if (!user) return unauthorized();
  const p = await parse(req, schema);
  if ("error" in p) return p.error;

  const del = db.prepare("DELETE FROM user_categories WHERE user_id = ?");
  const ins = db.prepare("INSERT OR IGNORE INTO user_categories (user_id, category) VALUES (?, ?)");
  db.transaction(() => {
    del.run(user.id);
    p.data.categories.forEach((c) => ins.run(user.id, c));
  })();
  return ok({ categories: read(user.id) });
}

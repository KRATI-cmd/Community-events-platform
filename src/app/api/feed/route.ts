import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { listUpcoming } from "@/lib/events";
import { ok, unauthorized } from "@/lib/http";

export async function GET(req: Request) {
  const user = await getUser(req);
  if (!user) return unauthorized();

  const categories = (db.prepare("SELECT category FROM user_categories WHERE user_id = ?").all(user.id) as { category: string }[])
    .map((r) => r.category);
  const sp = new URL(req.url).searchParams;
  const result = listUpcoming({ categories, page: Number(sp.get("page")) || 1, limit: Number(sp.get("limit")) || 6 });
  return ok({ ...result, hasFavourites: categories.length > 0 });
}

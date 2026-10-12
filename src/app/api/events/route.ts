import { CATEGORIES } from "@/lib/constants";
import { getUser } from "@/lib/auth";
import { listUpcoming, cardsAmong, remindedAmong, upcomingCities } from "@/lib/events";
import { fail, ok } from "@/lib/http";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const category = sp.get("category") || undefined;
  if (category && !(CATEGORIES as readonly string[]).includes(category)) {
    return fail("Unknown category");
  }
  const result = listUpcoming({
    category,
    city: sp.get("city") || undefined,
    q: sp.get("q")?.trim() || undefined,
    page: Number(sp.get("page")) || 1,
    limit: Number(sp.get("limit")) || 8,
  });
  const user = await getUser(req);
  const remindedIds = user ? remindedAmong(user.id, result.items.map((e) => e.id)) : [];
  const cards = user ? cardsAmong(user.id, result.items.map((e) => e.id)) : {};
  return ok({ ...result, remindedIds, cards, cities: upcomingCities() });
}

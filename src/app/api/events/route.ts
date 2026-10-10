import { CATEGORIES } from "@/lib/constants";
import { listUpcoming, upcomingCities } from "@/lib/events";
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
    limit: Number(sp.get("limit")) || 6,
  });
  return ok({ ...result, cities: upcomingCities() });
}

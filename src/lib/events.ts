import { db } from "./db";

type Row = {
  id: number; title: string; category: string; city: string; starts_at: string;
  price: number; description: string; image_url: string; is_active: number;
};

export type EventDto = {
  id: number; title: string; category: string; city: string; startsAt: string;
  price: number; description: string; imageUrl: string; isActive: boolean;
};

export const toDto = (r: Row): EventDto => ({
  id: r.id, title: r.title, category: r.category, city: r.city, startsAt: r.starts_at,
  price: r.price, description: r.description, imageUrl: r.image_url, isActive: !!r.is_active,
});

// Escape LIKE wildcards so a search for "100%" matches literally
const likeEscape = (s: string) => s.replace(/[\\%_]/g, (c) => "\\" + c);

export type ListOpts = {
  category?: string; categories?: string[]; city?: string; q?: string;
  page?: number; limit?: number;
};

/**
 * Active + upcoming events, nearest first. Every filter is optional and
 * they are AND-ed together, so Music + Coimbatore + "night" works.
 */
export function listUpcoming(o: ListOpts) {
  const where = ["is_active = 1", "starts_at > ?"];
  const args: (string | number)[] = [new Date().toISOString()];

  if (o.category) { where.push("category = ?"); args.push(o.category); }
  if (o.categories) {
    if (o.categories.length === 0) return { items: [], total: 0, page: 1, pages: 0 };
    where.push(`category IN (${o.categories.map(() => "?").join(",")})`);
    args.push(...o.categories);
  }
  if (o.city) { where.push("city = ? COLLATE NOCASE"); args.push(o.city); }
  if (o.q) {
    where.push("(title LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\')");
    const like = `%${likeEscape(o.q)}%`;
    args.push(like, like);
  }

  const limit = Math.min(Math.max(o.limit ?? 6, 1), 50);
  const total = (db.prepare(`SELECT COUNT(*) AS n FROM events WHERE ${where.join(" AND ")}`).get(...args) as { n: number }).n;
  const pages = Math.ceil(total / limit);
  const page = Math.min(Math.max(o.page ?? 1, 1), Math.max(pages, 1));

  const rows = db
    .prepare(`SELECT * FROM events WHERE ${where.join(" AND ")} ORDER BY starts_at ASC LIMIT ? OFFSET ?`)
    .all(...args, limit, (page - 1) * limit) as Row[];

  return { items: rows.map(toDto), total, page, pages };
}

export function upcomingCities(): string[] {
  const rows = db
    .prepare("SELECT DISTINCT city FROM events WHERE is_active = 1 AND starts_at > ? ORDER BY city")
    .all(new Date().toISOString()) as { city: string }[];
  return rows.map((r) => r.city);
}

export function getEvent(id: number) {
  const r = db.prepare("SELECT * FROM events WHERE id = ?").get(id) as Row | undefined;
  return r ? toDto(r) : null;
}

export function listAll() {
  const rows = db.prepare("SELECT * FROM events ORDER BY starts_at DESC").all() as Row[];
  return rows.map(toDto);
}

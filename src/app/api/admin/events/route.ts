import { z } from "zod";
import { db } from "@/lib/db";
import { CATEGORIES } from "@/lib/constants";
import { getAdmin } from "@/lib/auth";
import { getEvent, listAll } from "@/lib/events";
import { forbidden, ok, parse } from "@/lib/http";

export async function GET(req: Request) {
  if (!(await getAdmin(req))) return forbidden();
  return ok({ items: listAll() });
}

const schema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  category: z.enum(CATEGORIES),
  city: z.string().trim().min(2, "City is required").max(60),
  startsAt: z.string().refine((s) => !Number.isNaN(Date.parse(s)), "Enter a valid date and time"),
  price: z.number({ error: "Price must be a number" }).int("Price must be whole rupees").min(0).max(10_000_000),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000),
  imageUrl: z.string().trim().url("Image URL must be a valid URL").refine((u) => /^https?:/i.test(u), "Image URL must start with http(s)"),
});

export async function POST(req: Request) {
  if (!(await getAdmin(req))) return forbidden();
  const p = await parse(req, schema);
  if ("error" in p) return p.error;
  const e = p.data;

  const r = db.prepare(
    `INSERT INTO events (title, category, city, starts_at, price, description, image_url, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
  ).run(e.title, e.category, e.city, new Date(e.startsAt).toISOString(), e.price, e.description, e.imageUrl);
  return ok({ event: getEvent(Number(r.lastInsertRowid)) }, 201);
}

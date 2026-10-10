import { z } from "zod";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { getEvent } from "@/lib/events";
import { MAX_STICKERS, STICKERS, THEMES } from "@/lib/constants";
import { fail, ok, parse, unauthorized } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  theme: z.enum(THEMES),
  stickers: z.array(z.enum(STICKERS)).max(MAX_STICKERS, `You can add up to ${MAX_STICKERS} stickers`),
});

export async function GET(req: Request, { params }: Ctx) {
  const user = await getUser(req);
  if (!user) return unauthorized();
  const id = Number((await params).id);
  const c = db.prepare("SELECT theme, stickers FROM card_designs WHERE user_id = ? AND event_id = ?")
    .get(user.id, id) as { theme: string; stickers: string } | undefined;
  return ok({ card: c ? { theme: c.theme, stickers: JSON.parse(c.stickers) } : null });
}

// One row per (user, event); saving again overwrites it
export async function PUT(req: Request, { params }: Ctx) {
  const user = await getUser(req);
  if (!user) return unauthorized();
  const id = Number((await params).id);
  const event = Number.isInteger(id) ? getEvent(id) : null;
  if (!event || !event.isActive) return fail("Event not found", 404);

  const p = await parse(req, schema);
  if ("error" in p) return p.error;

  db.prepare(
    `INSERT INTO card_designs (user_id, event_id, theme, stickers) VALUES (?, ?, ?, ?)
     ON CONFLICT (user_id, event_id) DO UPDATE SET theme = excluded.theme, stickers = excluded.stickers`
  ).run(user.id, id, p.data.theme, JSON.stringify(p.data.stickers));
  return ok({ card: p.data });
}

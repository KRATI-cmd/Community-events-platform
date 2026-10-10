import { db } from "@/lib/db";
import { getAdmin, getUser } from "@/lib/auth";
import { getEvent } from "@/lib/events";
import { fail, ok } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  const id = Number((await params).id);
  const event = Number.isInteger(id) ? getEvent(id) : null;
  // Inactive events are hidden from visitors (admin can still open them)
  if (!event || (!event.isActive && !(await getAdmin(req)))) return fail("Event not found", 404);

  // Personal data, only when a user token is sent
  const user = await getUser(req);
  let reminded = false;
  let card: { theme: string; stickers: string[] } | null = null;
  if (user) {
    reminded = !!db.prepare("SELECT 1 FROM reminders WHERE user_id = ? AND event_id = ?").get(user.id, id);
    const c = db.prepare("SELECT theme, stickers FROM card_designs WHERE user_id = ? AND event_id = ?")
      .get(user.id, id) as { theme: string; stickers: string } | undefined;
    if (c) card = { theme: c.theme, stickers: JSON.parse(c.stickers) };
  }
  return ok({ event, reminded, card });
}

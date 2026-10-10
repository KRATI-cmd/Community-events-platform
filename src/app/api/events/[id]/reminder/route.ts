import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { getEvent } from "@/lib/events";
import { fail, ok, unauthorized } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

async function guard(req: Request, params: Ctx["params"]) {
  const user = await getUser(req);
  if (!user) return { res: unauthorized() } as const;
  const id = Number((await params).id);
  const event = Number.isInteger(id) ? getEvent(id) : null;
  if (!event || !event.isActive) return { res: fail("Event not found", 404) } as const;
  return { user, id } as const;
}

// PUT and DELETE are idempotent: repeating them leaves the same state
export async function PUT(req: Request, { params }: Ctx) {
  const g = await guard(req, params);
  if ("res" in g) return g.res;
  db.prepare("INSERT OR IGNORE INTO reminders (user_id, event_id) VALUES (?, ?)").run(g.user.id, g.id);
  return ok({ reminded: true });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const g = await guard(req, params);
  if ("res" in g) return g.res;
  db.prepare("DELETE FROM reminders WHERE user_id = ? AND event_id = ?").run(g.user.id, g.id);
  return ok({ reminded: false });
}

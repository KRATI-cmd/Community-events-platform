import { z } from "zod";
import { db } from "@/lib/db";
import { getAdmin } from "@/lib/auth";
import { getEvent } from "@/lib/events";
import { fail, forbidden, ok, parse } from "@/lib/http";

const schema = z.object({ isActive: z.boolean() });

// Events are never deleted, only switched Active / Inactive
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdmin(req))) return forbidden();
  const id = Number((await params).id);
  if (!Number.isInteger(id) || !getEvent(id)) return fail("Event not found", 404);

  const p = await parse(req, schema);
  if ("error" in p) return p.error;
  db.prepare("UPDATE events SET is_active = ? WHERE id = ?").run(p.data.isActive ? 1 : 0, id);
  return ok({ event: getEvent(id) });
}

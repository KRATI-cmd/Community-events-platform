import { NextResponse } from "next/server";
import type { ZodType } from "zod";

export const ok = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const fail = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });
export const unauthorized = () => fail("Please log in", 401);
export const forbidden = () => fail("Admin access required", 403);

/** Parse + validate a JSON body. Returns data or a ready-made 400 response. */
export async function parse<T>(req: Request, schema: ZodType<T>) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { error: fail("Invalid JSON body") } as const;
  }
  const r = schema.safeParse(body);
  if (!r.success) {
    return { error: fail(r.error.issues[0]?.message ?? "Invalid input") } as const;
  }
  return { data: r.data } as const;
}

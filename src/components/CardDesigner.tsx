"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { MAX_STICKERS, STICKERS, STICKER_EMOJI, STICKER_SLOTS as SLOTS, THEME_CLASS, THEMES, type Sticker, type Theme } from "@/lib/constants";
import type { EventDto } from "@/lib/events";
import { formatDate } from "@/lib/format";
import { useAuth } from "./AuthProvider";

type Placed = { key: number; sticker: Sticker }; // key keeps each sticker's animation stable
type Saved = { theme: Theme; stickers: Sticker[] };

let nextKey = 1;

export default function CardDesigner({ event, initial }: { event: EventDto; initial: Saved | null }) {
  const { email } = useAuth();
  const [theme, setTheme] = useState<Theme>(initial?.theme ?? "sunset");
  const [stickers, setStickers] = useState<Placed[]>(() => (initial?.stickers ?? []).map((s) => ({ key: nextKey++, sticker: s })));
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  const lastSaved = useRef<Saved>(initial ?? { theme: "sunset", stickers: [] });
  const firstRun = useRef(true);
  const unsent = useRef<Saved | null>(null); // a change still waiting for its 500ms timer

  // Save shortly after the last change; if it fails, roll the card back
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    if (!email) return; // not logged in: design stays on screen only
    const draft: Saved = { theme, stickers: stickers.map((s) => s.sticker) };
    setStatus("saving");
    unsent.current = draft;
    const t = setTimeout(async () => {
      unsent.current = null;
      try {
        await api(`/api/events/${event.id}/card`, { method: "PUT", json: draft });
        lastSaved.current = draft;
        setError(null);
        setStatus("saved");
      } catch (e) {
        setError(`Couldn't save your design. ${(e as Error).message}`);
        setStatus("idle");
        setTheme(lastSaved.current.theme);
        setStickers(lastSaved.current.stickers.map((s) => ({ key: nextKey++, sticker: s })));
        firstRun.current = true; // the rollback itself must not trigger another save
      }
    }, 500);
    return () => clearTimeout(t);
  }, [theme, stickers, email, event.id]);

  // Leaving the page within 500ms of a change must not lose it
  useEffect(() => () => {
    if (unsent.current) api(`/api/events/${event.id}/card`, { method: "PUT", json: unsent.current }).catch(() => {});
  }, [event.id]);

  const full = stickers.length >= MAX_STICKERS;
  const add = (s: Sticker) => { if (!full) setStickers((p) => [...p, { key: nextKey++, sticker: s }]); };
  const remove = (key: number) => setStickers((p) => p.filter((x) => x.key !== key));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold">Design your card</h2>
      <p className="mt-1 text-sm text-slate-600">Pick a theme and add up to {MAX_STICKERS} stickers. Tap the × on a sticker to remove it.</p>

      <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,320px)_1fr]">
        {/* Live preview. Each theme is its own layer; fading them gives a smooth switch */}
        <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-3xl shadow-lg" data-testid="card-preview">
          {/* Same photo as the event above, so the card matches the event */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          {THEMES.map((t) => (
            <div
              key={t}
              className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-500 ${THEME_CLASS[t]} ${t === theme ? "opacity-75" : "opacity-0"}`}
            />
          ))}
          <div className="relative flex h-full flex-col justify-end bg-gradient-to-t from-black/60 via-black/10 to-transparent p-5 text-white">
            <span className="mb-2 w-fit rounded-full bg-white/25 px-3 py-1 text-xs font-semibold backdrop-blur">{event.category}</span>
            <h3 className="text-2xl font-extrabold leading-tight drop-shadow">{event.title}</h3>
            <p className="mt-2 text-sm font-medium text-white/90">{formatDate(event.startsAt)}</p>
            <p className="text-sm text-white/90">{event.city}</p>
          </div>
          {stickers.map((p, i) => (
            <button
              key={p.key}
              onClick={() => remove(p.key)}
              aria-label={`Remove ${p.sticker} sticker`}
              style={{ left: `${SLOTS[i].left}%`, top: `${SLOTS[i].top}%` }}
              className="absolute animate-pop text-5xl transition-all duration-500 hover:scale-110"
            >
              {STICKER_EMOJI[p.sticker]}
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold leading-none text-slate-700 shadow">×</span>
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Background</h3>
            <div className="flex gap-3">
              {THEMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  aria-pressed={t === theme}
                  aria-label={`${t} theme`}
                  className={`h-12 w-16 rounded-xl bg-gradient-to-br transition ${THEME_CLASS[t]} ${
                    t === theme ? "ring-4 ring-indigo-300 ring-offset-2" : "opacity-80 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">
              Stickers <span className="font-normal text-slate-500">({stickers.length}/{MAX_STICKERS})</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {STICKERS.map((s) => (
                <button
                  key={s}
                  onClick={() => add(s)}
                  disabled={full}
                  aria-label={`Add ${s} sticker`}
                  className="h-14 w-14 rounded-xl border border-slate-200 bg-slate-50 text-3xl transition hover:scale-105 hover:bg-white active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                >
                  {STICKER_EMOJI[s]}
                </button>
              ))}
            </div>
            {full && <p className="mt-2 text-xs text-slate-500">Maximum reached. Tap the × on a sticker to remove one.</p>}
          </div>

          <p className="text-sm" aria-live="polite">
            {!email && <span className="text-slate-600"><Link href="/login" className="font-medium text-indigo-600 hover:underline">Log in</Link> to save your design.</span>}
            {email && status === "saving" && <span className="text-slate-500">Saving…</span>}
            {email && status === "saved" && <span className="text-emerald-600">Saved ✓</span>}
            {error && <span role="alert" className="text-red-600">{error}</span>}
          </p>
        </div>
      </div>
    </section>
  );
}

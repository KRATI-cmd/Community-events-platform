import Link from "next/link";
import { MapPin, CalendarClock } from "lucide-react";
import type { EventDto } from "@/lib/events";
import { STICKER_EMOJI, STICKER_SLOTS, THEME_CLASS, type Sticker, type Theme } from "@/lib/constants";
import RemindButton from "./RemindButton";
import { formatDate, formatPrice } from "@/lib/format";

export default function EventCard({ event, reminded = false, design }: { event: EventDto; reminded?: boolean; design?: { theme: Theme; stickers: Sticker[] } }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/events/${event.id}`} aria-label={event.title} className="absolute inset-0 z-0" />
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-indigo-200 to-violet-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={event.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        {design && (
          <>
            {/* The visitor's saved card design shows over the photo */}
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-50 ${THEME_CLASS[design.theme]}`} />
            {design.stickers.map((s, i) => (
              <span key={i} className="pointer-events-none absolute text-3xl" style={{ left: `${STICKER_SLOTS[i].left}%`, top: `${STICKER_SLOTS[i].top + 12}%` }}>
                {STICKER_EMOJI[s]}
              </span>
            ))}
          </>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-indigo-700">
          {event.category}
        </span>
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-slate-900">{event.title}</h3>
        <p className="flex items-center gap-1.5 text-sm text-slate-600">
          <CalendarClock className="h-4 w-4 shrink-0 text-slate-400" /> {formatDate(event.startsAt)}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-slate-600">
            <MapPin className="h-4 w-4 text-slate-400" /> {event.city}
          </span>
          <span className="font-semibold text-slate-900">{formatPrice(event.price)}</span>
        </div>
        <div className="relative z-10 pt-1">
          <RemindButton eventId={event.id} initial={reminded} compact />
        </div>
      </div>
    </div>
  );
}

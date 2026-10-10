import Link from "next/link";
import { MapPin, CalendarClock } from "lucide-react";
import type { EventDto } from "@/lib/events";
import { formatDate, formatPrice } from "@/lib/format";

export default function EventCard({ event }: { event: EventDto }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-indigo-200 to-violet-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={event.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
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
      </div>
    </Link>
  );
}

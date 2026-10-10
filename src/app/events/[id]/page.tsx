"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarClock, MapPin, Tag } from "lucide-react";
import { api } from "@/lib/api";
import type { EventDto } from "@/lib/events";
import type { Theme, Sticker } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/format";
import { useAuth } from "@/components/AuthProvider";
import RemindButton from "@/components/RemindButton";
import CardDesigner from "@/components/CardDesigner";
import { ErrorState, Spinner } from "@/components/States";

type Detail = { event: EventDto; reminded: boolean; card: { theme: Theme; stickers: Sticker[] } | null };

export default function EventPage() {
  const { id } = useParams<{ id: string }>();
  const { ready, email } = useAuth();
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  // Wait for `ready` so the first request already carries the login token
  useEffect(() => {
    if (!ready) return;
    setError(null);
    api<Detail>(`/api/events/${id}`).then(setData).catch((e) => setError(e.message));
  }, [id, ready, retry]);

  if (error) return <ErrorState message={error} onRetry={() => setRetry((n) => n + 1)} />;
  if (!data) return <Spinner label="Loading event…" />;

  const { event } = data;
  const past = new Date(event.startsAt) < new Date();
  return (
    <div className="space-y-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-indigo-600">
        <ArrowLeft className="h-4 w-4" /> All events
      </Link>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid md:grid-cols-2">
        <div className="aspect-video bg-gradient-to-br from-indigo-200 to-violet-200 md:aspect-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
        </div>
        <div className="space-y-4 p-5 sm:p-8">
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <Tag className="h-3 w-3" /> {event.category}
          </span>
          <h1 className="text-2xl font-bold sm:text-3xl">{event.title}</h1>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-slate-400" /> {formatDate(event.startsAt)}</li>
            <li className="flex items-center gap-2"><MapPin className="h-5 w-5 text-slate-400" /> {event.city}</li>
          </ul>
          <p className="text-2xl font-bold text-slate-900">{formatPrice(event.price)}</p>
          <p className="whitespace-pre-line text-slate-600">{event.description}</p>
          {past ? (
            <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">This event has already happened.</p>
          ) : (
            // key forces a fresh state if the login changes while the page is open
            <RemindButton key={`${event.id}-${email}`} eventId={event.id} initial={data.reminded} />
          )}
        </div>
      </article>

      <CardDesigner key={`${event.id}-${email}`} event={event} initial={data.card} />
    </div>
  );
}

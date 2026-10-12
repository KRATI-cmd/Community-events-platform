import type { Sticker, Theme } from "@/lib/constants";
import type { EventDto } from "@/lib/events";
import EventCard from "./EventCard";
import Pagination from "./Pagination";
import { CardSkeletons, EmptyState, ErrorState } from "./States";

export type ListData = { items: EventDto[]; total: number; page: number; pages: number; remindedIds?: number[]; cards?: Record<number, { theme: Theme; stickers: Sticker[] }> };

/** Shared loading / error / empty / grid + pagination block for Events and My Feed. */
export default function EventResults(props: {
  data: ListData | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onPage: (p: number) => void;
  empty: React.ReactNode;
}) {
  const { data, loading, error, onRetry, onPage, empty } = props;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!data) return <CardSkeletons />;
  if (data.items.length === 0) return <>{empty}</>;
  return (
    <>
      <div className={`grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 ${loading ? "opacity-50" : ""}`}>
        {data.items.map((e) => <EventCard key={`${e.id}-${data.remindedIds?.includes(e.id)}`} event={e} reminded={!!data.remindedIds?.includes(e.id)} design={data.cards?.[e.id]} />)}
      </div>
      <Pagination page={data.page} pages={data.pages} onChange={onPage} />
    </>
  );
}

export { EmptyState };

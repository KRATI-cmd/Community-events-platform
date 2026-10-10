"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import EventResults, { EmptyState, type ListData } from "@/components/EventResults";

type Feed = ListData & { hasFavourites: boolean };

export default function FeedPage() {
  const { email, ready, logout } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<Feed | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!ready) return;
    if (!email) { router.replace("/login"); return; }
    setLoading(true);
    setError(null);
    api<Feed>(`/api/feed?page=${page}`)
      .then(setData)
      .catch((e: ApiError) => {
        if (e.status === 401) { logout(); router.replace("/login"); return; } // expired token
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [ready, email, page, retry, router, logout]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">My Feed</h1>
        <p className="mt-1 text-slate-600">Upcoming events from the categories you picked.</p>
      </div>
      <EventResults
        data={data}
        loading={loading}
        error={error}
        onRetry={() => setRetry((n) => n + 1)}
        onPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        empty={
          data?.hasFavourites ? (
            <EmptyState title="Nothing coming up yet" hint="No upcoming events in your favourite categories. Check back soon or add more interests.">
              <Link href="/favourites" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Edit interests</Link>
            </EmptyState>
          ) : (
            <EmptyState title="Your feed is empty" hint="Pick a few favourite categories and we'll show matching events here.">
              <Link href="/favourites" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Choose interests</Link>
            </EmptyState>
          )
        }
      />
    </div>
  );
}

"use client";
import { useCallback, useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { api } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";
import EventResults, { EmptyState, type ListData } from "@/components/EventResults";

type Resp = ListData & { cities: string[] };

const input =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

export default function EventsPage() {
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState(""); // debounced copy of `search`
  const [page, setPage] = useState(1);

  const [data, setData] = useState<Resp | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  // Wait until the user stops typing before hitting the API
  useEffect(() => {
    const t = setTimeout(() => { setQ(search.trim()); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const ctrl = new AbortController();
    const params = new URLSearchParams({ page: String(page) });
    if (category) params.set("category", category);
    if (city) params.set("city", city);
    if (q) params.set("q", q);

    setLoading(true);
    setError(null);
    api<Resp>(`/api/events?${params}`, { signal: ctrl.signal })
      .then((r) => { setData(r); setCities(r.cities); })
      .catch((e) => { if (e.name !== "AbortError") setError(e.message); })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort(); // a newer filter change cancels the older request
  }, [category, city, q, page, retry]);

  const filtered = !!(category || city || q);
  const clear = useCallback(() => { setCategory(""); setCity(""); setSearch(""); setQ(""); setPage(1); }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Upcoming events</h1>
        <p className="mt-1 text-slate-600">Music nights, workshops, food fairs and more near you.</p>
      </div>

      <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_180px_180px] sm:p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className={`${input} pl-9`}
            placeholder="Search events…"
            aria-label="Search events"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className={input} aria-label="Category" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className={input} aria-label="City" value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }}>
          <option value="">All cities</option>
          {cities.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <EventResults
        data={data}
        loading={loading}
        error={error}
        onRetry={() => setRetry((n) => n + 1)}
        onPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        empty={
          <EmptyState
            title="No events found"
            hint={filtered ? "Nothing matches these filters. Try changing or clearing them." : "There are no upcoming events right now. Check back soon!"}
          >
            {filtered && (
              <button onClick={clear} className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                <X className="h-4 w-4" /> Clear filters
              </button>
            )}
          </EmptyState>
        }
      />
    </div>
  );
}

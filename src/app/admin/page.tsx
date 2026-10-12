"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Globe, LogOut, Plus, Search, X } from "lucide-react";
import { ApiError, api } from "@/lib/api";
import type { EventDto } from "@/lib/events";
import { formatDate, formatPrice } from "@/lib/format";
import Pagination from "@/components/Pagination";
import { EmptyState, ErrorState, Spinner } from "@/components/States";

export default function AdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<EventDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [retry, setRetry] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [text, setText] = useState(""); // what is typed in the box
  const [q, setQ] = useState(""); // what was actually searched

  useEffect(() => {
    setError(null);
    api<{ items: EventDto[]; page: number; pages: number }>(`/api/admin/events?page=${page}&q=${encodeURIComponent(q)}`, { cookieAuth: true })
      .then((r) => { setItems(r.items); setPages(r.pages); setPage(r.page); })
      .catch((e: ApiError) => (e.status === 403 ? router.replace("/admin/login") : setError(e.message)));
  }, [retry, page, q, router]);

  async function toggle(ev: EventDto) {
    setBusyId(ev.id);
    setRowError(null);
    try {
      const r = await api<{ event: EventDto }>(`/api/admin/events/${ev.id}`, {
        method: "PATCH", json: { isActive: !ev.isActive }, cookieAuth: true,
      });
      setItems((list) => list!.map((x) => (x.id === ev.id ? r.event : x)));
    } catch (e) {
      setRowError(`Couldn't update "${ev.title}". ${(e as Error).message}`);
    } finally {
      setBusyId(null);
    }
  }

  function search(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQ(text.trim());
  }
  function clearSearch() { setText(""); setPage(1); setQ(""); }

  async function logout() {
    await api("/api/admin/logout", { method: "POST", cookieAuth: true }).catch(() => {});
    router.push("/admin/login");
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">Events</h1>
        <div className="flex gap-2">
          <Link href="/admin/new" className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            <Plus className="h-4 w-4" /> Add event
          </Link>
          <Link href="/" className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Globe className="h-4 w-4" /> View site
          </Link>
          <button onClick={logout} className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </div>

      <form onSubmit={search} role="search" className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Search events by title, city or category…" aria-label="Search events"
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          {text && (
            <button type="button" onClick={clearSearch} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-700">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
          <Search className="h-4 w-4" /> Search
        </button>
      </form>

      {rowError && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{rowError}</p>}
      {error ? <ErrorState message={error} onRetry={() => setRetry((n) => n + 1)} />
        : !items ? <Spinner />
        : items.length === 0 ? <EmptyState title={q ? "No matching events" : "No events yet"} hint={q ? `Nothing found for "${q}".` : "Add the first event to get started."} />
        : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Event</th><th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Price</th><th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((ev) => (
                  <tr key={ev.id} className={ev.isActive ? "" : "bg-slate-50 text-slate-500"}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{ev.title}</div>
                      <div className="text-xs text-slate-500">{ev.category} · {ev.city}</div>
                    </td>
                    <td className="px-4 py-3">{formatDate(ev.startsAt)}</td>
                    <td className="px-4 py-3">{formatPrice(ev.price)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggle(ev)}
                        disabled={busyId === ev.id}
                        role="switch"
                        aria-checked={ev.isActive}
                        aria-label={`${ev.title} is ${ev.isActive ? "active" : "inactive"}`}
                        className="inline-flex items-center gap-2 disabled:opacity-50"
                      >
                        <span className={`relative h-6 w-11 rounded-full transition ${ev.isActive ? "bg-emerald-500" : "bg-slate-300"}`}>
                          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${ev.isActive ? "left-[22px]" : "left-0.5"}`} />
                        </span>
                        <span className="text-xs font-medium">{ev.isActive ? "Active" : "Inactive"}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      {items && items.length > 0 && !error && (
        <Pagination page={page} pages={pages} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
      )}
    </div>
  );
}

"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Plus } from "lucide-react";
import { ApiError, api } from "@/lib/api";
import type { EventDto } from "@/lib/events";
import { formatDate, formatPrice } from "@/lib/format";
import { EmptyState, ErrorState, Spinner } from "@/components/States";

export default function AdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<EventDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    setError(null);
    api<{ items: EventDto[] }>("/api/admin/events", { cookieAuth: true })
      .then((r) => setItems(r.items))
      .catch((e: ApiError) => (e.status === 403 ? router.replace("/admin/login") : setError(e.message)));
  }, [retry, router]);

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

  async function logout() {
    await api("/api/admin/logout", { method: "POST", cookieAuth: true }).catch(() => {});
    router.push("/admin/login");
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">Admin: events</h1>
        <div className="flex gap-2">
          <Link href="/admin/new" className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            <Plus className="h-4 w-4" /> Add event
          </Link>
          <button onClick={logout} className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </div>

      {rowError && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{rowError}</p>}
      {error ? <ErrorState message={error} onRetry={() => setRetry((n) => n + 1)} />
        : !items ? <Spinner />
        : items.length === 0 ? <EmptyState title="No events yet" hint="Add the first event to get started." />
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
    </div>
  );
}

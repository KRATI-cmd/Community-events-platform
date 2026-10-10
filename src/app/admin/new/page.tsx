"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";

const input = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

export default function NewEventPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await api("/api/admin/events", {
        method: "POST",
        cookieAuth: true,
        json: {
          title: f.get("title"),
          category: f.get("category"),
          city: f.get("city"),
          // datetime-local has no timezone: treat it as Indian time (+05:30)
          startsAt: `${f.get("startsAt")}:00+05:30`,
          price: Number(f.get("price")),
          description: f.get("description"),
          imageUrl: f.get("imageUrl"),
        },
      });
      router.push("/admin");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-indigo-600">
        <ArrowLeft className="h-4 w-4" /> Back to events
      </Link>
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">Add event</h1>
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <label className="block text-sm font-medium">Title
          <input name="title" required minLength={3} className={input} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">Category
            <select name="category" required className={input}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium">City
            <input name="city" required className={input} />
          </label>
          <label className="block text-sm font-medium">Date and time (IST)
            <input name="startsAt" type="datetime-local" required className={input} />
          </label>
          <label className="block text-sm font-medium">Price (₹, 0 for free)
            <input name="price" type="number" min={0} step={1} required defaultValue={0} className={input} />
          </label>
        </div>
        <label className="block text-sm font-medium">Image URL
          <input name="imageUrl" type="url" required placeholder="https://…" className={input} />
        </label>
        <label className="block text-sm font-medium">Description
          <textarea name="description" required minLength={10} rows={4} className={input} />
        </label>
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
          {busy ? "Saving…" : "Create event"}
        </button>
      </form>
    </div>
  );
}

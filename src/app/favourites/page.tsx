"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { api } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";
import { useAuth } from "@/components/AuthProvider";
import { ErrorState, Spinner } from "@/components/States";

export default function FavouritesPage() {
  const { email, ready } = useAuth();
  const router = useRouter();
  const [picked, setPicked] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!ready) return;
    if (!email) { router.replace("/login"); return; }
    setError(null);
    api<{ categories: string[] }>("/api/favourites")
      .then((r) => setPicked(r.categories))
      .catch((e) => setError(e.message));
  }, [ready, email, router, retry]);

  const toggle = (c: string) =>
    setPicked((p) => (p ?? []).includes(c) ? (p ?? []).filter((x) => x !== c) : [...(p ?? []), c]);

  async function save() {
    setSaving(true);
    setSaveError(null);
    try {
      await api("/api/favourites", { method: "PUT", json: { categories: picked } });
      router.push("/feed");
    } catch (e) {
      setSaveError((e as Error).message);
      setSaving(false);
    }
  }

  if (error) return <ErrorState message={error} onRetry={() => setRetry((n) => n + 1)} />;
  if (!picked) return <Spinner />;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold sm:text-3xl">What are you into?</h1>
      <p className="mt-1 text-slate-600">Pick your favourite categories. Your feed will only show these.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CATEGORIES.map((c) => {
          const on = picked.includes(c);
          return (
            <button
              key={c}
              onClick={() => toggle(c)}
              aria-pressed={on}
              className={`flex items-center justify-between rounded-2xl border-2 px-4 py-4 text-left font-medium transition ${
                on ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              {c} {on && <Check className="h-5 w-5" />}
            </button>
          );
        })}
      </div>

      {saveError && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</p>}
      <div className="mt-6 flex items-center gap-4">
        <button onClick={save} disabled={saving} className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
          {saving ? "Saving…" : "Save and view my feed"}
        </button>
        <Link href="/" className="text-sm text-slate-600 hover:underline">Skip</Link>
      </div>
    </div>
  );
}

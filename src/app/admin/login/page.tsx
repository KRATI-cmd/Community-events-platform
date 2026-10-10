"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/api/admin/login", { method: "POST", json: { email, password }, cookieAuth: true });
      router.push("/admin");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  const input = "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";
  return (
    <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <ShieldCheck className="mb-2 h-8 w-8 text-indigo-600" />
      <h1 className="text-2xl font-bold">Admin login</h1>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <label className="block text-sm font-medium">Email
          <input className={input} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">Password
          <input className={input} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
          {busy ? "Please wait…" : "Log in"}
        </button>
      </form>
    </div>
  );
}

"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./AuthProvider";
import PasswordInput from "./PasswordInput";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isLogin = mode === "login";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await api<{ token: string; role?: string; user?: { email: string } }>(`/api/auth/${mode}`, {
        method: "POST",
        json: { email, password },
      });
      if (r.role === "admin") { router.push("/admin"); return; }
      login(r.token, r.user!.email);
      // New users pick interests first; returning users go to their feed
      router.push(isLogin ? "/feed" : "/favourites");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  const input = "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";
  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">{isLogin ? "Welcome back" : "Create your account"}</h1>
      <p className="mt-1 text-sm text-slate-600">
        {isLogin ? "Log in to see your feed and set reminders." : "Sign up to save reminders and get a personal feed."}
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium">
          Email
          <input className={`${input} mt-1`} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          Password
          <PasswordInput
            className={`${input} mt-1`} required minLength={isLogin ? 1 : 8}
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          {!isLogin && <span className="mt-1 block text-xs font-normal text-slate-500">At least 8 characters.</span>}
        </label>
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
          {busy ? "Please wait…" : isLogin ? "Log in" : "Sign up"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        {isLogin ? "New here? " : "Already have an account? "}
        <Link href={isLogin ? "/signup" : "/login"} className="font-medium text-indigo-600 hover:underline">
          {isLogin ? "Sign up" : "Log in"}
        </Link>
      </p>
    </div>
    </div>
  );
}

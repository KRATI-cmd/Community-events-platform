"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, LogOut } from "lucide-react";
import { useAuth } from "./AuthProvider";

const link = (active: boolean) =>
  `rounded-full px-3 py-1.5 text-sm font-medium transition ${
    active ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
  }`;

export default function Header() {
  const path = usePathname();
  const router = useRouter();
  const { email, ready, logout } = useAuth();

  // The admin area has its own simple header
  if (path.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <CalendarDays className="h-5 w-5 text-indigo-600" /> Events Board
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/" className={link(path === "/")}>Events</Link>
          {ready && email && (
            <>
              <Link href="/feed" className={link(path === "/feed")}>My Feed</Link>
              <Link href="/favourites" className={link(path === "/favourites")}>Interests</Link>
              <button
                onClick={() => { logout(); router.push("/"); }}
                className="ml-1 flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Log out</span>
              </button>
            </>
          )}
          {ready && !email && (
            <>
              <Link href="/login" className={link(path === "/login")}>Log in</Link>
              <Link href="/signup" className={link(path === "/signup")}>Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

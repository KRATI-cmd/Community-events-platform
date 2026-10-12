"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "./AuthProvider";

export default function RemindButton({ eventId, initial, compact = false }: { eventId: number; initial: boolean; compact?: boolean }) {
  const { email } = useAuth();
  const router = useRouter();
  const [on, setOn] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (!email) { router.push("/login"); return; }
    const next = !on;
    setOn(next);        // optimistic: the button changes immediately
    setError(null);
    setPending(true);
    try {
      await api(`/api/events/${eventId}/reminder`, { method: next ? "PUT" : "DELETE" });
    } catch (e) {
      setOn(!next);     // saving failed -> go back to the previous state
      setError(`Couldn't ${next ? "set" : "remove"} the reminder. ${(e as Error).message}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button
        onClick={toggle}
        disabled={pending}
        aria-pressed={on}
        className={`inline-flex items-center gap-2 rounded-full font-semibold transition ${compact ? "px-3.5 py-1.5 text-xs" : "px-5 py-2.5 text-sm"} ${
          on ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-indigo-600 text-white hover:bg-indigo-700"
        }`}
      >
        {on ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        {on ? "Reminder set" : "Remind me"}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

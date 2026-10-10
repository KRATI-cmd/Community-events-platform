import { AlertTriangle, CalendarX } from "lucide-react";

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-slate-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
      {label}
    </div>
  );
}

export function CardSkeletons({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading events">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="aspect-video bg-slate-200" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 rounded bg-slate-200" />
            <div className="h-3 w-1/2 rounded bg-slate-200" />
            <div className="h-3 w-1/3 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, hint, children }: { title: string; hint?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <CalendarX className="mb-3 h-10 w-10 text-slate-400" />
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      {hint && <p className="mt-1 max-w-sm text-sm text-slate-500">{hint}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
      <AlertTriangle className="mb-3 h-9 w-9 text-red-500" />
      <p className="font-medium text-red-800">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
          Try again
        </button>
      )}
    </div>
  );
}

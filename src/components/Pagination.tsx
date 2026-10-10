import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  const btn = "flex items-center gap-1 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white";
  return (
    <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Pagination">
      <button className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft className="h-4 w-4" /> Prev
      </button>
      <span className="text-sm text-slate-600">Page {page} of {pages}</span>
      <button className={btn} disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

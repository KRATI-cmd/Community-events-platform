const IST = "Asia/Kolkata";

/** 150000 -> "₹1,50,000" (Indian digit grouping), 0 -> "Free" */
export function formatPrice(rupees: number) {
  if (rupees === 0) return "Free";
  return "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(rupees);
}

/** ISO string -> "Sat, 18 Oct, 6:30 PM" (shown in Indian time) */
export function formatDate(iso: string) {
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: IST }).format(d);
  const time = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: IST })
    .format(d)
    .toUpperCase();
  // en-IN gives "Sat, 18 Oct" already; add the time after a comma
  return `${day}, ${time}`;
}

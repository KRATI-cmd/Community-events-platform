// Dates are relative to "now" so the sample data always has upcoming + past events.
const DAY = 86_400_000;

function at(daysFromNow: number, hour: number, minute = 0) {
  const d = new Date(Date.now() + daysFromNow * DAY);
  // hour/minute are IST wall-clock time -> convert to UTC (IST = UTC+5:30)
  d.setUTCHours(hour - 5, minute - 30, 0, 0);
  return d.toISOString();
}

const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/450`;

type Row = {
  title: string; category: string; city: string; starts_at: string;
  price: number; description: string; image_url: string; is_active: number;
};

export function SEED_EVENTS(): Row[] {
  const e = (
    title: string, category: string, city: string, starts_at: string,
    price: number, description: string, seed: string, active = 1
  ): Row => ({ title, category, city, starts_at, price, description, image_url: img(seed), is_active: active });

  return [
    e("Coimbatore Indie Music Night", "Music", "Coimbatore", at(3, 18, 30), 500, "An evening of live indie bands from across Tamil Nadu under open skies.", "indie"),
    e("Carnatic Fusion Evening", "Music", "Chennai", at(6, 19), 1500, "Classical Carnatic meets modern jazz in this one-of-a-kind concert.", "carnatic"),
    e("Rock the Night Live", "Music", "Bengaluru", at(10, 20), 2500, "Three headline rock acts, food stalls and a late-night jam session.", "rock"),
    e("Pottery for Beginners", "Workshop", "Coimbatore", at(4, 10), 800, "Hands-on wheel pottery workshop. All materials included.", "pottery"),
    e("Photography Walk & Workshop", "Workshop", "Mumbai", at(8, 6, 30), 1200, "Learn street photography with a pro on a guided morning walk.", "photo"),
    e("Startup Pitch Masterclass", "Workshop", "Bengaluru", at(15, 14), 150000, "A premium two-day masterclass on pitching to investors.", "pitch"),
    e("Street Food Carnival", "Food", "Coimbatore", at(5, 17), 0, "Over 40 stalls serving regional street food. Free entry.", "streetfood"),
    e("Chennai Biryani Festival", "Food", "Chennai", at(12, 12), 300, "Taste biryani styles from Hyderabad, Ambur, Dindigul and more.", "biryani"),
    e("Delhi Chaat Fair", "Food", "Delhi", at(20, 16), 250, "A celebration of chaat, kulfi and old-Delhi sweets.", "chaat"),
    e("City Marathon 10K", "Sports", "Mumbai", at(25, 5, 30), 700, "10K run through the seafront with medals for all finishers.", "marathon"),
    e("Weekend Football League", "Sports", "Coimbatore", at(7, 16), 400, "5-a-side football tournament open to all skill levels.", "football"),
    e("Kids Art & Craft Day", "Kids", "Chennai", at(9, 11), 350, "Painting, clay and paper craft for ages 5 to 12.", "kidsart"),
    // Inactive (hidden from visitors)
    e("Jazz Under the Stars", "Music", "Delhi", at(14, 19, 30), 1800, "Cancelled for now - venue under review.", "jazz", 0),
    // Past events (hidden from visitors)
    e("New Year Music Bash", "Music", "Coimbatore", at(-30, 21), 999, "Past event: New Year celebration concert.", "newyear"),
    e("Summer Kids Camp Showcase", "Kids", "Bengaluru", at(-10, 10), 0, "Past event: showcase of the summer camp projects.", "kidscamp"),
  ];
}

// Dates are relative to "now" so the sample data always has upcoming + past events.
const DAY = 86_400_000;

function at(daysFromNow: number, hour: number, minute = 0) {
  const d = new Date(Date.now() + daysFromNow * DAY);
  // hour/minute are IST wall-clock time -> convert to UTC (IST = UTC+5:30)
  d.setUTCHours(hour - 5, minute - 30, 0, 0);
  return d.toISOString();
}

// Unsplash photos matching each event's category (music crowds, pottery, food, running, kids art...)
const PHOTO: Record<string, string> = {
  indie: "1501386761578-eac5c94b800a", carnatic: "1493225457124-a3eb161ffa5f", rock: "1470229722913-7c0e2dbbafd3", jazz: "1459749411175-04bf5292ceea", newyear: "1501386761578-eac5c94b800a",
  pottery: "1565193566173-7a0ee3dbe261", photo: "1452587925148-ce544e77e70d", pitch: "1540575467063-178a50c2df87",
  streetfood: "1555939594-58d7cb561ad1", biryani: "1504674900247-0877df9cc836", chaat: "1565299624946-b28f40a0ae38",
  marathon: "1552674605-db6ffd4facb5", football: "1461896836934-ffe607ba8211",
  kidsart: "1596464716127-f2a82984de30", kidscamp: "1503454537195-1dcabb73ffb9",
};
export const photoUrl = (key: string) => `https://images.unsplash.com/photo-${PHOTO[key]}?w=800&h=450&fit=crop&auto=format`;
const img = photoUrl;

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

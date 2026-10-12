export const CATEGORIES = ["Music", "Workshop", "Food", "Sports", "Kids"] as const;
export type Category = (typeof CATEGORIES)[number];

export const THEMES = ["sunset", "ocean", "forest"] as const;
export type Theme = (typeof THEMES)[number];

// The API stores sticker ids; clients decide how to draw them
export const STICKERS = ["party", "music", "food", "star", "heart"] as const;
export type Sticker = (typeof STICKERS)[number];
export const STICKER_EMOJI: Record<Sticker, string> = {
  party: "🎉", music: "🎵", food: "🍕", star: "⭐", heart: "❤️",
};
export const MAX_STICKERS = 3;

export const THEME_CLASS: Record<Theme, string> = {
  sunset: "from-orange-400 via-rose-500 to-fuchsia-600",
  ocean: "from-cyan-400 via-sky-500 to-indigo-600",
  forest: "from-lime-400 via-emerald-500 to-teal-700",
};
// Where the 1st, 2nd and 3rd sticker sit on the card (% from top-left); all in the top half so they never cover the title
export const STICKER_SLOTS = [{ left: 70, top: 6 }, { left: 6, top: 6 }, { left: 38, top: 20 }];

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

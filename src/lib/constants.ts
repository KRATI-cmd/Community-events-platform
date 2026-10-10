export const CATEGORIES = ["Music", "Workshop", "Food", "Sports", "Kids"] as const;
export type Category = (typeof CATEGORIES)[number];

export const THEMES = ["sunset", "ocean", "forest"] as const;
export type Theme = (typeof THEMES)[number];

export const STICKERS = ["🎉", "🎵", "🍕", "⭐", "❤️"] as const;
export const MAX_STICKERS = 3;

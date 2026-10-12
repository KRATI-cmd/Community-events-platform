import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { SEED_EVENTS } from "./seed-data";

const dir = path.join(process.cwd(), "data");
fs.mkdirSync(dir, { recursive: true });

// Reuse one connection across hot reloads in dev
const g = globalThis as unknown as { __db?: Database.Database };

function open() {
  const db = new Database(path.join(dir, "app.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('Music','Workshop','Food','Sports','Kids')),
      city TEXT NOT NULL,
      starts_at TEXT NOT NULL,           -- ISO-8601 UTC, sorts correctly as text
      price INTEGER NOT NULL DEFAULT 0,  -- whole rupees, 0 = free
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS user_categories (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      PRIMARY KEY (user_id, category)
    );
    CREATE TABLE IF NOT EXISTS reminders (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, event_id)
    );
    CREATE TABLE IF NOT EXISTS card_designs (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      theme TEXT NOT NULL,
      stickers TEXT NOT NULL DEFAULT '[]',  -- JSON array, max 3
      PRIMARY KEY (user_id, event_id)
    );
    CREATE INDEX IF NOT EXISTS idx_events_active_start ON events (is_active, starts_at);
    CREATE INDEX IF NOT EXISTS idx_events_cat_city ON events (category, city);
  `);

  // Seed once, on a fresh database
  const { n } = db.prepare("SELECT COUNT(*) AS n FROM events").get() as { n: number };
  if (n === 0) {
    const insert = db.prepare(
      `INSERT INTO events (title, category, city, starts_at, price, description, image_url, is_active)
       VALUES (@title, @category, @city, @starts_at, @price, @description, @image_url, @is_active)`
    );
    db.transaction(() => SEED_EVENTS().forEach((e) => insert.run(e)))();
  }
  // Older databases were seeded with random placeholder photos; swap in category-matching ones
  const fix = db.prepare("UPDATE events SET image_url = ? WHERE title = ? AND image_url LIKE 'https://picsum.photos/%'");
  db.transaction(() => SEED_EVENTS().forEach((e) => fix.run(e.image_url, e.title)))();
  return db;
}

export const db = g.__db ?? (g.__db = open());

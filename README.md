# Community Events Board

An admin posts local events; visitors browse, filter, pick favourite categories, set reminders and design a card for each event.
Built with **Next.js (App Router) + TypeScript, SQLite (better-sqlite3), Tailwind CSS**. See [REQUIREMENTS.md](REQUIREMENTS.md) for the plan.

## Setup (under 5 minutes)

Needs Node.js 20+ (tested on 22).

```bash
npm install
cp .env.example .env     # optional: defaults are built in
npm run dev              # http://localhost:5001
```

The database file (`data/app.db`) is created and filled with **15 sample events** automatically on first run. To reset, stop the server and delete `data/app.db`.

For a production check: `npm run build && npm start`.

## Admin login

Open `/admin/login`

| Email | Password |
|---|---|
| `admin@events.com` | `Make an event Active or Inactive. Do not delete it.` |

(One hard-coded admin, configurable via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`.)

Visitors sign up at `/signup`. After signing up they pick favourite categories, then see **My Feed**.

## API list

All endpoints return JSON. Visitor endpoints take `Authorization: Bearer <token>` (token comes from login), so a mobile app can use them as is. Errors look like `{ "error": "message" }`.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | – | Create account, returns `{ token, user }` |
| POST | `/api/auth/login` | – | Returns `{ token, user }` |
| GET | `/api/events?category=&city=&q=&page=&limit=` | – | Active, upcoming events, nearest first; filters combine |
| GET | `/api/events/:id` | optional | Event + (if logged in) `reminded` and saved `card` |
| GET / PUT | `/api/favourites` | user | Read / replace favourite categories |
| GET | `/api/feed?page=` | user | Upcoming events in favourite categories |
| PUT / DELETE | `/api/events/:id/reminder` | user | Set / remove reminder |
| GET / PUT | `/api/events/:id/card` | user | Read / save card design `{ theme, stickers[] }` |
| POST | `/api/admin/login` | – | Admin login, returns token and sets an httpOnly cookie |
| POST | `/api/admin/logout` | – | Clears the admin cookie |
| GET | `/api/admin/events` | admin | All events, including inactive |
| POST | `/api/admin/events` | admin | Create event |
| PATCH | `/api/admin/events/:id` | admin | `{ "isActive": true/false }` (no delete) |

## Short answers

**1. Database structure, and why**
Five tables: `users`, `events`, `user_categories (user_id, category)`, `reminders (user_id, event_id)` and `card_designs (user_id, event_id, theme, stickers)`. Favourites, reminders and card designs are separate tables with composite primary keys, so one user can never have duplicates, and "which events did I remind" is a simple lookup. Foreign keys use `ON DELETE CASCADE`. Events are never deleted, only `is_active` is flipped, so reminders and cards keep working. `starts_at` is stored as an ISO UTC string (sorts correctly as text) and price as whole rupees. Stickers are stored as a small JSON list because they are always read and written together with the card.

**2. Filter query and index**
One SQL query is built from optional conditions joined with `AND`: `is_active = 1 AND starts_at > now`, then `category = ?`, `city = ?` (case-insensitive) and `(title LIKE ? OR description LIKE ?)` only if the user chose them, ordered by `starts_at ASC` with `LIMIT/OFFSET` for pagination, plus a `COUNT(*)` with the same conditions for the page count. Values are always bound parameters (no SQL injection) and `%`/`_` in the search are escaped. Indexes in the schema: `events(is_active, starts_at)`, which serves the main "active + upcoming, nearest first" scan, and `events(category, city)`. `LIKE '%text%'` can't use a normal index, so for a large dataset I would add SQLite FTS5 full-text search.

**3. Passwords and admin protection**
Passwords are hashed with bcrypt (cost 10, per-password salt) and the plain password is never stored or logged; login returns the same error for a wrong email or a wrong password. Login returns a signed JWT (HS256, 7 days) containing the user id and a role. Admin pages are guarded on the server by `src/proxy.ts` (verifies the admin cookie and redirects to the login page), and every `/api/admin/*` handler checks the token and the `admin` role itself, so calling the API directly without it gives `403`. A normal user's token is rejected on admin routes. The admin password is compared in constant time.

## AI tools used

I used **Claude Code (Claude Sonnet 5.5)** to plan the requirements, then tested the flows in a browser. 
## What is left / known limits

- "Remind me" saves the reminder only; it does not send any email or notification (not in the brief).
- JWTs are not revocable and the visitor token is kept in `localStorage` (simple, mobile-friendly); a production app would add refresh tokens / httpOnly cookies.
- No rate limiting on login.
- Admin can add events and switch Active/Inactive, but not edit an existing event (not requested).
- Images come from `picsum.photos` and need internet access.
- Screen recording is not part of the repo.

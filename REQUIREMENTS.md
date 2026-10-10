# Community Events Board — Requirements & Plan

An admin posts local events; visitors browse, filter, favourite categories, set reminders and design a card per event.
Nothing beyond this list is built (extra features earn no marks).

## 1. Tech decisions
| Area | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router), TypeScript | Required |
| Database | SQLite via `better-sqlite3` | Zero setup, file DB, run in <5 min; raw SQL is easy to explain |
| UI | Tailwind CSS, `lucide-react` icons, Inter font | Free, consistent, responsive |
| Auth | `bcryptjs` (hash), `jose` (JWT, HS256) | Small, no native deps for auth |
| Validation | `zod` | One place for request validation |
| Animation | CSS transitions / `framer-motion` not required | Keep deps small |

## 2. Functional requirements
### A. Admin
- **A1** Admin login with one hard-coded admin (credentials from `.env`, documented in README). Returns JWT with `role=admin`.
- **A2** Admin pages (`/admin/*`) and admin APIs (`/api/admin/*`) protected **on the server** (middleware + per-route JWT/role check).
- **A3** Create event: title, category (Music, Workshop, Food, Sports, Kids), city, date & time, price, description, image URL.
- **A4** Toggle event Active/Inactive. No delete.

### B. Visitors
- **B4** Events page: only active + upcoming events, nearest date first.
- **B5** Filters: category, city, text search (title/description) — all combinable; pagination.
- **B6** Signup/login with email + password; login returns JWT.
- **B7** After login, user picks favourite categories.
- **B8** "My Feed": upcoming active events in the user's favourite categories only.
- **B9** "Remind me" button: optimistic UI update, persisted, rolled back with a message on failure.

### C. Event Card Designer (on event page)
- **C10** "Design your card": 3 background themes (switchable), 5 stickers, max 3 added (tap to add, removable), live smooth animation, saved per user per event and restored after refresh.

## 3. Non-functional requirements
- Pages call our own JSON API only (`/api/...`), so a mobile app can reuse it. JWT sent as `Authorization: Bearer` (web also stores it and sets a cookie for server-side page protection).
- Responsive and polished on phone and laptop; consistent colours, spacing, fonts.
- Loading, empty and error states on every data view.
- Prices in Indian format (₹1,50,000); dates friendly ("Sat, 18 Oct, 6:30 PM").
- 15 seed events: mixed categories & cities, some inactive, some past.

## 4. Data model (SQLite)
- `users(id, email UNIQUE, password_hash, created_at)`
- `events(id, title, category, city, starts_at, price, description, image_url, is_active, created_at)`
- `user_categories(user_id, category)` — PK (user_id, category)
- `reminders(user_id, event_id)` — PK (user_id, event_id)
- `card_designs(user_id, event_id, theme, stickers JSON)` — PK (user_id, event_id)
- Index: `events(is_active, starts_at)` and `events(category, city)`.

## 5. API list
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/signup | – | Create user, return JWT |
| POST | /api/auth/login | – | User login, return JWT |
| POST | /api/admin/login | – | Admin login, return JWT |
| GET | /api/events | – | Active upcoming events; `category, city, q, page, limit` |
| GET | /api/events/:id | – | Single event (+ user's reminder/card if logged in) |
| GET/PUT | /api/favourites | user | Read / replace favourite categories |
| GET | /api/feed | user | Upcoming events from favourite categories |
| PUT/DELETE | /api/events/:id/reminder | user | Set / clear reminder |
| GET/PUT | /api/events/:id/card | user | Read / save card design |
| GET | /api/admin/events | admin | All events incl. inactive |
| POST | /api/admin/events | admin | Create event |
| PATCH | /api/admin/events/:id | admin | Set active/inactive |

## 6. Pages
`/` events · `/events/[id]` detail + card designer · `/login` · `/signup` · `/favourites` · `/feed` · `/admin/login` · `/admin` (list + toggle) · `/admin/new`.

## 7. Deliverables checklist
- [ ] GitHub repo with regular commits
- [ ] README: setup (<5 min), admin login, API list, what's left, 3 short answers (DB structure, filter query + index, password/admin protection), AI-tool usage note
- [ ] 3–4 min screen recording (phone + laptop view, explain 2–3 code choices) — to be recorded by the author
- [ ] 15 seed events

## 8. Build order (one commit per step)
1. Requirements doc  2. Scaffold + DB + seed  3. Auth + admin API/pages  4. Public events API + page + filters  5. User favourites + feed  6. Reminders  7. Card designer  8. Polish, states, README

# Luna Café

> Coffee first. Then game on?

A portfolio project: the website of a fictional board game café. It opens as a calm specialty coffee shop, and the board game side is revealed as you scroll.

**Status:** phase 1 (setup, design system, first deploy). See [`docs/SPEC.md`](docs/SPEC.md) for the full plan.

## Stack

- **Client:** Vite, React 19, TypeScript, Tailwind CSS v4, Motion, React Router, TanStack Query
- **Server:** Node 22, Express 5, TypeScript, Mongoose (MongoDB Atlas), zod
- **Hosting (planned):** Vercel (client, rewrites `/api` to the server), Render (API), MongoDB Atlas M0

## Project layout

```
client/   React app
server/   Express API
docs/     spec
design/   Stitch mockups and the original design-system notes (visual reference only)
```

## Run it locally

1. Install dependencies: `npm run install:all`
2. Create `server/.env` from `server/.env.example` and set `MONGODB_URI` (and the admin values).
3. Seed the database: `npm --prefix server run seed`
4. Start the API: `npm run dev:server` (http://localhost:4000/api/health)
5. Start the site in a second tab: `npm run dev:client` (http://localhost:5173)

## Hero photo

Until the photo is ready the hero shows a drawn latte. To switch: save the photo as `client/public/images/hero.webp` (about 1600 × 1600, under 200 KB) and fill in `HERO_PHOTO` in `client/src/lib/cafe.ts`.

## Tests

`npm test` runs the server tests. They start a throwaway in-memory MongoDB (the first run downloads it, so allow a minute), so they never touch your Atlas data.

What they cover: café hours and time slots in café time (Asia/Kolkata), smallest-table assignment, double booking blocked under concurrent requests (enforced by a unique database index), cancellation freeing a slot, nearest-free-slot suggestions, and API validation errors.

## API so far

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | `{ status, db }` |
| GET | `/api/games` | available games |
| GET | `/api/games/:slug` | one game |
| GET | `/api/menu` | available menu items |
| GET | `/api/menu/special` | today's special (falls back to a signature drink) |
| GET | `/api/reservations/slots` | the fixed time slots |
| GET | `/api/reservations/availability?date=YYYY-MM-DD&partySize=4` | free / full / past / closed per slot |
| POST | `/api/reservations` | `{ name, email, phone, date, slotId, partySize, gameId? }` → reference code, or 409 with suggestions |

## Deploying

The API runs on Render (free), the site on Vercel, the data on MongoDB Atlas. Vercel forwards `/api/*` to Render, so the browser only talks to one address.

**1. MongoDB Atlas**
- Network Access → Add IP address → `0.0.0.0/0` (Render's free plan has no fixed IP). Keep a strong database password.
- Seed once from your machine: `npm --prefix server run seed`.

**2. API on Render**
- Dashboard → New → Blueprint → choose this repo. It reads `render.yaml`.
- Fill in `MONGODB_URI` (same as `server/.env`) and `CLIENT_ORIGIN` (your Vercel address, e.g. `https://luna-cafe.vercel.app`). `JWT_SECRET` is generated for you.
- When it is live, open `https://<service>.onrender.com/api/health`. It should say `"db":"connected"`.
- The free plan sleeps after 15 minutes without traffic and takes about a minute to wake. The site shows a "Waking up the café…" note meanwhile. No keep-alive ping on purpose: the free hours are shared with other projects in the same Render workspace.

**3. Site on Vercel**
- In `client/vercel.json`, replace `REPLACE-WITH-RENDER-URL` with your Render service name and commit.
- Vercel → Add New → Project → this repo. Root Directory: `client`. Framework: Vite (build `npm run build`, output `dist`).
- Open the site, then `/api/health` on the Vercel address: it should answer through the rewrite.

---

Portfolio project, fictional café. Game names belong to their owners.

# Luna Café: Project Specification (v2)

Revised 23 Nov 2026. Changes from v1 are marked **[v2]**. The Stitch mockups in this folder are visual reference only; the app is rebuilt as React components.

## 1. Overview

- **Project:** Luna Café, a fictional board game café website (portfolio project). Name locked.
- **Tagline:** "Coffee first. Then game on?"
- **Purpose:** prove full-stack ability and design/frontend polish.
- **Surprise concept:** the site opens as a calm café; the board game side is revealed in the first scroll. "Games" is in the nav from day one.
- **Footer note:** "Portfolio project, fictional café. Game names belong to their owners."
- **[v2] Café facts (fixed, used everywhere):** open Tue–Sun 10:00–22:00, closed Monday. Timezone Asia/Kolkata. Address and map are fictional (coded SVG map, no Google Maps key).

## 2. Theme and Design Direction

- Base calm (layout, palette, whitespace, slow motion); accent playful (micro-interactions, copy, small illustrations).
- Reference style: cream and sage bands, big rounded cards, wavy dividers, blob-shaped hero image. Use the design system, not the reference page structure.
- Moon motif: crescent in the logo, moon phases on the loyalty card, soft stars that twinkle on hover.

### Colors [v2: contrast-checked]

| Token | Hex | Use |
|---|---|---|
| cream | #F6EFDF | page background |
| sage | #A9BBA0 | alternate bands |
| forest | #4A6B4F | icons, secondary buttons, text on cream (5.2:1) |
| dark-forest | #294632 | headings, nav, **all text on sage** (5.1:1) |
| card | #FFFDF8 | cards, modals, forms |
| orange | **#B4501F** | CTAs only, white text (5.1:1) |
| orange-hover | #9E4419 | CTA hover/pressed |
| game accents | dusty blue #456277, terracotta #8C4E37, mustard #7D5800, lavender #665979 | game cards and tags only (each 6.3:1 on card); pale tints from the Stitch system for backgrounds |

**[v2] Why the changes:**
- White on #C85A24 is 4.25:1 and fails AA. Stitch worked around it with near-black text (#1F0900), which looks muddy. #B4501F keeps the look and passes with white.
- Forest (#4A6B4F) text on sage is 2.94:1 and fails. Text on sage uses dark-forest.
- CTA hover darkens to #9E4419. Never use `opacity` for hover on text buttons (it lowers contrast).
- `outline-strong` (#7B776A) is 3.9:1 on cream: borders only, never text.
- Rule stays: orange appears only on actions.

### Typography [v2: locked]

- Headings: **Fredoka** (600/500). Body: **DM Sans**. Reference codes and times: **Fragment Mono**.
- Self-host fonts with `@fontsource` packages (no Google Fonts request, better Lighthouse).

### Shapes and components

Large rounded cards (24px), pill buttons and tags, SVG wave dividers, blob clip-path on the hero image, cream/sage band rhythm. Soft shadow only: `0 8px 24px rgba(41,70,50,0.06)`. No glassmorphism, neon or heavy gradients.

### Accessibility

WCAG AA contrast; visible focus rings (dark-forest, 2px offset); keyboard-friendly modals (focus trap, Esc closes, focus returns) and menus; `prefers-reduced-motion` turns off heavy animation; every form field has a label and linked error text.

## 3. Pages

Public: 1 Home, 2 Games, 3 Menu, 4 Book a Table, 5 Events, 6 About, 7 Contact.
Hidden: 8 Admin (`/admin`, not linked in nav).

**[v2]** Stitch covers Home, Games + quiz, Menu, Book a Table and Admin. Events, About and Contact are built from the design system (or mocked in Stitch first if wanted).

## 4. Features

### Core
- **Game library:** filters (players, play time, difficulty, type, **[v2] mood**), search by name, detail modal, coded cards (accent background, type icon, name). Real names in text plus 4–5 invented games. Filter state kept in the URL (`?players=4&time=short`) so links are shareable.
- **Menu:** category tabs (coffee, tea, cold drinks, bakes, snacks), dietary tags (vegan, gluten-free), item modal.
- **Table reservation:** date, slot, party size, optional game; double-booking blocked in the database (see 7); confirmation screen with reference code; saved in MongoDB.

### Extras (all four in scope) [v2]
1. **Game picker quiz:** players → time → mood → 3 suggested games, with "Book a table with this game".
2. **Admin panel:** CRUD for games, menu items, events; view and cancel reservations; read contact messages.
3. **Events:** game nights and tournaments with sign-up (name, email), capacity enforced on the server, one sign-up per email per event.
4. **Moon-phase loyalty card:** UI only, stamps saved in localStorage, 8 phases = a free drink message.

### Small touches
Dice-roll on "Book a Table", twinkling stars on hover, latte-art/leaf line drawing in the hero.

### Dropped [v2]
- "Order from your table": removed (no time at 7 h/week; revisit after launch).

### Out of scope
Customer accounts, blog, newsletter popups, real payments.

## 5. Tech Stack [v2: updated]

- **Frontend:** Vite + React + **TypeScript**, React Router, **Tailwind CSS v4** (tokens in `@theme` in `index.css`, not a JS config), **Motion** (`motion` package, formerly Framer Motion; import from `motion/react`), TanStack Query for API calls.
- **Backend:** Node.js + Express + TypeScript, Mongoose, **zod** for validation (schemas shared with the frontend forms), helmet, cors, express-rate-limit on login and public POSTs.
- **Auth:** single admin, bcrypt hash, JWT in an **httpOnly cookie**. Admin is created by a seed script from env vars; there is no sign-up route.
- **Repo:** one GitHub repo, `client/` and `server/` folders, GitHub Actions CI (lint, test, build).
- **Tests [v2]:** server tests for booking rules and event capacity (Vitest + supertest + mongodb-memory-server); a few component tests; one Playwright happy path (book a table) before launch.
- **Deployment [v2]:** frontend on **Vercel** with a rewrite `/api/* → Render` (same origin, so the auth cookie works without third-party cookie issues); API on **Render free**; DB on **MongoDB Atlas M0**.
  - Your Render workspace already runs ShelfSpace and Fifty30 and shares 750 free hours/month. **Do not add a 24/7 keep-alive for Luna.** Accept the cold start and show a friendly "waking up the café…" loader on first API call.
- **Tools:** Antigravity for code generation, Gemini for photos.

## 6. Data Models [v2: revised]

- **Game:** name, slug, type (party | strategy | cooperative | word | dexterity), minPlayers, maxPlayers, playTimeMinutes, difficulty (1–3), moods [chill | competitive | silly | brainy], description, rulesSummary, accent (blue | terracotta | mustard | lavender), isInvented, isAvailable
- **MenuItem:** name, slug, category, price (in rupees, integer), description, dietaryTags, image, isSignature, isAvailable
- **Special:** menuItemId, date (one "today's special" per day; falls back to a signature item)
- **Table:** number, capacity
- **Reservation:** referenceCode, name, email, phone, date (`YYYY-MM-DD` string, café time), slotId, partySize, tableId, gameId?, status (confirmed | cancelled), createdAt
- **Event:** title, slug, date, startTime, description, type (game night | tournament), capacity, signups [{ name, email, createdAt }]
- **ContactMessage:** name, email, message, createdAt, isRead
- **Admin:** email, passwordHash

## 7. Reservation Rules (backend) [v2: concrete]

- **Slots** (90 min): 10:00, 11:30, 13:00, 14:30, 16:00, 17:30, 19:00, 20:30. Closed Mondays.
- **Tables:** four 2-seat, four 4-seat, two 6-seat, one 8-seat. Party size 1–8; larger groups are asked to use the contact form.
- **Window:** today (future slots only) up to 30 days ahead. Times are compared in Asia/Kolkata, not server time.
- **Assignment:** smallest free table that fits the party.
- **No double booking, enforced by the database:** unique partial index on `{ tableId, date, slotId }` where `status = "confirmed"`. On a duplicate-key error, retry with the next suitable table; if none, return `409` with the 3 nearest free slots. (A check-then-insert alone would let two requests at the same moment both succeed.)
- **Cancel:** admin sets status to cancelled, which frees the slot.
- **Reference code:** `LUNA-` + 5 characters without look-alikes (no 0/O/1/I), e.g. `LUNA-7KQ4M`.
- **Availability endpoint:** `GET /api/availability?date=&partySize=` returns each slot with free/full so the UI greys out full slots before submit.
- **Events:** sign-up uses one atomic update (only adds if signups < capacity and the email isn't already in the list); full returns `409`.

## 8. Animations (Motion)

Page transitions; scroll-reveal for sections and cards; hero entrance and the game reveal on first scroll; card hover tilt and "+" pop; layout animation on filter changes; quiz step transitions; dice roll. All respect reduced motion (`MotionConfig reducedMotion="user"` plus CSS fallback).

## 9. Images

- Done: hero (remove watermark, crop for mobile with the cup on the right).
- Needed (~10): interior wide, 3 drinks, 3 food items, game night scene, storefront.
- Same Gemini chat and style block, hero attached as reference, light clean oak wood.
- **[v2] Export:** WebP (AVIF optional), hero ≤ 1600 px wide and ≤ 200 KB, others ≤ 1000 px and ≤ 120 KB; `width`/`height` set to avoid layout shift; lazy-load below the fold; hero preloaded.
- Not generated: game cards, icons, logo, dividers, illustrations, map (all SVG/code).

## 10. Responsive and Quality Rules

Mobile-first at 375 / 768 / 1280. Hero on mobile: image anchored right so the cup stays visible, headline above. Test waves and blobs on mobile early. Lighthouse ≥ 90 performance and ≥ 95 accessibility before launch. No console errors.

## 11. Build Phases [v2: 7 h/week, about 1 h/day]

Phase order changed: a skeleton is deployed in phase 1 (deploy problems show up early), and the animation pass moves after features are built (no re-animating pages that change).

| # | Phase | Hard stop |
|---|---|---|
| 1 | Setup + design system: repo, Vite/TS/Tailwind tokens, fonts, base components (Button, Card, Tag, Modal, Input, Wave, Blob), layout + nav + footer, skeleton deployed to Vercel; start remaining photos | Sun 6 Dec 2026 |
| 2 | Static pages: all 7 public pages, responsive, placeholder data | Sun 20 Dec |
| 3 | Game library + menu: seed data, filters, search, modals | Sun 3 Jan 2027 |
| 4 | Backend + reservations: API, Atlas, booking rules + tests, availability, confirmation | Sun 24 Jan |
| 5 | Admin + quiz: login, CRUD, reservations list/cancel, messages; quiz | Sun 7 Feb |
| 6 | Events + loyalty card + Motion pass | Sun 21 Feb |
| 7 | Polish + launch: a11y, Lighthouse, Playwright happy path, README with screenshots | Sun 7 Mar |
| – | Buffer week | Sun 14 Mar |

Rule: if a phase misses its stop date by more than 3 days, cut scope (loyalty card first, then events) instead of moving every later date.

## 12. Definition of Done

- Live URL; all 7 public pages and admin working.
- Reservations block double booking (proved by a test that fires two bookings at once).
- Game filters, quiz, events sign-up and loyalty card working.
- No contrast failures or console errors; checked at phone, tablet, desktop.
- CI green; README with screenshots, features, stack, architecture note, setup steps, live link.

## Open Items

- Generate the remaining ~10 images (during phase 1–2).
- Decide the 4–5 invented games (Stitch already has "Moonlight Mischief").
- Fictional address and team names for About/Contact.

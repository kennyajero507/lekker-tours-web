# Lekker Tours Web

Public website and admin dashboard for **Lekker Tours and Travel**, a Nairobi-based safari operator.

The backend it reads from lives in a separate repository: **`lekker-tours-api`** (Express 5 +
MongoDB). That service must be running for this app to show content.

- **Framework:** Next.js 15 (App Router, React 19, Tailwind CSS v4)
- **Default port:** `3000`

| | URL |
|---|---|
| Public website | http://localhost:3000 |
| **Admin dashboard** | **http://localhost:3000/admin** |
| Admin login | http://localhost:3000/admin/login |

The admin area appears in no public navigation, is marked `noindex, nofollow`, and is disallowed in
`robots.txt`. It is reachable only by typing the URL.

---

## Getting started

Start the API first, see the `lekker-tours-api` README. Then:

```bash
npm install
cp .env.example .env.local    # then edit it, see below
npm run dev                   # starts the site on :3000
```

Sign in at `/admin/login` with the administrator created by the API's `npm run seed:admin`.

### Scripts

```bash
npm run dev     # development server
npm run build   # production build
npm start       # production server
npm run lint
```

---

## Environment

Copy `.env.example` to `.env.local`. `.env.local` is gitignored and must never be committed.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the API. Default `http://localhost:4000`. Public: it reaches the browser. Also feeds `images.remotePatterns`, so uploaded images render. Keep it identical to `PUBLIC_API_URL` in the API repo. |
| `NEXT_PUBLIC_SITE_URL` | This site's own public URL. Used for canonical URLs, `sitemap.ts` and `robots.ts`. |
| `REVALIDATE_SECRET` | Shared secret for the webhook the API calls. Must match the value in `lekker-tours-api`. **Server-only**: never prefix it with `NEXT_PUBLIC_`. |

---

## How it talks to the API

There is no shared code with the API repo, only HTTP.

**Reading content.** Public pages are **server components** that fetch through
[src/lib/api.ts](src/lib/api.ts) with an explicit `next: { revalidate, tags }`. Next 15 does not
cache `fetch` by default, so this is deliberate rather than incidental; without it every render
would hit Express. Public reads use `apiGetSafe` / `apiListSafe`, which degrade to an empty state
and log rather than crashing the page when the API is unreachable.

**Cache invalidation.** After any admin write, the API POSTs the affected cache tags to
[/api/revalidate](src/app/api/revalidate/route.ts), which verifies `x-revalidate-secret` and calls
`revalidateTag` for each, so published changes appear without a restart.

**The admin dashboard** fetches **client-side** with `credentials: 'include'` and
`cache: 'no-store'`, so it always shows the true database state including drafts. The JWT lives in
an `httpOnly` cookie and is never decoded in the browser; only the API verifies it.

> **Next 15, not 16.** `revalidateTag()` takes a *single* argument here. The two-argument form,
> `updateTag()` and `cacheLife()` are Next 16 APIs and will throw. Next is pinned to **15.5.25**;
> note that Next 16 is the current major release.

---

## Layout

```
public/images/     # 55 Pexels photographs + CREDITS.md
src/
├─ app/
│  ├─ (public)/      # the public website (Header + Footer layout)
│  ├─ admin/         # the dashboard: a bare segment, never linked
│  └─ api/revalidate # webhook the Express API calls after writes
├─ components/       # layout, home, tours, destinations, blog, ui, admin
├─ lib/              # api client, admin client, auth, settings, tags
└─ types/            # shared TypeScript types
```

---

## Admin dashboard

| Screen | What it does |
|---|---|
| **Dashboard** | Counts per collection, unread enquiry badge, quick actions. |
| **Tours** | Full CRUD. Day-by-day itinerary builder, gallery manager, inclusions/exclusions, featured and best-selling flags, one-click publish/unpublish. |
| **Destinations** | Full CRUD, including an inline parks/regions editor and a month-picker for seasons. |
| **Blog posts** | Full CRUD with cover image, tags and reading time. |
| **Testimonials** | Full CRUD with star ratings and featured flag. |
| **FAQs** | Full CRUD, grouped and ordered. |
| **Enquiries** | Inbox for both form types. Opening marks as read; status can be moved through the workflow. |
| **Site settings** | Tabbed editor for the site name, logos and favicon, the announcement bar, the About, Services and Contact page copy and banners, the homepage hero, the values strip, the full contact block, social links, footer text and default SEO, so nothing on the landing page is hardcoded. |

Images can be entered as a path already in this repo (`/images/…`) or uploaded from the browser;
uploads are stored and served by the API, not by this app.

---

## Content provenance

**Please read before publishing this site.**

Taken from lekkertours.com, their real published content:

- The six packages with their real names and prices: The Lion King Trail ($200), Rhino Sanctuary
  Deep Dive ($450), The Pattern of the Bush ($320), Big Five Express ($250), Savanna Sunsets ($200),
  Wilderness Quick-Dive ($300)
- Taglines: "Feel the Pulse of the African Wilderness", "Witness the Theater of Nature",
  "The Wild, Within Reach"
- Company values, the footer description, and the contact block
  (+254 182 308 871 · +254 182 308 872 · lekkertours@gmail.com · Agip House, Haile Selassie Avenue,
  P.O Box 13689-00200, Nairobi)

**Written for this site, not by Lekker Tours, review before it faces customers:**

- **15 additional tours**, and **every itinerary, duration and price** on all 21 tours. Parks,
  routes and seasons are real and researched, but the commercial detail is illustrative.
- **All 5 destination guides** and their park descriptions.
- **All 5 blog articles** and **all 9 FAQ answers**.
- **All 6 testimonials are illustrative examples, not real customers.** They exist to show how
  genuine reviews will render. Replace them with real, attributable reviews before launch,
  publishing invented testimonials as real would mislead customers.

Design and layout take structural inspiration from bluelilactours.com. No text, images, branding or
logo were copied from it.

Photographs are from [Pexels](https://www.pexels.com) under the Pexels License, with every
photographer credited in [public/images/CREDITS.md](public/images/CREDITS.md). They are stock images
chosen to match each subject, not photographs of Lekker's own trips, camps or guests. The lodge and
camp images in particular are generic and show no actual partner property.

The logo is the one supplied in the original project folder.

---

## Deployment

- Set `NEXT_PUBLIC_API_URL` to the deployed API hostname, and the API's `WEB_ORIGIN` to this app's
  hostname, CORS and the revalidation webhook both depend on that pair.
- Set `NEXT_PUBLIC_SITE_URL` so canonical URLs, the sitemap and robots.txt are correct.
- Keep `REVALIDATE_SECRET` identical on both sides.

### Images from the API

Admin-uploaded media is served by the API, not from this repo, so `<Image>` needs that hostname in
`images.remotePatterns`. [next.config.ts](next.config.ts) derives it from `NEXT_PUBLIC_API_URL`
rather than hardcoding it, keeping the localhost entries for development. If uploaded images render
in dev but break in production, that pairing is the first thing to check.

## Continuous integration

[.github/workflows/ci.yml](.github/workflows/ci.yml) runs on push and PR: `npm ci`, `npm run lint`,
`tsc --noEmit`, then `npm run build`. The build deliberately runs **without** an API available,
public pages use `apiGetSafe` / `apiListSafe` and must degrade to an empty state rather than fail,
so a green build also proves that fallback still works.

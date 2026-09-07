# IJ Estate & Builders — Keyword Map & SEO Guide

Last updated: 2026-09-03

This document is your single source of truth for **which page targets which Google
search**. Every page's `<title>` and meta description (in `src/seo/seoConfig.js`)
is written to match its target keyword below. Update both together.

---

## 1. Your SEO reality (read this first)

- **Who you are:** a real estate agency for **Bahria Town Lahore** (Safari Villas,
  Rafi Block, Johar Block, Tauheed Block, etc.), plus commercial (Business Bay).
- **Who you compete with:** Zameen.com, Graana, Ilaan — huge portals. You will
  **not** outrank them for broad terms like "property in Lahore" soon.
- **Where you CAN win:** specific, local, long-tail searches and **your own brand**.
  Example targets you can realistically rank for:
  - `IJ Estate & Builders`
  - `property dealer Safari Villas Bahria Town Lahore`
  - `5 marla house for sale Safari Villas`
  - `Business Bay commercial plots price Bahria Town`

**Rule of thumb:** one page = one primary keyword + a few close variants. Never make
two pages fight over the same keyword (keyword cannibalisation).

---

## 2. The keyword map (URL → target search)

| Page (URL) | Primary keyword | Secondary keywords | Search intent |
|---|---|---|---|
| `/` | Bahria Town Lahore real estate | property dealer Bahria Town Lahore, IJ Estate & Builders | Navigational / commercial |
| `/listings` | houses for sale in Bahria Town Lahore | plots for sale Bahria Town Lahore, 5 marla house Bahria Town | Commercial (ready to browse) |
| `/property/:id` | *(per property)* e.g. 5 marla house Safari Villas for sale | `{block} {marla} {type} for sale`, buy house Bahria Town | Transactional (ready to buy) |
| `/about` | trusted property dealer Bahria Town Lahore | best real estate agency Lahore, about IJ Estate | Trust / research |
| `/contact` | IJ Estate & Builders contact | real estate agent Bahria Town Lahore phone number | Navigational / action |
| `/commercial/business-bay` | Business Bay Commercial Bahria Town Lahore | commercial plots Bahria Town, shops for sale Lahore | Commercial investment |
| `/commercial/generic` | commercial property Bahria Town Lahore | office space Lahore, commercial plots | Commercial investment |
| `/map` | Bahria Town Lahore map | Bahria Town blocks map, Safari Villas location | Informational |
| `/virtual-3d` | Bahria Town Lahore virtual tour | Bahria Town street view, Bahria Town landmarks | Informational |
| `/forums` | Bahria Town Lahore property forum | Bahria Town community, property prices discussion | Community |

> Experimental 3D demo routes (`/3d`, `/3d-showcase`, `/3d-legacy`, `/3d-css`) are
> intentionally **blocked in robots.txt** — they have no unique text content and
> would only dilute your crawl budget.

---

## 3. How keyword mapping actually works (the process)

1. **Brain-dump seeds.** List everything a buyer might type: block names, plot sizes
   (marla/kanal), "for sale", "price", "map". You did this by having a real business.
2. **Expand with free tools:**
   - **Google autocomplete** — type "5 marla house Bahria Town" and note suggestions.
   - **"People also ask"** and **"Related searches"** at the bottom of the results.
   - **Google Keyword Planner** (free with a Google Ads account) — gives rough volumes.
   - **Google Search Console** (see §5) — the single best source once you're indexed:
     it shows the *exact* queries people already use to find you.
3. **Group by intent** (informational vs commercial vs transactional) and assign
   **one primary keyword to one URL** (the table above).
4. **Write the page to match:** the primary keyword should appear in the `<title>`,
   the `<h1>`, the first 100 words, the URL, and the meta description — naturally,
   not stuffed.
5. **Review quarterly** against Search Console data and shift targets as you learn
   what actually gets impressions.

---

## 4. What's already implemented in the code

- ✅ Per-page `<title>`, meta description, keywords, canonical URL — every route.
- ✅ Open Graph + Twitter cards (social sharing previews).
- ✅ JSON-LD structured data: `RealEstateAgent` (org), `WebSite` + Sitelinks search
  box on home, `BreadcrumbList` on inner pages, `Product`/`Offer` on each property.
- ✅ `sitemap.xml` with all indexable routes + property pages, current dates.
- ✅ `robots.txt` allowing crawl, blocking thin 3D routes, pointing to the sitemap.
- ✅ Google Analytics (G-8E0616QJJM) and Search Console verification already in place.

To change any page's SEO text, edit **`src/seo/seoConfig.js`** only.

---

## 5. Your action checklist (do these — code can't)

1. **Google Search Console** (search.google.com/search-console)
   - You're already verified. After deploying, go to **Sitemaps** and submit
     `https://ijestateandbuilders.com/sitemap.xml`.
   - Use **URL Inspection → Request indexing** for your top pages to speed things up.
   - After ~1–2 weeks, open **Performance** → this is your real keyword data.
2. **Google Business Profile** (google.com/business) — CRITICAL for local real estate.
   Create/claim it with your exact **N**ame, **A**ddress, **P**hone (NAP). This is
   what puts you on Google Maps and the local pack. Keep NAP identical everywhere.
3. **Fill the TODOs** in `src/seo/seoConfig.js`:
   - Real phone number (`PHONE`).
   - Real Facebook/Instagram URLs (`sameAs`) — helps Google confirm your identity.
4. **Get reviews** on Google Business Profile — reviews are a top local ranking factor.
5. **Add real, unique text** to `/listings` and each block landing (a paragraph about
   the area). Google rewards descriptive local content; thin pages don't rank.

---

## 6. Pre-rendering (react-snap) — ✅ NOW ACTIVE

Your site is a Create React App SPA (renders via JavaScript). Google *can* render
JS, but it's slower/less reliable, and Facebook/WhatsApp link previews **don't** run
JS — so per-page meta wouldn't show. To fix this, **react-snap now pre-renders your
main pages to static HTML at build time**. `npm run build` automatically runs
`react-snap` afterwards (the `postbuild` script) and writes real HTML with the
correct title, description, Open Graph and JSON-LD baked in.

**How it's set up (see `reactSnap` in `package.json`):**
- **Pre-rendered routes:** `/`, `/listings`, `/about`, `/contact`,
  `/commercial/business-bay`, `/commercial/generic`, `/virtual-3d`, `/forums`.
- **Deliberately NOT pre-rendered:** the heavy 3D demo routes (`/3d`, `/3d-showcase`,
  `/experience`) and `/property/:id`. Property pages come from your backend API, which
  isn't running at build time — pre-rendering them would bake a broken/`noindex` page,
  so Google renders them live instead (they still get correct meta via JS).
- **Three.js is protected:** the decorative WebGL jelly (`HeroBlob3D`) detects the
  `ReactSnap` user-agent via `src/utils/isPrerender.js` and **skips WebGL entirely**
  during snapshotting — so the build is fast and never hangs on the GPU. The visual
  still appears normally for real visitors after hydration.
- **Chrome:** react-snap ships an ancient bundled Chromium, so it's pointed at your
  installed Google Chrome (`puppeteerExecutablePath` in `package.json`). If you build
  on another machine, update that path or install Chrome there.

**⚠️ Deployment gotcha (Hostinger / any static host):** react-snap creates a folder
per route (`build/about/index.html`, etc.). Your host must serve that static file for
`/about` **before** falling back to the SPA `index.html`. Most hosts do this
automatically (folder `index.html` wins), but if you have a catch-all rule that
rewrites *everything* to `/index.html`, it will hide the pre-rendered pages. Rule of
thumb for the rewrite: "serve the file if it exists, otherwise fall back to
`/index.html`." Test after deploy by opening `view-source:https://yourdomain.com/about`
— you should see the About title/description in the raw HTML.

For the ultimate setup you'd migrate to **Next.js** (true server-side rendering), but
that's a large rewrite and not needed right now — react-snap covers the important pages.

---

## 7. Verify your work

- **Rich Results Test:** https://search.google.com/test/rich-results — paste a live
  property URL, confirm the `Product`/`Breadcrumb` schema is detected.
- **Meta tags:** view-source or use https://metatags.io to preview social cards.
- **Mobile-Friendly / PageSpeed:** https://pagespeed.web.dev — real estate buyers are
  on mobile; keep Core Web Vitals green (your heavy 3D scenes are the main risk).

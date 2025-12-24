## BizGrowth Africa — Business News & Intelligence (Africa-only)

Premium, original African business news built with React, Tailwind CSS, and React Router. This project powers BizGrowth Africa’s website, delivering founder-first coverage across markets, policy, funding, fintech, SMEs, and data-driven deep dives.

### Live domain
- https://bizgrowthafrica.com

### Key features
- Original article pages with strong typography, inline citations, “Why it matters” insights, key takeaways, and optional “By the numbers” stats.
- Dynamic, premium homepage with hero spotlight + side headlines, dense Latest grid, Funding & Deals, and Deep Dives & Analysis.
- Curated, Afro-centric imagery with Ninth Grid priority and progressive image fallbacks to ensure every image works.
- Daily content rotation hook for freshness (mock data), with internal article routing via slugs.
- SEO-optimized pages with canonical URLs, Open Graph/Twitter tags, and JSON-LD NewsArticle schema.
- Performance UX polish: route progress bar, image skeleton loaders, network preconnects.
- Dark mode support, responsive layout, clean Tailwind utility classes.

## Tech stack
- React 18 (Vite)
- React Router
- Tailwind CSS

## Getting started
1) Prerequisites
- Node.js 18+ (LTS recommended)

2) Install
```bash
npm install
```

3) Run dev server
```bash
npm run dev
```

4) Build for production
```bash
npm run build
```

5) Preview production build
```bash
npm run preview
```

## Project structure (high level)
- `src/pages/` — page-level components
  - `Home.jsx` — premium homepage (hero spotlight, side headlines, grids)
  - `NewsInsights.jsx` — full news listing page
  - `NewsArticle.jsx` — single article page (rich body, citations, stats, related)
- `src/components/` — shared UI components
  - `SEO.jsx` — sets meta tags, canonical, OG/Twitter, JSON-LD
  - `NewsCard.jsx`, `NewsInlineCard.jsx`, `SectionHeader.jsx`, `NewsletterCTA.jsx`, etc.
  - `RouteProgress.jsx` — subtle top progress bar on route changes
- `src/data/` — data and helpers
  - `articles.original.js` — seed set of BizGrowth original articles
  - `originals.bulk.js` — generator (~100) of additional originals with rich bodies/citations
  - `originals.index.js` — aggregates all articles, builds image candidates, enriches richBody
  - `useDailyOriginalArticles.js` — daily rotation hook for homepage freshness
  - `image.overrides.js` — Ninth Grid-first per-article/per-segment image overrides
- `src/config/site.js` — site-wide constants (e.g., `SITE_URL`)
- `public/robots.txt`, `public/sitemap.xml` — basic crawl and indexing files

## Styling & theming
- Tailwind classes throughout; primary brand color set to `#0067FF` (see `tailwind.config.js`).
- Responsive-first layout and dark mode via `dark:` utilities.
- Comfortable reading width on article pages (`max-w-3xl`), strong typographic hierarchy.

## Routing
- React Router configured in `src/App.jsx`:
  - `/` — Home
  - `/news-insights` — Listing
  - `/news/:slug` — Article page
  - Additional routes: `/opportunities`, `/procurement-tenders`, `/tools-templates`, `/community`, `/about`, `/contact`

## Content model
- Each article includes: `slug`, `title`, `subheading`, `category`, `country`, `region`, `publishedAt`, `summary`, `body` (paragraphs), optional `richBody` (inline citation spans), `whyItMatters`, `keyTakeaways`, optional `byTheNumbers`, `caseStudy`, `expertCommentary`, and `sourceAttribution`.
- `originals.index.js` will enrich any short article with a `richBody` (and inline citations) if missing.

## Images policy (Afro-centric, reliable)
- Ninth Grid is prioritized for featured images. Fallbacks are curated keyword-based images and a final seed fallback to avoid broken images.
  - Ninth Grid: add explicit URLs in `src/data/image.overrides.js` (by slug or by `Category|Country`). Ninth Grid: https://www.ninthgrid.com/
  - If an image fails, components will progressively try the next candidate until one succeeds.

## SEO
- Default head tags in `index.html` (description, theme-color, OG/Twitter defaults).
- Per-page SEO via `src/components/SEO.jsx`: dynamic title, description, canonical URL, OG/Twitter, and JSON-LD.
- Canonical base configured via `src/config/site.js` → `SITE_URL = "https://bizgrowthafrica.com"`.
- `public/sitemap.xml` and `public/robots.txt` included. For full coverage, generate a sitemap including every article slug in production.

## Performance & UX
- Route progress indicator (`RouteProgress.jsx`) on navigation.
- Image skeleton shimmers in cards and article hero while images load.
- `index.html` includes `preconnect` hints for image hosts.

## Editorial guidelines
- Original BizGrowth Africa coverage only (no copy–paste). Summaries, analysis, and verified references inline.
- Strictly African business news and intelligence; founder- and MSME-focused framing.
- Accuracy first: inline citations in article bodies point to authoritative sources (central banks, multilaterals, exchanges, research providers, etc.).

## Deployment notes
- This is a Vite app; deploy on any static hosting (Netlify, Vercel, Cloudflare Pages, S3 + CDN).
- Ensure `SITE_URL` matches the production domain before building.
- Consider generating a dynamic sitemap at build time (include all `news/:slug` URLs).

## Contact
- Website: https://bizgrowthafrica.com
- Contact: https://bizgrowthafrica.com/contact

## License
- All original content © BizGrowth Africa. Code licensed to the project owners. Images pulled from Ninth Grid or other sources should follow their respective usage policies.

# BizGrowth Africa

BizGrowth Africa is a business intelligence platform for African MSMEs. It features pages for Home, Opportunities, Procurement & Tenders, Business News & Insights, Tools & Templates, Community, About, and Contact. Each page uses reusable components like Navbar, Footer, Cards, Filters, Tabs, and CTA sections. Tailwind CSS handles styling.

## Tech Stack
- React + Vite
- react-router-dom
- Tailwind CSS

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

## Project Structure
```
src/
  components/        # Navbar, Footer, Layout, etc.
  pages/             # Route pages (Home, Opportunities, etc.)
  assets/            # Static assets
  data/              # Static data (JSON) and loaders
  App.jsx            # Routes
  main.jsx           # App entry
```

## Design
- Primary color: #0067FF
- Palette: White and Black for neutral UI


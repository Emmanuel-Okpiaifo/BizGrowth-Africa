<p align="center">
  <a href="#" target="_blank">
    <img src="public/img/logos/bizgrowth2.png" width="400" alt="BizGrowth Africa Logo">
  </a>
</p>

# BizGrowth Africa

BizGrowth Africa is a business news and opportunities platform designed for African MSMEs. The site brings together curated news and insights, procurement and tender intelligence, funding opportunities, and practical tools in a single, professional experience that supports informed decision‑making and sustainable growth.

## What this project includes

- **Home**: Business‑focused top stories and featured coverage.
- **Opportunities**: Curated opportunities list with dedicated detail pages.
- **News & Insights**: Editorial‑style news feed with article detail views.
- **Procurement & Tenders**: A procurement‑focused gallery and dedicated detail pages.
- **Tools & Templates**: Resource‑style gallery for business tools and templates.
- **Contact**: Business‑ready contact form and information.
- **Light / Dark Mode**: Consistent theming across all pages.

## Tech stack

- **Vite + React** for fast builds and routing
- **React Router** for client‑side navigation
- **Custom styling** layered on top of the template CSS

## Project structure

```
src/
  components/        # Shared UI (header, footer, theme)
  hooks/             # Theme + interaction hooks
  pages/             # Route pages
public/
  css/               # Template CSS
  img/               # Images and logos
```

## Routes in use

- `/` → Home
- `/opportunities` → Opportunities list
- `/news-insights` → News & Insights list
- `/procurement-tenders` → Procurement & Tenders
- `/tools-templates` → Tools & Templates
- `/contact` → Contact
- `/single-news-1` → Opportunity detail
- `/single-news-2` → Procurement / Tools detail
- `/single-news-3` → News detail
- `/404` → Not found

## Getting started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Notes

- The site content is tailored for a business‑formal tone.
- Legacy pages and assets were removed to keep the project focused on the active routes.

## Copyright

© 2026 BizGrowth Africa. All rights reserved.

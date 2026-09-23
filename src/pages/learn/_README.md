# pages/learn

Routes of the learning area (DaviLearn). This file starts with `_` so Astro does not
publish it as a page.

- Owner: UI Frontend Designer.
- These pages will be server-rendered (`export const prerender = false`); the
  documentation stays static.
- Pending decision (UI + i18n + SEO): `/learn` must either be localized (`/es/learn`,
  `/fr/learn`) or render without alternate `hreflang` links, like `404.astro` does.

See `docs/architecture/project-structure.md`.

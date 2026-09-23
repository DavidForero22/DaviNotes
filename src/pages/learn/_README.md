# pages/learn

Routes of the learning area (DaviLearn). This file starts with `_` so Astro does not
publish it as a page.

- Owner: UI Frontend Designer.
- Localized like the documentation: `/learn` (default language, this folder) and
  `/es/learn`, `/fr/learn` (`pages/[lang]/learn/`). Both render the same component
  from `components/learn/`, so `AlternateLinks` needs no exceptions.
- Phase A: prerendered placeholder with `noindex` (links still followed, `hreflang` kept).
- Phase C: pages become server-rendered (`export const prerender = false`). From then on
  `getStaticPaths` no longer applies, so `[lang]` must be validated with
  `isLang(lang) && lang !== defaultLang`, returning a 404 otherwise.

See `docs/architecture/project-structure.md` and `docs/architecture/layout-modos.md`.

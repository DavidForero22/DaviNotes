# pages/learn

Routes of the learning area (DaviLearn). This file starts with `_` so Astro does not
publish it as a page.

- Owner: UI Frontend Designer.
- Localized like the documentation: `/learn` (default language, this folder) and
  `/es/learn`, `/fr/learn` (`pages/[lang]/learn/`). Both render the same component
  from `components/learn/`, so `AlternateLinks` needs no exceptions.
- Phase C (T14): every learn page is server-rendered (`export const prerender = false`) and keeps `noindex`.
  `[lang]` is validated with `isLang(lang) && lang !== defaultLang` (404 otherwise).
  - `index.astro`: /learn (roulette and exercise list with a session).
  - `profile.astro`: private; profile and active languages form (flash cookie `dl_profile_flash`).
  - `play.astro`: private; `?language=x` → 303 to a random exercise (`pickExercise`), or 200/400/500 with the reason.
  - `login.astro`, `register.astro`: forms; a signed-in user is redirected (`redirectIfSignedIn`).
  - `exercise/[id].astro`: private (303 to login with `?next=`), 404 / 500 with their real status.
- `_exercises.ts`: server-side data of these pages (home, exercise, profile, roulette result). Server only.
  The private pages use `requireUser` (303 to login with `?next=`) directly.

See `docs/architecture/project-structure.md` and `docs/architecture/layout-modos.md`.

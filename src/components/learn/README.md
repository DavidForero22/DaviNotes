# components/learn

Components of the learning area (DaviLearn):

- **Interactive parts** are **Vue 3 islands** (`.vue`, Composition API) hydrated with `client:*` directives.
- **Static page sections** (e.g. `LearnHome.astro`) are plain Astro components that wrap
  `layouts/learn/LearnLayout.astro` and are rendered by the routes in `pages/learn/` and `pages/[lang]/learn/`.

- Owner: UI Frontend Designer.
- `LearnHome.astro`: /learn. With a session, the language roulette and the list of exercises; without one, the
  invitation to sign up and `LanguageSuggestion.vue`.
- `AuthForm.astro`: sign-in and sign-up forms (`<form method="post">` to `/api/auth/*`, errors from the flash
  cookie; guide `docs/guidelines/account-a11y.md` §1).
- `AccountMenu.astro`: account slot of the learn header (`<details>` menu or "Sign in" link; guide §2). It listens to
  the `davilearn:balance` event of the exercise island to keep coins, level and XP in sync.
- `ExercisePage.astro`: /learn/exercise/[id] (exercise, 404 and 500 states; guide §3).
- `InterfazEjercicio.vue`: exercise screen. It receives an `api` object (`exercise-ui.ts`); Astro cannot pass
  functions to an island, so `EjercicioConectado.vue` builds the real one (`exercise-api.ts`, `fetch` to
  `/api/exercises/[id]/{result,hints}`) and forwards each new balance to the header.
- `ProfilePage.astro` (C7): /learn/profile. Level, XP, coins and stats, the active languages form
  (`<form method="post">` to `/api/profile/languages`, works without JS) and the empty achievements section. It
  replaces the planned `DashboardPerfil.vue`: nothing on it needs to be interactive yet.
- `RuletaLenguajes.vue` (C7): roulette of the user's active languages; the result links to `/learn/play?language=`.
  Direct links per language keep it usable without JS; with one language there is no spin.
- `PlayPage.astro` (C7): /learn/play when there is no exercise to redirect to (no exercises yet, language not
  active, unknown language, error).
- Data comes from `src/pages/api/` endpoints (islands) or from `src/lib/server/` in the `.astro` pages; request/response
  shapes live in `src/types/`.
- **Never import from `src/lib/server/`** here — that code must not reach the client bundle. Pages load the data and
  pass it as props.
- Components shared with the documentation go in `components/shared/`, not here.

See `docs/architecture/project-structure.md`.

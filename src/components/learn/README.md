# components/learn

Components of the learning area (DaviLearn):

- **Interactive parts** are **Vue 3 islands** (`.vue`, Composition API) hydrated with `client:*` directives.
- **Static page sections** (e.g. `LearnHome.astro`) are plain Astro components that wrap
  `layouts/learn/LearnLayout.astro` and are rendered by the routes in `pages/learn/` and `pages/[lang]/learn/`.

- Owner: UI Frontend Designer.
- `LearnHome.astro`: /learn. With a session, the list of exercises; without one, the invitation to sign up.
- `AuthForm.astro`: sign-in and sign-up forms (`<form method="post">` to `/api/auth/*`, errors from the flash
  cookie; guide `docs/guidelines/account-a11y.md` §1).
- `AccountMenu.astro`: account slot of the learn header (`<details>` menu or "Sign in" link; guide §2). It listens to
  the `davilearn:balance` event of the exercise island to keep coins, level and XP in sync.
- `ExercisePage.astro`: /learn/exercise/[id] (exercise, 404 and 500 states; guide §3).
- `InterfazEjercicio.vue`: exercise screen. It receives an `api` object (`exercise-ui.ts`); Astro cannot pass
  functions to an island, so `EjercicioConectado.vue` builds the real one (`exercise-api.ts`, `fetch` to
  `/api/exercises/[id]/{result,hints}`) and forwards each new balance to the header.
- Planned: `DashboardPerfil.vue`, `RuletaLenguajes.vue`.
- Data comes from `src/pages/api/` endpoints (islands) or from `src/lib/server/` in the `.astro` pages; request/response
  shapes live in `src/types/`.
- **Never import from `src/lib/server/`** here — that code must not reach the client bundle. Pages load the data and
  pass it as props.
- Components shared with the documentation go in `components/shared/`, not here.

See `docs/architecture/project-structure.md`.

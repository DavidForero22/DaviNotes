# components/learn

Components of the learning area (DaviLearn):

- **Interactive parts** are **Vue 3 islands** (`.vue`, Composition API) hydrated with `client:*` directives.
- **Static page sections** (e.g. `LearnHome.astro`) are plain Astro components that wrap
  `layouts/learn/LearnLayout.astro` and are rendered by the routes in `pages/learn/` and `pages/[lang]/learn/`.

- Owner: UI Frontend Designer.
- `InterfazEjercicio.vue`: exercise screen (phase B). It receives an `api` object (`exercise-ui.ts`), so it is
  rendered inside another Vue island: today `EjercicioDemo.vue` with `fixtures/` (demo at `/learn/demo/exercise/`).
  Types come from `@/types/api` (contract v2.1); `ProfileSnapshot` is derived from `ResultResponse` in `fixtures/exercises.ts`.
- Planned: `DashboardPerfil.vue`, `RuletaLenguajes.vue`.
- Data comes from `src/pages/api/` endpoints; request/response shapes live in `src/types/`.
- **Never import from `src/lib/server/`** — that code must not reach the client bundle.
- Components shared with the documentation go in `components/shared/`, not here.

See `docs/architecture/project-structure.md`.

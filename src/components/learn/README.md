# components/learn

Components of the learning area (DaviLearn):

- **Interactive parts** are **Vue 3 islands** (`.vue`, Composition API) hydrated with `client:*` directives.
- **Static page sections** (e.g. `LearnHome.astro`) are plain Astro components that wrap
  `layouts/learn/LearnLayout.astro` and are rendered by the routes in `pages/learn/` and `pages/[lang]/learn/`.

- Owner: UI Frontend Designer.
- Planned: `DashboardPerfil.vue`, `RuletaLenguajes.vue`, `InterfazEjercicio.vue`.
- Data comes from `src/pages/api/` endpoints; request/response shapes live in `src/types/`.
- **Never import from `src/lib/server/`** — that code must not reach the client bundle.
- Components shared with the documentation go in `components/shared/`, not here.

See `docs/architecture/project-structure.md`.

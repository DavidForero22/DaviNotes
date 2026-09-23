# components/learn

Interactive components of the learning area (DaviLearn), written as **Vue 3 islands**
(`.vue`, Composition API) and hydrated with `client:*` directives.

- Owner: UI Frontend Designer.
- Planned: `DashboardPerfil.vue`, `RuletaLenguajes.vue`, `InterfazEjercicio.vue`.
- Data comes from `src/pages/api/` endpoints; request/response shapes live in `src/types/`.
- **Never import from `src/lib/server/`** — that code must not reach the client bundle.
- Components shared with the documentation go in `components/shared/`, not here.

See `docs/architecture/project-structure.md`.

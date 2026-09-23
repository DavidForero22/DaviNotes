# pages/api

HTTP endpoints of DaviLearn (JSON). This file starts with `_` so Astro does not
publish it as a page.

- Owner: Backend Architect.
- Endpoints are server-rendered (`export const prerender = false`); the documentation stays static.
- Routes are not localized: `/api/*` has no language prefix and no `hreflang` alternates.
- Planned layout, one folder per resource:

```
api/
├─ auth/        register.ts, login.ts, logout.ts, session.ts
└─ exercises/   index.ts, [id]/result.ts, [id]/hints.ts
```

- Handlers stay thin: they validate input, call `@/lib/server/*` and return the DTOs
  defined in `@/types/api`.

See `docs/architecture/project-structure.md`.

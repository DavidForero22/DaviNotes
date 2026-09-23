# types

Types shared by the frontend (Vue islands) and the backend (`pages/api/`).

- Owner: Backend Architect.
- `api.ts`: request/response DTOs of every endpoint. The UI imports them from `@/types/api`.
- `database.ts`: **generated** with `supabase gen types typescript --local`. Do not edit by hand.
- Type-only code: nothing here may import from `@/lib/server`.

See `docs/architecture/project-structure.md`.

# lib/server

Server-only code: the Supabase client (cookie-based session) and the services used by
`pages/api/` and server-rendered pages.

- Owner: Backend Architect.
- **Never import from `components/` or any `.vue` file.** Keeping this code out of the client
  bundle keeps the SDK and secrets on the server.
- `supabase.ts`: client factory (cookie-based session, typed with `@/types/database`).
- `http.ts`: JSON and `ApiError` responses.
- `exercises.ts`: exercise queries and mapping to `ExerciseDTO`.
- Planned (Fase C): progress and hints services on top of the RPC `submit_result` / `unlock_hint`.

See `docs/architecture/project-structure.md`.

# lib/server

Server-only code: the Supabase client (cookie-based session) and the services used by
`pages/api/` and server-rendered pages.

- Owner: Backend Architect.
- **Never import from `components/` or any `.vue` file.** Keeping this code out of the client
  bundle keeps the SDK and secrets on the server.
- Planned: `supabase.ts` (client factory), `services/` (exercises, progress, hints).

See `docs/architecture/project-structure.md`.

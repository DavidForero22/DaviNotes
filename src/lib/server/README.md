# lib/server

Server-only code: the Supabase client (cookie-based session) and the services used by
`pages/api/` and server-rendered pages.

- Owner: Backend Architect.
- **Never import from `components/` or any `.vue` file.** Keeping this code out of the client
  bundle keeps the SDK and secrets on the server.
- `supabase.ts`: client factory (cookie-based session, typed with `@/types/database`). The middleware
  creates one per SSR request: use `Astro.locals.supabase`.
- `http.ts`: JSON, `ApiError` and redirect responses; body readers (form or JSON); `isUuid`.
- `auth.ts`: session (`loadSessionUser`), guards (`requireUser`, `redirectIfSignedIn`, `requireApiUser`),
  safe `next`, auth error codes and the flash cookie of the forms (`consumeAuthFlash`). Used by `.astro` pages
  and `pages/api`, never by `.vue` files.
- `exercises.ts`: exercise queries and mapping to `ExerciseDTO`.
- `progress.ts`: `submitResult`, `unlockHint` (RPC, `RpcError` with the HTTP status of `PTxxx`) and `getProfile`.

See `docs/architecture/project-structure.md`.

C8 (admin panel):
- `supabase-admin.ts`: service-role client (`getServiceClient`) and `serverEnv`. Never import it from the browser.
- `admin-common.ts`: `AdminError`, `adminResponse`, query parsers shared by `/api/admin/**`.
- `users.ts`, `admin-exercises.ts`: user and exercise CRUD (permission rules in `@/lib/admin-rules`).
- `bootstrap.ts`: `ensureSuperAdmin()`, called once from the middleware.
- Guards in `auth.ts`: `requireAdmin` (pages), `requireApiAdmin` (API).

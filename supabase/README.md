# supabase

Database of DaviLearn, managed with the Supabase CLI (devDependency: always `npx supabase`).
Development runs against a **local** Supabase stack (Docker); there is no remote project yet.

- Owner: Backend Architect.
- `config.toml`: local stack (project id `davilearn`). Email sign-up without confirmation (D3).
- `migrations/`: versioned SQL (schema + Row Level Security + RPC). One file per change, created
  with `npx supabase migration new <name>`. Never edit a migration that was already merged.
- `seed.sql`: exercise categories only (local; never run in production). **No exercises** (D4).
- `tests/`: pgTAP tests of the progression rules and of RLS (`npx supabase test db`).
- `exercises/`: template and instructions for the user's exercise insertion scripts.

Schema summary (`migrations/20260923120000_initial_schema.sql`):

| Table | Client access (RLS) |
|-------|---------------------|
| `profiles` (coins, level, xp) | read own; update only `display_name` (T11) |
| `exercise_categories` + `_translations`, `exercises` + `exercise_translations`, `hints`, `achievements` + `_translations` | public read |
| `hint_translations` | read only the hints the user unlocked |
| `exercise_answers` | none (the answer never leaves the database) |
| `attempts`, `hint_unlocks`, `user_achievements` | read own; written only by the RPC |

RPC (`security definer`, only for `authenticated`): `submit_result(p_exercise_id, p_correct)` and
`unlock_hint(p_hint_id)`. Rules in `docs/architecture/roadmap.md` §4; errors in `docs/architecture/api.md`.

Local workflow:

```sh
npx supabase start          # starts Postgres, Auth and Studio (http://127.0.0.1:54323)
npx supabase status         # prints the API URL and anon key for .env
npx supabase db reset       # re-applies migrations + seed.sql (deletes every exercise)
npx supabase test db        # runs supabase/tests/*.sql
npx supabase gen types typescript --local > src/types/database.ts   # after every migration
```

See `docs/architecture/project-structure.md`.

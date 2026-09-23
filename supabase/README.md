# supabase

Database of DaviLearn, managed with the Supabase CLI. Development runs against a **local**
Supabase stack; there is no remote project yet.

- Owner: Backend Architect.
- `migrations/`: versioned SQL (schema + Row Level Security). One file per change,
  named by the CLI (`supabase migration new <name>`). Never edit a migration that was already applied.
- `seed.sql`: sample data loaded by `supabase db reset` (local only).
- `config.toml` will be created by `supabase init` when the SSR phase starts.

Local workflow (SSR phase):

```sh
supabase start      # starts Postgres, Auth and Studio locally
supabase status     # prints the local API URL and anon key for .env
supabase db reset   # re-applies migrations + seed.sql
```

See `docs/architecture/project-structure.md`.

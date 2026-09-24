# supabase/exercises

Insertion scripts for the exercises of DaviLearn. **You write them** (decision D4): the
`exercises` table starts empty and neither the migrations nor `seed.sql` add exercises.

- Owner of the format: Backend Architect. Owner of the content: the user.
- `_template.sql`: annotated template of one exercise (texts in en/es/fr, answer and hints)
  inside a single transaction. It contains no real data and fails on purpose if run as is.

## Workflow

1. Copy `_template.sql` to a new file, one per topic, e.g. `java-oop.sql`.
2. Replace every `<placeholder>`. Check the rules at the top of the template
   (slug, category, type, difficulty 1-10, the three locales).
3. Make sure the local stack is running (`npx supabase start`) and run the file:

   ```sh
   # Git Bash
   docker exec -i supabase_db_davilearn psql -U postgres -v ON_ERROR_STOP=1 < supabase/exercises/java-oop.sql
   ```

   ```powershell
   # PowerShell
   Get-Content supabase/exercises/java-oop.sql -Raw | docker exec -i supabase_db_davilearn psql -U postgres -v ON_ERROR_STOP=1
   ```

   Or paste it in the SQL editor of Supabase Studio (<http://127.0.0.1:54323>).
4. Check the result: `GET http://localhost:4321/api/exercises?language=java&locale=es`
   (with `npm run dev`).

If a statement fails, the transaction is rolled back and nothing is inserted: fix the file
and run it again. Running a file twice fails on the unique `slug` (nothing is duplicated).

`npx supabase db reset` **deletes every exercise** (it rebuilds the database from the migrations
and `seed.sql`). Run your scripts again after a reset.

## Where each piece of data goes

| Data | Table | Notes |
|------|-------|-------|
| slug, language, framework, concept, category, type, difficulty | `exercises` | Language/concept slugs must exist in `src/data/` (T4); `npm run check:content` will validate them in Fase C |
| title, context, objective, prompt, code, options | `exercise_translations` | One row per locale (`en`, `es`, `fr`). `options` only for `multiple_choice`, same order in every locale |
| correct answer | `exercise_answers` | `correct_option` (0-based index) or `accepted_answers`. Never sent to the browser |
| hints | `hints` + `hint_translations` | `position` 1, 2, 3...; each costs 1 coin; the text is visible only after unlocking it |

Categories (`exercise_categories`) are fixed in `seed.sql`; ask Backend and i18n to add new ones.
Changing an exercise already completed by users: update its texts freely, but do not change
its `difficulty` (the rewards already given are not recalculated) or its `slug`.

In production the same scripts are run against the remote database (see
`docs/architecture/produccion.md`).

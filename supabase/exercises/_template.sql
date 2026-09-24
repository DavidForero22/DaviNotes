-- =====================================================================================
-- TEMPLATE · one exercise with its texts in en/es/fr, its answer and its hints.
--
-- Copy this file (e.g. `java-oop-constructors.sql`), replace every <placeholder> and run
-- it (see README.md). Everything happens in ONE transaction: if any statement fails,
-- nothing is inserted. As it is, the template fails on purpose (the slug check rejects
-- "<exercise-slug>"), so running it by mistake inserts nothing.
--
-- Rules the database enforces:
--   · slug: lowercase words separated by hyphens, unique among all exercises.
--   · category: one of the slugs in exercise_categories (see seed.sql).
--   · type: 'multiple_choice' | 'fill_blank' | 'code_output'.
--   · difficulty: integer 1-10. Reward on the first completion: 1-3 → 1 coin,
--     4-6 → 2 coins, 7-10 → 3 coins; XP = difficulty × 10 (roadmap §4).
--   · locale: 'en' | 'es' | 'fr'. The API only lists an exercise in the locales that
--     have a row in exercise_translations: write the three.
-- =====================================================================================

begin;

-- 1) The exercise (locale-independent data). ------------------------------------------
insert into public.exercises (slug, language_slug, framework_slug, concept_slug, category, type, difficulty)
values (
	'<exercise-slug>',        -- e.g. 'java-oop-constructor-chaining'
	'<language-slug>',        -- slug of src/data/languages.ts, e.g. 'java'
	null,                     -- framework slug of src/data/frameworks.ts, e.g. 'laravel', or null
	'<concept-slug>',         -- lesson slug, e.g. 'oop', or null if it is not tied to a lesson
	'<category-slug>',        -- e.g. 'syntax', 'debugging'
	'multiple_choice',        -- or 'fill_blank' / 'code_output'
	5                         -- 1-10
);

-- 2) Texts per locale. ----------------------------------------------------------------
--    context: optional thematic framing ("You work at a bank..."), or null.
--    code:    optional snippet shown with the prompt, or null. Dollar quotes ($c$ ... $c$)
--             avoid escaping quotes inside code.
--    options: only for multiple_choice, SAME ORDER in every locale; null otherwise.
insert into public.exercise_translations (exercise_id, locale, title, context, objective, prompt, code, options)
select e.id, t.locale::public.locale, t.title, t.context, t.objective, t.prompt, t.code, t.options
from public.exercises e
cross join (values
	('en', '<Title>',  '<Context or null>', '<Technical objective>', '<Prompt>',  $c$<code or null>$c$, array['<option A>', '<option B>', '<option C>']),
	('es', '<Título>', '<Contexto o null>', '<Objetivo técnico>',   '<Enunciado>', $c$<code or null>$c$, array['<opción A>', '<opción B>', '<opción C>']),
	('fr', '<Titre>',  '<Contexte ou null>', '<Objectif technique>', '<Énoncé>',   $c$<code or null>$c$, array['<option A>', '<option B>', '<option C>'])
) as t (locale, title, context, objective, prompt, code, options)
where e.slug = '<exercise-slug>';

-- 3) The correct answer. It is never sent to the browser (RLS without policies). -------
--    multiple_choice → correct_option = 0-based index into `options`.
--    fill_blank / code_output → accepted_answers = every accepted answer.
insert into public.exercise_answers (exercise_id, correct_option, accepted_answers)
select e.id, 1, null            -- or: null, array['<answer>', '<alternative answer>']
from public.exercises e
where e.slug = '<exercise-slug>';

-- 4) Hints (optional; every hint costs 1 coin). position = display order 1, 2, 3... ----
insert into public.hints (exercise_id, position)
select e.id, p.position
from public.exercises e
cross join (values (1), (2)) as p (position)
where e.slug = '<exercise-slug>';

insert into public.hint_translations (hint_id, locale, text)
select h.id, t.locale::public.locale, t.text
from public.hints h
join public.exercises e on e.id = h.exercise_id
join (values
	(1, 'en', '<First hint>'),
	(1, 'es', '<Primera pista>'),
	(1, 'fr', '<Premier indice>'),
	(2, 'en', '<Second hint>'),
	(2, 'es', '<Segunda pista>'),
	(2, 'fr', '<Deuxième indice>')
) as t (position, locale, text) on t.position = h.position
where e.slug = '<exercise-slug>';

commit;

-- To add more exercises in the same file, repeat blocks 1-4 inside the same
-- begin/commit with another slug.

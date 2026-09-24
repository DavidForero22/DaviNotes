-- =====================================================================================
-- DEV SAMPLE · fictitious exercises for LOCAL DEVELOPMENT ONLY (Fase C, task C2).
--
-- They exist so the UI can test the real flow (exercise page, result, hints, coins).
-- They are NOT learning content (D4: the user writes the real exercises) and they must
-- NEVER be loaded into production. Not part of seed.sql: `npx supabase db reset` removes
-- them; load them again afterwards (see README.md).
--
-- Idempotent: it deletes the previous sample (slugs `dev-sample-*`, with their attempts
-- and unlocked hints, by cascade) and inserts it again with the same fixed ids.
--
-- Exercise ids (stable, for URLs such as /learn/exercise/<id>):
--   de000000-0000-4000-8000-000000000001  dev-sample-1  multiple_choice  difficulty 2  (1 coin, 20 XP)  2 hints
--   de000000-0000-4000-8000-000000000002  dev-sample-2  fill_blank       difficulty 5  (2 coins, 50 XP) 1 hint
--   de000000-0000-4000-8000-000000000003  dev-sample-3  code_output      difficulty 8  (3 coins, 80 XP) 0 hints
-- Hint ids: de000000-0000-4000-8000-0000000001<exercise><position>, e.g. ...000000000111.
-- =====================================================================================

begin;

delete from public.exercises where slug like 'dev-sample-%';

insert into public.exercises (id, slug, language_slug, framework_slug, concept_slug, category, type, difficulty) values
	('de000000-0000-4000-8000-000000000001', 'dev-sample-1', 'java',   null, null, 'syntax',       'multiple_choice', 2),
	('de000000-0000-4000-8000-000000000002', 'dev-sample-2', 'python', null, null, 'debugging',    'fill_blank',      5),
	('de000000-0000-4000-8000-000000000003', 'dev-sample-3', 'php',    null, null, 'control-flow', 'code_output',     8);

insert into public.exercise_translations (exercise_id, locale, title, context, objective, prompt, code, options) values
	-- 1 · multiple_choice (options in the same order in every locale)
	('de000000-0000-4000-8000-000000000001', 'en', 'Test exercise 1', 'Sample data for development.',
		'Check the multiple choice flow.', 'Test question: choose option A.', null,
		array['Option A', 'Option B', 'Option C']),
	('de000000-0000-4000-8000-000000000001', 'es', 'Ejercicio de prueba 1', 'Datos de prueba para desarrollo.',
		'Probar el flujo de opción múltiple.', 'Pregunta de prueba: elige la opción A.', null,
		array['Opción A', 'Opción B', 'Opción C']),
	('de000000-0000-4000-8000-000000000001', 'fr', 'Exercice de test 1', 'Données de test pour le développement.',
		'Tester le flux à choix multiple.', 'Question de test : choisis l''option A.', null,
		array['Option A', 'Option B', 'Option C']),
	-- 2 · fill_blank, with a code block
	('de000000-0000-4000-8000-000000000002', 'en', 'Test exercise 2', null,
		'Check the fill in the blank flow.', 'Test question: write "test" in the blank.',
		$c$value = "____"  # sample code$c$, null),
	('de000000-0000-4000-8000-000000000002', 'es', 'Ejercicio de prueba 2', null,
		'Probar el flujo de completar el hueco.', 'Pregunta de prueba: escribe "test" en el hueco.',
		$c$value = "____"  # sample code$c$, null),
	('de000000-0000-4000-8000-000000000002', 'fr', 'Exercice de test 2', null,
		'Tester le flux de texte à trous.', 'Question de test : écris « test » dans le trou.',
		$c$value = "____"  # sample code$c$, null),
	-- 3 · code_output, only in English and Spanish: /fr falls back to English (locale "en")
	('de000000-0000-4000-8000-000000000003', 'en', 'Test exercise 3', 'Sample data for development.',
		'Check the code output flow.', 'Test question: what does this sample print?',
		$c$<?php echo "test"; // sample code$c$, null),
	('de000000-0000-4000-8000-000000000003', 'es', 'Ejercicio de prueba 3', 'Datos de prueba para desarrollo.',
		'Probar el flujo de salida de código.', 'Pregunta de prueba: ¿qué imprime este ejemplo?',
		$c$<?php echo "test"; // sample code$c$, null);

-- Answers are never sent to the browser. With D6 the UI decides; they are here for completeness.
insert into public.exercise_answers (exercise_id, correct_option, accepted_answers) values
	('de000000-0000-4000-8000-000000000001', 0, null),
	('de000000-0000-4000-8000-000000000002', null, array['test']),
	('de000000-0000-4000-8000-000000000003', null, array['test']);

insert into public.hints (id, exercise_id, position) values
	('de000000-0000-4000-8000-000000000111', 'de000000-0000-4000-8000-000000000001', 1),
	('de000000-0000-4000-8000-000000000112', 'de000000-0000-4000-8000-000000000001', 2),
	('de000000-0000-4000-8000-000000000121', 'de000000-0000-4000-8000-000000000002', 1);

insert into public.hint_translations (hint_id, locale, text) values
	('de000000-0000-4000-8000-000000000111', 'en', 'Test hint 1 of exercise 1.'),
	('de000000-0000-4000-8000-000000000111', 'es', 'Pista de prueba 1 del ejercicio 1.'),
	('de000000-0000-4000-8000-000000000111', 'fr', 'Indice de test 1 de l''exercice 1.'),
	('de000000-0000-4000-8000-000000000112', 'en', 'Test hint 2 of exercise 1.'),
	('de000000-0000-4000-8000-000000000112', 'es', 'Pista de prueba 2 del ejercicio 1.'),
	('de000000-0000-4000-8000-000000000112', 'fr', 'Indice de test 2 de l''exercice 1.'),
	('de000000-0000-4000-8000-000000000121', 'en', 'Test hint 1 of exercise 2.'),
	('de000000-0000-4000-8000-000000000121', 'es', 'Pista de prueba 1 del ejercicio 2.'),
	('de000000-0000-4000-8000-000000000121', 'fr', 'Indice de test 1 de l''exercice 2.');

commit;

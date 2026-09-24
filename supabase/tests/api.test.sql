-- pgTAP tests of the queries the Fase C endpoints rely on (docs/architecture/api.md):
-- hint membership check, hint text fallback, profile stats and the public exercise read.
-- Run with: npx supabase test db   (everything is rolled back at the end)
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(12);

-- ---------------------------------------------------------------- fixtures (as postgres)
insert into auth.users (id, email) values
	('00000000-0000-0000-0000-0000000000c1', 'c1@test.local'),
	('00000000-0000-0000-0000-0000000000c2', 'c2@test.local');

insert into exercise_categories (slug) values ('api-test');
insert into exercises (id, slug, language_slug, category, type, difficulty) values
	('30000000-0000-0000-0000-000000000001', 'api-test-1', 'java', 'api-test', 'multiple_choice', 1),
	('30000000-0000-0000-0000-000000000002', 'api-test-2', 'java', 'api-test', 'fill_blank', 4);
insert into exercise_translations (exercise_id, locale, title, objective, prompt, options) values
	('30000000-0000-0000-0000-000000000001', 'en', 'T1', 'O1', 'P1', array['a', 'b']),
	('30000000-0000-0000-0000-000000000002', 'en', 'T2', 'O2', 'P2', null);
insert into hints (id, exercise_id, position) values
	('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 1),
	('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 1);
-- Hint 1 only in English and Spanish: French falls back to English in the API.
insert into hint_translations (hint_id, locale, text) values
	('40000000-0000-0000-0000-000000000001', 'en', 'Hint EN'),
	('40000000-0000-0000-0000-000000000001', 'es', 'Pista ES'),
	('40000000-0000-0000-0000-000000000002', 'en', 'Other hint');

-- ---------------------------------------------------------------- anon: GET /api/exercises/[id]
set local role anon;
select is(
	(select count(*) from exercises e join exercise_translations t on t.exercise_id = e.id
	 where e.id = '30000000-0000-0000-0000-000000000001' and t.locale = 'en'),
	1::bigint, 'anon reads one exercise with its text'
);
select is(
	(select count(*) from exercise_translations where exercise_id = '30000000-0000-0000-0000-000000000001' and locale = 'fr'),
	0::bigint, 'no French text: the API falls back to English'
);
reset role;

-- ---------------------------------------------------------------- c1 signed in
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000c1","role":"authenticated"}';

-- POST /api/exercises/[id]/hints checks membership with this query before unlock_hint.
select is(
	(select count(*) from hints where id = '40000000-0000-0000-0000-000000000002'
	 and exercise_id = '30000000-0000-0000-0000-000000000001'),
	0::bigint, 'membership check: a hint of another exercise is not found'
);
select is(
	(select count(*) from hints where id = '40000000-0000-0000-0000-000000000001'
	 and exercise_id = '30000000-0000-0000-0000-000000000001'),
	1::bigint, 'membership check: the hint of the exercise is found'
);
-- unlock_hint alone does not know the exercise: that is why the endpoint checks first.
select throws_ok(
	$$ select * from unlock_hint('40000000-0000-0000-0000-000000000002') $$,
	'PT402', null, 'unlock_hint without coins: 402 (the endpoint maps it to insufficient_coins)'
);

-- Earn 1 coin, then unlock hint 1.
select results_eq(
	$$ select coins_awarded, coins from submit_result('30000000-0000-0000-0000-000000000001', true) $$,
	$$ values (1, 1) $$, 'difficulty 1 gives 1 coin'
);
select results_eq(
	$$ select exercise_id, coins_spent, coins from unlock_hint('40000000-0000-0000-0000-000000000001') $$,
	$$ values ('30000000-0000-0000-0000-000000000001'::uuid, 1, 0) $$, 'unlock_hint returns the exercise of the hint'
);
select results_eq(
	$$ select locale::text, text from hint_translations where hint_id = '40000000-0000-0000-0000-000000000001'
	   and locale in ('fr', 'en') order by locale $$,
	$$ values ('en', 'Hint EN') $$, 'after unlocking, the English text is readable for the fallback'
);
select is(
	(select count(*) from hint_translations where hint_id = '40000000-0000-0000-0000-000000000002'),
	0::bigint, 'the text of a locked hint stays hidden'
);

-- GET /api/profile stats.
select * from submit_result('30000000-0000-0000-0000-000000000002', false);
select results_eq(
	$$ select (select count(*) from attempts where user_id = '00000000-0000-0000-0000-0000000000c1'),
	          (select count(*) from attempts where user_id = '00000000-0000-0000-0000-0000000000c1' and first_completion) $$,
	$$ values (2::bigint, 1::bigint) $$, 'profile stats: 2 attempts, 1 exercise completed'
);
reset role;

-- ---------------------------------------------------------------- c2 signed in
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000c2","role":"authenticated"}';
select is(
	(select count(*) from attempts where user_id = '00000000-0000-0000-0000-0000000000c1'),
	0::bigint, 'profile stats: another user''s attempts are not counted'
);
select is(
	(select count(*) from profiles where id = '00000000-0000-0000-0000-0000000000c1'),
	0::bigint, 'a user cannot read another profile'
);
reset role;

select * from finish();
rollback;

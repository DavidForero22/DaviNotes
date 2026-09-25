-- pgTAP tests of C7 (T16): user_languages (CHECK, RLS, privileges), set_user_languages and
-- the query of pickExercise (exercises of a language + the user's first completions).
-- Run with: npx supabase test db   (everything is rolled back at the end)
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(18);

-- ---------------------------------------------------------------- fixtures (as postgres)
insert into auth.users (id, email) values
	('00000000-0000-0000-0000-0000000000d1', 'd1@test.local'),
	('00000000-0000-0000-0000-0000000000d2', 'd2@test.local');

insert into exercise_categories (slug) values ('c7-test');
insert into exercises (id, slug, language_slug, category, type, difficulty) values
	('50000000-0000-0000-0000-000000000001', 'c7-test-1', 'astro', 'c7-test', 'multiple_choice', 1),
	('50000000-0000-0000-0000-000000000002', 'c7-test-2', 'astro', 'c7-test', 'fill_blank', 2);
insert into exercise_translations (exercise_id, locale, title, objective, prompt, options) values
	('50000000-0000-0000-0000-000000000001', 'en', 'T1', 'O1', 'P1', array['a', 'b']),
	('50000000-0000-0000-0000-000000000002', 'es', 'T2', 'O2', 'P2', null);

-- ---------------------------------------------------------------- structure
select has_table('public', 'user_languages', 'user_languages exists');
select col_is_pk('public', 'user_languages', array['user_id', 'language_slug'], 'PK (user_id, language_slug)');
select throws_ok(
	$$ insert into user_languages (user_id, language_slug) values ('00000000-0000-0000-0000-0000000000d1', 'cobol') $$,
	'23514', null, 'CHECK: only the 6 selectable languages'
);

-- ---------------------------------------------------------------- anon
set local role anon;
select throws_ok($$ select * from user_languages $$, '42501', null, 'anon cannot read user_languages');
select throws_ok($$ select set_user_languages(array['java']) $$, '42501', null, 'anon cannot call set_user_languages');
reset role;

-- ---------------------------------------------------------------- d1 signed in
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000d1","role":"authenticated"}';

select results_eq(
	$$ select * from set_user_languages(array['python', 'java', 'java']) $$,
	$$ values ('java'), ('python') $$, 'set_user_languages ignores duplicates and returns the set'
);
select results_eq(
	$$ select * from set_user_languages(array['astro', 'java']) $$,
	$$ values ('astro'), ('java') $$, 'set_user_languages replaces the set (python removed)'
);
select throws_ok(
	$$ select set_user_languages(array['astro', 'cobol']) $$,
	'23514', null, 'an unknown slug fails the CHECK'
);
select results_eq(
	$$ select language_slug from user_languages order by 1 $$,
	$$ values ('astro'), ('java') $$, 'after a failed call the set is unchanged'
);
select lives_ok(
	$$ insert into user_languages (user_id, language_slug) values ('00000000-0000-0000-0000-0000000000d1', 'html') $$,
	'the owner can insert a language'
);
select lives_ok(
	$$ delete from user_languages where language_slug = 'html' $$,
	'the owner can delete a language'
);
select throws_ok(
	$$ update user_languages set language_slug = 'php' where language_slug = 'java' $$,
	'42501', null, 'no update privilege'
);
select throws_ok(
	$$ insert into user_languages (user_id, language_slug) values ('00000000-0000-0000-0000-0000000000d2', 'php') $$,
	'42501', null, 'cannot insert languages for another user (RLS)'
);

-- pickExercise: exercises of the language readable in es (or the en fallback), with the
-- user's first completions.
select * from submit_result('50000000-0000-0000-0000-000000000001', true);
select results_eq(
	$$ select e.id, (select count(*) from attempts a where a.exercise_id = e.id and a.first_completion)
	   from exercises e
	   where e.language_slug = 'astro'
	     and exists (select 1 from exercise_translations t where t.exercise_id = e.id and t.locale in ('es', 'en'))
	   order by e.id $$,
	$$ values ('50000000-0000-0000-0000-000000000001'::uuid, 1::bigint),
	          ('50000000-0000-0000-0000-000000000002'::uuid, 0::bigint) $$,
	'pickExercise query: both exercises, the first one completed'
);
select is(
	(select count(*) from exercises e
	 where e.language_slug = 'astro'
	   and exists (select 1 from exercise_translations t where t.exercise_id = e.id and t.locale in ('fr', 'en'))),
	1::bigint, 'pickExercise query: in fr only the exercise with the en fallback'
);
select results_eq(
	$$ select * from set_user_languages(array[]::text[]) $$,
	$$ select null::text where false $$, 'an empty array clears the set'
);
reset role;

-- ---------------------------------------------------------------- d2 signed in
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000d2","role":"authenticated"}';
select is(
	(select count(*) from user_languages where user_id = '00000000-0000-0000-0000-0000000000d1'),
	0::bigint, 'a user cannot read another user''s languages'
);
reset role;

-- d1's rows as postgres: d2 could not delete them.
insert into user_languages (user_id, language_slug) values ('00000000-0000-0000-0000-0000000000d1', 'react');
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000d2","role":"authenticated"}';
delete from user_languages where user_id = '00000000-0000-0000-0000-0000000000d1';
reset role;
select is(
	(select count(*) from user_languages where user_id = '00000000-0000-0000-0000-0000000000d1'),
	1::bigint, 'a user cannot delete another user''s languages'
);

select * from finish();
rollback;

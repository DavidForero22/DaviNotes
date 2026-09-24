-- pgTAP tests of the progression rules (roadmap §4) and of T11.
-- Run with: npx supabase test db   (everything is rolled back at the end)
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(36);

-- ---------------------------------------------------------------- fixtures (as postgres)
insert into auth.users (id, email, raw_user_meta_data) values
	('00000000-0000-0000-0000-00000000000a', 'a@test.local', '{"display_name":"Ana"}'),
	('00000000-0000-0000-0000-00000000000b', 'b@test.local', '{}');

insert into exercise_categories (slug) values ('test-category');
insert into exercises (id, slug, language_slug, category, type, difficulty) values
	('10000000-0000-0000-0000-000000000002', 'test-d2', 'java', 'test-category', 'multiple_choice', 2),
	('10000000-0000-0000-0000-000000000005', 'test-d5', 'java', 'test-category', 'fill_blank', 5),
	('10000000-0000-0000-0000-000000000010', 'test-d10', 'java', 'test-category', 'code_output', 10);
insert into hints (id, exercise_id, position) values
	('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 1),
	('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 2);
insert into hint_translations (hint_id, locale, text) values
	('20000000-0000-0000-0000-000000000001', 'en', 'Hint one'),
	('20000000-0000-0000-0000-000000000002', 'en', 'Hint two');
insert into exercise_answers (exercise_id, accepted_answers) values
	('10000000-0000-0000-0000-000000000005', '{secret}');

-- ---------------------------------------------------------------- sign-up trigger
select results_eq(
	$$ select coins, level, xp, display_name from profiles where id = '00000000-0000-0000-0000-00000000000a' $$,
	$$ values (0, 1, 0, 'Ana'::text) $$,
	'sign-up creates the profile with 0 coins, level 1, 0 XP'
);
select is((select display_name from profiles where id = '00000000-0000-0000-0000-00000000000b'), null,
	'display_name is optional');

-- ---------------------------------------------------------------- pure rules
select is(private.reward_coins(1::smallint), 1::smallint, 'difficulty 1 -> 1 coin');
select is(private.reward_coins(3::smallint), 1::smallint, 'difficulty 3 -> 1 coin');
select is(private.reward_coins(4::smallint), 2::smallint, 'difficulty 4 -> 2 coins');
select is(private.reward_coins(6::smallint), 2::smallint, 'difficulty 6 -> 2 coins');
select is(private.reward_coins(7::smallint), 3::smallint, 'difficulty 7 -> 3 coins');
select is(private.reward_coins(10::smallint), 3::smallint, 'difficulty 10 -> 3 coins');
select is(private.reward_xp(7::smallint), 70, 'XP = difficulty x 10');
select results_eq($$ select * from private.apply_xp(1, 0, 99) $$, $$ values (1, 99) $$, 'below the threshold: no level-up');
select results_eq($$ select * from private.apply_xp(1, 50, 50) $$, $$ values (2, 0) $$, 'exact threshold: level-up with 0 XP left');
select results_eq($$ select * from private.apply_xp(1, 0, 350) $$, $$ values (3, 50) $$, 'several level-ups (100 + 200) with carry-over');
select throws_ok(
	$$ insert into exercises (slug, language_slug, category, type, difficulty) values ('bad', 'java', 'test-category', 'fill_blank', 11) $$,
	'23514', null, 'difficulty must be between 1 and 10 (T5)'
);

-- ---------------------------------------------------------------- anon
set local role anon;
select throws_ok(
	$$ select * from submit_result('10000000-0000-0000-0000-000000000005', true) $$,
	'42501', null, 'anon cannot call submit_result'
);
select is((select count(*) from hint_translations), 0::bigint, 'anon cannot read hint texts');
select throws_ok($$ select * from exercise_answers $$, '42501', null, 'anon cannot read the answers');
reset role;

-- ---------------------------------------------------------------- user A
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';

select throws_ok(
	$$ select * from unlock_hint('20000000-0000-0000-0000-000000000001') $$,
	'PT402', 'insufficient_coins', 'a hint cannot be unlocked with 0 coins'
);

select results_eq(
	$$ select correct, first_completion, coins_awarded, xp_awarded, coins, xp, level
	   from submit_result('10000000-0000-0000-0000-000000000005', false) $$,
	$$ values (false, false, 0, 0, 0, 0, 1) $$,
	'"not solved" awards nothing'
);

select results_eq(
	$$ select first_completion, coins_awarded, xp_awarded, coins, xp, level, xp_to_next_level, new_achievements
	   from submit_result('10000000-0000-0000-0000-000000000005', true) $$,
	$$ values (true, 2, 50, 2, 50, 1, 50, '{}'::text[]) $$,
	'first completion of a difficulty-5 exercise: 2 coins and 50 XP'
);

select results_eq(
	$$ select first_completion, coins_awarded, xp_awarded, coins, xp, level
	   from submit_result('10000000-0000-0000-0000-000000000005', true) $$,
	$$ values (false, 0, 0, 2, 50, 1) $$,
	'repeating a completed exercise awards 0 coins and 0 XP'
);

select results_eq(
	$$ select coins_awarded, xp_awarded, coins, xp, level, xp_to_next_level
	   from submit_result('10000000-0000-0000-0000-000000000010', true) $$,
	$$ values (3, 100, 5, 50, 2, 150) $$,
	'difficulty 10: 3 coins, 100 XP, level-up with carry-over (50 + 100 - 100)'
);

select results_eq(
	$$ select coins_awarded, xp_awarded, coins, xp, level
	   from submit_result('10000000-0000-0000-0000-000000000002', true) $$,
	$$ values (1, 20, 6, 70, 2) $$,
	'difficulty 2: 1 coin, 20 XP'
);

select results_eq(
	$$ select coins_spent, coins from unlock_hint('20000000-0000-0000-0000-000000000001') $$,
	$$ values (1, 5) $$,
	'unlocking a hint costs 1 coin'
);
select results_eq(
	$$ select coins_spent, coins from unlock_hint('20000000-0000-0000-0000-000000000001') $$,
	$$ values (0, 5) $$,
	'unlocking the same hint again is free'
);
select results_eq(
	$$ select text from hint_translations order by text $$,
	$$ values ('Hint one'::text) $$,
	'the user reads only the texts of the hints they unlocked'
);

select is((select count(*) from attempts), 5::bigint, 'every submission is recorded as an attempt');
select is((select count(*) from attempts where first_completion), 3::bigint, 'one rewarded completion per exercise');

select throws_ok(
	$$ select * from submit_result('99999999-0000-0000-0000-000000000000', true) $$,
	'PT404', 'exercise_not_found', 'unknown exercise -> PT404'
);
select throws_ok(
	$$ select * from unlock_hint('99999999-0000-0000-0000-000000000000') $$,
	'PT404', 'hint_not_found', 'unknown hint -> PT404'
);

-- T11: coins, XP and level are read-only for the client.
select throws_ok($$ update profiles set coins = 999 $$, '42501', null, 'the client cannot write coins');
select throws_ok($$ update profiles set level = 99, xp = 0 $$, '42501', null, 'the client cannot write level or XP');
select throws_ok(
	$$ insert into attempts (user_id, exercise_id, correct) values ('00000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-000000000002', true) $$,
	'42501', null, 'the client cannot insert attempts'
);
select lives_ok($$ update profiles set display_name = 'Ana B.' $$, 'the client can rename itself');
reset role;

-- ---------------------------------------------------------------- user B
-- Several level-ups inside the RPC (the carried XP comes from an artificial state).
update profiles set level = 1, xp = 250 where id = '00000000-0000-0000-0000-00000000000b';
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';

select is((select count(*) from attempts), 0::bigint, 'a user does not see the attempts of another user');
select results_eq(
	$$ select coins, xp, level, xp_to_next_level from submit_result('10000000-0000-0000-0000-000000000010', true) $$,
	$$ values (3, 50, 3, 250) $$,
	'submit_result chains several level-ups (250 + 100 -> level 3 with 50 XP)'
);
select is(
	(select count(*) from profiles where id = '00000000-0000-0000-0000-00000000000a'),
	0::bigint,
	'a user cannot read the profile of another user'
);
reset role;

select * from finish();
rollback;

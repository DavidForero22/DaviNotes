-- =====================================================================================
-- DaviLearn · initial schema (Fase B, task B1)
--
-- Progression rules: docs/architecture/roadmap.md §4 (closed, decision D2).
-- Coins, XP and level only change inside the security definer RPCs below (T11):
-- the client roles (anon, authenticated) have no write privilege on those columns.
-- The `exercises` table starts empty (D4): exercises are inserted by the user's own
-- script (see supabase/exercises/README.md).
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- Types
-- -------------------------------------------------------------------------------------

create type public.locale as enum ('en', 'es', 'fr');

create type public.exercise_type as enum ('multiple_choice', 'fill_blank', 'code_output');

-- Helpers that must not be exposed through the API live in `private`
-- (not listed in config.toml [api].schemas).
create schema if not exists private;
revoke all on schema private from public;

-- -------------------------------------------------------------------------------------
-- Profiles (one per auth user, created by trigger)
-- -------------------------------------------------------------------------------------

create table public.profiles (
	id uuid primary key references auth.users (id) on delete cascade,
	display_name text check (display_name is null or char_length(display_name) between 1 and 40),
	coins integer not null default 0 check (coins >= 0),
	level integer not null default 1 check (level >= 1),
	-- XP accumulated inside the current level: always 0 <= xp < level * 100.
	xp integer not null default 0 check (xp >= 0),
	created_at timestamptz not null default now()
);

comment on table public.profiles is
	'One row per user. coins/xp/level are written only by submit_result and unlock_hint (T11).';
comment on column public.profiles.xp is 'XP inside the current level (0 <= xp < level * 100).';

-- -------------------------------------------------------------------------------------
-- Catalog: categories, exercises, hints (public read, no client writes)
-- -------------------------------------------------------------------------------------

create table public.exercise_categories (
	slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	sort_order smallint not null default 0
);

create table public.exercise_category_translations (
	category_slug text not null references public.exercise_categories (slug) on delete cascade on update cascade,
	locale public.locale not null,
	name text not null check (char_length(name) > 0),
	primary key (category_slug, locale)
);

create table public.exercises (
	id uuid primary key default gen_random_uuid(),
	slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	-- Link to the documentation catalog (T4): slugs of src/data/languages.ts / frameworks.ts.
	language_slug text not null check (char_length(language_slug) > 0),
	framework_slug text check (framework_slug is null or char_length(framework_slug) > 0),
	concept_slug text check (concept_slug is null or char_length(concept_slug) > 0),
	category text not null references public.exercise_categories (slug) on update cascade,
	type public.exercise_type not null,
	-- T5: 1-10, independent from the 5 lesson levels.
	difficulty smallint not null check (difficulty between 1 and 10),
	created_at timestamptz not null default now()
);

create index exercises_language_concept_idx on public.exercises (language_slug, concept_slug);
create index exercises_category_idx on public.exercises (category);
create index exercises_difficulty_idx on public.exercises (difficulty);

create table public.exercise_translations (
	exercise_id uuid not null references public.exercises (id) on delete cascade,
	locale public.locale not null,
	title text not null check (char_length(title) > 0),
	context text,
	objective text not null check (char_length(objective) > 0),
	prompt text not null check (char_length(prompt) > 0),
	code text,
	-- Only for multiple_choice: the options in display order (same order in every locale).
	options text[] check (options is null or cardinality(options) >= 2),
	primary key (exercise_id, locale)
);

-- The correct answer never reaches the client: RLS is enabled on this table and it has
-- no policy, so only the database owner / service role can read it.
create table public.exercise_answers (
	exercise_id uuid primary key references public.exercises (id) on delete cascade,
	-- multiple_choice: 0-based index into exercise_translations.options.
	correct_option smallint check (correct_option is null or correct_option >= 0),
	-- fill_blank / code_output: accepted answers (compared after trimming).
	accepted_answers text[] check (accepted_answers is null or cardinality(accepted_answers) >= 1),
	check (correct_option is not null or accepted_answers is not null)
);

create table public.hints (
	id uuid primary key default gen_random_uuid(),
	exercise_id uuid not null references public.exercises (id) on delete cascade,
	-- Display order inside the exercise (1, 2, 3...). Every hint costs 1 coin (§4).
	position smallint not null check (position >= 1),
	unique (exercise_id, position)
);

create table public.hint_translations (
	hint_id uuid not null references public.hints (id) on delete cascade,
	locale public.locale not null,
	text text not null check (char_length(text) > 0),
	primary key (hint_id, locale)
);

-- -------------------------------------------------------------------------------------
-- Per-user progress (read own rows, written only by the RPCs)
-- -------------------------------------------------------------------------------------

create table public.attempts (
	id bigint generated always as identity primary key,
	user_id uuid not null references public.profiles (id) on delete cascade,
	exercise_id uuid not null references public.exercises (id) on delete cascade,
	correct boolean not null,
	-- True only for the attempt that completed the exercise for the first time.
	first_completion boolean not null default false,
	coins_awarded smallint not null default 0 check (coins_awarded >= 0),
	xp_awarded integer not null default 0 check (xp_awarded >= 0),
	created_at timestamptz not null default now(),
	check (not first_completion or correct)
);

create index attempts_user_exercise_idx on public.attempts (user_id, exercise_id);
-- At most one rewarded completion per user and exercise.
create unique index attempts_first_completion_uidx
	on public.attempts (user_id, exercise_id) where first_completion;

create table public.hint_unlocks (
	user_id uuid not null references public.profiles (id) on delete cascade,
	hint_id uuid not null references public.hints (id) on delete cascade,
	created_at timestamptz not null default now(),
	primary key (user_id, hint_id)
);

create index hint_unlocks_hint_idx on public.hint_unlocks (hint_id);

-- -------------------------------------------------------------------------------------
-- Achievements (catalog + unlocked per user). Award rules arrive in Fase C.
-- -------------------------------------------------------------------------------------

create table public.achievements (
	slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	-- Path of the icon under /public (alt text comes from the translation name).
	icon text,
	sort_order smallint not null default 0
);

create table public.achievement_translations (
	achievement_slug text not null references public.achievements (slug) on delete cascade on update cascade,
	locale public.locale not null,
	name text not null check (char_length(name) > 0),
	description text not null check (char_length(description) > 0),
	primary key (achievement_slug, locale)
);

create table public.user_achievements (
	user_id uuid not null references public.profiles (id) on delete cascade,
	achievement_slug text not null references public.achievements (slug) on delete cascade on update cascade,
	unlocked_at timestamptz not null default now(),
	primary key (user_id, achievement_slug)
);

-- -------------------------------------------------------------------------------------
-- Row Level Security
-- -------------------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.exercise_categories enable row level security;
alter table public.exercise_category_translations enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_translations enable row level security;
alter table public.exercise_answers enable row level security;
alter table public.hints enable row level security;
alter table public.hint_translations enable row level security;
alter table public.attempts enable row level security;
alter table public.hint_unlocks enable row level security;
alter table public.achievements enable row level security;
alter table public.achievement_translations enable row level security;
alter table public.user_achievements enable row level security;

-- Table privileges. Supabase grants everything to anon/authenticated by default; RLS
-- already blocks writes without a policy, but privileges are removed too (defence in depth).
revoke insert, update, delete, truncate on all tables in schema public from anon, authenticated;
revoke all on public.exercise_answers from anon, authenticated;
-- The only client write: a user may rename themselves. coins/xp/level stay read-only (T11).
grant update (display_name) on public.profiles to authenticated;

-- Catalog: readable by everyone.
create policy "Categories are public" on public.exercise_categories
	for select to anon, authenticated using (true);
create policy "Category names are public" on public.exercise_category_translations
	for select to anon, authenticated using (true);
create policy "Exercises are public" on public.exercises
	for select to anon, authenticated using (true);
create policy "Exercise texts are public" on public.exercise_translations
	for select to anon, authenticated using (true);
create policy "Hints are public (without text)" on public.hints
	for select to anon, authenticated using (true);
create policy "Achievements are public" on public.achievements
	for select to anon, authenticated using (true);
create policy "Achievement names are public" on public.achievement_translations
	for select to anon, authenticated using (true);
-- exercise_answers: no policy on purpose.

-- A hint text is visible only after the user unlocked it.
create policy "Unlocked hint texts are visible to their owner" on public.hint_translations
	for select to authenticated
	using (
		exists (
			select 1 from public.hint_unlocks hu
			where hu.hint_id = hint_translations.hint_id
				and hu.user_id = (select auth.uid())
		)
	);

-- Own rows only.
create policy "Users read their profile" on public.profiles
	for select to authenticated using (id = (select auth.uid()));
create policy "Users rename themselves" on public.profiles
	for update to authenticated
	using (id = (select auth.uid()))
	with check (id = (select auth.uid()));
create policy "Users read their attempts" on public.attempts
	for select to authenticated using (user_id = (select auth.uid()));
create policy "Users read their unlocked hints" on public.hint_unlocks
	for select to authenticated using (user_id = (select auth.uid()));
create policy "Users read their achievements" on public.user_achievements
	for select to authenticated using (user_id = (select auth.uid()));

-- -------------------------------------------------------------------------------------
-- Profile creation on sign-up
-- -------------------------------------------------------------------------------------

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
	-- coins 0, level 1, xp 0 come from the column defaults (§4).
	insert into public.profiles (id, display_name)
	values (
		new.id,
		nullif(left(trim(new.raw_user_meta_data ->> 'display_name'), 40), '')
	);
	return new;
end;
$$;

create trigger on_auth_user_created
	after insert on auth.users
	for each row execute function private.handle_new_user();

-- -------------------------------------------------------------------------------------
-- Progression rules (§4) as pure functions
-- -------------------------------------------------------------------------------------

-- Coins for completing an exercise for the first time: 1-3 → 1, 4-6 → 2, 7-10 → 3.
create function private.reward_coins(p_difficulty smallint)
returns smallint
language sql
immutable
strict
set search_path = ''
as $$
	select (case when p_difficulty <= 3 then 1 when p_difficulty <= 6 then 2 else 3 end)::smallint;
$$;

-- XP for completing an exercise for the first time: difficulty × 10.
create function private.reward_xp(p_difficulty smallint)
returns integer
language sql
immutable
strict
set search_path = ''
as $$
	select p_difficulty * 10;
$$;

-- Adds XP and applies level-ups: going from level N to N+1 costs N × 100 XP and the
-- remaining XP carries over, possibly across several levels.
create function private.apply_xp(p_level integer, p_xp integer, p_gained integer,
	out level integer, out xp integer)
language plpgsql
immutable
strict
set search_path = ''
as $$
begin
	level := p_level;
	xp := p_xp + p_gained;
	while xp >= level * 100 loop
		xp := xp - level * 100;
		level := level + 1;
	end loop;
end;
$$;

grant usage on schema private to postgres, service_role;

-- -------------------------------------------------------------------------------------
-- RPC: submit_result
-- -------------------------------------------------------------------------------------

create function public.submit_result(p_exercise_id uuid, p_correct boolean)
returns table (
	correct boolean,
	first_completion boolean,
	coins_awarded integer,
	xp_awarded integer,
	coins integer,
	xp integer,
	level integer,
	xp_to_next_level integer,
	new_achievements text[]
)
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_user uuid := auth.uid();
	v_difficulty smallint;
	v_profile public.profiles%rowtype;
	v_first boolean := false;
	v_coins integer := 0;
	v_xp integer := 0;
	v_progress record;
begin
	if v_user is null then
		raise exception 'not_authenticated' using errcode = 'PT401';
	end if;
	if p_exercise_id is null or p_correct is null then
		raise exception 'invalid_arguments' using errcode = 'PT400';
	end if;

	select e.difficulty into v_difficulty from public.exercises e where e.id = p_exercise_id;
	if not found then
		raise exception 'exercise_not_found' using errcode = 'PT404';
	end if;

	-- Lock the profile: concurrent submissions of the same user are serialized.
	select * into v_profile from public.profiles p where p.id = v_user for update;
	if not found then
		raise exception 'profile_not_found' using errcode = 'PT404';
	end if;

	if p_correct and not exists (
		select 1 from public.attempts a
		where a.user_id = v_user and a.exercise_id = p_exercise_id and a.first_completion
	) then
		v_first := true;
		v_coins := private.reward_coins(v_difficulty);
		v_xp := private.reward_xp(v_difficulty);
		v_progress := private.apply_xp(v_profile.level, v_profile.xp, v_xp);

		update public.profiles p
		set coins = p.coins + v_coins, level = v_progress.level, xp = v_progress.xp
		where p.id = v_user
		returning * into v_profile;
	end if;

	insert into public.attempts (user_id, exercise_id, correct, first_completion, coins_awarded, xp_awarded)
	values (v_user, p_exercise_id, p_correct, v_first, v_coins, v_xp);

	return query select
		p_correct,
		v_first,
		v_coins,
		v_xp,
		v_profile.coins,
		v_profile.xp,
		v_profile.level,
		v_profile.level * 100 - v_profile.xp,
		-- Achievement rules are defined in Fase C.
		'{}'::text[];
end;
$$;

comment on function public.submit_result(uuid, boolean) is
	'Records an attempt. First correct completion awards coins (1/2/3 by difficulty) and difficulty*10 XP; repeats award nothing. Errors: PT401, PT400, PT404.';

-- -------------------------------------------------------------------------------------
-- RPC: unlock_hint
-- -------------------------------------------------------------------------------------

create function public.unlock_hint(p_hint_id uuid)
returns table (
	hint_id uuid,
	exercise_id uuid,
	coins_spent integer,
	coins integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_user uuid := auth.uid();
	v_exercise uuid;
	v_coins integer;
	v_cost constant integer := 1; -- §4: every hint costs 1 coin.
begin
	if v_user is null then
		raise exception 'not_authenticated' using errcode = 'PT401';
	end if;
	if p_hint_id is null then
		raise exception 'invalid_arguments' using errcode = 'PT400';
	end if;

	select h.exercise_id into v_exercise from public.hints h where h.id = p_hint_id;
	if not found then
		raise exception 'hint_not_found' using errcode = 'PT404';
	end if;

	select p.coins into v_coins from public.profiles p where p.id = v_user for update;
	if not found then
		raise exception 'profile_not_found' using errcode = 'PT404';
	end if;

	-- Already unlocked: never charged twice.
	if exists (select 1 from public.hint_unlocks hu where hu.user_id = v_user and hu.hint_id = p_hint_id) then
		return query select p_hint_id, v_exercise, 0, v_coins;
		return;
	end if;

	if v_coins < v_cost then
		raise exception 'insufficient_coins' using errcode = 'PT402';
	end if;

	update public.profiles p set coins = p.coins - v_cost where p.id = v_user
	returning p.coins into v_coins;

	insert into public.hint_unlocks (user_id, hint_id) values (v_user, p_hint_id);

	return query select p_hint_id, v_exercise, v_cost, v_coins;
end;
$$;

comment on function public.unlock_hint(uuid) is
	'Unlocks a hint for 1 coin (free if already unlocked). Errors: PT401, PT400, PT404, PT402 (insufficient coins).';

-- Only signed-in users may call the RPCs (PostgREST maps PTxxx to HTTP xxx).
revoke execute on function public.submit_result(uuid, boolean) from public, anon;
revoke execute on function public.unlock_hint(uuid) from public, anon;
grant execute on function public.submit_result(uuid, boolean) to authenticated;
grant execute on function public.unlock_hint(uuid) to authenticated;

revoke execute on all functions in schema private from public, anon, authenticated;

-- C7 (T16, D8): active languages of each user. The user picks them in the profile; the
-- roulette of /learn only spins among them. Only the 6 languages with documentation can be
-- chosen: keep the CHECK in sync with SELECTABLE_LANGUAGES in src/lib/learn-rules.ts.

create table public.user_languages (
	user_id uuid not null references auth.users (id) on delete cascade,
	language_slug text not null
		check (language_slug in ('astro', 'html', 'java', 'php', 'python', 'react')),
	created_at timestamptz not null default now(),
	primary key (user_id, language_slug)
);

comment on table public.user_languages is
	'Active languages of a user (C7). Owner reads, inserts and deletes; no updates.';

alter table public.user_languages enable row level security;

-- Privileges: the owner reads, inserts and deletes (RLS limits it to their rows). No update:
-- a row is only a (user, language) pair. anon has nothing.
revoke all on public.user_languages from anon, authenticated;
grant select, insert, delete on public.user_languages to authenticated;

create policy "Users read their languages" on public.user_languages
	for select to authenticated using (user_id = (select auth.uid()));
create policy "Users add their languages" on public.user_languages
	for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Users remove their languages" on public.user_languages
	for delete to authenticated using (user_id = (select auth.uid()));

-- Replaces the set of active languages of the signed-in user in one transaction.
-- `security invoker`: runs with the caller's privileges, so the RLS policies above apply.
-- Duplicates are ignored; an empty array clears the set. An unknown slug fails the CHECK
-- (23514) and nothing changes. Returns the resulting set.
create function public.set_user_languages(p_languages text[])
returns setof text
language plpgsql
security invoker
set search_path = ''
as $$
declare
	v_user uuid := (select auth.uid());
begin
	if v_user is null then
		raise exception 'Not signed in' using errcode = 'PT401';
	end if;

	delete from public.user_languages ul
	where ul.user_id = v_user
		and not (ul.language_slug = any (coalesce(p_languages, '{}')));

	insert into public.user_languages (user_id, language_slug)
	select distinct v_user, l from unnest(coalesce(p_languages, '{}')) as l
	on conflict (user_id, language_slug) do nothing;

	return query
		select ul.language_slug from public.user_languages ul
		where ul.user_id = v_user
		order by ul.language_slug;
end;
$$;

comment on function public.set_user_languages(text[]) is
	'Replaces the active languages of the signed-in user (C7). Errors: PT401, 23514 (unknown slug).';

revoke execute on function public.set_user_languages(text[]) from public, anon;
grant execute on function public.set_user_languages(text[]) to authenticated;

-- C8: roles of the admin panel. `user` is the default; `admin` manages users of role `user`
-- and the exercise catalog; `superadmin` (only one, created at server start from the
-- SUPER_ADMIN_* variables) manages admins. Permission rules are enforced in the server
-- (src/lib/server/users.ts) with the service role; clients can never write the column.

create type public.user_role as enum ('user', 'admin', 'superadmin');

alter table public.profiles
	add column role public.user_role not null default 'user';

comment on column public.profiles.role is
	'Panel role (C8). Written only by the server with the service role: authenticated has no UPDATE grant on it.';

-- At most one superadmin.
create unique index profiles_single_superadmin_uidx
	on public.profiles (role) where role = 'superadmin';

-- Only display_name is updatable by clients (initial schema); role stays read-only for them.
-- Repeated on purpose so this migration alone documents the guarantee.
revoke update (role) on public.profiles from anon, authenticated;

import { PASSWORD_MIN_LENGTH } from '@/lib/auth-rules';
import { getServiceClient, serverEnv } from './supabase-admin';

let started: Promise<void> | null = null;

/**
 * Creates the single super admin from SUPER_ADMIN_NAME / _EMAIL / _PASSWORD if it does not
 * exist (C8). Idempotent (an existing user with that email is promoted; an existing superadmin
 * is left alone) and never throws: missing variables or errors only log a warning.
 *
 * Called from `src/middleware.ts` on the first server-rendered request, once per process (the
 * promise is cached). The Node adapter has no server-start hook, so the first request is the
 * earliest reliable point; requests do not wait for it.
 */
export function ensureSuperAdmin(): Promise<void> {
	started ??= run().catch((error) => console.warn('[bootstrap] super admin not created:', error));
	return started;
}

async function run(): Promise<void> {
	const email = serverEnv('SUPER_ADMIN_EMAIL');
	const password = serverEnv('SUPER_ADMIN_PASSWORD');
	const name = serverEnv('SUPER_ADMIN_NAME');
	if (!serverEnv('SUPABASE_SERVICE_ROLE_KEY') || !email || !password) {
		console.warn('[bootstrap] SUPABASE_SERVICE_ROLE_KEY / SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD missing: no super admin created.');
		return;
	}
	const supabase = getServiceClient();

	const { data: current, error } = await supabase.from('profiles').select('id').eq('role', 'superadmin').maybeSingle();
	if (error) throw error;
	if (current) return;

	let id: string | undefined;
	for (let page = 1; page <= 50 && !id; page++) {
		const { data, error: listError } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
		if (listError) throw listError;
		id = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())?.id;
		if (data.users.length < 200) break;
	}

	if (!id) {
		if (password.length < PASSWORD_MIN_LENGTH) {
			throw new Error(`SUPER_ADMIN_PASSWORD needs at least ${PASSWORD_MIN_LENGTH} characters`);
		}
		const { data, error: createError } = await supabase.auth.admin.createUser({
			email,
			password,
			email_confirm: true,
			user_metadata: name ? { display_name: name.slice(0, 40) } : {},
		});
		if (createError || !data.user) throw createError ?? new Error('createUser returned no user');
		id = data.user.id;
	}

	const { error: roleError } = await supabase.from('profiles').update({ role: 'superadmin' }).eq('id', id);
	if (roleError) throw roleError;
	console.info('[bootstrap] super admin ready:', email);
}

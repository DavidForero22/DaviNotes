import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

let client: SupabaseClient<Database> | null = null;

type ServerEnvName =
	| 'SUPABASE_SERVICE_ROLE_KEY'
	| 'SUPER_ADMIN_NAME'
	| 'SUPER_ADMIN_EMAIL'
	| 'SUPER_ADMIN_PASSWORD';

/** Server env var: `process.env` in production (Node adapter), `import.meta.env` in `astro dev`. */
export function serverEnv(name: ServerEnvName): string {
	return (process.env[name] ?? import.meta.env[name] ?? '').trim();
}

/**
 * Service-role client (C8): bypasses RLS and can use the Auth admin API. Server only, and only
 * after the caller has been checked as admin (`requireApiAdmin`) or for the bootstrap. It has no
 * session and never touches cookies. Throws if `SUPABASE_SERVICE_ROLE_KEY` is not set.
 */
export function getServiceClient(): SupabaseClient<Database> {
	if (client) return client;
	const key = serverEnv('SUPABASE_SERVICE_ROLE_KEY');
	if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
	client = createClient<Database>(import.meta.env.PUBLIC_SUPABASE_URL, key, {
		auth: { autoRefreshToken: false, persistSession: false },
	});
	return client;
}

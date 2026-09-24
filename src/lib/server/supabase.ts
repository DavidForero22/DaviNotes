import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';
import type { Database } from '@/types/database';

interface RequestContext {
	request: Request;
	cookies: AstroCookies;
}

/**
 * Creates a Supabase client bound to the current request: it reads the session from the
 * request cookies and writes refreshed tokens back through Astro's cookies.
 * Create one per request; never share it between requests. Server-only.
 */
export function createSupabaseServerClient({ request, cookies }: RequestContext) {
	return createServerClient<Database>(
		import.meta.env.PUBLIC_SUPABASE_URL,
		import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll() {
					return parseCookieHeader(request.headers.get('Cookie') ?? '');
				},
				setAll(cookiesToSet) {
					for (const { name, value, options } of cookiesToSet) {
						cookies.set(name, value, options);
					}
				},
			},
		},
	);
}

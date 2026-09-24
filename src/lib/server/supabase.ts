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
 * The middleware creates it for every server-rendered request: use `locals.supabase`.
 *
 * Session cookies are `HttpOnly`: the browser never talks to Supabase directly (the Vue islands
 * call `/api/**`), so page scripts do not need to read the tokens. `Secure` is left to
 * production (docs/architecture/produccion.md §5).
 */
export function createSupabaseServerClient({ request, cookies }: RequestContext) {
	return createServerClient<Database>(
		import.meta.env.PUBLIC_SUPABASE_URL,
		import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
		{
			cookieOptions: { httpOnly: true },
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

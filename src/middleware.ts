import { defineMiddleware } from 'astro:middleware';
import { loadSessionUser } from '@/lib/server/auth';
import { apiError } from '@/lib/server/http';
import { createSupabaseServerClient } from '@/lib/server/supabase';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const FORM_TYPES = ['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'];

/**
 * Runs before every route, including the prerendered docs at build time.
 *
 * - Prerendered pages (the docs) have no request cookies: nothing is read or changed (T12).
 * - Server-rendered routes (`/api/**`, `/learn/**` with `prerender = false`):
 *   1. Origin check of POST/PUT/PATCH/DELETE (T15, see `isCrossSite`).
 *   2. `locals.supabase` (client bound to the request cookies) and `locals.user`.
 *   3. `Cache-Control: private, no-store` unless the route set its own: these responses depend
 *      on the session and must never be stored by a shared cache.
 *   4. `/api/**`: `X-Robots-Tag: noindex` on every response, redirects and errors included.
 */
export const onRequest = defineMiddleware(async (context, next) => {
	context.locals.user = null;
	if (context.isPrerendered) return next();

	const isApi = context.url.pathname.startsWith('/api/');
	if (isCrossSite(context.request, context.url)) {
		const response = isApi
			? apiError(403, 'forbidden_origin', 'Cross-site requests are not allowed.')
			: new Response('Cross-site requests are not allowed.', { status: 403 });
		return finish(response, isApi);
	}

	const supabase = createSupabaseServerClient(context);
	context.locals.supabase = supabase;
	context.locals.user = await loadSessionUser(supabase);

	return finish(await next(), isApi);
});

/**
 * T15. Replaces Astro's `security.checkOrigin` (disabled in astro.config.mjs because it runs
 * before this middleware and its 403 would lack `X-Robots-Tag`), with the same rules plus JSON:
 * - form content types, or no content type: `Origin` must be this site (browsers always send it
 *   on POST);
 * - any other content type (JSON): rejected if `Origin` is another site. Tools without
 *   `Origin` (curl) are allowed; a browser cannot send cross-site JSON without a CORS
 *   preflight, which this site never grants.
 */
function isCrossSite(request: Request, url: URL): boolean {
	if (SAFE_METHODS.has(request.method)) return false;
	const origin = request.headers.get('Origin');
	const sameOrigin = origin === url.origin;
	const type = (request.headers.get('Content-Type') ?? '').toLowerCase();
	const formLike = type === '' || FORM_TYPES.some((form) => type.includes(form));
	return formLike ? !sameOrigin : origin !== null && !sameOrigin;
}

function finish(response: Response, isApi: boolean): Response {
	const out = mutable(response);
	if (!out.headers.has('Cache-Control')) out.headers.set('Cache-Control', 'private, no-store');
	if (isApi) out.headers.set('X-Robots-Tag', 'noindex');
	return out;
}

/** Responses built with `Response.redirect` have immutable headers: copy them if needed. */
function mutable(response: Response): Response {
	try {
		response.headers.set('X-DaviLearn-Check', '1');
		response.headers.delete('X-DaviLearn-Check');
		return response;
	} catch {
		return new Response(response.body, response);
	}
}

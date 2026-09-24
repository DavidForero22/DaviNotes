import type { APIRoute } from 'astro';
import { afterAuthPath, parseLang } from '@/lib/server/auth';
import { apiError, json, readFields, redirect, wantsJson } from '@/lib/server/http';
import type { SessionResponse } from '@/types/api';

export const prerender = false;

/**
 * POST /api/auth/logout — ends the session on this device and clears the cookies.
 * Works without a session (idempotent). Form → 303 to `next` or `/learn` of `lang`.
 * JSON → 200 `SessionResponse` (`{ user: null }`). docs/architecture/api.md#auth
 */
export const POST: APIRoute = async ({ request, locals }) => {
	const asJson = wantsJson(request);
	const fields = (await readFields(request)) ?? {};

	const { error } = await locals.supabase.auth.signOut({ scope: 'local' });
	// Without a session signOut reports AuthSessionMissingError: still a successful logout.
	if (error && error.name !== 'AuthSessionMissingError') {
		console.error('[api/auth/logout] sign-out failed', error);
		if (asJson) return apiError(500, 'internal_error', 'Could not sign out.');
	}

	if (!asJson) return redirect(afterAuthPath(parseLang(fields.lang), fields.next));
	const body: SessionResponse = { user: null };
	return json(body);
};

import type { APIRoute } from 'astro';
import {
	afterAuthPath,
	authFailureResponse,
	mapAuthError,
	parseCredentials,
	parseLang,
	toSessionUser,
	type AuthFormContext,
} from '@/lib/server/auth';
import { json, readFields, redirect, wantsJson } from '@/lib/server/http';
import type { AuthResponse } from '@/types/api';

export const prerender = false;

/**
 * POST /api/auth/register — creates the account and signs in (no email confirmation, D3).
 * The `on_auth_user_created` trigger creates the profile (0 coins, level 1, 0 XP).
 * Form → 303 to `next` or `/learn` (errors: 303 back to the form + flash cookie).
 * JSON → 201 `AuthResponse`. docs/architecture/api.md#auth
 */
export const POST: APIRoute = async ({ request, cookies, locals }) => {
	const fields = await readFields(request);
	const ctx: AuthFormContext = {
		cookies,
		json: wantsJson(request),
		page: 'register',
		lang: parseLang(fields?.lang),
		next: fields?.next,
		values: { email: fields?.email?.trim(), displayName: fields?.displayName?.trim() },
	};
	if (!fields) {
		return authFailureResponse(ctx, [{ status: 400, code: 'invalid_input', message: 'Could not read the form.' }]);
	}

	const parsed = parseCredentials(fields, 'register');
	if (!parsed.ok) return authFailureResponse(ctx, parsed.errors);
	const { email, password, displayName } = parsed.credentials;

	const { data, error } = await locals.supabase.auth.signUp({
		email,
		password,
		options: displayName ? { data: { display_name: displayName } } : {},
	});
	if (error) return authFailureResponse(ctx, [mapAuthError(error)]);
	if (!data.user || !data.session) {
		// Only happens if email confirmations are turned on (D3 keeps them off).
		console.error('[api/auth/register] sign-up returned no session: are email confirmations enabled?');
		return authFailureResponse(ctx, [{ status: 500, code: 'internal_error', message: 'Could not sign in.' }]);
	}

	if (!ctx.json) return redirect(afterAuthPath(ctx.lang, ctx.next));
	const body: AuthResponse = { user: await toSessionUser(locals.supabase, data.user) };
	return json(body, 201);
};

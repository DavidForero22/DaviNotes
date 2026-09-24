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
 * POST /api/auth/login — email + password. Sets the session cookies (`@supabase/ssr`).
 * Form → 303 to `next` or `/learn` (errors: 303 back to the form + flash cookie).
 * JSON → 200 `AuthResponse`. docs/architecture/api.md#auth
 */
export const POST: APIRoute = async ({ request, cookies, locals }) => {
	const fields = await readFields(request);
	const ctx: AuthFormContext = {
		cookies,
		json: wantsJson(request),
		page: 'login',
		lang: parseLang(fields?.lang),
		next: fields?.next,
		values: { email: fields?.email?.trim() },
	};
	if (!fields) {
		return authFailureResponse(ctx, [{ status: 400, code: 'invalid_input', message: 'Could not read the form.' }]);
	}

	const parsed = parseCredentials(fields, 'login');
	if (!parsed.ok) return authFailureResponse(ctx, parsed.errors);

	const { data, error } = await locals.supabase.auth.signInWithPassword({
		email: parsed.credentials.email,
		password: parsed.credentials.password,
	});
	if (error) return authFailureResponse(ctx, [mapAuthError(error)]);

	if (!ctx.json) return redirect(afterAuthPath(ctx.lang, ctx.next));
	const body: AuthResponse = { user: await toSessionUser(locals.supabase, data.user) };
	return json(body);
};

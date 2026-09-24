import type { AstroCookies } from 'astro';
import type { AuthError, SupabaseClient, User } from '@supabase/supabase-js';
import { defaultLang, type Lang } from '@/i18n/ui';
import { getLangFromUrl, isLang, localizePath } from '@/i18n/utils';
import {
	DISPLAY_NAME_MAX_LENGTH,
	EMAIL_MAX_LENGTH,
	PASSWORD_MAX_LENGTH,
	PASSWORD_MIN_LENGTH,
} from '@/lib/auth-rules';
import type { AuthErrorCode, AuthField, AuthFieldError, AuthFlash, SessionUser } from '@/types/api';
import type { Database } from '@/types/database';
import { apiError, redirect } from './http';

type Client = SupabaseClient<Database>;

// ------------------------------------------------------------------------------ session

/**
 * Reads the session from the request cookies and returns the signed-in user, or `null`.
 * `getUser()` validates the access token with Supabase Auth (it may refresh it and write
 * the new cookies). The display name comes from `profiles`, the source of truth.
 */
export async function loadSessionUser(supabase: Client): Promise<SessionUser | null> {
	const { data, error } = await supabase.auth.getUser();
	if (error || !data.user) return null;
	return toSessionUser(supabase, data.user);
}

export async function toSessionUser(supabase: Client, user: User): Promise<SessionUser> {
	const { data: profile, error } = await supabase
		.from('profiles')
		.select('display_name')
		.eq('id', user.id)
		.maybeSingle();
	if (error) console.error('[auth] could not read the profile', error);
	const session: SessionUser = { id: user.id, email: user.email ?? '' };
	if (profile?.display_name) session.displayName = profile.display_name;
	return session;
}

// ------------------------------------------------------------------------------ paths

/**
 * Returns `value` if it is a same-site relative path starting with a single "/"
 * (e.g. "/es/learn/exercise/…?x=1"), otherwise `fallback`. Rejects "//host", "/\host",
 * absolute URLs and API routes: `next` can never send the user to another site.
 */
export function safeNext(value: string | null | undefined, fallback: string): string {
	if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback;
	try {
		const base = 'http://davilearn.invalid';
		const url = new URL(value, base);
		if (url.origin !== base || url.pathname.startsWith('/api/')) return fallback;
		return url.pathname + url.search + url.hash;
	} catch {
		return fallback;
	}
}

/** "/learn…" in the given language ("/learn/login" + "es" → "/es/learn/login"). */
export function learnPath(lang: Lang, path = '/learn'): string {
	return localizePath(path, lang);
}

/** Login page of `lang`, with `?next=` to come back after signing in. */
export function loginPath(lang: Lang, next?: string): string {
	const path = learnPath(lang, '/learn/login');
	return next ? `${path}?next=${encodeURIComponent(next)}` : path;
}

/** Where a successful login/register/logout goes: `next` if it is safe, else `/learn` of `lang`. */
export function afterAuthPath(lang: Lang, next?: string | null): string {
	return safeNext(next, learnPath(lang));
}

/** `lang` form field or query value, falling back to the default language. */
export function parseLang(value: string | null | undefined): Lang {
	return isLang(value ?? undefined) ? (value as Lang) : defaultLang;
}

// ------------------------------------------------------------------------------ guards

interface GuardContext {
	locals: App.Locals;
	url: URL;
}

/**
 * Page guard (T14). Returns the signed-in user, or a 302 redirect to the login page of the
 * page's language with `?next=` pointing back to it.
 *
 * ```astro
 * const user = requireUser(Astro);
 * if (user instanceof Response) return user;
 * ```
 */
export function requireUser({ locals, url }: GuardContext): SessionUser | Response {
	if (locals.user) return locals.user;
	return redirect(loginPath(getLangFromUrl(url), url.pathname + url.search), 302);
}

/**
 * For `/learn/login` and `/learn/register`: a signed-in user is sent (303) to `?next=` or to
 * `/learn` of the page's language. Returns `null` when there is no session.
 *
 * ```astro
 * const signedIn = redirectIfSignedIn(Astro);
 * if (signedIn) return signedIn;
 * ```
 */
export function redirectIfSignedIn({ locals, url }: GuardContext): Response | null {
	if (!locals.user) return null;
	return redirect(afterAuthPath(getLangFromUrl(url), url.searchParams.get('next')), 303);
}

/**
 * API guard. Returns the signed-in user, or a `401 unauthorized` JSON response.
 *
 * ```ts
 * const user = requireApiUser(context);
 * if (user instanceof Response) return user;
 * ```
 */
export function requireApiUser({ locals }: Pick<GuardContext, 'locals'>): SessionUser | Response {
	return locals.user ?? apiError(401, 'unauthorized', 'Sign in to continue.');
}

// ------------------------------------------------------------------------------ errors

/** An auth error with its HTTP status (JSON) and an English debug message. */
export interface AuthFailure extends AuthFieldError {
	status: number;
	message: string;
}

const RATE_LIMITED: AuthFailure = { status: 429, code: 'rate_limited', message: 'Too many attempts. Try again later.' };

/** Maps a Supabase Auth error to the stable codes of docs/architecture/api.md. */
export function mapAuthError(error: AuthError): AuthFailure {
	switch (error.code) {
		case 'invalid_credentials':
		case 'email_not_confirmed':
			// Never tells which field was wrong.
			return { status: 401, code: 'invalid_credentials', message: 'Wrong email or password.' };
		case 'user_already_exists':
		case 'email_exists':
			return { status: 409, code: 'email_taken', message: 'That email is already registered.', field: 'email' };
		case 'weak_password':
			return { status: 422, code: 'weak_password', message: error.message, field: 'password' };
		case 'email_address_invalid':
			return { status: 400, code: 'invalid_input', message: 'The email is not valid.', field: 'email' };
		case 'over_request_rate_limit':
		case 'over_email_send_rate_limit':
			return RATE_LIMITED;
	}
	if (error.status === 429) return RATE_LIMITED;
	console.error('[auth] unexpected Supabase Auth error', error);
	return { status: 500, code: 'internal_error', message: 'Authentication failed.' };
}

// ------------------------------------------------------------------------------ forms (T13)

export type AuthPage = 'login' | 'register';

export interface Credentials {
	email: string;
	password: string;
	displayName?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates the fields of the login/register forms and returns the credentials, or every
 * error found (email → password → displayName). The password is never trimmed. The minimum
 * length is checked only on register, so an old shorter password can still sign in.
 */
export function parseCredentials(
	fields: Record<string, string>,
	page: AuthPage,
): { ok: true; credentials: Credentials } | { ok: false; errors: AuthFailure[] } {
	const errors: AuthFailure[] = [];
	const email = (fields.email ?? '').trim();
	const password = fields.password ?? '';
	const displayName = (fields.displayName ?? '').trim();

	if (!email || email.length > EMAIL_MAX_LENGTH || !EMAIL.test(email)) {
		errors.push({ status: 400, code: 'invalid_input', field: 'email', message: 'Enter a valid email.' });
	}
	if (!password || password.length > PASSWORD_MAX_LENGTH) {
		errors.push({
			status: 400,
			code: 'invalid_input',
			field: 'password',
			message: `Enter a password of up to ${PASSWORD_MAX_LENGTH} characters.`,
		});
	} else if (page === 'register' && password.length < PASSWORD_MIN_LENGTH) {
		errors.push({
			status: 422,
			code: 'weak_password',
			field: 'password',
			message: `The password must have at least ${PASSWORD_MIN_LENGTH} characters.`,
		});
	}
	if (page === 'register' && displayName.length > DISPLAY_NAME_MAX_LENGTH) {
		errors.push({
			status: 400,
			code: 'invalid_input',
			field: 'displayName',
			message: `The name must have 1-${DISPLAY_NAME_MAX_LENGTH} characters.`,
		});
	}
	if (errors.length > 0) return { ok: false, errors };

	const credentials: Credentials = { email, password };
	if (page === 'register' && displayName) credentials.displayName = displayName;
	return { ok: true, credentials };
}

export interface AuthFormContext {
	cookies: AstroCookies;
	/** Respond with JSON instead of a redirect (`wantsJson`). */
	json: boolean;
	page: AuthPage;
	lang: Lang;
	/** Raw `next` field; validated with `safeNext`. */
	next?: string;
	/** What the user typed (never the password), stored in the flash cookie on failure. */
	values: AuthFlash['values'];
}

/**
 * Failure of a login/register request.
 * - JSON: `ApiError` with the first error (status of that error).
 * - Form: 303 back to the form of `lang` (only `?next=` in the query) and the flash cookie
 *   with every error and the typed values, read once by the page with `consumeAuthFlash`.
 */
export function authFailureResponse(ctx: AuthFormContext, failures: AuthFailure[]): Response {
	const [first] = failures;
	if (!first) throw new Error('authFailureResponse needs at least one failure');
	if (ctx.json) return apiError(first.status, first.code, first.message, first.field);

	setAuthFlash(ctx.cookies, ctx.page, {
		errors: failures.map(({ code, field }) => (field ? { code, field } : { code })),
		values: ctx.values,
	});
	const next = safeNext(ctx.next, '');
	const form = learnPath(ctx.lang, `/learn/${ctx.page}`);
	return redirect(next ? `${form}?next=${encodeURIComponent(next)}` : form);
}

// ------------------------------------------------------------------------------ flash

/**
 * One-use cookie with the result of a failed form POST (T13 + guide account-a11y §1.5):
 * `HttpOnly`, `SameSite=Lax`, `Path=/`, 2 minutes. Never contains the password.
 */
export const AUTH_FLASH_COOKIE = 'dl_auth_flash';

interface StoredFlash extends AuthFlash {
	page: AuthPage;
}

const AUTH_FIELDS: readonly AuthField[] = ['email', 'password', 'displayName'];
const AUTH_CODES: readonly AuthErrorCode[] = [
	'invalid_input',
	'invalid_credentials',
	'email_taken',
	'weak_password',
	'rate_limited',
	'internal_error',
];

function setAuthFlash(cookies: AstroCookies, page: AuthPage, flash: AuthFlash): void {
	const values: AuthFlash['values'] = {};
	if (flash.values.email) values.email = flash.values.email.slice(0, EMAIL_MAX_LENGTH);
	if (flash.values.displayName) values.displayName = flash.values.displayName.slice(0, DISPLAY_NAME_MAX_LENGTH);
	const stored: StoredFlash = { page, errors: flash.errors, values };
	cookies.set(AUTH_FLASH_COOKIE, JSON.stringify(stored), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 120,
	});
}

/**
 * For the login/register pages (SSR `.astro` only; never from `.vue`, T9). Returns the
 * errors and typed values of the last failed POST of this `page`, or `null`, and deletes the
 * cookie, so a reload shows a clean form. A flash left by the other page is discarded.
 *
 * ```astro
 * const flash = consumeAuthFlash(Astro.cookies, 'register'); // { errors, values } | null
 * ```
 */
export function consumeAuthFlash(cookies: AstroCookies, page: AuthPage): AuthFlash | null {
	const raw = cookies.get(AUTH_FLASH_COOKIE)?.value;
	if (!raw) return null;
	cookies.delete(AUTH_FLASH_COOKIE, { path: '/' });
	try {
		const value = JSON.parse(raw) as Partial<StoredFlash> | null;
		if (!value || value.page !== page || !Array.isArray(value.errors)) return null;

		const errors: AuthFieldError[] = [];
		for (const item of value.errors) {
			if (!item || !AUTH_CODES.includes(item.code)) continue;
			errors.push(item.field && AUTH_FIELDS.includes(item.field) ? { code: item.code, field: item.field } : { code: item.code });
		}
		const values: AuthFlash['values'] = {};
		if (typeof value.values?.email === 'string') values.email = value.values.email.slice(0, EMAIL_MAX_LENGTH);
		if (typeof value.values?.displayName === 'string') {
			values.displayName = value.values.displayName.slice(0, DISPLAY_NAME_MAX_LENGTH);
		}
		return errors.length > 0 ? { errors, values } : null;
	} catch {
		return null;
	}
}

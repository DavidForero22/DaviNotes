import type { APIRoute } from 'astro';
import { isSelectableLanguage, type SelectableLanguage } from '@/lib/learn-rules';
import { learnPath, loginPath, parseLang, safeNext } from '@/lib/server/auth';
import { apiError, json, readJsonObject, redirect, wantsJson } from '@/lib/server/http';
import { setProfileFlash } from '@/lib/server/profile-flash';
import { setActiveLanguages } from '@/lib/server/progress';
import type { ProfileFlash, UpdateLanguagesResponse } from '@/types/api';

export const prerender = false;

interface Body {
	/** Raw slugs; `null` when the body could not be read. */
	languages: unknown[] | null;
	lang?: string;
	next?: string;
}

/** JSON `{ languages: [...] }`, or an HTML form with one `languages` field per checked box. */
async function readBody(request: Request, asJson: boolean): Promise<Body> {
	if (asJson) {
		const body = await readJsonObject(request);
		return { languages: body && Array.isArray(body.languages) ? body.languages : null };
	}
	const type = request.headers.get('Content-Type') ?? '';
	if (!type.includes('application/x-www-form-urlencoded') && !type.includes('multipart/form-data')) {
		return { languages: null };
	}
	try {
		const form = await request.formData();
		const text = (name: string) => {
			const value = form.get(name);
			return typeof value === 'string' ? value : undefined;
		};
		return { languages: form.getAll('languages'), lang: text('lang'), next: text('next') };
	} catch {
		return { languages: null };
	}
}

/**
 * POST /api/profile/languages — replaces the active languages of the signed-in user (C7).
 * Form → 303 to `next` or `/{lang}/learn/profile`, with the result in the `dl_profile_flash`
 * cookie (without a session: 303 to the login page). JSON → 200 `UpdateLanguagesResponse`,
 * 400 `invalid_input` for an unknown slug, 401 without a session. docs/architecture/api.md
 */
export const POST: APIRoute = async ({ request, cookies, locals }) => {
	const asJson = wantsJson(request);
	const body = await readBody(request, asJson);
	const lang = parseLang(body.lang);
	const profilePath = learnPath(lang, '/learn/profile');
	const back = safeNext(body.next, profilePath);

	if (!locals.user) {
		return asJson ? apiError(401, 'unauthorized', 'Sign in to continue.') : redirect(loginPath(lang, back));
	}

	const finish = (flash: ProfileFlash, response: () => Response): Response => {
		if (asJson) return response();
		setProfileFlash(cookies, flash);
		return redirect(back);
	};

	const raw = body.languages;
	if (!raw || !raw.every(isSelectableLanguage)) {
		return finish({ ok: false, code: 'invalid_input' }, () =>
			apiError(400, 'invalid_input', 'Unknown language. Valid: astro, html, java, php, python, react.', 'languages'),
		);
	}

	try {
		const activeLanguages = await setActiveLanguages(locals.supabase, raw as SelectableLanguage[]);
		const response: UpdateLanguagesResponse = { activeLanguages };
		return finish({ ok: true }, () => json(response));
	} catch (error) {
		console.error('[api/profile/languages] update failed', error);
		return finish({ ok: false, code: 'internal_error' }, () =>
			apiError(500, 'internal_error', 'Could not save the languages.'),
		);
	}
};

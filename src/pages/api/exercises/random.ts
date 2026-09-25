import type { APIRoute } from 'astro';
import { requireApiUser } from '@/lib/server/auth';
import { parseLocale } from '@/lib/server/exercises';
import { apiError, json } from '@/lib/server/http';
import { LanguageNotActiveError, pickExercise } from '@/lib/server/progress';
import type { RandomExerciseResponse } from '@/types/api';

export const prerender = false;

/**
 * GET /api/exercises/random?language=&locale= — a random exercise of one of the user's active
 * languages (C7 roulette; prefers the ones not completed yet). 200 `{ id }`, 404 `no_exercises`,
 * 400 `language_not_active`, 401 without a session. docs/architecture/api.md
 */
export const GET: APIRoute = async (context) => {
	const user = requireApiUser(context);
	if (user instanceof Response) return user;

	const { url, locals } = context;
	const locale = parseLocale(url.searchParams.get('locale'));
	if (!locale) return apiError(400, 'invalid_query', '"locale" must be one of en, es, fr.', 'locale');
	const language = url.searchParams.get('language') ?? '';

	try {
		const id = await pickExercise(locals.supabase, user, language, locale);
		if (!id) return apiError(404, 'no_exercises', `No exercises for "${language}" yet.`);
		const body: RandomExerciseResponse = { id };
		return json(body);
	} catch (error) {
		if (error instanceof LanguageNotActiveError) {
			return apiError(400, 'language_not_active', '"language" must be one of your active languages.', 'language');
		}
		console.error('[api/exercises/random] pick failed', error);
		return apiError(500, 'internal_error', 'Could not pick an exercise.');
	}
};

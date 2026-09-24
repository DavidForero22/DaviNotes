import type { APIRoute } from 'astro';
import { getExercise, parseLocale } from '@/lib/server/exercises';
import { apiError, isUuid, json } from '@/lib/server/http';
import type { ExerciseResponse } from '@/types/api';

export const prerender = false;

/**
 * GET /api/exercises/[id]?locale= — one exercise (public). Falls back to English when it has
 * no translation in `locale` (`locale` of the DTO says which one). With a session, `completed`
 * and the unlocked hints reflect the user. docs/architecture/api.md
 */
export const GET: APIRoute = async ({ params, url, locals }) => {
	const locale = parseLocale(url.searchParams.get('locale'));
	if (!locale) return apiError(400, 'invalid_query', '"locale" must be one of en, es, fr.', 'locale');
	if (!isUuid(params.id)) return apiError(404, 'not_found', 'Exercise not found.');

	try {
		const exercise: ExerciseResponse | null = await getExercise(locals.supabase, params.id, locale);
		return exercise ? json(exercise) : apiError(404, 'not_found', 'Exercise not found.');
	} catch (error) {
		console.error('[api/exercises/[id]] read failed', error);
		return apiError(500, 'internal_error', 'Could not load the exercise.');
	}
};

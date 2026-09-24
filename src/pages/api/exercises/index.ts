import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '@/lib/server/supabase';
import { DEFAULT_LIMIT, LOCALES, MAX_LIMIT, listExercises } from '@/lib/server/exercises';
import { apiError, json } from '@/lib/server/http';
import type { ExerciseListQuery, ExerciseListResponse, Locale } from '@/types/api';

export const prerender = false;

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SLUG_FILTERS = ['language', 'framework', 'concept', 'category'] as const;

type Parsed = { ok: true; query: ExerciseListQuery } | { ok: false; response: Response };

function parseInteger(value: string, min: number, max: number): number | null {
	if (!/^\d+$/.test(value)) return null;
	const n = Number(value);
	return n >= min && n <= max ? n : null;
}

function parseQuery(params: URLSearchParams): Parsed {
	const query: ExerciseListQuery = {};
	const fail = (field: string, message: string): Parsed => ({
		ok: false,
		response: apiError(400, 'invalid_query', message, field),
	});

	for (const field of SLUG_FILTERS) {
		const value = params.get(field);
		if (value === null || value === '') continue;
		if (!SLUG.test(value)) return fail(field, `"${field}" must be a lowercase slug.`);
		query[field] = value;
	}

	const locale = params.get('locale');
	if (locale !== null && locale !== '') {
		if (!LOCALES.includes(locale as Locale)) return fail('locale', `"locale" must be one of ${LOCALES.join(', ')}.`);
		query.locale = locale as Locale;
	}

	const numeric = [
		['difficulty', 1, 10],
		['limit', 1, MAX_LIMIT],
		['offset', 0, 100_000],
	] as const;
	for (const [field, min, max] of numeric) {
		const value = params.get(field);
		if (value === null || value === '') continue;
		const n = parseInteger(value, min, max);
		if (n === null) return fail(field, `"${field}" must be an integer between ${min} and ${max}.`);
		query[field] = n;
	}

	return { ok: true, query };
}

/**
 * GET /api/exercises — public list of exercises in one locale (docs/architecture/api.md).
 * Without a session every hint is locked and `completed` is false. Never returns answers.
 */
export const GET: APIRoute = async ({ request, cookies, url }) => {
	const parsed = parseQuery(url.searchParams);
	if (!parsed.ok) return parsed.response;

	try {
		const supabase = createSupabaseServerClient({ request, cookies });
		const body: ExerciseListResponse = await listExercises(supabase, {
			limit: DEFAULT_LIMIT,
			...parsed.query,
		});
		return json(body);
	} catch (error) {
		console.error('[api/exercises] list failed', error);
		return apiError(500, 'internal_error', 'Could not load the exercises.');
	}
};

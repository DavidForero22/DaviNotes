import type { APIRoute } from 'astro';
import { requireApiUser } from '@/lib/server/auth';
import { apiError, isUuid, json, readJsonObject } from '@/lib/server/http';
import { RpcError, submitResult } from '@/lib/server/progress';
import type { ResultResponse } from '@/types/api';

export const prerender = false;

/**
 * POST /api/exercises/[id]/result — body `{ "correct": boolean }` (D6). Requires a session.
 * First correct completion: coins 1/2/3 by difficulty and difficulty × 10 XP (§4); repeats
 * and "not solved" give nothing but are recorded. docs/architecture/api.md
 */
export const POST: APIRoute = async (context) => {
	const user = requireApiUser(context);
	if (user instanceof Response) return user;

	const { params, request, locals } = context;
	if (!isUuid(params.id)) return apiError(404, 'not_found', 'Exercise not found.');

	const body = await readJsonObject(request);
	if (!body) return apiError(400, 'invalid_body', 'Send a JSON object with Content-Type: application/json.');
	if (typeof body.correct !== 'boolean') {
		return apiError(400, 'invalid_body', '"correct" must be a boolean.', 'correct');
	}

	try {
		const result: ResultResponse = await submitResult(locals.supabase, params.id, body.correct);
		return json(result);
	} catch (error) {
		if (error instanceof RpcError) {
			if (error.status === 401) return apiError(401, 'unauthorized', 'Sign in to continue.');
			if (error.status === 404) return apiError(404, 'not_found', 'Exercise not found.');
		}
		console.error('[api/exercises/[id]/result] submit failed', error);
		return apiError(500, 'internal_error', 'Could not save the result.');
	}
};

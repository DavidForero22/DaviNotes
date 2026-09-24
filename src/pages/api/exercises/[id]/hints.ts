import type { APIRoute } from 'astro';
import { requireApiUser } from '@/lib/server/auth';
import { findHint, parseLocale, unlockedHintText } from '@/lib/server/exercises';
import { apiError, isUuid, json, readJsonObject } from '@/lib/server/http';
import { RpcError, unlockHint } from '@/lib/server/progress';
import type { HintDTO, UnlockHintResponse } from '@/types/api';

export const prerender = false;

/**
 * POST /api/exercises/[id]/hints?locale= — body `{ "hintId": uuid }`. Requires a session.
 * Costs 1 coin (free if already unlocked); 402 `insufficient_coins` without balance. The hint
 * must belong to `[id]`: checked BEFORE calling `unlock_hint`, which charges the coin.
 * docs/architecture/api.md
 */
export const POST: APIRoute = async (context) => {
	const user = requireApiUser(context);
	if (user instanceof Response) return user;

	const { params, request, locals, url } = context;
	const locale = parseLocale(url.searchParams.get('locale'));
	if (!locale) return apiError(400, 'invalid_query', '"locale" must be one of en, es, fr.', 'locale');
	if (!isUuid(params.id)) return apiError(404, 'not_found', 'Exercise not found.');

	const body = await readJsonObject(request);
	if (!body) return apiError(400, 'invalid_body', 'Send a JSON object with Content-Type: application/json.');
	if (!isUuid(body.hintId)) return apiError(400, 'invalid_body', '"hintId" must be a uuid.', 'hintId');

	try {
		const hint = await findHint(locals.supabase, params.id, body.hintId);
		if (!hint) return apiError(404, 'not_found', 'This exercise has no such hint.', 'hintId');

		const { coins } = await unlockHint(locals.supabase, hint.id);
		const text = await unlockedHintText(locals.supabase, hint.id, locale);
		const dto: HintDTO = text === undefined
			? { id: hint.id, order: hint.position, cost: 1, unlocked: true }
			: { id: hint.id, order: hint.position, cost: 1, unlocked: true, text };
		const response: UnlockHintResponse = { hint: dto, coins };
		return json(response);
	} catch (error) {
		if (error instanceof RpcError) {
			if (error.status === 402) return apiError(402, 'insufficient_coins', 'Not enough coins to unlock this hint.');
			if (error.status === 401) return apiError(401, 'unauthorized', 'Sign in to continue.');
			if (error.status === 404) return apiError(404, 'not_found', 'Hint not found.', 'hintId');
		}
		console.error('[api/exercises/[id]/hints] unlock failed', error);
		return apiError(500, 'internal_error', 'Could not unlock the hint.');
	}
};

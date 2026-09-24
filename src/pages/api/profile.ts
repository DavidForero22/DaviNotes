import type { APIRoute } from 'astro';
import { requireApiUser } from '@/lib/server/auth';
import { apiError, json } from '@/lib/server/http';
import { getProfile } from '@/lib/server/progress';
import type { ProfileDTO } from '@/types/api';

export const prerender = false;

/**
 * GET /api/profile — coins, level, XP and basic stats of the signed-in user (401 without a
 * session). Achievements and active languages arrive in C7+. docs/architecture/api.md
 */
export const GET: APIRoute = async (context) => {
	const user = requireApiUser(context);
	if (user instanceof Response) return user;

	try {
		const profile: ProfileDTO | null = await getProfile(context.locals.supabase, user);
		return profile ? json(profile) : apiError(404, 'not_found', 'Profile not found.');
	} catch (error) {
		console.error('[api/profile] read failed', error);
		return apiError(500, 'internal_error', 'Could not load the profile.');
	}
};

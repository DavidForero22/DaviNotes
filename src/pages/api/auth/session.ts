import type { APIRoute } from 'astro';
import { json } from '@/lib/server/http';
import type { SessionResponse } from '@/types/api';

export const prerender = false;

/** GET /api/auth/session — the signed-in user, or `{ user: null }`. Never 401. */
export const GET: APIRoute = ({ locals }) => {
	const body: SessionResponse = { user: locals.user };
	return json(body);
};

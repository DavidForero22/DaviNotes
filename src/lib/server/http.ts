import type { ApiError, ApiErrorCode } from '@/types/api';

/** JSON response with the given status. API responses are never cached (per-user data). */
export function json(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'no-store',
		},
	});
}

/** Error response with the shared `ApiError` shape (docs/architecture/api.md). */
export function apiError(status: number, code: ApiErrorCode, message: string, field?: string): Response {
	const body: ApiError = { error: field ? { code, message, field } : { code, message } };
	return json(body, status);
}

import type { ApiError, ApiErrorCode } from '@/types/api';

/** JSON response with the given status. API responses are never cached (per-user data). */
export function json(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'private, no-store',
		},
	});
}

/** Error response with the shared `ApiError` shape (docs/architecture/api.md). */
export function apiError(status: number, code: ApiErrorCode, message: string, field?: string): Response {
	const body: ApiError = { error: field ? { code, message, field } : { code, message } };
	return json(body, status);
}

/**
 * Redirect with mutable headers (unlike `Response.redirect`), so the middleware can add
 * `X-Robots-Tag` and Astro can attach the session cookies. 303 after a form POST (T13).
 */
export function redirect(location: string, status: 302 | 303 = 303): Response {
	return new Response(null, {
		status,
		headers: { Location: location, 'Cache-Control': 'private, no-store' },
	});
}

/** True when the client asked for JSON (`Accept: application/json`) or sent a JSON body. */
export function wantsJson(request: Request): boolean {
	const accept = request.headers.get('Accept') ?? '';
	const type = request.headers.get('Content-Type') ?? '';
	return accept.includes('application/json') || type.includes('application/json');
}

/**
 * Reads a JSON object body. Returns `null` when the body is not `application/json` or not a
 * JSON object. Requiring the JSON content type also means a cross-site page cannot send it
 * without a CORS preflight, which this API never grants (T15).
 */
export async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
	if (!(request.headers.get('Content-Type') ?? '').includes('application/json')) return null;
	try {
		const body: unknown = await request.json();
		return body !== null && typeof body === 'object' && !Array.isArray(body)
			? (body as Record<string, unknown>)
			: null;
	} catch {
		return null;
	}
}

/**
 * Reads the fields of an HTML form (urlencoded or multipart) or of a JSON object as strings.
 * Non-string values are dropped. An empty body gives `{}`. Returns `null` if it cannot be parsed.
 */
export async function readFields(request: Request): Promise<Record<string, string> | null> {
	const type = request.headers.get('Content-Type') ?? '';
	const fields: Record<string, string> = {};
	if (type.includes('application/json')) {
		const body = await readJsonObject(request);
		if (!body) return null;
		for (const [key, value] of Object.entries(body)) {
			if (typeof value === 'string') fields[key] = value;
		}
		return fields;
	}
	if (type.includes('application/x-www-form-urlencoded') || type.includes('multipart/form-data')) {
		try {
			const form = await request.formData();
			for (const [key, value] of form) {
				if (typeof value === 'string') fields[key] = value;
			}
			return fields;
		} catch {
			return null;
		}
	}
	return type === '' ? fields : null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
	return typeof value === 'string' && UUID.test(value);
}

/** SQLSTATE `PTxxx` raised by the RPCs → HTTP status `xxx` (`null` for any other error). */
export function rpcStatus(error: { code?: string } | null): number | null {
	const match = /^PT(\d{3})$/.exec(error?.code ?? '');
	return match ? Number(match[1]) : null;
}

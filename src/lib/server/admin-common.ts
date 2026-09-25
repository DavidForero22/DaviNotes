import type { AdminOrder, ApiErrorCode } from '@/types/api';
import { apiError } from './http';

/** Expected failure of the admin services; `adminResponse` turns it into the JSON error. */
export class AdminError extends Error {
	constructor(
		readonly status: number,
		readonly code: ApiErrorCode,
		message: string,
		readonly field?: string,
	) {
		super(message);
	}
}

/** Runs an admin service call and maps `AdminError` (and unexpected errors) to JSON responses. */
export async function adminResponse(run: () => Promise<Response>): Promise<Response> {
	try {
		return await run();
	} catch (error) {
		if (error instanceof AdminError) return apiError(error.status, error.code, error.message, error.field);
		console.error('[api/admin] unexpected error', error);
		return apiError(500, 'internal_error', 'Error interno.');
	}
}

export const ADMIN_DEFAULT_LIMIT = 20;
export const ADMIN_MAX_LIMIT = 100;

function invalidQuery(field: string, message: string): AdminError {
	return new AdminError(400, 'invalid_query', message, field);
}

function intParam(params: URLSearchParams, name: string, fallback: number | undefined, min: number, max: number): number | undefined {
	const raw = params.get(name);
	if (raw === null || raw === '') return fallback;
	const value = Number(raw);
	if (!Number.isInteger(value) || value < min || value > max) {
		throw invalidQuery(name, `"${name}" debe ser un entero entre ${min} y ${max}.`);
	}
	return value;
}

export function parsePagination(params: URLSearchParams): { limit: number; offset: number } {
	return {
		limit: intParam(params, 'limit', ADMIN_DEFAULT_LIMIT, 1, ADMIN_MAX_LIMIT)!,
		offset: intParam(params, 'offset', 0, 0, 1_000_000)!,
	};
}

export function parseIntParam(params: URLSearchParams, name: string, min: number, max: number): number | undefined {
	return intParam(params, name, undefined, min, max);
}

export function parseEnumParam<T extends string>(params: URLSearchParams, name: string, allowed: readonly T[]): T | undefined {
	const raw = params.get(name);
	if (raw === null || raw === '') return undefined;
	if (!(allowed as readonly string[]).includes(raw)) {
		throw invalidQuery(name, `"${name}" debe ser uno de: ${allowed.join(', ')}.`);
	}
	return raw as T;
}

export function parseOrder(params: URLSearchParams): AdminOrder {
	return parseEnumParam(params, 'order', ['asc', 'desc'] as const) ?? 'desc';
}

/** Trimmed text param (max 100 characters), or `undefined` if absent or empty. */
export function parseText(params: URLSearchParams, name: string): string | undefined {
	const raw = params.get(name)?.trim();
	if (!raw) return undefined;
	if (raw.length > 100) throw invalidQuery(name, `"${name}" admite hasta 100 caracteres.`);
	return raw;
}

/** `%`, `_` and `\` of a user-typed search are literals in `ilike`. */
export function likePattern(text: string): string {
	return `%${text.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

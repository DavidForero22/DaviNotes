import type { ApiError, ApiErrorCode } from "@/types/api";

/**
 * `fetch` helpers of the admin panel islands (C8), same origin, against `/api/admin/**`.
 * Runs in the browser: types only from `@/types/api`, never `@/lib/server` (T9).
 */

/** A failed call: HTTP status (0 = network), `ApiError` code, server message and `field`. */
export class AdminRequestError extends Error {
	constructor(
		readonly status: number,
		readonly code: ApiErrorCode | undefined,
		message: string,
		readonly field?: string,
	) {
		super(message);
		this.name = "AdminRequestError";
	}
}

type Method = "GET" | "POST" | "PATCH" | "DELETE";

export async function adminRequest<T>(method: Method, url: string, body?: unknown): Promise<T> {
	let response: Response;
	try {
		response = await fetch(url, {
			method,
			credentials: "same-origin",
			headers: body === undefined ? { Accept: "application/json" } : { "Content-Type": "application/json", Accept: "application/json" },
			body: body === undefined ? undefined : JSON.stringify(body),
		});
	} catch {
		throw new AdminRequestError(0, undefined, "No hay conexión con el servidor. Comprueba tu red y vuelve a intentarlo.");
	}
	if (!response.ok) {
		const error = (await response.json().catch(() => null)) as ApiError | null;
		throw new AdminRequestError(response.status, error?.error?.code, messageFor(response.status, error), error?.error?.field);
	}
	return (await response.json()) as T;
}

function messageFor(status: number, error: ApiError | null): string {
	if (status === 401) return "Tu sesión ha caducado. Vuelve a iniciar sesión para seguir.";
	if (status === 403 && !error?.error?.message) return "No tienes permiso para hacer esto.";
	if (status >= 500) return "Error del servidor. Vuelve a intentarlo en unos segundos.";
	return error?.error?.message ?? `La petición ha fallado (HTTP ${status}).`;
}

/** Builds `?a=1&b=2`, skipping empty values. */
export function queryString(params: Record<string, string | number | undefined | null>): string {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null || value === "") continue;
		search.set(key, String(value));
	}
	const text = search.toString();
	return text ? `?${text}` : "";
}

const dateFormat = new Intl.DateTimeFormat("es", { day: "numeric", month: "short", year: "numeric" });
const dateTimeFormat = new Intl.DateTimeFormat("es", { dateStyle: "long", timeStyle: "short" });
export const numberFormat = new Intl.NumberFormat("es");

export function shortDate(iso: string | undefined): string {
	return iso ? dateFormat.format(new Date(iso)) : "";
}

export function longDate(iso: string | undefined): string {
	return iso ? dateTimeFormat.format(new Date(iso)) : "";
}

/** "Mostrando 21-40 de 57" */
export function rangeText(offset: number, count: number, total: number): string {
	if (total === 0) return "Sin resultados";
	return `Mostrando ${numberFormat.format(offset + 1)}–${numberFormat.format(offset + count)} de ${numberFormat.format(total)}`;
}

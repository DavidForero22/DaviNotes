import type { ApiError, ApiErrorCode, Locale, ResultRequest, ResultResponse, UnlockHintRequest, UnlockHintResponse } from "@/types/api";
import type { ExerciseAnswer, ExerciseApi, ProfileSnapshot } from "./exercise-ui";

/**
 * The real `ExerciseApi` of the exercise screen: same-origin `fetch` calls to
 * `POST /api/exercises/[id]/result` and `POST /api/exercises/[id]/hints` (docs/architecture/api.md).
 * Runs in the browser: types only from `@/types/api`, never `@/lib/server` (T9).
 */

/** A non-2xx answer of the API, with its HTTP status and `ApiError` code (if the body had one). */
export class ApiRequestError extends Error {
	constructor(
		readonly status: number,
		readonly code: ApiErrorCode | undefined,
	) {
		super(`API request failed with ${status}${code ? ` (${code})` : ""}`);
		this.name = "ApiRequestError";
	}
}

/**
 * Event the island sends after every change of the balance, so the account menu of the
 * header shows the same numbers. The header updates silently: the island already announced it.
 */
export const BALANCE_EVENT = "davilearn:balance";

export function publishBalance(balance: ProfileSnapshot): void {
	window.dispatchEvent(new CustomEvent<ProfileSnapshot>(BALANCE_EVENT, { detail: balance }));
}

async function post<T>(url: string, body: unknown): Promise<T> {
	let response: Response;
	try {
		response = await fetch(url, {
			method: "POST",
			credentials: "same-origin",
			headers: { "Content-Type": "application/json", Accept: "application/json" },
			body: JSON.stringify(body),
		});
	} catch {
		// Offline or the server is down
		throw new ApiRequestError(0, undefined);
	}
	if (!response.ok) {
		const error = (await response.json().catch(() => null)) as ApiError | null;
		throw new ApiRequestError(response.status, error?.error?.code);
	}
	return (await response.json()) as T;
}

/**
 * @param exerciseId uuid of the exercise.
 * @param locale language of the interface: the text of an unlocked hint comes in it (or in English).
 */
export function createExerciseApi(exerciseId: string, locale: Locale): ExerciseApi {
	const base = `/api/exercises/${encodeURIComponent(exerciseId)}`;
	return {
		submitResult(answer: ExerciseAnswer) {
			// D6 (development only, produccion.md §7): the browser never receives the solution,
			// so "Solved" with an answer counts as correct and "Not solved" (null) as not correct.
			// Before production the endpoint takes `{ answer }` and the database checks it.
			const body: ResultRequest = { correct: answer !== null };
			return post<ResultResponse>(`${base}/result`, body);
		},
		unlockHint(hintId: string) {
			const body: UnlockHintRequest = { hintId };
			return post<UnlockHintResponse>(`${base}/hints?locale=${locale}`, body);
		},
	};
}

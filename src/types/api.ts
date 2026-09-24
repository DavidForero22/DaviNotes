/**
 * DTOs of the DaviLearn HTTP API (contract v2.2, docs/architecture/roadmap.md §5).
 * v2.2 (Fase C): auth (`SessionUser`, `AuthRequest`, `AuthResponse`, `SessionResponse`,
 * `AuthErrorCode`), `ProfileDTO`, `ExerciseResponse` and the new `ApiErrorCode` values.
 * Shared by the Vue islands and `pages/api/**`. Type-only: never import `@/lib/server` here.
 * Endpoint details: docs/architecture/api.md.
 */
import type { Database } from './database';

type PublicEnums = Database['public']['Enums'];

/** Content locale of an exercise (same values as `Lang` in `@/i18n/config`). */
export type Locale = PublicEnums['locale'];

export type ExerciseType = PublicEnums['exercise_type'];

/** Every hint costs 1 coin (roadmap §4). */
export type HintCost = 1;

export interface HintDTO {
	id: string;
	/** 1-based display order inside the exercise. */
	order: number;
	cost: HintCost;
	unlocked: boolean;
	/** Only present when `unlocked` is true. */
	text?: string;
}

/** Reward for the first completion: coins by difficulty band, XP = difficulty × 10 (§4). */
export interface ExerciseReward {
	coins: 1 | 2 | 3;
	xp: number;
}

export interface ExerciseDTO {
	/** uuid */
	id: string;
	slug: string;
	/** Slug of `src/data/languages.ts`. */
	languageSlug: string;
	/** Slug of `src/data/frameworks.ts`, e.g. "laravel". */
	frameworkSlug?: string;
	/** Links the exercise to its lesson (T4). */
	conceptSlug?: string;
	/** Category slug (seed: syntax, data-structures, ...). */
	category: string;
	/** Category name in `locale`. */
	categoryName: string;
	/** 1-10 (T5). */
	difficulty: number;
	type: ExerciseType;
	locale: Locale;
	title: string;
	context?: string;
	objective: string;
	prompt: string;
	code?: string;
	/** Only for `multiple_choice`. */
	options?: string[];
	reward: ExerciseReward;
	hints: HintDTO[];
	/** True when the signed-in user already completed it (always false without a session). */
	completed: boolean;
}

/** Query string of `GET /api/exercises`. Every filter is optional. */
export interface ExerciseListQuery {
	language?: string;
	framework?: string;
	concept?: string;
	category?: string;
	/** 1-10 */
	difficulty?: number;
	/** Defaults to "en". */
	locale?: Locale;
	/** 1-100, defaults to 50. */
	limit?: number;
	/** Defaults to 0. */
	offset?: number;
}

/** `GET /api/exercises` → 200. Empty array when nothing matches. */
export type ExerciseListResponse = ExerciseDTO[];

/** `GET /api/exercises/[id]?locale=` → 200. 404 `not_found` if it does not exist in `locale`. */
export type ExerciseResponse = ExerciseDTO;

/** `POST /api/exercises/[id]/result` request body. D6: the client decides if it was correct. */
export interface ResultRequest {
	correct: boolean;
}

/** `POST /api/exercises/[id]/result` → 200. The correct answer never reaches the client. */
export interface ResultResponse {
	correct: boolean;
	firstCompletion: boolean;
	coinsAwarded: number;
	xpAwarded: number;
	coins: number;
	/** XP inside the current level. */
	xp: number;
	level: number;
	xpToNextLevel: number;
	/** Achievement slugs unlocked by this submission (always empty until C7+). */
	newAchievements: string[];
}

/**
 * `POST /api/exercises/[id]/hints?locale=` request body. The hint must belong to `[id]`
 * (404 otherwise); `locale` (query, default "en") picks the language of `hint.text`.
 */
export interface UnlockHintRequest {
	hintId: string;
}

/** `POST /api/exercises/[id]/hints` → 200; 402 `insufficient_coins` without balance. */
export interface UnlockHintResponse {
	/** Always `unlocked: true`, with `text` in the requested locale. */
	hint: HintDTO;
	/** Balance after the unlock (unchanged if the hint was already unlocked). */
	coins: number;
}

// ---------------------------------------------------------------------------- auth

/** The signed-in user as the server sees it (`Astro.locals.user`). */
export interface SessionUser {
	/** uuid (= profiles.id) */
	id: string;
	email: string;
	/** Omitted when the user did not choose one. */
	displayName?: string;
}

/**
 * Fields of `POST /api/auth/register` and `POST /api/auth/login`, sent as an HTML form
 * (`application/x-www-form-urlencoded` / `multipart/form-data`) or as JSON.
 */
export interface AuthRequest {
	email: string;
	/** 1-72 characters; the minimum length is enforced by Supabase Auth (`weak_password`). */
	password: string;
	/** Register only, optional. 1-40 characters after trimming. */
	displayName?: string;
	/** Where to go after success: a same-site path, e.g. "/es/learn/exercise/…". */
	next?: string;
	/** Language of the form, used to build the redirect back on error. Defaults to "en". */
	lang?: Locale;
}

/** JSON response of register (201) and login (200). */
export interface AuthResponse {
	user: SessionUser;
}

/** `GET /api/auth/session` → 200, and `POST /api/auth/logout` (JSON) → 200 with `user: null`. */
export interface SessionResponse {
	user: SessionUser | null;
}

/**
 * Stable error codes of the auth endpoints. HTML forms receive them in the flash cookie read by
 * the page (`consumeAuthFlash` in `@/lib/server/auth`); JSON clients in `ApiError.error.code`.
 * i18n translates them. Field of each code: docs/architecture/api.md#auth.
 */
export type AuthErrorCode =
	| 'invalid_input'
	| 'invalid_credentials'
	| 'email_taken'
	| 'weak_password'
	| 'rate_limited'
	| 'internal_error';

/** Form field an auth error points to (= the `name`/`id` of the input). */
export type AuthField = 'email' | 'password' | 'displayName';

/**
 * One error of a login/register form. `field` is omitted for errors that are not about one
 * field (`invalid_credentials` never says which one failed, `rate_limited`, `internal_error`).
 */
export interface AuthFieldError {
	code: AuthErrorCode;
	field?: AuthField;
}

/** What a login/register page receives after a failed form POST (303 + flash cookie). */
export interface AuthFlash {
	/** Every error found, in field order (email, password, displayName). */
	errors: AuthFieldError[];
	/** What the user typed, to fill the form again (WCAG 3.3.7). Never the password. */
	values: { email?: string; displayName?: string };
}

// ---------------------------------------------------------------------------- profile

/** `GET /api/profile` → 200 (requires a session). Achievements and active languages: C7+. */
export interface ProfileDTO {
	id: string;
	email: string;
	displayName?: string;
	coins: number;
	level: number;
	/** XP inside the current level (0 <= xp < level × 100). */
	xp: number;
	/** XP still missing to reach the next level (= level × 100 − xp). */
	xpToNextLevel: number;
	stats: {
		/** Distinct exercises completed (first correct attempt of each). */
		exercisesCompleted: number;
		/** Every submitted attempt, correct or not, repeats included. */
		attempts: number;
	};
}

// ---------------------------------------------------------------------------- errors

export type ApiErrorCode =
	| 'invalid_query'
	| 'invalid_body'
	| 'unauthorized'
	| 'forbidden_origin'
	| 'insufficient_coins'
	| 'not_found'
	| 'internal_error'
	| AuthErrorCode;

/** Body of every non-2xx response. */
export interface ApiError {
	error: {
		code: ApiErrorCode;
		message: string;
		/** Query or body field that failed validation. */
		field?: string;
	};
}

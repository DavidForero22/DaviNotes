/**
 * DTOs of the DaviLearn HTTP API (contract v2.1, docs/architecture/roadmap.md §5).
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

/** `POST /api/exercises/[id]/result` request body (Fase C). */
export interface ResultRequest {
	correct: boolean;
}

/** `POST /api/exercises/[id]/result` → 200 (Fase C). The correct answer never reaches the client. */
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
	/** Achievement slugs unlocked by this submission. */
	newAchievements: string[];
}

/** `POST /api/exercises/[id]/hints` request body (Fase C). */
export interface UnlockHintRequest {
	hintId: string;
}

/** `POST /api/exercises/[id]/hints` → 200 (Fase C); 402 `insufficient_coins` without balance. */
export interface UnlockHintResponse {
	hint: HintDTO;
	coins: number;
}

export type ApiErrorCode =
	| 'invalid_query'
	| 'invalid_body'
	| 'unauthorized'
	| 'insufficient_coins'
	| 'not_found'
	| 'internal_error';

/** Body of every non-2xx response. */
export interface ApiError {
	error: {
		code: ApiErrorCode;
		message: string;
		/** Query or body field that failed validation. */
		field?: string;
	};
}

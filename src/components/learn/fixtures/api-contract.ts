/**
 * Local copy of the exercise data contract (roadmap §5, v2).
 *
 * TEMPORARY: Backend is writing the real DTOs in `src/types/api.ts` (task B2, branch
 * `fase-b/db`). When that file reaches `renovacion`, delete this file and import the
 * same names from `@/types/api`. Keep it identical to §5 until then: do not add fields.
 */

export type Locale = "en" | "es" | "fr";

export interface HintDTO {
	id: string;
	order: number;
	cost: 1;
	unlocked: boolean;
	/** Only present when `unlocked` is true. */
	text?: string;
}

export interface ExerciseDTO {
	/** uuid */
	id: string;
	slug: string;
	/** Slug from `data/languages.ts`. */
	languageSlug: string;
	/** e.g. "laravel" */
	frameworkSlug?: string;
	/** Links the exercise to its lesson (T4). */
	conceptSlug?: string;
	category: string;
	/** 1-10 (T5) */
	difficulty: number;
	type: "multiple_choice" | "fill_blank" | "code_output";
	locale: Locale;
	title: string;
	context?: string;
	objective: string;
	prompt: string;
	code?: string;
	/** Only for multiple_choice. */
	options?: string[];
	/** Derived from difficulty (§4). */
	reward: { coins: 1 | 2 | 3; xp: number };
	hints: HintDTO[];
	/** Per user. */
	completed: boolean;
}

/** POST /api/exercises/[id]/result. The correct answer NEVER travels to the client. */
export interface ResultResponse {
	correct: boolean;
	firstCompletion: boolean;
	coinsAwarded: number;
	xpAwarded: number;
	coins: number;
	xp: number;
	level: number;
	xpToNextLevel: number;
	newAchievements: string[];
}

/** POST /api/exercises/[id]/hints → this body, or HTTP 402 when the balance is too low. */
export interface HintUnlockResponse {
	hint: HintDTO;
	coins: number;
}

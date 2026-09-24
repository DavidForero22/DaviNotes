import type { UIKey } from "@/i18n/ui";
import type { ResultResponse, UnlockHintResponse } from "@/types/api";

/**
 * Shared types of the exercise screen (`InterfazEjercicio.vue`) and the helper that
 * builds its texts on the Astro side, so the island never ships the dictionaries (T6).
 */

/** What the screen sends: the chosen option index, the typed text, or null for "Not solved". */
export type ExerciseAnswer = number | string | null;

/**
 * How the screen talks to the server. The demo passes a simulation
 * (`fixtures/demo-api.ts`); phase C passes `fetch` calls to the real endpoints.
 * `unlockHint` rejects with an error whose `status` is 402 when the balance is too low.
 */
export interface ExerciseApi {
	submitResult(answer: ExerciseAnswer): Promise<ResultResponse>;
	unlockHint(hintId: string): Promise<UnlockHintResponse>;
}

/** Prop name → i18n key. Placeholders are filled in the browser. */
const exerciseTextKeys = {
	progress: "learn.exercise.progress",
	level: "learn.exercise.level",
	xpProgress: "learn.exercise.xpProgress",
	coinOne: "learn.exercise.coinOne",
	coinOther: "learn.exercise.coinOther",
	difficulty: "learn.exercise.difficulty",
	reward: "learn.exercise.reward",
	completed: "learn.exercise.completed",
	context: "learn.exercise.context",
	objective: "learn.exercise.objective",
	question: "learn.exercise.question",
	chooseAnswer: "learn.exercise.chooseAnswer",
	answerLabel: "learn.exercise.answerLabel",
	solved: "learn.exercise.solved",
	notSolved: "learn.exercise.notSolved",
	answerFirst: "learn.exercise.answerFirst",
	sending: "learn.exercise.sending",
	error: "learn.exercise.error",
	hintHeading: "learn.hint.heading",
	hintIntro: "learn.hint.intro",
	hintLabel: "learn.hint.label",
	hintUnlock: "learn.hint.unlock",
	hintNoCoins: "learn.hint.noCoins",
	hintUnlocked: "learn.hint.unlocked",
	resultCorrect: "learn.result.correct",
	resultIncorrect: "learn.result.incorrect",
	resultNotSolved: "learn.result.notSolved",
	resultEarned: "learn.result.earned",
	resultLevelUp: "learn.result.levelUp",
	resultAlreadyCompleted: "learn.result.alreadyCompleted",
	resultNoReward: "learn.result.noReward",
	resultYourAnswer: "learn.result.yourAnswer",
	resultRetry: "learn.result.retry",
} as const satisfies Record<string, UIKey>;

export type ExerciseTexts = Record<keyof typeof exerciseTextKeys, string>;

/** Raw strings (placeholders untouched) for the exercise screen in one language. */
export function buildExerciseTexts(t: (key: UIKey) => string): ExerciseTexts {
	return Object.fromEntries(
		Object.entries(exerciseTextKeys).map(([prop, key]) => [prop, t(key)]),
	) as ExerciseTexts;
}

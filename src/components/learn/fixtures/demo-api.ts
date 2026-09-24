import type { ExerciseAnswer, ExerciseApi } from "../exercise-ui";
import type { DemoScenario, ProfileSnapshot } from "./exercises";

/**
 * DEMO ONLY: simulates `POST /api/exercises/[id]/result` and `POST /api/exercises/[id]/hints`
 * in the browser, applying the progression rules of the roadmap (§4).
 *
 * In phase C the server decides all of this inside the `submit_result` and `unlock_hint`
 * RPCs (T11): the client never computes rewards, never knows the solution and never writes
 * coins, XP or level. This file is then replaced by `fetch` calls and must not be reused.
 */

/** Same shape as the HTTP 402 the real endpoint answers with. */
export class NotEnoughCoinsError extends Error {
	readonly status = 402;
	constructor() {
		super("Payment Required: not enough coins to unlock this hint");
	}
}

const HINT_COST = 1;

/** §4: difficulty 1-3 → 1 coin, 4-6 → 2 coins, 7-10 → 3 coins. */
function coinsFor(difficulty: number): 1 | 2 | 3 {
	return difficulty <= 3 ? 1 : difficulty <= 6 ? 2 : 3;
}

function normalize(text: string): string {
	return text.replace(/\s+/g, "").toLowerCase();
}

function isCorrect(answer: ExerciseAnswer, solution: number | string): boolean {
	if (answer === null) return false;
	if (typeof solution === "number") return answer === solution;
	return typeof answer === "string" && normalize(answer) === normalize(solution);
}

/** A short pause so the screen shows its pending state as it will with the real API. */
function respond<T>(value: T): Promise<T> {
	return new Promise((resolve) => setTimeout(() => resolve(value), 250));
}

export function createDemoApi(scenario: DemoScenario): ExerciseApi {
	const { exercise, secrets } = scenario;
	const profile: ProfileSnapshot = { ...scenario.profile };
	let completed = exercise.completed;
	const unlocked = new Set(exercise.hints.filter((hint) => hint.unlocked).map((hint) => hint.id));

	return {
		submitResult(answer) {
			const correct = isCorrect(answer, secrets.solution);
			const firstCompletion = correct && !completed;
			let coinsAwarded = 0;
			let xpAwarded = 0;

			if (firstCompletion) {
				completed = true;
				coinsAwarded = coinsFor(exercise.difficulty);
				xpAwarded = exercise.difficulty * 10;
				profile.coins += coinsAwarded;
				profile.xp += xpAwarded;
				// §4: level N → N+1 needs N × 100 XP; leftover XP carries over and may chain.
				while (profile.xp >= profile.level * 100) {
					profile.xp -= profile.level * 100;
					profile.level += 1;
				}
				profile.xpToNextLevel = profile.level * 100 - profile.xp;
			}

			return respond({
				correct,
				firstCompletion,
				coinsAwarded,
				xpAwarded,
				...profile,
				newAchievements: [],
			});
		},

		unlockHint(hintId) {
			const hint = exercise.hints.find((item) => item.id === hintId);
			if (!hint) return Promise.reject(new Error(`Unknown hint ${hintId}`));
			// §4: an unlocked hint is never charged twice
			if (!unlocked.has(hintId)) {
				if (profile.coins < HINT_COST) return Promise.reject(new NotEnoughCoinsError());
				profile.coins -= HINT_COST;
				unlocked.add(hintId);
			}
			return respond({
				hint: { ...hint, unlocked: true, text: hint.text ?? secrets.hintTexts[hintId] },
				coins: profile.coins,
			});
		},
	};
}

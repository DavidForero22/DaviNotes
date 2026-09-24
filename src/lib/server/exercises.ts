import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type {
	ExerciseDTO,
	ExerciseListQuery,
	ExerciseReward,
	HintDTO,
	Locale,
} from '@/types/api';

type Client = SupabaseClient<Database>;

export const LOCALES: readonly Locale[] = ['en', 'es', 'fr'];
export const DEFAULT_LIMIT = 50;
export const MAX_LIMIT = 100;

/**
 * Reward of the first completion (roadmap §4). Mirrors `private.reward_coins` and
 * `private.reward_xp` in the database, which are the source of truth when awarding.
 */
export function rewardFor(difficulty: number): ExerciseReward {
	const coins = difficulty <= 3 ? 1 : difficulty <= 6 ? 2 : 3;
	return { coins, xp: difficulty * 10 };
}

/**
 * Columns read for the list. `exercise_answers` is never selected (and RLS would hide it):
 * the correct answer does not leave the database. Hint texts come back only for the hints
 * the signed-in user unlocked (RLS on `hint_translations`); `attempts` and `hint_unlocks`
 * only contain the rows of the signed-in user (none without a session).
 */
const EXERCISE_COLUMNS = `
	id, slug, language_slug, framework_slug, concept_slug, category, type, difficulty,
	exercise_translations!inner ( title, context, objective, prompt, code, options ),
	exercise_categories!inner ( exercise_category_translations!inner ( name ) ),
	hints ( id, position, hint_translations ( text ), hint_unlocks ( hint_id ) ),
	attempts ( id )
`;

/**
 * Lists the exercises that have a translation in `query.locale`, ordered by difficulty
 * and slug. Returns an empty array when nothing matches (the table starts empty, D4).
 */
export async function listExercises(
	supabase: Client,
	query: ExerciseListQuery,
): Promise<ExerciseDTO[]> {
	const locale = query.locale ?? 'en';
	const limit = query.limit ?? DEFAULT_LIMIT;
	const offset = query.offset ?? 0;

	let request = supabase
		.from('exercises')
		.select(EXERCISE_COLUMNS)
		.eq('exercise_translations.locale', locale)
		.eq('exercise_categories.exercise_category_translations.locale', locale)
		.eq('hints.hint_translations.locale', locale)
		.eq('attempts.first_completion', true)
		.order('difficulty')
		.order('slug')
		.order('position', { referencedTable: 'hints' })
		.range(offset, offset + limit - 1);

	if (query.language) request = request.eq('language_slug', query.language);
	if (query.framework) request = request.eq('framework_slug', query.framework);
	if (query.concept) request = request.eq('concept_slug', query.concept);
	if (query.category) request = request.eq('category', query.category);
	if (query.difficulty) request = request.eq('difficulty', query.difficulty);

	const { data, error } = await request;
	if (error) throw error;

	return data.map((row): ExerciseDTO => {
		const t = row.exercise_translations[0]!;
		const hints = row.hints.map((h): HintDTO => {
			const unlocked = h.hint_unlocks.length > 0;
			const text = h.hint_translations[0]?.text;
			return unlocked && text !== undefined
				? { id: h.id, order: h.position, cost: 1, unlocked, text }
				: { id: h.id, order: h.position, cost: 1, unlocked };
		});

		const dto: ExerciseDTO = {
			id: row.id,
			slug: row.slug,
			languageSlug: row.language_slug,
			category: row.category,
			categoryName: row.exercise_categories.exercise_category_translations[0]?.name ?? row.category,
			difficulty: row.difficulty,
			type: row.type,
			locale,
			title: t.title,
			objective: t.objective,
			prompt: t.prompt,
			reward: rewardFor(row.difficulty),
			hints,
			completed: row.attempts.length > 0,
		};
		if (row.framework_slug) dto.frameworkSlug = row.framework_slug;
		if (row.concept_slug) dto.conceptSlug = row.concept_slug;
		if (t.context) dto.context = t.context;
		if (t.code) dto.code = t.code;
		if (row.type === 'multiple_choice' && t.options) dto.options = t.options;
		return dto;
	});
}

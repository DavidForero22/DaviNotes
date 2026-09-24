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
 * Exercises with their texts in `locale`, filtered for the current user (RLS: unlocked hint
 * texts and own attempts only), ordered by difficulty and slug, hints by position.
 */
function selectExercises(supabase: Client, locale: Locale) {
	return supabase
		.from('exercises')
		.select(EXERCISE_COLUMNS)
		.eq('exercise_translations.locale', locale)
		.eq('exercise_categories.exercise_category_translations.locale', locale)
		.eq('hints.hint_translations.locale', locale)
		.eq('attempts.first_completion', true)
		.order('difficulty')
		.order('slug')
		.order('position', { referencedTable: 'hints' });
}

type ExerciseRow = NonNullable<Awaited<ReturnType<typeof selectExercises>>['data']>[number];

function toExerciseDTO(row: ExerciseRow, locale: Locale): ExerciseDTO {
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
}

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

	let request = selectExercises(supabase, locale).range(offset, offset + limit - 1);
	if (query.language) request = request.eq('language_slug', query.language);
	if (query.framework) request = request.eq('framework_slug', query.framework);
	if (query.concept) request = request.eq('concept_slug', query.concept);
	if (query.category) request = request.eq('category', query.category);
	if (query.difficulty) request = request.eq('difficulty', query.difficulty);

	const { data, error } = await request;
	if (error) throw error;
	return data.map((row) => toExerciseDTO(row, locale));
}

/**
 * One exercise by id in `locale`. If it has no translation in `locale`, it falls back to
 * English (`dto.locale` says which one was served: the page marks that content with
 * `lang="en"`). Returns `null` if the exercise does not exist or has no text at all.
 */
export async function getExercise(supabase: Client, id: string, locale: Locale): Promise<ExerciseDTO | null> {
	const candidates: Locale[] = locale === 'en' ? ['en'] : [locale, 'en'];
	for (const candidate of candidates) {
		const { data, error } = await selectExercises(supabase, candidate).eq('id', id).maybeSingle();
		if (error) throw error;
		if (data) return toExerciseDTO(data, candidate);
	}
	return null;
}

/** Id and position of a hint, only if it belongs to `exerciseId` (else `null`). */
export async function findHint(
	supabase: Client,
	exerciseId: string,
	hintId: string,
): Promise<{ id: string; position: number } | null> {
	const { data, error } = await supabase
		.from('hints')
		.select('id, position')
		.eq('id', hintId)
		.eq('exercise_id', exerciseId)
		.maybeSingle();
	if (error) throw error;
	return data;
}

/**
 * Text of a hint the user unlocked, in `locale` or else in English (RLS hides the texts of
 * locked hints, so this returns `undefined` for them).
 */
export async function unlockedHintText(supabase: Client, hintId: string, locale: Locale): Promise<string | undefined> {
	const { data, error } = await supabase
		.from('hint_translations')
		.select('locale, text')
		.eq('hint_id', hintId)
		.in('locale', locale === 'en' ? ['en'] : [locale, 'en']);
	if (error) throw error;
	return (data.find((row) => row.locale === locale) ?? data[0])?.text;
}

/**
 * `?locale=` of the exercise endpoints: the value (default "en"), or `null` if it is not
 * one of `LOCALES`.
 */
export function parseLocale(value: string | null): Locale | null {
	if (value === null || value === '') return 'en';
	return LOCALES.includes(value as Locale) ? (value as Locale) : null;
}

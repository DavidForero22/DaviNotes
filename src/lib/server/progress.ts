import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { isSelectableLanguage, sortLanguages, type SelectableLanguage } from '@/lib/learn-rules';
import type { Locale, ProfileDTO, ResultResponse, SessionUser } from '@/types/api';

type Client = SupabaseClient<Database>;

/** Error of an RPC: `status` comes from its SQLSTATE `PTxxx` (null for anything else). */
export class RpcError extends Error {
	constructor(
		readonly status: number | null,
		readonly code: string | undefined,
		message: string,
	) {
		super(message);
		this.name = 'RpcError';
	}
}

function rpcError(error: { code?: string; message: string }): RpcError {
	const match = /^PT(\d{3})$/.exec(error.code ?? '');
	return new RpcError(match ? Number(match[1]) : null, error.code, error.message);
}

/**
 * Records an attempt with `submit_result` (roadmap §4, D6: the client says if it was correct).
 * Throws `RpcError` (401 no session, 404 exercise not found).
 */
export async function submitResult(supabase: Client, exerciseId: string, correct: boolean): Promise<ResultResponse> {
	const { data, error } = await supabase.rpc('submit_result', { p_exercise_id: exerciseId, p_correct: correct });
	if (error) throw rpcError(error);
	const row = data[0];
	if (!row) throw new RpcError(null, undefined, 'submit_result returned no row');
	return {
		correct: row.correct,
		firstCompletion: row.first_completion,
		coinsAwarded: row.coins_awarded,
		xpAwarded: row.xp_awarded,
		coins: row.coins,
		xp: row.xp,
		level: row.level,
		xpToNextLevel: row.xp_to_next_level,
		newAchievements: row.new_achievements,
	};
}

/**
 * Unlocks a hint with `unlock_hint` (1 coin; free if already unlocked). The caller must have
 * checked that the hint belongs to the exercise BEFORE calling it: the RPC charges first.
 * Throws `RpcError` (401, 404 hint not found, 402 insufficient coins).
 */
export async function unlockHint(supabase: Client, hintId: string): Promise<{ coins: number; coinsSpent: number }> {
	const { data, error } = await supabase.rpc('unlock_hint', { p_hint_id: hintId });
	if (error) throw rpcError(error);
	const row = data[0];
	if (!row) throw new RpcError(null, undefined, 'unlock_hint returned no row');
	return { coins: row.coins, coinsSpent: row.coins_spent };
}

/**
 * Profile of the signed-in user with basic stats (RLS: own rows only). `null` if the profile
 * row is missing (it is created by the sign-up trigger, so only if it was deleted).
 */
export async function getProfile(supabase: Client, user: SessionUser): Promise<ProfileDTO | null> {
	const [profile, attempts, completed, activeLanguages] = await Promise.all([
		supabase.from('profiles').select('display_name, coins, level, xp').eq('id', user.id).maybeSingle(),
		supabase.from('attempts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
		supabase
			.from('attempts')
			.select('id', { count: 'exact', head: true })
			.eq('user_id', user.id)
			.eq('first_completion', true),
		getActiveLanguages(supabase, user),
	]);
	for (const result of [profile, attempts, completed]) {
		if (result.error) throw result.error;
	}
	if (!profile.data) return null;

	const { display_name, coins, level, xp } = profile.data;
	const dto: ProfileDTO = {
		id: user.id,
		email: user.email,
		coins,
		level,
		xp,
		xpToNextLevel: level * 100 - xp,
		stats: { exercisesCompleted: completed.count ?? 0, attempts: attempts.count ?? 0 },
		activeLanguages,
	};
	if (display_name) dto.displayName = display_name;
	return dto;
}

// ------------------------------------------------------------------------------ languages (C7)

/** Active languages of the signed-in user, in the order of `SELECTABLE_LANGUAGES`. */
export async function getActiveLanguages(supabase: Client, user: SessionUser): Promise<SelectableLanguage[]> {
	const { data, error } = await supabase.from('user_languages').select('language_slug').eq('user_id', user.id);
	if (error) throw error;
	return sortLanguages(data.map((row) => row.language_slug));
}

/**
 * Replaces the active languages of the signed-in user (RPC `set_user_languages`, one
 * transaction). The caller validates the slugs first (`isSelectableLanguage`); the database
 * CHECK rejects any other. Returns the resulting set. Throws `RpcError` (401 no session).
 */
export async function setActiveLanguages(
	supabase: Client,
	languages: readonly SelectableLanguage[],
): Promise<SelectableLanguage[]> {
	const { data, error } = await supabase.rpc('set_user_languages', { p_languages: [...languages] });
	if (error) throw rpcError(error);
	return sortLanguages(data);
}

/** Thrown by `pickExercise` when `language` is not one of the user's active languages. */
export class LanguageNotActiveError extends Error {
	constructor(readonly language: string) {
		super(`"${language}" is not an active language of the user`);
		this.name = 'LanguageNotActiveError';
	}
}

/**
 * Id of a random exercise of `language` for the roulette (C7), or `null` if that language has
 * no exercises readable in `locale` (or in English, the fallback of the exercise page).
 * Prefers the exercises the user has not completed; once every one is completed, any of them.
 * Only accepts active languages of the user: throws `LanguageNotActiveError` otherwise.
 *
 * ```astro
 * const id = await pickExercise(Astro.locals.supabase, user, 'java', 'es');
 * ```
 */
export async function pickExercise(
	supabase: Client,
	user: SessionUser,
	language: string,
	locale: Locale,
): Promise<string | null> {
	if (!isSelectableLanguage(language)) throw new LanguageNotActiveError(language);
	const active = await getActiveLanguages(supabase, user);
	if (!active.includes(language)) throw new LanguageNotActiveError(language);

	// Small catalog per language: read the ids and choose here. `attempts` only holds the
	// user's own rows (RLS), filtered to first completions.
	const { data, error } = await supabase
		.from('exercises')
		.select('id, exercise_translations!inner ( locale ), attempts ( id )')
		.eq('language_slug', language)
		.in('exercise_translations.locale', locale === 'en' ? ['en'] : [locale, 'en'])
		.eq('attempts.first_completion', true);
	if (error) throw error;
	if (data.length === 0) return null;

	const pending = data.filter((row) => row.attempts.length === 0);
	const pool = pending.length > 0 ? pending : data;
	return pool[Math.floor(Math.random() * pool.length)]!.id;
}

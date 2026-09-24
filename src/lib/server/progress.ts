import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { ProfileDTO, ResultResponse, SessionUser } from '@/types/api';

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
	const [profile, attempts, completed] = await Promise.all([
		supabase.from('profiles').select('display_name, coins, level, xp').eq('id', user.id).maybeSingle(),
		supabase.from('attempts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
		supabase
			.from('attempts')
			.select('id', { count: 'exact', head: true })
			.eq('user_id', user.id)
			.eq('first_completion', true),
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
	};
	if (display_name) dto.displayName = display_name;
	return dto;
}

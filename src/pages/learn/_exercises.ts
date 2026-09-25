import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfileSnapshot } from "@/components/learn/exercise-ui";
import type { Lang } from "@/i18n/ui";
import { localizePath } from "@/i18n/utils";
import { isSelectableLanguage, type SelectableLanguage } from "@/lib/learn-rules";
import { isUuid, redirect } from "@/lib/server/http";
import { getExercise, listExercises } from "@/lib/server/exercises";
import { getActiveLanguages, getProfile, LanguageNotActiveError, pickExercise } from "@/lib/server/progress";
import type { ExerciseDTO, ProfileDTO, SessionUser } from "@/types/api";
import type { Database } from "@/types/database";

/**
 * Server-side data of the learn pages (the leading "_" keeps this file out of the routes).
 * Only imported by `.astro` pages, never by components or `.vue` files (T9).
 */

type Client = SupabaseClient<Database>;

/**
 * Exercises for the /learn list.
 * Those without a translation in `lang` are listed in English, like the exercise page serves
 * them (`getExercise` falls back to English), so every exercise can be reached from the list.
 */
export async function loadExerciseList(supabase: Client, lang: Lang): Promise<ExerciseDTO[]> {
	const [own, english] = await Promise.all([
		listExercises(supabase, { locale: lang, limit: 100 }),
		lang === "en" ? Promise.resolve([]) : listExercises(supabase, { locale: "en", limit: 100 }),
	]);
	const ids = new Set(own.map((exercise) => exercise.id));
	return [...own, ...english.filter((exercise) => !ids.has(exercise.id))].sort(
		(a, b) => a.difficulty - b.difficulty || a.slug.localeCompare(b.slug),
	);
}

// ------------------------------------------------------------------ home (C4, C7)

export interface LearnHomeData {
	/** Exercises of the list; null without a session or if they could not be read. */
	exercises: ExerciseDTO[] | null;
	/** Active languages for the roulette; null without a session or if they could not be read. */
	activeLanguages: SelectableLanguage[] | null;
	/** The exercise list could not be read. */
	loadError: boolean;
}

/** Exercise list and active languages of the signed-in user, read in parallel. */
export async function loadLearnHome(supabase: Client, user: SessionUser | null, lang: Lang): Promise<LearnHomeData> {
	if (!user) return { exercises: null, activeLanguages: null, loadError: false };
	const [exercises, activeLanguages] = await Promise.allSettled([
		loadExerciseList(supabase, lang),
		getActiveLanguages(supabase, user),
	]);
	if (exercises.status === "rejected") console.error("[learn] could not list the exercises", exercises.reason);
	if (activeLanguages.status === "rejected") {
		console.error("[learn] could not read the active languages", activeLanguages.reason);
	}
	return {
		exercises: exercises.status === "fulfilled" ? exercises.value : null,
		activeLanguages: activeLanguages.status === "fulfilled" ? activeLanguages.value : null,
		loadError: exercises.status === "rejected",
	};
}

// ------------------------------------------------------------------ exercise page (C5)

export type ExercisePageState =
	| { kind: "ok"; exercise: ExerciseDTO; profile: ProfileSnapshot }
	| { kind: "notFound" }
	| { kind: "error" };

/**
 * Exercise (in `lang`, or English if it has no translation) and the user's balance, read on
 * the server so the first HTML already has the exercise (guide §3.1). Also sets the HTTP
 * status of the page: 404 for an unknown id, 500 when the database fails (guide §3.4).
 */
export async function loadExercisePage(
	supabase: Client,
	user: SessionUser,
	id: string | undefined,
	lang: Lang,
	response: { status: number },
): Promise<ExercisePageState> {
	if (!isUuid(id)) {
		response.status = 404;
		return { kind: "notFound" };
	}
	try {
		const [exercise, profile] = await Promise.all([getExercise(supabase, id, lang), getProfile(supabase, user)]);
		if (!exercise) {
			response.status = 404;
			return { kind: "notFound" };
		}
		if (!profile) throw new Error(`no profile row for user ${user.id}`);
		const { coins, xp, level, xpToNextLevel } = profile;
		return { kind: "ok", exercise, profile: { coins, xp, level, xpToNextLevel } };
	} catch (error) {
		console.error("[learn/exercise] could not load the exercise", error);
		response.status = 500;
		return { kind: "error" };
	}
}

// ------------------------------------------------------------------ profile (C7)

/** Profile of the signed-in user, or null (and HTTP 500) if it could not be read. */
export async function loadProfilePage(
	supabase: Client,
	user: SessionUser,
	response: { status: number },
): Promise<ProfileDTO | null> {
	try {
		const profile = await getProfile(supabase, user);
		if (!profile) throw new Error(`no profile row for user ${user.id}`);
		return profile;
	} catch (error) {
		console.error("[learn/profile] could not load the profile", error);
		response.status = 500;
		return null;
	}
}

// ------------------------------------------------------------------ roulette result (C7)

export type PlayPageState =
	| { kind: "redirect"; response: Response }
	| { kind: "noExercises"; language: SelectableLanguage }
	| { kind: "notActive"; language: SelectableLanguage }
	| { kind: "invalid" }
	| { kind: "error" };

/**
 * `/learn/play?language=x`: 303 to a random exercise of `x` (`pickExercise`), or the state
 * that explains why there is none. Also sets the HTTP status: 400 for a language that is not
 * selectable or not active, 500 when the database fails ("no exercises yet" is a 200).
 */
export async function loadPlayPage(
	supabase: Client,
	user: SessionUser,
	language: string | null,
	lang: Lang,
	response: { status: number },
): Promise<PlayPageState> {
	if (!isSelectableLanguage(language)) {
		response.status = 400;
		return { kind: "invalid" };
	}
	try {
		const id = await pickExercise(supabase, user, language, lang);
		if (!id) return { kind: "noExercises", language };
		return { kind: "redirect", response: redirect(localizePath(`/learn/exercise/${id}`, lang), 303) };
	} catch (error) {
		if (error instanceof LanguageNotActiveError) {
			response.status = 400;
			return { kind: "notActive", language };
		}
		console.error("[learn/play] could not pick an exercise", error);
		response.status = 500;
		return { kind: "error" };
	}
}

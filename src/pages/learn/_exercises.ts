import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfileSnapshot } from "@/components/learn/exercise-ui";
import { defaultLang, type Lang } from "@/i18n/ui";
import { loginPath, requireUser } from "@/lib/server/auth";
import { isUuid, redirect } from "@/lib/server/http";
import { getExercise, listExercises } from "@/lib/server/exercises";
import { getProfile } from "@/lib/server/progress";
import type { ExerciseDTO, SessionUser } from "@/types/api";
import type { Database } from "@/types/database";

/**
 * Server-side data of the learn pages (the leading "_" keeps this file out of the routes).
 * Only imported by `.astro` pages, never by components or `.vue` files (T9).
 */

/**
 * Exercises for the /learn list.
 * Those without a translation in `lang` are listed in English, like the exercise page serves
 * them (`getExercise` falls back to English), so every exercise can be reached from the list.
 */
export async function loadExerciseList(supabase: SupabaseClient<Database>, lang: Lang): Promise<ExerciseDTO[]> {
	const [own, english] = await Promise.all([
		listExercises(supabase, { locale: lang, limit: 100 }),
		lang === "en" ? Promise.resolve([]) : listExercises(supabase, { locale: "en", limit: 100 }),
	]);
	const ids = new Set(own.map((exercise) => exercise.id));
	return [...own, ...english.filter((exercise) => !ids.has(exercise.id))].sort(
		(a, b) => a.difficulty - b.difficulty || a.slug.localeCompare(b.slug),
	);
}

// ------------------------------------------------------------------ exercise page (C5)

type Guard = Parameters<typeof requireUser>[0];

/**
 * `requireUser` answering 303 (guide account-a11y §3.5) to the login page of the page's
 * language with `?next=` back here.
 */
export function requireSignedIn(context: Guard): SessionUser | Response {
	const user = requireUser(context);
	if (!(user instanceof Response)) return user;
	return redirect(user.headers.get("Location") ?? loginPath(defaultLang), 303);
}

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
	supabase: SupabaseClient<Database>,
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

/**
 * DTOs of the DaviLearn HTTP API (contract v2.3, docs/architecture/roadmap.md §5).
 * v2.3 (C7, T16): `ProfileDTO.activeLanguages`, `UpdateLanguagesRequest/Response`,
 * `ProfileFlash`, `RandomExerciseResponse`, codes `no_exercises` and `language_not_active`.
 * v2.2 (Fase C): auth (`SessionUser`, `AuthRequest`, `AuthResponse`, `SessionResponse`,
 * `AuthErrorCode`), `ProfileDTO`, `ExerciseResponse` and the new `ApiErrorCode` values.
 * Shared by the Vue islands and `pages/api/**`. Type-only: never import `@/lib/server` here.
 * Endpoint details: docs/architecture/api.md.
 */
import type { SelectableLanguage } from '@/lib/learn-rules';
import type { Database } from './database';

type PublicEnums = Database['public']['Enums'];

/** Content locale of an exercise (same values as `Lang` in `@/i18n/config`). */
export type Locale = PublicEnums['locale'];

export type ExerciseType = PublicEnums['exercise_type'];

/** C8: `user` (default), `admin`, `superadmin` (only one, created from the SUPER_ADMIN_* variables). */
export type UserRole = PublicEnums['user_role'];

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

/** `GET /api/exercises/[id]?locale=` → 200. 404 `not_found` if it does not exist in `locale`. */
export type ExerciseResponse = ExerciseDTO;

/** `POST /api/exercises/[id]/result` request body. D6: the client decides if it was correct. */
export interface ResultRequest {
	correct: boolean;
}

/** `POST /api/exercises/[id]/result` → 200. The correct answer never reaches the client. */
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
	/** Achievement slugs unlocked by this submission (always empty until C7+). */
	newAchievements: string[];
}

/**
 * `POST /api/exercises/[id]/hints?locale=` request body. The hint must belong to `[id]`
 * (404 otherwise); `locale` (query, default "en") picks the language of `hint.text`.
 */
export interface UnlockHintRequest {
	hintId: string;
}

/** `POST /api/exercises/[id]/hints` → 200; 402 `insufficient_coins` without balance. */
export interface UnlockHintResponse {
	/** Always `unlocked: true`, with `text` in the requested locale. */
	hint: HintDTO;
	/** Balance after the unlock (unchanged if the hint was already unlocked). */
	coins: number;
}

// ---------------------------------------------------------------------------- auth

/** The signed-in user as the server sees it (`Astro.locals.user`). */
export interface SessionUser {
	/** uuid (= profiles.id) */
	id: string;
	email: string;
	/** Omitted when the user did not choose one. */
	displayName?: string;
	/** Panel role (C8). `admin` and `superadmin` can use `/api/admin/**`. */
	role: UserRole;
}

/**
 * Fields of `POST /api/auth/register` and `POST /api/auth/login`, sent as an HTML form
 * (`application/x-www-form-urlencoded` / `multipart/form-data`) or as JSON.
 */
export interface AuthRequest {
	email: string;
	/** 1-72 characters; the minimum length is enforced by Supabase Auth (`weak_password`). */
	password: string;
	/** Register only, optional. 1-40 characters after trimming. */
	displayName?: string;
	/** Where to go after success: a same-site path, e.g. "/es/learn/exercise/…". */
	next?: string;
	/** Language of the form, used to build the redirect back on error. Defaults to "en". */
	lang?: Locale;
}

/** JSON response of register (201) and login (200). */
export interface AuthResponse {
	user: SessionUser;
}

/** `GET /api/auth/session` → 200, and `POST /api/auth/logout` (JSON) → 200 with `user: null`. */
export interface SessionResponse {
	user: SessionUser | null;
}

/**
 * Stable error codes of the auth endpoints. HTML forms receive them in the flash cookie read by
 * the page (`consumeAuthFlash` in `@/lib/server/auth`); JSON clients in `ApiError.error.code`.
 * i18n translates them. Field of each code: docs/architecture/api.md#auth.
 */
export type AuthErrorCode =
	| 'invalid_input'
	| 'invalid_credentials'
	| 'email_taken'
	| 'weak_password'
	| 'rate_limited'
	| 'internal_error';

/** Form field an auth error points to (= the `name`/`id` of the input). */
export type AuthField = 'email' | 'password' | 'displayName';

/**
 * One error of a login/register form. `field` is omitted for errors that are not about one
 * field (`invalid_credentials` never says which one failed, `rate_limited`, `internal_error`).
 */
export interface AuthFieldError {
	code: AuthErrorCode;
	field?: AuthField;
}

/** What a login/register page receives after a failed form POST (303 + flash cookie). */
export interface AuthFlash {
	/** Every error found, in field order (email, password, displayName). */
	errors: AuthFieldError[];
	/** What the user typed, to fill the form again (WCAG 3.3.7). Never the password. */
	values: { email?: string; displayName?: string };
}

// ---------------------------------------------------------------------------- profile

/** `GET /api/profile` → 200 (requires a session). Achievements: later (D8). */
export interface ProfileDTO {
	id: string;
	email: string;
	displayName?: string;
	coins: number;
	level: number;
	/** XP inside the current level (0 <= xp < level × 100). */
	xp: number;
	/** XP still missing to reach the next level (= level × 100 − xp). */
	xpToNextLevel: number;
	stats: {
		/** Distinct exercises completed (first correct attempt of each). */
		exercisesCompleted: number;
		/** Every submitted attempt, correct or not, repeats included. */
		attempts: number;
	};
	/** Languages the user marked as active (C7), in the order of `SELECTABLE_LANGUAGES`. */
	activeLanguages: SelectableLanguage[];
}

/**
 * `POST /api/profile/languages` as JSON: replaces the whole set (an empty array clears it).
 * As an HTML form: one `languages` field per checked box, plus `lang` and `next`.
 */
export interface UpdateLanguagesRequest {
	languages: SelectableLanguage[];
}

/** `POST /api/profile/languages` (JSON) → 200. */
export interface UpdateLanguagesResponse {
	activeLanguages: SelectableLanguage[];
}

/**
 * What the profile page receives after a form POST to `/api/profile/languages` (303 + flash
 * cookie, read once with `consumeProfileFlash` in `@/lib/server/profile-flash`).
 */
export type ProfileFlash = { ok: true } | { ok: false; code: 'invalid_input' | 'internal_error' };

/** `GET /api/exercises/random?language=&locale=` → 200 (requires a session). */
export interface RandomExerciseResponse {
	/** uuid of the exercise; open it with `/learn/exercise/[id]`. */
	id: string;
}

// ---------------------------------------------------------------------------- errors

export type ApiErrorCode =
	| 'invalid_query'
	| 'invalid_body'
	| 'unauthorized'
	| 'forbidden_origin'
	| 'insufficient_coins'
	| 'not_found'
	| 'no_exercises'
	| 'forbidden'
	| 'slug_taken'
	| 'language_not_active'
	| 'internal_error'
	| AuthErrorCode;

/** Body of every non-2xx response. */
export interface ApiError {
	error: {
		code: ApiErrorCode;
		message: string;
		/** Query or body field that failed validation. */
		field?: string;
	};
}

// ---------------------------------------------------------------------------- admin (C8)
// All /api/admin/** endpoints: 401 `unauthorized` without a session, 403 `forbidden` if the role is
// not admin/superadmin or the permission rules below forbid the action. Spanish only (D7).
// Rules (enforced by the server; `canManageUser` in @/lib/admin-rules mirrors them for the UI):
//  - the superadmin cannot be edited, deleted or assigned to anyone;
//  - admin manages only users with role `user` (and can only create role `user`);
//  - only the superadmin creates, promotes, demotes, edits or deletes admins;
//  - nobody deletes themselves.

/** Common pagination of the admin lists. `limit` 1-100 (default 20), `offset` >= 0. */
export interface AdminPage {
	total: number;
	limit: number;
	offset: number;
}

export type AdminOrder = 'asc' | 'desc';

/** A user as the admin panel sees it. */
export interface AdminUserDTO {
	id: string;
	email: string;
	/** Omitted when the user has no name. */
	displayName?: string;
	role: UserRole;
	level: number;
	coins: number;
	/** ISO 8601. */
	createdAt: string;
	/** ISO 8601; omitted if the user never signed in. */
	lastSignInAt?: string;
	/** Whether the caller may edit/delete this user (role rules; deleting oneself is a separate 403). */
	manageable: boolean;
}

export type AdminUserSort = 'created_at' | 'display_name' | 'level' | 'coins' | 'role';

/**
 * `GET /api/admin/users?q=&role=&sort=&order=&limit=&offset=`
 * - `q`: case-insensitive substring of the display name.
 * - `role`: `user` | `admin` | `superadmin`.
 * - `sort`: default `created_at`; `order`: default `desc`.
 * Invalid values → 400 `invalid_query` (with `field`).
 */
export interface AdminUserListQuery {
	q?: string;
	role?: UserRole;
	sort?: AdminUserSort;
	order?: AdminOrder;
	limit?: number;
	offset?: number;
}

/** `GET /api/admin/users` → 200. */
export interface AdminUserListResponse extends AdminPage {
	users: AdminUserDTO[];
}

/**
 * `POST /api/admin/users` (JSON) → 201 `AdminUserResponse`. `role` defaults to `user`; `admin`
 * only if the caller is superadmin (else 403); `superadmin` → 403. Errors: 400 `invalid_input`,
 * 422 `weak_password`, 409 `email_taken` (each with `field`).
 */
export interface AdminCreateUserRequest {
	email: string;
	password: string;
	displayName?: string;
	role?: Exclude<UserRole, 'superadmin'>;
}

/**
 * `PATCH /api/admin/users/[id]` (JSON, every field optional) → 200 `AdminUserResponse`.
 * `displayName: ""` clears the name. Changing `role` requires superadmin. 404 `not_found`.
 */
export interface AdminUpdateUserRequest {
	email?: string;
	password?: string;
	displayName?: string;
	role?: Exclude<UserRole, 'superadmin'>;
}

/** `GET|PATCH|POST` of one user. */
export interface AdminUserResponse {
	user: AdminUserDTO;
}

/** `DELETE` of a user or an exercise → 200. */
export interface AdminDeleteResponse {
	id: string;
}

/** One hint of the panel (Spanish text). Its order is its position in the array (1-based). */
export interface AdminHintInput {
	text: string;
}

/**
 * Exercise as the panel sees it: metadata, the Spanish translation, the CORRECT ANSWER and the
 * Spanish hints. The answer is only served by /api/admin/**.
 */
export interface AdminExerciseDTO {
	id: string;
	slug: string;
	languageSlug: string;
	frameworkSlug?: string;
	conceptSlug?: string;
	category: string;
	type: ExerciseType;
	difficulty: number;
	/** ISO 8601. */
	createdAt: string;
	/** Spanish translation. */
	title: string;
	context?: string;
	objective: string;
	prompt: string;
	code?: string;
	/** Only `multiple_choice`. */
	options?: string[];
	/** Only `multiple_choice`: 0-based index into `options`. */
	correctOption?: number;
	/** `fill_blank` / `code_output`: accepted answers. */
	acceptedAnswers?: string[];
	/** Spanish hints in display order (only in the detail/create/update responses; empty in the list). */
	hints: { id: string; order: number; text: string }[];
}

export type AdminExerciseSort = 'created_at' | 'title' | 'difficulty' | 'slug';

/**
 * `GET /api/admin/exercises?q=&language=&framework=&concept=&category=&type=&difficulty=&sort=&order=&limit=&offset=`
 * - `q`: case-insensitive substring of the Spanish title.
 * - `type`: `multiple_choice` | `fill_blank` | `code_output`; `difficulty` 1-10.
 * - `sort`: default `created_at`; `order`: default `desc`.
 */
export interface AdminExerciseListQuery {
	q?: string;
	language?: string;
	framework?: string;
	concept?: string;
	category?: string;
	type?: ExerciseType;
	difficulty?: number;
	sort?: AdminExerciseSort;
	order?: AdminOrder;
	limit?: number;
	offset?: number;
}

/** `GET /api/admin/exercises` → 200 (`exercises[].hints` is empty: use the detail). */
export interface AdminExerciseListResponse extends AdminPage {
	exercises: AdminExerciseDTO[];
}

/**
 * `POST /api/admin/exercises` (JSON) → 201 `AdminExerciseResponse`; `PATCH /api/admin/exercises/[id]`
 * (`AdminExercisePatch`: every field optional; `hints`, if sent, replaces the list;
 * `frameworkSlug`/`conceptSlug`/`context`/`code` accept `null` to clear) → 200. Rules:
 *  - `slug`: lowercase kebab-case, unique (409 `slug_taken`); `category` must exist;
 *  - `multiple_choice`: `options` (>= 2) and `correctOption` (valid index) required;
 *  - `fill_blank` / `code_output`: `acceptedAnswers` (>= 1) required.
 * Errors: 400 `invalid_input` (with `field`), 404 `not_found`.
 */
export interface AdminExerciseInput {
	slug: string;
	languageSlug: string;
	frameworkSlug?: string | null;
	conceptSlug?: string | null;
	category: string;
	type: ExerciseType;
	difficulty: number;
	title: string;
	context?: string | null;
	objective: string;
	prompt: string;
	code?: string | null;
	options?: string[];
	correctOption?: number;
	acceptedAnswers?: string[];
	hints?: AdminHintInput[];
}

export type AdminExercisePatch = Partial<AdminExerciseInput>;

/** `GET|POST|PATCH` of one exercise. */
export interface AdminExerciseResponse {
	exercise: AdminExerciseDTO;
}

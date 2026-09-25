/**
 * DaviLearn rules shared by the server and the UI (C7, T16). Isomorphic: no server-only
 * imports, safe in `.vue` files.
 */

/**
 * Languages a user can mark as active in the profile (D8: the ones with documentation), in
 * display order. Keep in sync with the CHECK of `public.user_languages` (migration
 * `20260925120000_user_languages.sql`).
 */
export const SELECTABLE_LANGUAGES = ['astro', 'html', 'java', 'php', 'python', 'react'] as const;

export type SelectableLanguage = (typeof SELECTABLE_LANGUAGES)[number];

export function isSelectableLanguage(value: unknown): value is SelectableLanguage {
	return typeof value === 'string' && (SELECTABLE_LANGUAGES as readonly string[]).includes(value);
}

/** `languages` sorted in the order of `SELECTABLE_LANGUAGES`, without duplicates or unknown slugs. */
export function sortLanguages(languages: Iterable<string>): SelectableLanguage[] {
	const set = new Set(languages);
	return SELECTABLE_LANGUAGES.filter((slug) => set.has(slug));
}

/**
 * Languages available on the site. The first key is the default locale,
 * which is served without a URL prefix.
 */
export const locales = {
	en: { label: "English", short: "EN" },
	es: { label: "Español", short: "ES" },
	fr: { label: "Français", short: "FR" },
} as const;

export type Lang = keyof typeof locales;

export const defaultLang: Lang = "en";

/**
 * A piece of text written in every supported language.
 */
export type Localized = Record<Lang, string>;

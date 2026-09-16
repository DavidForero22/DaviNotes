import { defaultLang, locales, ui, type Lang, type Localized, type UIKey } from "./ui";

export const langs = Object.keys(locales) as Lang[];

export function isLang(value: string | undefined): value is Lang {
	return !!value && value in locales;
}

/**
 * Reads the language from the first URL segment ("/es/java" -> "es").
 * Paths without a language prefix belong to the default language.
 */
export function getLangFromUrl(url: URL): Lang {
	const [, first] = url.pathname.split("/");
	return isLang(first) ? first : defaultLang;
}

/**
 * Returns a translation function bound to one language. Missing keys fall back
 * to the default language, and `{name}` placeholders are filled from `vars`.
 */
export function useTranslations(lang: Lang) {
	return function t(key: UIKey, vars: Record<string, string> = {}): string {
		const text: string = ui[lang][key] ?? ui[defaultLang][key];
		return text.replace(/\{(\w+)\}/g, (match, name) => vars[name] ?? match);
	};
}

/**
 * Picks the text for the given language from a localized value.
 */
export function pick(value: Localized, lang: Lang): string {
	return value[lang] ?? value[defaultLang];
}

/**
 * Removes the language prefix from a path ("/es/java/oop" -> "/java/oop").
 */
export function stripLang(pathname: string): string {
	const [, first, ...rest] = pathname.split("/");
	if (!isLang(first)) return pathname;
	return "/" + rest.join("/");
}

/**
 * Builds a path for the given language ("/java/oop" + "fr" -> "/fr/java/oop").
 */
export function localizePath(path: string, lang: Lang): string {
	const clean = stripLang(path);
	if (lang === defaultLang) return clean;
	return clean === "/" ? `/${lang}/` : `/${lang}${clean}`;
}

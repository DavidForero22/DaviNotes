import type { Category, LanguageItem } from "../data/languages";
import type { Lang } from "../i18n/ui";
import { localizePath } from "../i18n/utils";

/**
 * Calculates the relative luminance of a hex color.
 * Returns a number between 0 (dark) and 1 (light).
 */
export function getLuminance(hex: string): number {
	const cleanedHex = hex.replace("#", "");
	const r = parseInt(cleanedHex.substring(0, 2), 16) / 255;
	const g = parseInt(cleanedHex.substring(2, 4), 16) / 255;
	const b = parseInt(cleanedHex.substring(4, 6), 16) / 255;

	/** Apply gamma correction for accurate WCAG luminance */
	const getLinear = (c: number) =>
		c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

	return 0.2126 * getLinear(r) + 0.7152 * getLinear(g) + 0.0722 * getLinear(b);
}

/**
 * Returns a readable text color (#000 or #fff) depending on the background color.
 * Chooses the color with the higher contrast ratio.
 */
export function getTextColorForBackground(hex: string): string {
	const bgLuminance = getLuminance(hex);

	/** Luminance of white (1) and black (0) */
	const contrastWhite = (1 + 0.05) / (bgLuminance + 0.05);
	const contrastBlack = (bgLuminance + 0.05) / (0 + 0.05);

	/** Return the color with the higher contrast ratio */
	return contrastBlack > contrastWhite ? "#000" : "#fff";
}

/**
 * Receives a list of categories and returns a NEW list
 * with each category's items sorted alphabetically (A-Z).
 */
export function getSortedCategories(data: Category[]): Category[] {
  return data.map((category) => ({
    ...category,
    items: [...category.items].sort((a, b) =>
      a.title.localeCompare(b.title)
    ),
  }));
}

/**
 * Returns every language item without its category.
 */
export function getAllLanguageItems(data: Category[]): LanguageItem[] {
	return data.flatMap((category) => category.items);
}

/**
 * Builds the localized URL of a language landing page or one of its pages.
 * languageHref(java, "es") -> "/es/java"
 * languageHref(java, "es", "oop") -> "/es/java/oop"
 */
export function languageHref(item: LanguageItem, lang: Lang, pageSlug?: string): string {
	const path = pageSlug ? `/${item.slug}/${pageSlug}` : `/${item.slug}`;
	return localizePath(path, lang);
}

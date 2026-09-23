import { defaultLang, type Lang } from "./config";
import en from "./locales/en";
import es from "./locales/es";
import fr from "./locales/fr";

export { locales, defaultLang } from "./config";
export type { Lang, Localized } from "./config";

/**
 * Interface strings (buttons, labels, headings) that are not part of the guides.
 * Each locale lives in `src/i18n/locales/<lang>/`, split by namespace.
 * `{name}` placeholders are replaced at render time.
 */
export const ui = { en, es, fr } as const satisfies Record<Lang, Record<string, string>>;

export type UIKey = keyof (typeof ui)[typeof defaultLang];

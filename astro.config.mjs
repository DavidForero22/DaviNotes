// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	/**
	 * English is served without a prefix (/java/oop), while the other
	 * languages live under their own folder (/es/java/oop, /fr/java/oop).
	 */
	i18n: {
		locales: ['en', 'es', 'fr'],
		defaultLocale: 'en',
		routing: {
			prefixDefaultLocale: false,
		},
	},
});

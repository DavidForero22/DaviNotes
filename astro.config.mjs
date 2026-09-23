// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
	/**
	 * Pages are prerendered by default, so the documentation stays static. Routes that need
	 * the user session opt out with `export const prerender = false` and are served by the
	 * Node adapter.
	 */
	output: 'static',
	adapter: node({ mode: 'standalone' }),
	integrations: [vue()],
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

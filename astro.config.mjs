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
	 * T15: the Origin check of POST/PUT/PATCH/DELETE lives in src/middleware.ts. It follows the
	 * rules of Astro's `checkOrigin` and also covers JSON, and its 403 carries
	 * `X-Robots-Tag: noindex`. Astro's own check is turned off because it runs before the
	 * middleware.
	 */
	security: {
		checkOrigin: false,
	},
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

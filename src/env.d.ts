/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly PUBLIC_SUPABASE_URL: string;
	readonly PUBLIC_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare namespace App {
	interface Locals {
		/**
		 * Signed-in user, or `null`. Set by `src/middleware.ts`; always `null` on prerendered
		 * pages (no cookies at build time). Guards: `requireUser` / `requireApiUser`
		 * (`@/lib/server/auth`).
		 */
		user: import('@/types/api').SessionUser | null;
		/**
		 * Supabase client bound to the request cookies (RLS as the signed-in user, or `anon`).
		 * Only set on server-rendered routes (`prerender = false`); undefined on prerendered pages.
		 */
		supabase: import('@supabase/supabase-js').SupabaseClient<import('@/types/database').Database>;
	}
}

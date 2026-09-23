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
		/** Signed-in user, or `null`. Set by `src/middleware.ts` on server-rendered requests. */
		user: import('@supabase/supabase-js').User | null;
	}
}

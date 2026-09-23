import { defineMiddleware } from 'astro:middleware';

/**
 * Runs before every route, including the prerendered docs at build time.
 * Skeleton for now: the Supabase session will be read here once auth exists
 * (only for server-rendered routes, since prerendered pages have no request cookies).
 */
export const onRequest = defineMiddleware((context, next) => {
	context.locals.user = null;
	return next();
});

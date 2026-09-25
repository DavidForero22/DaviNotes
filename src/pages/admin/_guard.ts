import type { AstroGlobal } from 'astro';
import { isAdminRole } from '@/lib/admin-rules';
import { learnPath, loginPath } from '@/lib/server/auth';
import type { SessionUser } from '@/types/api';

/**
 * Guard of the `/admin/*` pages: `requireAdmin` with the Spanish learn pages, since the panel
 * has no language prefix and is Spanish only (D7). Guests → 303 to `/es/learn/login?next=`;
 * signed-in users without an admin role → 303 to `/es/learn`.
 */
export function adminGuard(Astro: AstroGlobal): SessionUser | Response {
	const user = Astro.locals.user;
	if (!user) return Astro.redirect(loginPath('es', Astro.url.pathname + Astro.url.search), 303);
	if (!isAdminRole(user.role)) return Astro.redirect(learnPath('es'), 303);
	return user;
}

/** Login page that comes back to `path` (for an expired session inside the islands). */
export const adminLoginHref = (path: string) => loginPath('es', path);

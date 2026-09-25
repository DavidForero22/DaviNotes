/**
 * Admin panel permission rules (C8), shared by the server (which enforces them) and the UI
 * (to hide buttons). Isomorphic: no server-only imports, safe in `.vue` files.
 */
import type { UserRole } from '@/types/api';

export const USER_ROLES: readonly UserRole[] = ['user', 'admin', 'superadmin'];

export function isAdminRole(role: UserRole | undefined | null): boolean {
	return role === 'admin' || role === 'superadmin';
}

/** Whether `actor` may edit or delete a user with role `target`. Self-delete is checked apart. */
export function canManageUser(actor: UserRole, target: UserRole): boolean {
	if (target === 'superadmin') return false;
	if (actor === 'superadmin') return true;
	return actor === 'admin' && target === 'user';
}

/** Roles `actor` may assign when creating or changing a user (never `superadmin`). */
export function assignableRoles(actor: UserRole): Array<Exclude<UserRole, 'superadmin'>> {
	return actor === 'superadmin' ? ['user', 'admin'] : actor === 'admin' ? ['user'] : [];
}

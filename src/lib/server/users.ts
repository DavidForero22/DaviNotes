import { assignableRoles, canManageUser } from '@/lib/admin-rules';
import {
	DISPLAY_NAME_MAX_LENGTH,
	EMAIL_MAX_LENGTH,
	PASSWORD_MAX_LENGTH,
	PASSWORD_MIN_LENGTH,
} from '@/lib/auth-rules';
import type {
	AdminCreateUserRequest,
	AdminUpdateUserRequest,
	AdminUserDTO,
	AdminUserListQuery,
	AdminUserListResponse,
	SessionUser,
	UserRole,
} from '@/types/api';
import { AdminError, likePattern } from './admin-common';
import { mapAuthError } from './auth';
import { getServiceClient } from './supabase-admin';

/**
 * User management (C8) through the Auth admin API + `profiles`, with the service role. Every
 * function receives the `actor` (the signed-in admin) and enforces the permission rules of
 * `@/lib/admin-rules`; callers must have passed `requireApiAdmin` first.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PROFILE_COLUMNS = 'id, display_name, role, level, coins, created_at';

interface ProfileRow {
	id: string;
	display_name: string | null;
	role: UserRole;
	level: number;
	coins: number;
	created_at: string;
}

function toDTO(row: ProfileRow, email: string, lastSignInAt: string | null | undefined, actor: SessionUser): AdminUserDTO {
	const dto: AdminUserDTO = {
		id: row.id,
		email,
		role: row.role,
		level: row.level,
		coins: row.coins,
		createdAt: row.created_at,
		manageable: row.id !== actor.id && canManageUser(actor.role, row.role),
	};
	if (row.display_name) dto.displayName = row.display_name;
	if (lastSignInAt) dto.lastSignInAt = lastSignInAt;
	return dto;
}

async function authInfo(id: string): Promise<{ email: string; lastSignInAt?: string | null }> {
	const { data } = await getServiceClient().auth.admin.getUserById(id);
	return { email: data.user?.email ?? '', lastSignInAt: data.user?.last_sign_in_at };
}

async function findProfile(id: string): Promise<ProfileRow> {
	const { data, error } = await getServiceClient().from('profiles').select(PROFILE_COLUMNS).eq('id', id).maybeSingle();
	if (error) throw error;
	if (!data) throw new AdminError(404, 'not_found', 'Usuario no encontrado.');
	return data;
}

function forbidden(message: string, field?: string): AdminError {
	return new AdminError(403, 'forbidden', message, field);
}

export async function listUsers(actor: SessionUser, query: AdminUserListQuery): Promise<AdminUserListResponse> {
	const limit = query.limit ?? 20;
	const offset = query.offset ?? 0;
	let request = getServiceClient().from('profiles').select(PROFILE_COLUMNS, { count: 'exact' });
	if (query.q) request = request.ilike('display_name', likePattern(query.q));
	if (query.role) request = request.eq('role', query.role);
	request = request
		.order(query.sort ?? 'created_at', { ascending: query.order === 'asc', nullsFirst: false })
		.order('id')
		.range(offset, offset + limit - 1);

	const { data, count, error } = await request;
	if (error) throw error;
	const infos = await Promise.all(data.map((row) => authInfo(row.id)));
	return {
		users: data.map((row, i) => toDTO(row, infos[i]!.email, infos[i]!.lastSignInAt, actor)),
		total: count ?? data.length,
		limit,
		offset,
	};
}

export async function getUser(actor: SessionUser, id: string): Promise<AdminUserDTO> {
	const row = await findProfile(id);
	const info = await authInfo(id);
	return toDTO(row, info.email, info.lastSignInAt, actor);
}

// ------------------------------------------------------------------------------ validation

function validEmail(value: unknown): string {
	const email = typeof value === 'string' ? value.trim() : '';
	if (!email || email.length > EMAIL_MAX_LENGTH || !EMAIL.test(email)) {
		throw new AdminError(400, 'invalid_input', 'Introduce un correo válido.', 'email');
	}
	return email;
}

function validPassword(value: unknown): string {
	if (typeof value !== 'string' || value.length === 0 || value.length > PASSWORD_MAX_LENGTH) {
		throw new AdminError(400, 'invalid_input', `La contraseña admite hasta ${PASSWORD_MAX_LENGTH} caracteres.`, 'password');
	}
	if (value.length < PASSWORD_MIN_LENGTH) {
		throw new AdminError(422, 'weak_password', `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`, 'password');
	}
	return value;
}

/** Trimmed name, or `null` for an empty one (clears it). */
function validName(value: unknown): string | null {
	if (typeof value !== 'string') throw new AdminError(400, 'invalid_input', 'El nombre debe ser texto.', 'displayName');
	const name = value.trim();
	if (name.length > DISPLAY_NAME_MAX_LENGTH) {
		throw new AdminError(400, 'invalid_input', `El nombre admite hasta ${DISPLAY_NAME_MAX_LENGTH} caracteres.`, 'displayName');
	}
	return name || null;
}

function validRole(value: unknown): 'user' | 'admin' {
	if (value === 'superadmin') throw forbidden('El rol superadmin no se puede asignar.', 'role');
	if (value !== 'user' && value !== 'admin') {
		throw new AdminError(400, 'invalid_input', 'El rol debe ser "user" o "admin".', 'role');
	}
	return value;
}

function assertCanAssign(actor: SessionUser, role: 'user' | 'admin'): void {
	if (!assignableRoles(actor.role).includes(role)) {
		throw forbidden(role === 'admin' ? 'Solo el superadmin gestiona administradores.' : 'No puedes asignar ese rol.', 'role');
	}
}

// ------------------------------------------------------------------------------ writes

export async function createUser(actor: SessionUser, body: Record<string, unknown>): Promise<AdminUserDTO> {
	const input = body as Partial<AdminCreateUserRequest>;
	const email = validEmail(input.email);
	const password = validPassword(input.password);
	const displayName = input.displayName === undefined ? null : validName(input.displayName);
	const role = input.role === undefined ? 'user' : validRole(input.role);
	assertCanAssign(actor, role);

	const supabase = getServiceClient();
	const { data, error } = await supabase.auth.admin.createUser({
		email,
		password,
		email_confirm: true,
		user_metadata: displayName ? { display_name: displayName } : {},
	});
	if (error || !data.user) {
		const failure = mapAuthError(error!);
		throw new AdminError(failure.status, failure.code, failure.message, failure.field);
	}
	if (role !== 'user') {
		const { error: roleError } = await supabase.from('profiles').update({ role }).eq('id', data.user.id);
		if (roleError) {
			await supabase.auth.admin.deleteUser(data.user.id);
			throw roleError;
		}
	}
	return getUser(actor, data.user.id);
}

export async function updateUser(actor: SessionUser, id: string, body: Record<string, unknown>): Promise<AdminUserDTO> {
	const target = await findProfile(id);
	if (target.role === 'superadmin') throw forbidden('El superadmin no se puede editar.');
	if (!canManageUser(actor.role, target.role)) throw forbidden('Solo el superadmin gestiona administradores.');
	const patch = body as Partial<AdminUpdateUserRequest>;
	const supabase = getServiceClient();

	// Validate everything before writing anything.
	const email = patch.email === undefined ? undefined : validEmail(patch.email);
	const password = patch.password === undefined ? undefined : validPassword(patch.password);
	const displayName = patch.displayName === undefined ? undefined : validName(patch.displayName);
	let role: 'user' | 'admin' | undefined;
	if (patch.role !== undefined) {
		role = validRole(patch.role);
		if (actor.role !== 'superadmin') throw forbidden('Solo el superadmin cambia roles.', 'role');
	}

	if (email !== undefined || password !== undefined) {
		const attrs: { email?: string; password?: string; email_confirm?: boolean } = {};
		if (email !== undefined) {
			attrs.email = email;
			attrs.email_confirm = true;
		}
		if (password !== undefined) attrs.password = password;
		const { error } = await supabase.auth.admin.updateUserById(id, attrs);
		if (error) {
			const failure = mapAuthError(error);
			throw new AdminError(failure.status, failure.code, failure.message, failure.field);
		}
	}
	const profile: { display_name?: string | null; role?: UserRole } = {};
	if (displayName !== undefined) profile.display_name = displayName;
	if (role !== undefined) profile.role = role;
	if (Object.keys(profile).length > 0) {
		const { error } = await supabase.from('profiles').update(profile).eq('id', id);
		if (error) throw error;
	}
	return getUser(actor, id);
}

export async function deleteUser(actor: SessionUser, id: string): Promise<void> {
	const target = await findProfile(id);
	if (id === actor.id) throw forbidden('No puedes borrar tu propia cuenta.');
	if (target.role === 'superadmin') throw forbidden('El superadmin no se puede borrar.');
	if (!canManageUser(actor.role, target.role)) throw forbidden('Solo el superadmin gestiona administradores.');
	const { error } = await getServiceClient().auth.admin.deleteUser(id);
	if (error) throw error;
}

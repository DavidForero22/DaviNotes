import type { APIRoute } from 'astro';
import { USER_ROLES } from '@/lib/admin-rules';
import { adminResponse, parseEnumParam, parseOrder, parsePagination, parseText } from '@/lib/server/admin-common';
import { requireApiAdmin } from '@/lib/server/auth';
import { apiError, json, readJsonObject } from '@/lib/server/http';
import { createUser, listUsers } from '@/lib/server/users';
import type { AdminUserListQuery, AdminUserResponse } from '@/types/api';

export const prerender = false;

/** GET /api/admin/users — list with search, role filter, sort and pagination (`AdminUserListQuery`). */
export const GET: APIRoute = (context) =>
	adminResponse(async () => {
		const actor = requireApiAdmin(context);
		if (actor instanceof Response) return actor;
		const p = context.url.searchParams;
		const query: AdminUserListQuery = { ...parsePagination(p), order: parseOrder(p) };
		const q = parseText(p, 'q');
		const role = parseEnumParam(p, 'role', USER_ROLES);
		const sort = parseEnumParam(p, 'sort', ['created_at', 'display_name', 'level', 'coins', 'role'] as const);
		if (q) query.q = q;
		if (role) query.role = role;
		if (sort) query.sort = sort;
		return json(await listUsers(actor, query));
	});

/** POST /api/admin/users — JSON `AdminCreateUserRequest` → 201 `AdminUserResponse`. */
export const POST: APIRoute = (context) =>
	adminResponse(async () => {
		const actor = requireApiAdmin(context);
		if (actor instanceof Response) return actor;
		const body = await readJsonObject(context.request);
		if (!body) return apiError(400, 'invalid_body', 'Envía un objeto JSON con Content-Type: application/json.');
		const response: AdminUserResponse = { user: await createUser(actor, body) };
		return json(response, 201);
	});

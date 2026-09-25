import type { APIRoute } from 'astro';
import { adminResponse } from '@/lib/server/admin-common';
import { requireApiAdmin } from '@/lib/server/auth';
import { apiError, isUuid, json, readJsonObject } from '@/lib/server/http';
import { deleteUser, getUser, updateUser } from '@/lib/server/users';
import type { AdminDeleteResponse, AdminUserResponse } from '@/types/api';

export const prerender = false;

const notFound = () => apiError(404, 'not_found', 'Usuario no encontrado.');

/** GET /api/admin/users/[id] → `AdminUserResponse`. */
export const GET: APIRoute = (context) =>
	adminResponse(async () => {
		const actor = requireApiAdmin(context);
		if (actor instanceof Response) return actor;
		const id = context.params.id;
		if (!isUuid(id)) return notFound();
		const response: AdminUserResponse = { user: await getUser(actor, id) };
		return json(response);
	});

/** PATCH /api/admin/users/[id] — JSON `AdminUpdateUserRequest` → `AdminUserResponse`. */
export const PATCH: APIRoute = (context) =>
	adminResponse(async () => {
		const actor = requireApiAdmin(context);
		if (actor instanceof Response) return actor;
		const id = context.params.id;
		if (!isUuid(id)) return notFound();
		const body = await readJsonObject(context.request);
		if (!body) return apiError(400, 'invalid_body', 'Envía un objeto JSON con Content-Type: application/json.');
		const response: AdminUserResponse = { user: await updateUser(actor, id, body) };
		return json(response);
	});

/** DELETE /api/admin/users/[id] → `AdminDeleteResponse`. */
export const DELETE: APIRoute = (context) =>
	adminResponse(async () => {
		const actor = requireApiAdmin(context);
		if (actor instanceof Response) return actor;
		const id = context.params.id;
		if (!isUuid(id)) return notFound();
		await deleteUser(actor, id);
		const response: AdminDeleteResponse = { id };
		return json(response);
	});

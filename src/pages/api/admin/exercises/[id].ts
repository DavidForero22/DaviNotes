import type { APIRoute } from 'astro';
import { adminResponse } from '@/lib/server/admin-common';
import { deleteExercise, getExercise, updateExercise } from '@/lib/server/admin-exercises';
import { requireApiAdmin } from '@/lib/server/auth';
import { apiError, isUuid, json, readJsonObject } from '@/lib/server/http';
import type { AdminDeleteResponse, AdminExerciseResponse } from '@/types/api';

export const prerender = false;

const notFound = () => apiError(404, 'not_found', 'Ejercicio no encontrado.');

/** GET /api/admin/exercises/[id] → `AdminExerciseResponse` (with the correct answer and hints). */
export const GET: APIRoute = (context) =>
	adminResponse(async () => {
		const actor = requireApiAdmin(context);
		if (actor instanceof Response) return actor;
		const id = context.params.id;
		if (!isUuid(id)) return notFound();
		const response: AdminExerciseResponse = { exercise: await getExercise(id) };
		return json(response);
	});

/** PATCH /api/admin/exercises/[id] — JSON `AdminExercisePatch` → `AdminExerciseResponse`. */
export const PATCH: APIRoute = (context) =>
	adminResponse(async () => {
		const actor = requireApiAdmin(context);
		if (actor instanceof Response) return actor;
		const id = context.params.id;
		if (!isUuid(id)) return notFound();
		const body = await readJsonObject(context.request);
		if (!body) return apiError(400, 'invalid_body', 'Envía un objeto JSON con Content-Type: application/json.');
		const response: AdminExerciseResponse = { exercise: await updateExercise(id, body) };
		return json(response);
	});

/** DELETE /api/admin/exercises/[id] → `AdminDeleteResponse`. */
export const DELETE: APIRoute = (context) =>
	adminResponse(async () => {
		const actor = requireApiAdmin(context);
		if (actor instanceof Response) return actor;
		const id = context.params.id;
		if (!isUuid(id)) return notFound();
		await deleteExercise(id);
		const response: AdminDeleteResponse = { id };
		return json(response);
	});

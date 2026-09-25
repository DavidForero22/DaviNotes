import type { APIRoute } from 'astro';
import {
	adminResponse,
	parseEnumParam,
	parseIntParam,
	parseOrder,
	parsePagination,
	parseText,
} from '@/lib/server/admin-common';
import { createExercise, listExercises } from '@/lib/server/admin-exercises';
import { requireApiAdmin } from '@/lib/server/auth';
import { apiError, json, readJsonObject } from '@/lib/server/http';
import type { AdminExerciseListQuery, AdminExerciseResponse } from '@/types/api';

export const prerender = false;

/** GET /api/admin/exercises — list with search, filters, sort and pagination (`AdminExerciseListQuery`). */
export const GET: APIRoute = (context) =>
	adminResponse(async () => {
		const actor = requireApiAdmin(context);
		if (actor instanceof Response) return actor;
		const p = context.url.searchParams;
		const query: AdminExerciseListQuery = { ...parsePagination(p), order: parseOrder(p) };
		for (const key of ['q', 'language', 'framework', 'concept', 'category'] as const) {
			const value = parseText(p, key);
			if (value) query[key] = value;
		}
		const type = parseEnumParam(p, 'type', ['multiple_choice', 'fill_blank', 'code_output'] as const);
		const sort = parseEnumParam(p, 'sort', ['created_at', 'title', 'difficulty', 'slug'] as const);
		const difficulty = parseIntParam(p, 'difficulty', 1, 10);
		if (type) query.type = type;
		if (sort) query.sort = sort;
		if (difficulty) query.difficulty = difficulty;
		return json(await listExercises(query));
	});

/** POST /api/admin/exercises — JSON `AdminExerciseInput` → 201 `AdminExerciseResponse`. */
export const POST: APIRoute = (context) =>
	adminResponse(async () => {
		const actor = requireApiAdmin(context);
		if (actor instanceof Response) return actor;
		const body = await readJsonObject(context.request);
		if (!body) return apiError(400, 'invalid_body', 'Envía un objeto JSON con Content-Type: application/json.');
		const response: AdminExerciseResponse = { exercise: await createExercise(body) };
		return json(response, 201);
	});

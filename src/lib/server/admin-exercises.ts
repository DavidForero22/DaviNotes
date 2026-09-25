import type {
	AdminExerciseDTO,
	AdminExerciseInput,
	AdminExerciseListQuery,
	AdminExerciseListResponse,
	ExerciseType,
} from '@/types/api';
import { AdminError, likePattern } from './admin-common';
import { getServiceClient } from './supabase-admin';

/**
 * Exercise CRUD for the admin panel (C8), with the service role. Handles the metadata, the
 * Spanish translation (`locale = 'es'`, D7), the correct answer (`exercise_answers`) and the
 * Spanish hints. The correct answer is only returned here (never by `lib/server/exercises.ts`).
 * Callers must have passed `requireApiAdmin`.
 */

const LOCALE = 'es' as const;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TYPES: readonly ExerciseType[] = ['multiple_choice', 'fill_blank', 'code_output'];

const DETAIL_COLUMNS = `
	id, slug, language_slug, framework_slug, concept_slug, category, type, difficulty, created_at,
	exercise_translations ( locale, title, context, objective, prompt, code, options ),
	exercise_answers ( correct_option, accepted_answers ),
	hints ( id, position, hint_translations ( locale, text ) )
`;

interface DetailRow {
	id: string;
	slug: string;
	language_slug: string;
	framework_slug: string | null;
	concept_slug: string | null;
	category: string;
	type: ExerciseType;
	difficulty: number;
	created_at: string;
	exercise_translations: Array<{
		locale: string;
		title: string;
		context: string | null;
		objective: string;
		prompt: string;
		code: string | null;
		options: string[] | null;
	}>;
	// One-to-one (primary key): PostgREST returns an object, not an array.
	exercise_answers: { correct_option: number | null; accepted_answers: string[] | null } | null;
	hints: Array<{ id: string; position: number; hint_translations: Array<{ locale: string; text: string }> }>;
}

function toDTO(row: DetailRow, withHints: boolean): AdminExerciseDTO {
	const t = row.exercise_translations.find((tr) => tr.locale === LOCALE);
	const dto: AdminExerciseDTO = {
		id: row.id,
		slug: row.slug,
		languageSlug: row.language_slug,
		category: row.category,
		type: row.type,
		difficulty: row.difficulty,
		createdAt: row.created_at,
		title: t?.title ?? '',
		objective: t?.objective ?? '',
		prompt: t?.prompt ?? '',
		hints: [],
	};
	if (row.framework_slug) dto.frameworkSlug = row.framework_slug;
	if (row.concept_slug) dto.conceptSlug = row.concept_slug;
	if (t?.context) dto.context = t.context;
	if (t?.code) dto.code = t.code;
	if (t?.options) dto.options = t.options;
	const answer = row.exercise_answers;
	if (answer?.correct_option != null) dto.correctOption = answer.correct_option;
	if (answer?.accepted_answers) dto.acceptedAnswers = answer.accepted_answers;
	if (withHints) {
		dto.hints = row.hints
			.map((h) => ({ id: h.id, order: h.position, text: h.hint_translations.find((tr) => tr.locale === LOCALE)?.text ?? '' }))
			.sort((a, b) => a.order - b.order);
	}
	return dto;
}

// ------------------------------------------------------------------------------ reads

export async function listExercises(query: AdminExerciseListQuery): Promise<AdminExerciseListResponse> {
	const limit = query.limit ?? 20;
	const offset = query.offset ?? 0;
	// The list starts from the Spanish translation so it can be searched and sorted by title;
	// every exercise has one (create and update always write it).
	let request = getServiceClient()
		.from('exercise_translations')
		.select(
			`locale, title, context, objective, prompt, code, options,
			 exercises!inner ( id, slug, language_slug, framework_slug, concept_slug, category, type, difficulty,
			 created_at, exercise_answers ( correct_option, accepted_answers ) )`,
			{ count: 'exact' },
		)
		.eq('locale', LOCALE);
	if (query.q) request = request.ilike('title', likePattern(query.q));
	if (query.language) request = request.eq('exercises.language_slug', query.language);
	if (query.framework) request = request.eq('exercises.framework_slug', query.framework);
	if (query.concept) request = request.eq('exercises.concept_slug', query.concept);
	if (query.category) request = request.eq('exercises.category', query.category);
	if (query.type) request = request.eq('exercises.type', query.type);
	if (query.difficulty) request = request.eq('exercises.difficulty', query.difficulty);

	const ascending = query.order === 'asc';
	const sort = query.sort ?? 'created_at';
	request =
		sort === 'title'
			? request.order('title', { ascending })
			: request.order(sort, { ascending, referencedTable: 'exercises' });
	request = request.order('exercise_id').range(offset, offset + limit - 1);

	const { data, count, error } = await request;
	if (error) throw error;
	const exercises = data.map((row) => {
		const { exercises: ex, ...translation } = row as unknown as { exercises: Omit<DetailRow, 'exercise_translations' | 'hints'> } & DetailRow['exercise_translations'][number];
		return toDTO({ ...ex, exercise_translations: [translation], hints: [] }, false);
	});
	return { exercises, total: count ?? exercises.length, limit, offset };
}

export async function getExercise(id: string): Promise<AdminExerciseDTO> {
	const { data, error } = await getServiceClient().from('exercises').select(DETAIL_COLUMNS).eq('id', id).maybeSingle();
	if (error) throw error;
	if (!data) throw new AdminError(404, 'not_found', 'Ejercicio no encontrado.');
	return toDTO(data as unknown as DetailRow, true);
}

// ------------------------------------------------------------------------------ validation

interface ValidInput {
	slug: string;
	languageSlug: string;
	frameworkSlug: string | null;
	conceptSlug: string | null;
	category: string;
	type: ExerciseType;
	difficulty: number;
	title: string;
	context: string | null;
	objective: string;
	prompt: string;
	code: string | null;
	options: string[] | null;
	correctOption: number | null;
	acceptedAnswers: string[] | null;
	hints: string[] | undefined;
}

function invalid(field: string, message: string): AdminError {
	return new AdminError(400, 'invalid_input', message, field);
}

function required(value: unknown, field: string, max = 5000): string {
	if (typeof value !== 'string' || value.trim() === '') throw invalid(field, `"${field}" es obligatorio.`);
	if (value.length > max) throw invalid(field, `"${field}" admite hasta ${max} caracteres.`);
	return value.trim();
}

/** Optional text: `null`/empty → `null`. */
function optional(value: unknown, field: string, max = 20000): string | null {
	if (value === null || value === undefined || value === '') return null;
	if (typeof value !== 'string') throw invalid(field, `"${field}" debe ser texto.`);
	if (value.length > max) throw invalid(field, `"${field}" admite hasta ${max} caracteres.`);
	return value;
}

function stringList(value: unknown, field: string): string[] {
	if (!Array.isArray(value) || !value.every((item) => typeof item === 'string' && item.trim() !== '')) {
		throw invalid(field, `"${field}" debe ser una lista de textos no vacíos.`);
	}
	return value.map((item: string) => item.trim());
}

function validate(raw: Record<string, unknown>): ValidInput {
	const slug = required(raw.slug, 'slug', 100);
	if (!SLUG.test(slug)) throw invalid('slug', '"slug" debe estar en minúsculas y con guiones (kebab-case).');
	const type = raw.type;
	if (typeof type !== 'string' || !TYPES.includes(type as ExerciseType)) {
		throw invalid('type', `"type" debe ser uno de: ${TYPES.join(', ')}.`);
	}
	const difficulty = raw.difficulty;
	if (typeof difficulty !== 'number' || !Number.isInteger(difficulty) || difficulty < 1 || difficulty > 10) {
		throw invalid('difficulty', '"difficulty" debe ser un entero entre 1 y 10.');
	}

	let options: string[] | null = null;
	let correctOption: number | null = null;
	let acceptedAnswers: string[] | null = null;
	if (type === 'multiple_choice') {
		options = stringList(raw.options, 'options');
		if (options.length < 2) throw invalid('options', 'Las opciones deben ser al menos 2.');
		const c = raw.correctOption;
		if (typeof c !== 'number' || !Number.isInteger(c) || c < 0 || c >= options.length) {
			throw invalid('correctOption', '"correctOption" debe ser un índice válido de "options".');
		}
		correctOption = c;
	} else {
		acceptedAnswers = stringList(raw.acceptedAnswers, 'acceptedAnswers');
		if (acceptedAnswers.length < 1) throw invalid('acceptedAnswers', 'Indica al menos una respuesta aceptada.');
	}

	let hints: string[] | undefined;
	if (raw.hints !== undefined) {
		if (!Array.isArray(raw.hints)) throw invalid('hints', '"hints" debe ser una lista.');
		hints = raw.hints.map((hint: unknown, i: number) => {
			const text = (hint as { text?: unknown } | null)?.text;
			return required(text, `hints[${i}].text`, 2000);
		});
	}

	return {
		slug,
		languageSlug: required(raw.languageSlug, 'languageSlug', 100),
		frameworkSlug: optional(raw.frameworkSlug, 'frameworkSlug', 100),
		conceptSlug: optional(raw.conceptSlug, 'conceptSlug', 100),
		category: required(raw.category, 'category', 100),
		type: type as ExerciseType,
		difficulty,
		title: required(raw.title, 'title', 200),
		context: optional(raw.context, 'context'),
		objective: required(raw.objective, 'objective'),
		prompt: required(raw.prompt, 'prompt'),
		code: optional(raw.code, 'code'),
		options,
		correctOption,
		acceptedAnswers,
		hints,
	};
}

/** Postgres errors that mean "bad input" for the client. */
function mapDbError(error: { code?: string; message: string; details?: string }): AdminError | null {
	if (error.code === '23505') return new AdminError(409, 'slug_taken', 'Ya existe un ejercicio con ese slug.', 'slug');
	if (error.code === '23503') return invalid('category', 'La categoría no existe.');
	if (error.code === '23514') return invalid('body', 'Algún valor no cumple las reglas del esquema.');
	return null;
}

// ------------------------------------------------------------------------------ writes

/** Writes translation, answer and (if given) hints of an exercise that already has its row. */
async function writeDetails(id: string, input: ValidInput): Promise<void> {
	const supabase = getServiceClient();
	const { error: tError } = await supabase.from('exercise_translations').upsert({
		exercise_id: id,
		locale: LOCALE,
		title: input.title,
		context: input.context,
		objective: input.objective,
		prompt: input.prompt,
		code: input.code,
		options: input.options,
	});
	if (tError) throw tError;

	const { error: aError } = await supabase.from('exercise_answers').upsert({
		exercise_id: id,
		correct_option: input.correctOption,
		accepted_answers: input.acceptedAnswers,
	});
	if (aError) throw aError;

	if (input.hints === undefined) return;
	// Sync by position so the hints the users already unlocked are kept: update in place,
	// add the new ones, remove the surplus.
	const { data: existing, error: hError } = await supabase.from('hints').select('id, position').eq('exercise_id', id);
	if (hError) throw hError;
	const byPosition = new Map(existing.map((h) => [h.position, h.id]));
	for (const [index, text] of input.hints.entries()) {
		const position = index + 1;
		let hintId = byPosition.get(position);
		if (!hintId) {
			const { data, error } = await supabase.from('hints').insert({ exercise_id: id, position }).select('id').single();
			if (error) throw error;
			hintId = data.id;
		}
		const { error } = await supabase.from('hint_translations').upsert({ hint_id: hintId, locale: LOCALE, text });
		if (error) throw error;
	}
	const surplus = existing.filter((h) => h.position > input.hints!.length).map((h) => h.id);
	if (surplus.length > 0) {
		const { error } = await supabase.from('hints').delete().in('id', surplus);
		if (error) throw error;
	}
}

function metadataOf(input: ValidInput) {
	return {
		slug: input.slug,
		language_slug: input.languageSlug,
		framework_slug: input.frameworkSlug,
		concept_slug: input.conceptSlug,
		category: input.category,
		type: input.type,
		difficulty: input.difficulty,
	};
}

export async function createExercise(body: Record<string, unknown>): Promise<AdminExerciseDTO> {
	const input = validate(body);
	const supabase = getServiceClient();
	const { data, error } = await supabase.from('exercises').insert(metadataOf(input)).select('id').single();
	if (error) throw mapDbError(error) ?? error;
	try {
		await writeDetails(data.id, input);
	} catch (failure) {
		await supabase.from('exercises').delete().eq('id', data.id); // cascades to the rest
		throw mapDbError(failure as { message: string }) ?? failure;
	}
	return getExercise(data.id);
}

/** Merges `patch` over the current exercise and validates the result as a whole. */
export async function updateExercise(id: string, patch: Record<string, unknown>): Promise<AdminExerciseDTO> {
	const current = await getExercise(id);
	const merged: Record<string, unknown> = {
		slug: current.slug,
		languageSlug: current.languageSlug,
		frameworkSlug: current.frameworkSlug ?? null,
		conceptSlug: current.conceptSlug ?? null,
		category: current.category,
		type: current.type,
		difficulty: current.difficulty,
		title: current.title,
		context: current.context ?? null,
		objective: current.objective,
		prompt: current.prompt,
		code: current.code ?? null,
		options: current.options,
		correctOption: current.correctOption,
		acceptedAnswers: current.acceptedAnswers,
	};
	for (const [key, value] of Object.entries(patch)) {
		if (value !== undefined && key in merged) merged[key] = value;
		if (key === 'hints') merged.hints = value;
	}
	const input = validate(merged);

	const { error } = await getServiceClient().from('exercises').update(metadataOf(input)).eq('id', id);
	if (error) throw mapDbError(error) ?? error;
	try {
		await writeDetails(id, input);
	} catch (failure) {
		throw mapDbError(failure as { message: string }) ?? failure;
	}
	return getExercise(id);
}

export async function deleteExercise(id: string): Promise<void> {
	const { data, error } = await getServiceClient().from('exercises').delete().eq('id', id).select('id');
	if (error) throw error;
	if (data.length === 0) throw new AdminError(404, 'not_found', 'Ejercicio no encontrado.');
}

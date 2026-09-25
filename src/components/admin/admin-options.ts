import type { ExerciseType } from "@/types/api";

/**
 * Catalog options the exercises page passes to its island (built on the server from
 * `src/data/*` and `exercise_categories`), plus the labels shared by the panel. Isomorphic.
 */
export interface AdminOption {
	slug: string;
	name: string;
}

export interface AdminFrameworkOption extends AdminOption {
	/** Slug of its language. */
	language: string;
}

export interface AdminExerciseCatalog {
	languages: AdminOption[];
	frameworks: AdminFrameworkOption[];
	/** Concept slugs of the documentation, by language slug and by `language/framework`. */
	concepts: Record<string, AdminOption[]>;
	/** Existing `exercise_categories` with their Spanish name. */
	categories: AdminOption[];
}

export const EXERCISE_TYPES: readonly ExerciseType[] = ["multiple_choice", "fill_blank", "code_output"];

export const TYPE_LABELS: Record<ExerciseType, string> = {
	multiple_choice: "Opción múltiple",
	fill_blank: "Completar hueco",
	code_output: "Salida de código",
};

export const TYPE_HINTS: Record<ExerciseType, string> = {
	multiple_choice: "La persona elige una de varias opciones.",
	fill_blank: "Escribe la palabra o expresión que falta.",
	code_output: "Escribe lo que imprime el código.",
};

/** "Hola, ¿qué tal?" → "hola-que-tal" (kebab-case, as the server requires). */
export function slugify(text: string): string {
	return text
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 100)
		.replace(/-+$/g, "");
}

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

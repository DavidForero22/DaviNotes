import type { AdminExerciseCatalog, AdminOption } from '@/components/admin/admin-options';
import { frameworks } from '@/data/frameworks';
import { languages } from '@/data/languages';
import type { createSupabaseServerClient } from '@/lib/server/supabase';
import { getAllLanguageItems } from '@/utils/utils';

/**
 * Server-only data of the exercises admin page (C8): the documentation catalog (languages,
 * frameworks and their concept slugs, for the suggestions of the form) and the existing
 * exercise categories with their Spanish name (public read, RLS).
 */
type Client = ReturnType<typeof createSupabaseServerClient>;

export async function loadExerciseCatalog(supabase: Client): Promise<AdminExerciseCatalog> {
	const items = getAllLanguageItems(languages);
	const concepts: Record<string, AdminOption[]> = {};
	for (const item of items) {
		concepts[item.slug] = item.concepts.map((c) => ({ slug: c.slug, name: c.title.es }));
	}
	for (const f of frameworks) {
		concepts[`${f.language}/${f.slug}`] = f.concepts.map((c) => ({ slug: c.slug, name: c.title.es }));
	}

	const { data, error } = await supabase
		.from('exercise_categories')
		.select('slug, sort_order, exercise_category_translations ( locale, name )')
		.order('sort_order');
	if (error) throw error;
	const categories = data.map((row) => ({
		slug: row.slug,
		name: row.exercise_category_translations.find((t) => t.locale === 'es')?.name ?? row.slug,
	}));

	return {
		languages: items.map((item) => ({ slug: item.slug, name: item.title })).sort((a, b) => a.name.localeCompare(b.name, 'es')),
		frameworks: frameworks.map((f) => ({ slug: f.slug, name: f.name, language: f.language })),
		concepts,
		categories,
	};
}

/**
 * Content consistency check (B9).
 *
 *   node scripts/check-content.ts        (npm run check:content)
 *
 * 1. Every concept in `src/data/` (languages, their installation guide and frameworks) has its
 *    Markdown file in `src/content/docs/<locale>/` for every locale.
 * 2. There are no orphan `.md` files (files that no concept points to).
 * 3. The catalog itself is coherent (no duplicate slugs, every framework has a parent language).
 *
 * It also exports `validateExerciseRefs`, which checks the composite key of an exercise
 * (`languageSlug` + optional `frameworkSlug` + optional `conceptSlug`, T4) against the catalog.
 * In Phase C it will be fed with the rows of the `exercises` table.
 *
 * Node 24 runs this file directly (type stripping), so it only uses erasable TypeScript syntax
 * (no `enum`, `namespace` or parameter properties) and relative imports with the `.ts` extension:
 * the `@/` alias only exists inside Astro/Vite.
 */
import { readdirSync } from "node:fs";
import process from "node:process";
import { locales, type Lang } from "../src/i18n/config.ts";
import { INSTALLATION_GUIDE_SLUG, languages } from "../src/data/languages.ts";
import { frameworks } from "../src/data/frameworks.ts";

/* ------------------------------------------------------------------ */
/* Catalog                                                            */
/* ------------------------------------------------------------------ */

/** Composite key that links an exercise to the documentation (T4). */
export interface ExerciseRef {
	languageSlug: string;
	frameworkSlug?: string | null;
	conceptSlug?: string | null;
	/** Optional identifier of the exercise, only used to make messages readable. */
	slug?: string;
}

export interface ContentIssue {
	message: string;
}

export interface ExerciseRefIssue extends ContentIssue {
	/** Position of the ref in the array passed to `validateExerciseRefs`. */
	index: number;
	ref: ExerciseRef;
}

interface CatalogLanguage {
	/** Concept slugs of the language, including the installation guide. */
	concepts: Set<string>;
	/** Framework slug -> its concept slugs. */
	frameworks: Map<string, Set<string>>;
}

/** Language slug -> concepts and frameworks. Built once from `src/data/`. */
function buildCatalog(): Map<string, CatalogLanguage> {
	const catalog = new Map<string, CatalogLanguage>();
	for (const category of languages) {
		for (const item of category.items) {
			catalog.set(item.slug, {
				concepts: new Set([...item.concepts.map((c) => c.slug), INSTALLATION_GUIDE_SLUG]),
				frameworks: new Map(),
			});
		}
	}
	for (const framework of frameworks) {
		catalog
			.get(framework.language)
			?.frameworks.set(framework.slug, new Set(framework.concepts.map((c) => c.slug)));
	}
	return catalog;
}

const catalog = buildCatalog();

/** Checks the catalog data itself: duplicate slugs and frameworks without a parent language. */
export function checkCatalog(): ContentIssue[] {
	const issues: ContentIssue[] = [];
	const seenLanguages = new Set<string>();

	for (const category of languages) {
		for (const item of category.items) {
			if (seenLanguages.has(item.slug)) issues.push({ message: `Duplicate language slug "${item.slug}".` });
			seenLanguages.add(item.slug);

			const seenConcepts = new Set<string>();
			for (const concept of item.concepts) {
				if (seenConcepts.has(concept.slug) || concept.slug === INSTALLATION_GUIDE_SLUG) {
					issues.push({ message: `Duplicate concept slug "${item.slug}/${concept.slug}".` });
				}
				seenConcepts.add(concept.slug);
			}
		}
	}

	const seenFrameworks = new Set<string>();
	for (const framework of frameworks) {
		const id = `${framework.language}/${framework.slug}`;
		const parent = catalog.get(framework.language);
		if (!parent) {
			issues.push({ message: `Framework "${framework.slug}" points to unknown language "${framework.language}".` });
		} else if (parent.concepts.has(framework.slug)) {
			issues.push({ message: `Framework slug "${id}" collides with a concept of "${framework.language}".` });
		}
		if (seenFrameworks.has(id)) issues.push({ message: `Duplicate framework slug "${id}".` });
		seenFrameworks.add(id);

		const seenConcepts = new Set<string>();
		for (const concept of framework.concepts) {
			if (seenConcepts.has(concept.slug)) issues.push({ message: `Duplicate concept slug "${id}/${concept.slug}".` });
			seenConcepts.add(concept.slug);
		}
	}

	return issues;
}

/**
 * Validates the composite key of each exercise against the catalog (T4):
 * - `languageSlug` must be a language of `src/data/languages.ts`;
 * - `frameworkSlug`, if present, must be a framework of that language;
 * - `conceptSlug`, if present, must be a concept of the framework (when given) or of the language.
 *
 * Returns one issue per invalid ref; an empty array means every ref is valid.
 */
export function validateExerciseRefs(refs: readonly ExerciseRef[]): ExerciseRefIssue[] {
	const issues: ExerciseRefIssue[] = [];

	refs.forEach((ref, index) => {
		const label = ref.slug ? `Exercise "${ref.slug}"` : `Exercise #${index}`;
		const fail = (message: string) => issues.push({ index, ref, message: `${label}: ${message}` });

		const language = catalog.get(ref.languageSlug);
		if (!language) {
			fail(`unknown languageSlug "${ref.languageSlug}".`);
			return;
		}

		let concepts = language.concepts;
		let scope = ref.languageSlug;
		if (ref.frameworkSlug) {
			const frameworkConcepts = language.frameworks.get(ref.frameworkSlug);
			if (!frameworkConcepts) {
				fail(`unknown frameworkSlug "${ref.frameworkSlug}" for language "${ref.languageSlug}".`);
				return;
			}
			concepts = frameworkConcepts;
			scope = `${ref.languageSlug}/${ref.frameworkSlug}`;
		}

		if (ref.conceptSlug && !concepts.has(ref.conceptSlug)) {
			fail(`unknown conceptSlug "${ref.conceptSlug}" in "${scope}".`);
		}
	});

	return issues;
}

/* ------------------------------------------------------------------ */
/* Docs coverage                                                      */
/* ------------------------------------------------------------------ */

const DOCS_ROOT = new URL("../src/content/docs/", import.meta.url);

/** Every `.md` path the catalog expects, relative to `src/content/docs/<locale>/`, without extension. */
export function expectedDocPaths(): string[] {
	const paths: string[] = [];
	for (const [languageSlug, language] of catalog) {
		for (const concept of language.concepts) paths.push(`${languageSlug}/${concept}`);
		for (const [frameworkSlug, concepts] of language.frameworks) {
			for (const concept of concepts) paths.push(`${languageSlug}/${frameworkSlug}/${concept}`);
		}
	}
	return paths;
}

/** Lists every `.md` under `src/content/docs/`, as `<locale>/<path>` without extension, with `/` separators. */
function listDocFiles(): string[] {
	return readdirSync(DOCS_ROOT, { recursive: true, encoding: "utf8" })
		.map((file) => file.replaceAll("\\", "/"))
		.filter((file) => file.endsWith(".md"))
		.map((file) => file.slice(0, -".md".length));
}

/** Missing translations and orphan files. */
export function checkDocsCoverage(): { issues: ContentIssue[]; filesPerLocale: Record<string, number> } {
	const issues: ContentIssue[] = [];
	const langs = Object.keys(locales) as Lang[];
	const expected = expectedDocPaths();
	const actual = new Set(listDocFiles());

	const filesPerLocale: Record<string, number> = {};
	for (const file of actual) {
		const locale = file.split("/")[0];
		filesPerLocale[locale] = (filesPerLocale[locale] ?? 0) + 1;
	}

	const expectedFiles = new Set<string>();
	for (const lang of langs) {
		for (const path of expected) {
			const file = `${lang}/${path}`;
			expectedFiles.add(file);
			if (!actual.has(file)) issues.push({ message: `Missing: src/content/docs/${file}.md` });
		}
	}

	for (const file of [...actual].sort()) {
		if (!expectedFiles.has(file)) {
			issues.push({ message: `Orphan (no concept in src/data/ points to it): src/content/docs/${file}.md` });
		}
	}

	return { issues, filesPerLocale };
}

/* ------------------------------------------------------------------ */
/* CLI                                                                */
/* ------------------------------------------------------------------ */

function main(): void {
	const catalogIssues = checkCatalog();
	const { issues: docsIssues, filesPerLocale } = checkDocsCoverage();
	const issues = [...catalogIssues, ...docsIssues];

	const expected = expectedDocPaths().length;
	const counts = Object.keys(locales)
		.map((lang) => `${lang} ${filesPerLocale[lang] ?? 0}/${expected}`)
		.join(", ");

	if (issues.length === 0) {
		console.log(`check:content OK. ${catalog.size} languages, ${frameworks.length} frameworks. Docs: ${counts}.`);
		return;
	}

	console.error(`check:content found ${issues.length} problem(s). Docs: ${counts}.`);
	for (const issue of issues) console.error(`  - ${issue.message}`);
	process.exitCode = 1;
}

// Only run when executed directly, not when imported (e.g. by the Phase C exercise check).
if (import.meta.main) main();

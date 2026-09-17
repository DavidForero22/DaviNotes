import { getCollection } from "astro:content";
import { INSTALLATION_GUIDE_SLUG, type LanguageItem } from "../data/languages";
import { frameworks } from "../data/frameworks";
import { defaultLang, type Lang } from "../i18n/ui";
import { pick, useTranslations } from "../i18n/utils";
import { CELL_SEPARATOR } from "./search-shared";
import { getFrameworksForLanguage, languageHref } from "./utils";

/**
 * A searchable part of a guide: the text under one heading, until the next heading.
 */
export interface SearchSection {
	/** Title of the guide the section belongs to, e.g. "PHP Fundamentals". */
	page: string;
	/** URL of the guide, already localized. */
	href: string;
	/** Heading of the section, e.g. "2. Variables and Constants". */
	heading: string;
	/** Id of the heading, used to link directly to the section. */
	slug: string;
	/** Paragraphs, list items and table rows of the section as plain text (code blocks excluded). */
	blocks: string[];
}


const NAMED_ENTITIES: Record<string, string> = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: '"',
	apos: "'",
	nbsp: " ",
	copy: "©",
	rarr: "→",
};

function decodeEntities(text: string): string {
	return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
		if (code[0] !== "#") return NAMED_ENTITIES[code.toLowerCase()] ?? entity;
		const value = code[1] === "x" || code[1] === "X" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
		return String.fromCodePoint(value);
	});
}

/** Removes the tags of an HTML fragment and returns its readable text on a single line. */
function stripTags(html: string): string {
	return decodeEntities(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

/**
 * Splits an HTML fragment into blocks of text: one per paragraph, list item, quote or table row.
 */
function toBlocks(html: string): string[] {
	const BLOCK_TAGS = "p|li|ul|ol|table|thead|tbody|tr|blockquote|div|br|hr|img";

	return html
		.replace(/<thead\b[\s\S]*?<\/thead>/gi, "") // Column titles ("Type · Description") add noise to the results
		.replace(/<\/t[dh]>/gi, CELL_SEPARATOR)
		.replace(new RegExp(`<\\/?(${BLOCK_TAGS})\\b[^>]*>`, "gi"), "\n")
		.split("\n")
		.map((block) => stripTags(block).replace(/^[\s·]+|[\s·]+$/g, ""))
		.filter(Boolean);
}

/**
 * Splits the rendered HTML of a guide into sections, one per heading.
 * The rendered HTML is used (instead of the Markdown source) so the indexed text is exactly
 * what the visitor reads, including typographic quotes, and the ids match the real headings.
 * Code blocks and the table of contents are skipped because they only add noise to the results.
 */
function splitIntoSections(html: string) {
	const withoutCode = html.replace(/<pre\b[\s\S]*?<\/pre>/gi, "");
	const parts = withoutCode.split(/(<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>)/i);

	const sections: { heading: string; slug: string; blocks: string[]; isTableOfContents: boolean }[] = [];

	for (const part of parts) {
		const heading = part.match(/^<h[1-6]\b([^>]*)>([\s\S]*?)<\/h[1-6]>$/i);

		if (heading) {
			const slug = heading[1].match(/\bid="([^"]*)"/)?.[1] ?? "";
			sections.push({ heading: stripTags(heading[2]), slug, blocks: [], isTableOfContents: false });
			continue;
		}

		const current = sections[sections.length - 1];
		if (!current) continue;

		if (part.includes('id="content-table"')) current.isTableOfContents = true;
		current.blocks.push(...toBlocks(part));
	}

	return sections
		.filter((section) => !section.isTableOfContents)
		.map(({ heading, slug, blocks }) => ({ heading, slug, blocks }));
}

/**
 * Builds the search index of one language (e.g. PHP) in the visitor's language.
 * It includes every lesson, the installation guide, and every lesson of that language's
 * frameworks (e.g. Laravel), falling back to English when a translation is missing.
 */
export async function buildSearchIndex(item: LanguageItem, lang: Lang): Promise<SearchSection[]> {
	const t = useTranslations(lang);
	const docs = await getCollection("docs");

	const languagePages = [
		...item.concepts.map((concept) => ({ slug: concept.slug, title: pick(concept.title, lang) })),
		{ slug: INSTALLATION_GUIDE_SLUG, title: t("index.installGuide") },
	];

	const frameworkPages = getFrameworksForLanguage(frameworks, item.slug).flatMap((framework) =>
		framework.concepts.map((concept) => ({
			slug: `${framework.slug}/${concept.slug}`,
			title: `${framework.name} — ${pick(concept.title, lang)}`,
		})),
	);

	const pages = [...languagePages, ...frameworkPages];

	return pages.flatMap((page) => {
		const id = `${item.slug}/${page.slug}`;
		const entry =
			docs.find((doc) => doc.id === `${lang}/${id}`) ?? docs.find((doc) => doc.id === `${defaultLang}/${id}`);
		const html = entry?.rendered?.html;
		if (!html) return [];

		const href = languageHref(item, lang, page.slug);
		return splitIntoSections(html).map((section) => ({ page: page.title, href, ...section }));
	});
}

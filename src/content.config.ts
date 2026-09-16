import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Every guide lives in `src/content/docs/<locale>/<technology>/<page>.md`.
 * The entry id mirrors that path (e.g. "es/java/basic-syntax"), which lets the
 * router find the translation of a page just by swapping the locale prefix.
 */
const docs = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/docs" }),
	schema: z.object({
		title: z.string(),
	}),
});

export const collections = { docs };

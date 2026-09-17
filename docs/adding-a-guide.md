# Adding or Updating a Language Guide

This document explains how to add a new guide (topic/concept) to an existing technology, or update an existing one, in DaviNotes.

> Looking to add a brand new technology (e.g. a new language card on the home page) instead of a topic inside an existing one? The same files apply, but you will also need to add a new `LanguageItem` entry to `src/data/languages.ts` (see step 1) instead of just a new `Concept`. Looking to add a framework built on top of an existing language (e.g. Laravel for PHP) instead? See ["Adding a new framework"](#adding-a-new-framework-optional) — frameworks live in a separate file, `src/data/frameworks.ts`.

## Overview

Each documentation page ("guide") is made of two things:

1. **Metadata** in [`src/data/languages.ts`](../src/data/languages.ts) — the title, description and `slug` of the guide, nested under its technology.
2. **Content** as a Markdown file in `src/content/docs/<locale>/<technology>/<slug>.md`, duplicated once per supported locale (`en`, `es`, `fr`).

The `slug` defined in `languages.ts` must match the Markdown file name exactly, since it is what the router (`src/pages/[...path].astro`) uses to resolve `/<technology>/<slug>` to its content file.

---

## Adding a new guide

### 1. Register the concept in `languages.ts`

Open [`src/data/languages.ts`](../src/data/languages.ts) and find the `LanguageItem` for the technology you are documenting (e.g. `java`, `python`, `react`...). Add a new entry to its `concepts` array:

```typescript
{
    title: { en: "Collections", es: "Colecciones", fr: "Collections" },
    desc: {
        en: "Arrays, stacks, queues, ArrayList, HashMap and the Stream API.",
        es: "Arrays, pilas, colas, ArrayList, HashMap y la API Stream.",
        fr: "Tableaux, piles, files, ArrayList, HashMap et l'API Stream.",
    },
    slug: "collections",
},
```

- `title` and `desc` must be filled in **all three locales** (`en`, `es`, `fr`) — these strings power the sidebar and the language landing page directly, they are not translated automatically.
- `slug` should be a short, kebab-case identifier. It will become part of the URL (`/<technology>/<slug>`) and must match the Markdown file name in the next step.

### 2. Create the Markdown file for each locale

Create one file per locale, all sharing the same file name:

```
src/content/docs/en/<technology>/<slug>.md
src/content/docs/es/<technology>/<slug>.md
src/content/docs/fr/<technology>/<slug>.md
```

For example, adding a `collections` guide under `java` requires:

```
src/content/docs/en/java/collections.md
src/content/docs/es/java/collections.md
src/content/docs/fr/java/collections.md
```

Each file only needs a `title` in its frontmatter, followed by the guide content in Markdown:

```markdown
---
title: "Collections in Java"
---

# Collections

Content goes here...
```

The `title` is validated by the `docs` collection schema in [`src/content.config.ts`](../src/content.config.ts) and is only used for metadata (e.g. page `<title>`); it does not need to match the `title` used in `languages.ts`.

> **If a translation isn't ready yet:** you can skip the `es` and/or `fr` file for now. The site falls back to the English version and shows a notice to the reader. Avoid leaving the `en` file missing, since English is the default fallback for every locale.

### 3. Verify locally

Run the dev server and open the new guide in the browser:

```bash
npm run dev
```

Check that:

- The new topic appears in the technology's landing page and in the sidebar, with the correct title/description in each locale you filled in.
- The guide renders correctly at `/<technology>/<slug>` (and `/es/<technology>/<slug>`, `/fr/<technology>/<slug>` if translated).
- Internal links, headings and the table of contents (if you added one) work as expected.
- The guide shows up in the language's search results (`DocSearch`), since the search index is generated at build time from the rendered content.

---

## Updating an existing guide

1. Locate the Markdown file(s) for the guide under `src/content/docs/<locale>/<technology>/<slug>.md`.
2. Edit the content directly. If the change affects the page title, update the `title` frontmatter field.
3. If you change only one locale, remember the other locales will now be out of sync — update them too, or leave them as-is if the change is English-only and the other locales still make sense as a general translation.
4. If you rename the topic (not just the file content), also update the corresponding `title`/`desc` fields in `src/data/languages.ts`. Only rename the `slug` (and the file names) if you are prepared to update every locale's file name and are fine with the guide's URL changing.
5. Re-run `npm run dev` and re-check the guide, its sidebar entry and its search result as described above.

---

## Adding a brand new technology (optional)

If the goal is to introduce a technology that doesn't exist yet (e.g. a new language card on the home page), you additionally need to:

1. Add a new `LanguageItem` object to the relevant `Category` (or a new `Category`) in `src/data/languages.ts`, filling in `title`, `desc`, `intro`, `color`, `theme`, `slug`, `icon`, `difficulty` and `prerequisites`. A `Category`'s own `category` label is `Localized` too (`{ en, es, fr }`), since it is shown translated in the sidebar and on the home page.
2. Create the technology's folder under `src/content/docs/<locale>/<new-technology>/` for each locale.
3. Every technology conventionally includes an `installation-guide.md` guide, whose slug is exported as `INSTALLATION_GUIDE_SLUG` in `languages.ts` — add it as your first concept for consistency with the rest of the site.
4. Follow the "Adding a new guide" steps above for each topic you want to document under the new technology.

---

## Adding a new framework (optional)

A **framework** (e.g. Laravel for PHP) is a library built on top of an existing language, documented in its own mini learning path nested under that language. Frameworks are modeled separately from languages, in [`src/data/frameworks.ts`](../src/data/frameworks.ts), so adding one never touches `languages.ts`. Each language with at least one framework automatically gets a collapsible **"Frameworks"** section on its landing page, right below "Key Concepts", and a "discover frameworks" prompt at the end of its own last guide instead of a "next lesson" link — nothing else needs to be wired up by hand.

### 1. Register the framework in `frameworks.ts`

Open [`src/data/frameworks.ts`](../src/data/frameworks.ts) and add a new entry to the `frameworks` array:

```typescript
{
    language: "php", // Slug of the parent LanguageItem this framework belongs to
    name: "Laravel", // Proper noun, not localized
    desc: {
        en: "The most popular PHP framework, for building elegant, full-featured web applications fast.",
        es: "El framework de PHP más popular, para crear aplicaciones web elegantes y completas con rapidez.",
        fr: "Le framework PHP le plus populaire, pour créer rapidement des applications web élégantes et complètes.",
    },
    difficulty: "Intermediate", // Same DifficultyLevel type used by languages
    slug: "laravel", // URL segment, nested under its language: /php/laravel
    concepts: [ /* same shape as a LanguageItem's concepts */ ],
},
```

- `language` must match an existing `LanguageItem.slug` from `languages.ts` — this is the only link between the two files.
- `concepts` reuses the exact same `Concept` shape (`title`, `desc`, `slug`) that languages use, and each one becomes a full guide with its own "next lesson" flow, scoped to the framework (the framework's last concept has no next lesson, and frameworks have no installation guide of their own).

### 2. Create the Markdown files

Framework guides are nested one level deeper than a language's own guides, under the language's folder:

```
src/content/docs/en/<language-slug>/<framework-slug>/<concept-slug>.md
src/content/docs/es/<language-slug>/<framework-slug>/<concept-slug>.md
src/content/docs/fr/<language-slug>/<framework-slug>/<concept-slug>.md
```

For example, a `routing` guide under Laravel (nested under `php`) requires:

```
src/content/docs/en/php/laravel/routing.md
src/content/docs/es/php/laravel/routing.md
src/content/docs/fr/php/laravel/routing.md
```

Each file follows the same convention as any other guide (a `title` in its frontmatter, then Markdown content); see step 2 of "Adding a new guide" above. Link to the framework's own official documentation somewhere in the content, using the site's external-link style: `<a href="https://laravel.com/docs" class="doc-link" target="_blank" rel="noopener noreferrer" title="...">official documentation</a>`.

### 3. Verify locally

Run `npm run dev` and check that:

- The technology's landing page (`/<language-slug>`) shows a "Frameworks" section with a collapsible row for the framework, showing its name, short description and difficulty; expanding it lists its concepts, linking to `/<language-slug>/<framework-slug>/<concept-slug>`.
- Each framework guide renders at that nested URL, with a breadcrumb of `Home / <Language> / <Framework> / <Concept>`, and links to the next lesson of the framework's own path.
- The language's very last guide (its last `concepts` entry) now shows a "discover frameworks" prompt instead of a "next lesson" link, pointing back to the `#frameworks` section of the landing page.
- The framework's content shows up in that language's search results (`DocSearch`), alongside the language's own guides.

A framework does **not** get its own landing page (there is no `/<language-slug>/<framework-slug>` route) — the collapsible row on its language's page is the only entry point to it, besides direct links to its guides.

---

## Adding a new locale (optional)

Adding a guide is per-locale, but adding an entirely new locale to the site is a separate, larger change. See the "Adding a new language" section of the [README](../README.md) for the full list of files to update (`src/i18n/ui.ts`, `astro.config.mjs`, `src/data/languages.ts`, and creating the new locale folder under `src/content/docs/`).

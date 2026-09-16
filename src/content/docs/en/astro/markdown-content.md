---
title: "Markdown Content in Astro"
---

# Markdown Content

**Markdown** (`.md`) is a simple way of writing formatted text using plain symbols: `#` for headings, `**bold**` for bold text, `-` for lists, and so on. It is much easier to write than HTML, which makes it ideal for articles and documentation.

Astro has excellent Markdown support. You can turn Markdown files into pages directly, or organize large amounts of content with **Content Collections**. This makes Astro a great choice for blogs, documentation sites and portfolios, without needing a database or a content management system (CMS). In fact, the guides on this website are written in Markdown and managed with a content collection.

---

## Table of Contents

<div id="content-table">

- [1. Markdown Pages](#1-markdown-pages "Creating routes from .md files")
- [2. Frontmatter & Layouts](#2-frontmatter--layouts "Adding metadata and styling")
- [3. Content Collections](#3-content-collections "Type-safe content management")
  - [3.1 Configuration](#31-configuration "Defining collections in content.config.ts")
  - [3.2 Querying Content](#32-querying-content "Fetching data with getCollection")

</div>

---

## 1. Markdown Pages

The simplest way to create a page is to add a `.md` file to the `src/pages/` folder. Just like `.astro` files, its location determines its URL.

```markdown

    <!-- File: src/pages/welcome.md -->
    
    # Hello World
    
    This is my first **Markdown** page in Astro.
    It will be available at `mysite.com/welcome`.


```

Astro supports GitHub Flavored Markdown, a popular version of Markdown that also includes tables, task lists and code blocks.

---

## 2. Frontmatter & Layouts

Markdown files can start with a **frontmatter** block: a section between two lines of `---` at the very top of the file, written in YAML format (`key: value`). It stores information *about* the page, such as its title, date or author.

The special `layout` property tells Astro which layout component should wrap the Markdown content (headers, menus, styles...).

```markdown

    ---
    layout: ../layouts/BlogPostLayout.astro
    title: "My First Post"
    author: "Astro Learner"
    date: "2025-01-01"
    ---
    
    # Introduction
    
    This content will be inserted into the <slot /> of BlogPostLayout.


```

**Accessing Frontmatter in Layouts**:

The layout receives the frontmatter data through `Astro.props.frontmatter`.

```astro

    ---
    // src/layouts/BlogPostLayout.astro
    const { frontmatter } = Astro.props;
    ---
    
    <html>
      <head><title>{frontmatter.title}</title></head>
      <body>
        <h1>{frontmatter.title}</h1>
        <p>Written by: {frontmatter.author}</p>
        <slot />
      </body>
    </html>


```

**Common mistake:** writing the layout path from the project root instead of from the Markdown file. The path is *relative*: it starts from the folder where the `.md` file is located, and `../` means "go up one folder".

```markdown

    <!-- File: src/pages/blog/post.md -->

    <!-- ❌ WRONG: the path does not start from the Markdown file, so Astro cannot find the layout -->
    ---
    layout: src/layouts/BlogPostLayout.astro
    ---

    <!-- ✅ CORRECT: from src/pages/blog/, go up two folders to src/, then into layouts/ -->
    ---
    layout: ../../layouts/BlogPostLayout.astro
    ---


```

---

## 3. Content Collections

In larger projects, keeping every Markdown file in `src/pages/` quickly becomes messy. **Content Collections** let you store your Markdown files in a separate folder (for example, `src/content/`) and read them from your code as if they were a small database.

### 3.1 Configuration

Collections are defined in a file called `src/content.config.ts`. For each collection, you indicate where its files are and, optionally, a **schema**: a set of rules, written with the **Zod** library, that checks the frontmatter of every file. If a post is missing its title or has an invalid date, Astro shows a clear error when building the site.

```ts

    // src/content.config.ts
    import { defineCollection, z } from 'astro:content';
    import { glob } from 'astro/loaders';
    
    const blog = defineCollection({
      // Load every .md file inside src/content/blog
      loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
      // Rules that every frontmatter must follow
      schema: z.object({
        title: z.string(),
        pubDate: z.coerce.date(),
        draft: z.boolean().optional(),
      }),
    });
    
    export const collections = { blog };


```

### 3.2 Querying Content

To read the entries of a collection, use the `getCollection()` function. It is usually combined with a dynamic route (like `src/pages/blog/[id].astro`) to generate one page for each entry.

```astro

    ---
    // src/pages/blog/[id].astro
    import { getCollection, render } from 'astro:content';
    
    // 1. Create one page for every entry of the collection
    export async function getStaticPaths() {
      const posts = await getCollection('blog');
      return posts.map((post) => ({
        params: { id: post.id },
        props: { post },
      }));
    }
    
    // 2. Turn the Markdown of this entry into HTML
    const { post } = Astro.props;
    const { Content } = await render(post);
    ---
    
    <h1>{post.data.title}</h1>
    <Content />


```

`post.data` contains the frontmatter values, already checked by the schema, and `<Content />` displays the body of the Markdown file.

**Common mistake:** following old tutorials. Before Astro 5, the configuration file was `src/content/config.ts`, entries used `post.slug` and the content was rendered with `post.render()`. In current versions, use `src/content.config.ts`, `post.id` and `render(post)`.

```astro

    ---
    // ❌ WRONG (old API): slug and entry.render() no longer exist in collections that use loaders
    const { Content } = await post.render();
    const url = `/blog/${post.slug}`;

    // ✅ CORRECT (Astro 5+)
    import { render } from 'astro:content';
    const { Content } = await render(post);
    const url = `/blog/${post.id}`;
    ---


```

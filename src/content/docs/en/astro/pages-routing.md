---
title: "Pages & Routing in Astro"
---

# Pages & Routing

**Routing** is how a website decides which page to show for each address (URL). Astro uses **file-based routing**: the files inside the `src/pages/` folder automatically become the pages of your site, and their location in that folder determines their URL.

Other tools often require a separate configuration file listing every route. In Astro there is nothing to configure: create a file and the page exists. Pages can be written as `.astro`, `.md` (Markdown), `.mdx` or `.html` files, and `.js`/`.ts` files can create *endpoints* that return data instead of pages.

---

## Table of Contents

<div id="content-table">

- [1. File-Based Routing](#1-file-based-routing "Understanding how files map to URLs")
- [2. Static Routes](#2-static-routes "Creating standard pages")
- [3. Dynamic Routes](#3-dynamic-routes "Generating pages from data")
  - [3.1 The [param] Syntax](#31-the-param-syntax "Using brackets for dynamic segments")
  - [3.2 getStaticPaths()](#32-getstaticpaths "Defining paths for static builds")
- [4. 404 Error Page](#4-404-error-page "Handling missing pages")

</div>

---

## 1. File-Based Routing

Astro looks for supported files inside `src/pages/`. Each one automatically becomes a page of your website.

**Mapping Examples**:

- `src/pages/index.astro`  →  `mysite.com/`
- `src/pages/about.astro`  →  `mysite.com/about`
- `src/pages/blog/post.md` →  `mysite.com/blog/post`

A file named `index` represents the main page of its folder, so it does not add anything to the URL.

Files and folders whose name starts with an underscore (e.g., `_Hidden.astro`) are ignored by the router. This is useful to keep helper files next to your pages without turning them into pages.

**Common mistake:** placing a page outside `src/pages/`. Only files inside that folder become routes.

```plaintext

    ❌ WRONG: src/components/about.astro  →  no page is created
    ✅ CORRECT: src/pages/about.astro     →  mysite.com/about


```

---

## 2. Static Routes

A **static route** is a file that corresponds to exactly one page with a fixed address. It can be an Astro component, Markdown or plain HTML.

```astro

    ---
    // src/pages/contact.astro  →  mysite.com/contact
    const pageTitle = "Contact Us";
    ---
    
    <html>
      <head><title>{pageTitle}</title></head>
      <body>
        <h1>Get in touch</h1>
        <p>Email us at hello@example.com</p>
      </body>
    </html>


```

To group pages under the same section, create a folder. The `index.astro` file inside it becomes the main page of that section:

```plaintext

    # This structure:
    src/pages/
      └── services/
          ├── index.astro
          └── design.astro
      
    # Produces these URLs:
    mysite.com/services
    mysite.com/services/design


```

---

## 3. Dynamic Routes

**Dynamic routes** let a single file generate many pages that share the same design but show different data, like blog posts, product pages or user profiles.

### 3.1 The [param] Syntax

To create a dynamic route, put part of the file name between square brackets `[]`. That part becomes a **parameter**: a variable whose value comes from the URL.

For example, a file named `src/pages/dogs/[dog].astro` matches addresses like `/dogs/clifford` or `/dogs/rover`, and inside the page the parameter `dog` will be `"clifford"` or `"rover"`.

### 3.2 getStaticPaths()

By default, Astro builds every page in advance, when the site is generated, instead of creating them when a visitor arrives. That is why it needs to know **exactly** which pages a dynamic route must produce. You tell it by exporting a function called `getStaticPaths()` that returns the list of all possible values.

```astro

    ---
    // src/pages/dogs/[dog].astro
    
    export function getStaticPaths() {
      // One object per page to generate
      return [
        { params: { dog: 'clifford' } },
        { params: { dog: 'rover' } },
        { params: { dog: 'spot' } },
      ];
    }
    
    // Read the parameter of the page being generated
    const { dog } = Astro.params;
    ---
    
    <h1>Good boy, {dog}!</h1>


```

This file generates three pages: `/dogs/clifford`, `/dogs/rover` and `/dogs/spot`.

**Key Concepts**:

- `params`: The values for the brackets in the file name. The key must have the same name as the parameter (`{ dog: ... }` for `[dog].astro`).
- `props`: Optional extra data you can pass to each generated page, read with `Astro.props`.

**Common mistake:** using a key in `params` that does not match the name between brackets.

```astro

    ---
    // File: src/pages/dogs/[dog].astro

    // ❌ WRONG: the file uses [dog], but the key is "name"
    export function getStaticPaths() {
      return [{ params: { name: 'clifford' } }];
    }

    // ✅ CORRECT: the key matches the name between brackets
    export function getStaticPaths() {
      return [{ params: { dog: 'clifford' } }];
    }
    ---


```

---

## 4. 404 Error Page

A **404 page** is what visitors see when they open an address that does not exist. To customize it, create a file named `404.astro` (or `404.md`) directly inside `src/pages/`.

Most hosting services (like Netlify, Vercel or GitHub Pages) automatically detect this file and show it whenever a page is not found.

```astro

    ---
    // src/pages/404.astro
    import Layout from '../layouts/MainLayout.astro';
    ---
    
    <Layout title="Not Found">
        <div class="error-container">
            <h1>404</h1>
            <p>Oops! The page you are looking for doesn't exist.</p>
            <a href="/">Go back home</a>
        </div>
    </Layout>


```

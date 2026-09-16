---
title: "Semantic tags in HTML"
---

# Semantic HTML

Semantic HTML means choosing tags that describe **what the content is** (its meaning), not just how it should look. The word *semantic* simply means "related to meaning".

For example, the `<b>` tag only tells the browser to make text bold (appearance), while the `<strong>` tag tells the browser that the text is important (meaning). Both look bold on screen, but only one explains *why*.

Using semantic tags is crucial for:

- **Accessibility:** screen readers (programs that read web pages aloud for people with visual impairments) rely on these tags to let users jump between sections.
- **SEO** (Search Engine Optimization): search engines like Google use them to understand what each part of the page is about, which helps the page appear in search results.

---

## Table of Contents

<div id="content-table">

- [1. Why Semantics Matter](#1-why-semantics-matter "Moving away from div soup")
- [2. Structural Elements](#2-structural-elements "Header, Nav, Main, and Footer")
- [3. Content Containers](#3-content-containers "Article, Section, and Aside")
- [4. Text Semantics](#4-text-semantics "Strong, Emphasis, and Headings")

</div>

---

## 1. Why Semantics Matter

In the past, developers used the `<div>` tag (a generic box with no meaning) for everything, creating what is known as "div soup". It can look fine once CSS styles are applied, but it tells machines nothing about the content.

Compare both versions of the same page layout:

```html

    <!-- ❌ WRONG: generic boxes that say nothing about their content -->
    <div id="header">
        <div class="nav">...</div>
    </div>
    <div class="main-content">
        <div class="article">...</div>
    </div>
    <div id="footer">...</div>

    <!-- ✅ CORRECT: each tag describes the role of its content -->
    <header>
        <nav>...</nav>
    </header>
    <main>
        <article>...</article>
    </main>
    <footer>...</footer>


```

Both versions can look identical, but the second one lets a screen reader say "navigation" or "main content", and lets a search engine know which part is the actual article.

---

## 2. Structural Elements

These elements define the large areas of a web page. They act as landmarks that help assistive technologies (like screen readers) move around the document.

- `<header>`

Introductory content at the top of the page or of a section. It usually contains the logo, the site name, a search form, or the navigation menu.

- `<nav>`

A group of navigation links, either to other pages or to other parts of the same page.

- `<main>`

The main content of the page. It should only include content unique to that page, not elements repeated on every page (like sidebars or the site-wide footer). There should be only one `<main>` per page.

- `<footer>`

Closing content at the bottom of the page or of a section: author, copyright information, links to terms of use, contact details, etc.

Example of a full layout:

```html

    <body>
        <header>
            <p class="logo">DaviNotes</p>
            <nav>
                <a href="/">Home</a>
                <a href="/about">About</a>
            </nav>
        </header>

        <main>
            <h1>Understanding Semantics</h1>
            <p>This is the primary content of the page.</p>
        </main>

        <footer>
            <p>&copy; 2025 DaviNotes</p>
        </footer>
    </body>


```

---

## 3. Content Containers

When organizing content inside `<main>`, choose the tag that best describes how that content relates to the rest of the page.

**`<article>` vs `<section>` vs `<aside>`**

- `<article>`: A self-contained piece that would still make sense if you moved it to another page (e.g., a blog post, a news story, a product card). It can contain `<section>` or `<aside>` elements inside.
- `<section>`: A group of content about the same topic, usually with its own heading (`<h2>`, `<h3>`...). Unlike `<article>`, it is not independent: it only makes sense as part of the surrounding content.
- `<aside>`: Content related to the main content but not essential to it, such as a tip, a note, or a sidebar.

**Example:**

```html

    <article>
        <h2>The History of HTML</h2>
        <p>HTML was created by Tim Berners-Lee...</p>

        <section>
            <h3>The Early Days</h3>
            <p>In 1991, the first version...</p>
        </section>

        <aside>
            <p>Did you know? HTML stands for HyperText Markup Language.</p>
        </aside>
    </article>


```

---

## 4. Text Semantics

Using the correct tags for text ensures that the hierarchy and emphasis are communicated to every user, including those who cannot see the page.

<table>
    <thead>
        <tr>
            <th>Tag</th>
            <th>Name</th>
            <th>Semantic Meaning</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>&lt;h1&gt; - &lt;h6&gt;</td>
            <td>Headings</td>
            <td>Define the outline of the page, like the chapters of a book. &lt;h1&gt; is the most important and &lt;h6&gt; the least.</td>
        </tr>
        <tr>
            <td>&lt;strong&gt;</td>
            <td>Strong importance</td>
            <td>The content is important, serious, or urgent.</td>
        </tr>
        <tr>
            <td>&lt;em&gt;</td>
            <td>Emphasis</td>
            <td>The content is stressed, which changes the tone of the sentence (like saying a word louder).</td>
        </tr>
        <tr>
            <td>&lt;blockquote&gt;</td>
            <td>Quotation</td>
            <td>The content is a long quotation from another source.</td>
        </tr>
        <tr>
            <td>&lt;time&gt;</td>
            <td>Time</td>
            <td>A date or time written in a format that machines can also read.</td>
        </tr>
    </tbody>
</table>

**Presentation vs Meaning:**

Do not use `<b>` or `<i>` just to change how text looks; that is the job of CSS. Use `<strong>` or `<em>` when the text really is important or emphasized.

```html

    <!-- ❌ WRONG: only changes the appearance, the meaning is lost -->
    <b>Warning: Do not unplug.</b>
    <i>I really mean it.</i>

    <!-- ✅ CORRECT: screen readers and search engines understand the importance -->
    <strong>Warning: Do not unplug.</strong>
    <em>I really mean it.</em>

    <!-- Dates: people read "March 15th", machines read 2025-03-15 -->
    <p>Published on <time datetime="2025-03-15">March 15th</time></p>


```

**Common mistake:** choosing a heading level because of its size. Headings must follow the order of the content, and their size can always be changed with CSS.

```html

    <!-- ❌ WRONG: jumps from h1 to h4 because h4 "looks smaller" -->
    <h1>Recipes</h1>
    <h4>Desserts</h4>

    <!-- ✅ CORRECT: levels follow the structure of the content -->
    <h1>Recipes</h1>
    <h2>Desserts</h2>


```

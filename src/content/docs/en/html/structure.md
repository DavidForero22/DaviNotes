---
title: "Structure in HTML"
---

# Structure

HTML (HyperText Markup Language) is the standard language used to build the structure of web pages. It is not a programming language like **Java** or **Python**, which make decisions and perform calculations. Instead, HTML is a **markup** language: it labels each piece of content ("this is a heading", "this is an image", "this is a link") so the **browser** (Chrome, Firefox, Safari...) knows how to display it.

Think of a web page as a document organized like a family tree: the page contains sections, sections contain paragraphs, paragraphs contain words. The browser stores this tree in memory and calls it the **DOM** (Document Object Model).

---

## Table of Contents

<div id="content-table">

- [1. Tags vs Elements](#1-tags-vs-elements "Difference between opening tags, closing tags, and elements")
- [2. Attributes](#2-attributes "Providing additional information to elements")
- [3. Nesting](#3-nesting "Understanding parent-child relationships")
- [4. The Basic Skeleton](#4-the-basic-skeleton "The required structure of every HTML5 document")

</div>

---

## 1. Tags vs Elements

HTML is written using **tags**. A tag is a keyword enclosed in angle brackets, like `<p>` (short for *paragraph*). Most tags come in pairs: an **opening tag** that marks where something starts and a **closing tag** (with a forward slash `/`) that marks where it ends.

An **element** is the whole block: the opening tag, the content inside, and the closing tag.

```html

    <!-- Opening tag: <p> | Content: This is a paragraph. | Closing tag: </p> -->
    <p>This is a paragraph.</p>


```

Anything written between `<!--` and `-->` is a **comment**: a note for people reading the code. The browser ignores it and does not show it on the page.

**Void Elements (Self-closing)**

Some elements have no content inside, so they do not need a closing tag. These are called **void** (or empty) elements.

```html

    <!-- Line break -->
    <br>

    <!-- Image: the information it needs goes inside the tag itself -->
    <img src="logo.png" alt="Company Logo">

    <!-- Horizontal dividing line -->
    <hr>


```

**Common mistake:** forgetting to close a tag. The browser tries to guess where it should end, and the rest of the page may inherit the wrong format.

```html

    <!-- ❌ WRONG: the paragraph is never closed -->
    <p>First paragraph
    <p>Second paragraph

    <!-- ✅ CORRECT: every opening tag has its closing tag -->
    <p>First paragraph</p>
    <p>Second paragraph</p>


```

---

## 2. Attributes

Attributes provide **extra information** about an element, such as the address a link points to or the file an image should show. They are always written inside the **opening tag** and usually follow the pattern `name="value"`.

```html

    <!-- href tells the link where to go -->
    <a href="https://google.com">Go to Google</a>

    <!-- class and id give the element names that CSS and JavaScript can use -->
    <h1 class="title" id="main-heading">Welcome to DaviNotes</h1>


```

| Attribute | Description | Example |
|-----------|-------------|---------|
| class     | Gives the element one or more group names, used to style it with CSS or find it with JavaScript. Many elements can share a class. | `<div class="container">` |
| id        | Gives the element a unique name. No two elements on the same page should share it. | `<div id="header">` |
| style     | Applies CSS styles directly to that element. | `<p style="color:red;">` |
| src       | The address of a file to load, such as an image or a script. | `<img src="photo.jpg">` |
| href      | The address a link points to. | `<a href="page.html">` |
| alt       | Alternative text that describes an image. It is read aloud by screen readers and shown if the image fails to load. | `<img src="dog.jpg" alt="A brown dog">` |

**Common mistake:** leaving out the `alt` attribute on images. People who use screen readers will not know what the image shows.

```html

    <!-- ❌ WRONG: no description for the image -->
    <img src="team.jpg">

    <!-- ✅ CORRECT: the description explains what the image shows -->
    <img src="team.jpg" alt="The DaviNotes team smiling in the office">


```

---

## 3. Nesting

HTML elements can be placed inside other elements. This is called **nesting**, and it creates a **hierarchy**: the outer element is the *parent* and the inner one is the *child*.

**Rule of Thumb:** the last tag you open must be the first one you close, like boxes placed inside other boxes.

```html

    <div class="card">
        <h2>Card Title</h2>
        <p>This is a <strong>bold</strong> word inside a paragraph.</p>
    </div>


```

If you nest incorrectly, the browser will try to fix it, but the result is often a broken layout.

```html

    <!-- ❌ WRONG: <strong> was opened last, but </p> is closed first -->
    <p>This is <strong>wrong.</p></strong>

    <!-- ✅ CORRECT: close the inner tag before the outer one -->
    <p>This is <strong>right.</strong></p>


```

---

## 4. The Basic Skeleton

Every HTML document needs a standard starting structure (often called *boilerplate*) so that browsers display it correctly.

This structure is the root of the **DOM tree**: every other element hangs from it.

```html

    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Page Title</title>
    </head>
    <body>

        <h1>My First Heading</h1>
        <p>My first paragraph.</p>

    </body>
    </html>


```

**Key Components:**

- `<!DOCTYPE html>`: Tells the browser that this is a modern HTML (HTML5) document.

- `<html>`: The root element. Everything else goes inside it. The `lang` attribute indicates the language of the page.

- `<head>`: Contains information **about** the page that is **not displayed** in the page itself: the title shown in the browser tab, the character encoding (`charset`), links to style files, and data for search engines.

- `<meta name="viewport">`: Makes the page adapt to the screen width, which is essential on mobile phones.

- `<body>`: Contains the **visible** content of the page (headings, paragraphs, images, lists, etc.).

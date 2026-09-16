---
title: "Components in Astro"
---

# Components

**Components** are the basic building blocks of an Astro project: reusable pieces of a page, such as a header, a card or a button, that you write once and use as many times as you want.

Astro components produce plain HTML. By default they do not send any JavaScript to the visitor's browser, which makes pages load very fast. This is the main difference from libraries like **React** or **Vue**, whose components run JavaScript in the browser.

Astro components are saved in files with the `.astro` extension and have two parts: a **component script** (JavaScript or TypeScript code) and a **component template** (the HTML-like markup that will be shown).

---

## Table of Contents

<div id="content-table">

- [1. Component Structure](#1-component-structure "Learn the anatomy of an .astro file")
- [2. Props](#2-props "Passing data to components")
- [3. Layouts & Slots](#3-layouts--slots "Injecting child content into components")
  - [3.1 Creating a Layout](#31-creating-a-layout "How to create reusable layouts in Astro")
  - [3.2 Named Slots](#32-named-slots "Injecting content into specific areas of a layout")
- [4. UI Frameworks](#4-ui-frameworks "Using React, Vue, or Svelte in Astro")
  - [4.1 Importing Components](#41-importing-components "How to use framework components")
  - [4.2 Hydration Directives](#42-hydration-directives "Making components interactive")

</div>

---

## 1. Component Structure

An Astro component is split into two parts by a **code fence**: two lines of three dashes (`---`).

```astro

    ---
    // Component script: runs on the server (or when the site is built)
    import SomeComponent from './SomeComponent.astro';
    const name = "Astro";
    ---
    
    <!-- Component template: the HTML that will be shown -->
    <div class="container">
        <SomeComponent />
        <h1>Hello {name}!</h1>
    </div>


```

**Key Parts**:

- **The component script (between the `---`)**: This code runs on the server or when the site is built, never in the visitor's browser. Here you can import other components, load data or create variables.

- **The template (below the fence)**: The HTML of the component. Anything between curly braces `{}` is replaced by the value of a JavaScript expression, similar to JSX in React, but the final result is plain HTML.

**Common mistake:** using browser features (like `document` or `window`) in the component script. That code runs on the server, where there is no browser page, so it fails. Code that must run in the browser goes inside a `<script>` tag in the template.

```astro

    ---
    // ❌ WRONG: there is no "document" on the server (ReferenceError: document is not defined)
    document.title = "My page";
    ---

    <!-- ✅ CORRECT: <script> tags in the template run in the visitor's browser -->
    <script>
        document.title = "My page";
    </script>


```

---

## 2. Props

**Props** (short for *properties*) let a parent component pass data to a child component, like the attributes of an HTML tag. Inside the child, the values are read from the `Astro.props` object.

You can also describe the props with a TypeScript `interface`, so your code editor warns you if a prop is missing or has the wrong type.

```astro

    ---
    // Card.astro
    interface Props {
        title: string;
        description?: string; // The ? means this prop is optional
    }
    
    // Read the props; "Default description" is used if none is given
    const { title, description = "Default description" } = Astro.props;
    ---
    
    <div class="card">
        <h2>{title}</h2>
        <p>{description}</p>
    </div>


```

**Usage**:

```astro

    <Card title="My Project" description="Built with Astro" />


```

**Common mistake:** writing a component name in lowercase. Lowercase tags are treated as plain HTML elements, so Astro ignores your component.

```astro

    ---
    import card from '../components/Card.astro';
    ---

    <!-- ❌ WRONG: <card> is rendered as an unknown HTML tag -->
    <card title="My Project" />

    <!-- ✅ CORRECT: component names start with a capital letter -->
    <Card title="My Project" />


```

---

## 3. Layouts & Slots

**Layouts** are Astro components that provide a shared page structure, such as the header, navigation menu and footer. You wrap your pages with them so the whole website looks consistent.

Layouts and slots work together: the **layout** defines the frame, and the **slot** marks the spot where each page's own content is inserted.

### 3.1 Creating a Layout

A layout is just a normal Astro component, usually saved in `src/layouts/`. It typically contains the `<html>`, `<head>` and `<body>` tags.

The special `<slot />` element is a placeholder: when a page uses the layout, the page's content is inserted exactly where `<slot />` is.

```astro

    ---
    // src/layouts/MainLayout.astro
    const { title } = Astro.props;
    ---
    
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>{title}</title>
      </head>
      <body>
        <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
        </nav>
    
        <main>
            <!-- The content of each page appears here -->
            <slot />
        </main>
    
        <footer>
            <p>© 2025 My Website</p>
        </footer>
      </body>
    </html>


```

To use a layout, import it into your page and put your content between its opening and closing tags. Everything inside is sent to the `<slot />`.

```astro

    ---
    // src/pages/index.astro
    import MainLayout from '../layouts/MainLayout.astro';
    ---
    
    <MainLayout title="Welcome to Astro">
        <h1>Hello, World!</h1>
        <p>This paragraph will appear inside the 'main' tag of the layout.</p>
    </MainLayout>


```

### 3.2 Named Slots

Sometimes a layout needs to receive content in several different places, not just one. For example, a page may want to add its own `<meta>` tag inside the `<head>`.

Give each slot a `name` to create separate zones, and use the `slot` attribute in the page to choose where each piece goes.

**In the Layout:**

```astro

    <head>
        <!-- Zone called "head" -->
        <slot name="head" />
    </head>
    <body>
        <!-- Default zone: everything without a slot attribute -->
        <slot />
    </body>


```

**In the Page:**

```astro

    <MainLayout title="Special Page">
        
        <!-- Goes to <slot name="head" /> -->
        <meta slot="head" name="description" content="My page description" />
        
        <!-- Goes to the default <slot /> -->
        <h1>This is the body content</h1>
        
    </MainLayout>


```

---

## 4. UI Frameworks

Astro lets you use components written with other popular libraries, such as **React**, **Vue**, **Svelte** or **Solid**, directly in your Astro pages. You can even mix several of them in the same project.

### 4.1 Importing Components

First, add the official integration for the library. For React, run `npx astro add react` in the terminal. Then import the component in your `.astro` file like any other component.

```astro

    ---
    import Button from '../components/Button.jsx';
    ---
    
    <Button />


```

### 4.2 Hydration Directives

By default, even React or Vue components are turned into static HTML with no JavaScript: they are displayed, but clicks and other interactions do nothing. To make a component interactive, you must tell Astro to send its JavaScript to the browser using a **client directive**. This process is called **hydration**: the static HTML "comes to life".

| Directive | When the JavaScript loads | Example |
| :--- | :--- | :--- |
| `client:load` | Immediately, as soon as the page loads. | `<Nav client:load />` |
| `client:idle` | Once the browser has finished its most important work. | `<Chat client:idle />` |
| `client:visible` | Only when the component scrolls into view on the screen. | `<Carousel client:visible />` |

```astro

    ---
    import Counter from '../components/Counter.jsx';
    ---
    
    <!-- ❌ WRONG: the counter is displayed, but clicking its buttons does nothing -->
    <Counter />

    <!-- ✅ CORRECT: the directive sends the JavaScript, so the buttons work -->
    <Counter client:load />


```

<h1 align="center">DaviNotes</h1>

<p align="center">
<em>A friendly space to explore, learn, and understand programming through visual notes.</em>
</p>

<div align="center">
    <img src="https://img.shields.io/badge/Astro-FF5F00?style=for-the-badge&logo=astro&logoColor=white">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white">
    <img src="https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css&logoColor=white">
    <img src="https://img.shields.io/badge/Markdown-000000?style=for-the-badge&logo=markdown&logoColor=white" />
</div>

---

## 📚 Table of Contents
- [📝 Description](#-description "Learn more about the game's concept and purpose")
- [⚙️ Installation](#️-installation "Instructions to install and run the project locally")
- [🕹️ How to Use](#%EF%B8%8F-how-to-use "Step-by-step guide on how to use the website")
- [🔧 Architecture](#-architecture "Understand the structure and logic behind the proyect")
- [🧠 Technologies](#-technologies "See which technologies were used to build the project")

---


## 📝 Description

Originally conceived as an academic assignment, **DaviNotes** evolved into a comprehensive personal knowledge base. It functions as a structured documentation hub for the technologies and programming languages I have worked with.

The main objective is to guide the user through different technologies in a basic and visual way. The information is organized into specific pages to facilitate understanding, covering aspects such as difficulty levels, recommended prerequisites, and key concepts.

---

## ⚙️ Installation

To run this project locally, you will need **Node.js** installed. This project uses the standard Astro setup.

1. **Clone the repository:**

```bash
    git clone https://github.com/your-username/davinotes.git
    cd davinotes
```

2. **Install dependencies:**

```bash
    npm install
```

3. **Start the development server:**

```bash
    npm run dev
```

Open your browser and navigate to `http://localhost:4321`.

---

## 🕹️ How to Use

Navigating through DaviNotes is intuitive and designed for quick access to information:

- **Home Page:** Upon loading the site, you will see a categorized grid of buttons/cards representing different technologies (e.g., Java, Python, React, HTML).

![Home page swhocase](/public/images/docs/home-showcase.png)

- **Technology Overview:** Clicking on a technology card takes you to its specific DocIndexLayout. Here you will find:

    - **Difficulty Level:** An estimate of the learning curve.

    - **Prerequisites:** Concepts recommended before starting.

    - **Key Concepts:** A list of fundamental topics available for reading.

![Language index showcase](/public/images/docs/doc-index-showcase.png)

- **Documentation Pages:** Inside a topic (e.g., "Basic Syntax" or "Hooks"), you can read the detailed documentation.

- **Help System:** A built-in, accessible help modal is located next to the language selector in the top bar. It provides quick guidance for newcomers, explaining the site's purpose, a breakdown of difficulty levels, and recommended starting paths.

![Language documentation showcase](/public/images/docs/doc-showcase.png)

---

## 🔧 Architecture

### 1. Proyect Structure
The project is built with **Astro**. The guides are Markdown files stored in a **content collection**, and a single dynamic route generates every page of the site in every supported language (English, Spanish and French).

**File Structure Overview:**

```plaintext
    src
    ├───components          # UI components (Breadcrumbs, Sidebar, InfoBox, LanguagePicker, etc.)
    ├───content
    │   └───docs            # Guides, one folder per language
    │       ├───en
    │       │   ├───astro
    │       │   ├───html
    │       │   ├───java
    │       │   ├───php
    │       │   ├───python
    │       │   └───react
    │       ├───es          # Same structure as en
    │       └───fr          # Same structure as en
    ├───data                # Static data sources (languages.ts)
    ├───i18n                # Interface translations (ui.ts) and language helpers (utils.ts)
    ├───layouts             # Page wrappers (HomeLayout, DocInfoLayout, DocIndexLayout)
    ├───pages
    │   ├───[...path].astro # Generates home, language landing pages and guides for every language
    │   └───404.astro
    ├───styles              # Global and layout-specific CSS
    ├───utils               # Utility functions (colors, sorting, localized links)
    └───content.config.ts   # Content collection definition
```

**Key Components:**

- `[...path].astro:` The only route of the site. It reads `languages.ts` and the `docs` collection and generates `/`, `/java`, `/java/oop`... for English, and the same pages under `/es/` and `/fr/`.

- `DocIndexLayout.astro:` The "Landing Page" of a specific language. It receives the language item from `languages.ts` and uses its colors to theme the UI (buttons, text highlights).

- `DocInfoLayout.astro:` The main wrapper for documentation content. It includes the `ClientRouter` (for View Transitions), the `SideBar`, the `Breadcrumbs` and the `LanguagePicker`, ensuring the navigation state persists across page loads.

- `SideBar.astro:` Handles the navigation menu, allowing users to browse through the hierarchy of documentation pages.

- `LanguagePicker.astro:` Links to the current page in every available language. It is shown on the home page and in the top bar of every guide.

- `DocSearch.astro:` Keyword search on each language landing page, limited to the guides of that language. The index is generated at build time from the rendered guides (`utils/search.ts`), so searching runs instantly in the browser. Each result links to its section and, in browsers that support text fragments, highlights the searched word.

- `HelpModal.astro:` A native HTML `<dialog>` component that acts as a quick-reference guide for beginners. It features custom entry/exit animations, backdrop click-to-close behavior, and full multi-language support.

### 2. Core Data Model

The heart of the application is located at `data/languages.ts`. This file acts as the single source of truth for the entire site. It exports a strictly typed JSON-like structure that dictates:

- **Navigation:** Populates the `SideBar` and `HomeLayout`.

- **Routing:** Maps each technology and concept to its URL and Markdown file (e.g., `java` + `basic-syntax` → `/java/basic-syntax`).

- **Theming:** Defines specific colors (`#f89820`) and icons (`☕`) for each technology.

- **Metadata:** Stores difficulty levels and prerequisites.

**Type Definitions:** The data adheres to strict TypeScript interfaces to ensure consistency across the UI. Every text a visitor reads is `Localized`, which means it is written once per language:

```typescript

    type Localized = { en: string; es: string; fr: string };

    interface Concept {
        title: Localized;    // e.g., { en: "Collections", es: "Colecciones", fr: "Collections" }
        desc: Localized;     // Short description of the doc page
        slug: string;        // Markdown file name, e.g., "collections"
    }

    interface LanguageItem {
        title: string;       // e.g., "Java"
        desc: Localized;     // Short description for the home page card
        intro: Localized;    // Introduction of the landing page
        color: string;       // Card glow color on the home page
        theme: { color: string; dark: string }; // Landing page accent colors
        slug: string;        // e.g., "java" -> /java
        icon: string;        // Icon for the sidebar item
        difficulty: "Fundamental" | "Beginner" | "Elementary" | "Intermediate" | "Advanced";
        prerequisites: Localized[]; // Recommended prior knowledge
        concepts: Concept[]; // List of documentation topics
    }

    interface Category {
        category: string;    // e.g., "Backend"
        items: LanguageItem[];
    }
```

By modifying this single file, you can add new categories, languages, or topics without altering the UI components.

### 3. Translations

The site is available in English (default, no URL prefix), Spanish (`/es/`) and French (`/fr/`).

- **Guides:** each guide exists once per language, with the same file name: `src/content/docs/en/java/oop.md`, `src/content/docs/es/java/oop.md`, `src/content/docs/fr/java/oop.md`. If a translation is missing, the English version is shown with a notice.

- **Interface texts** (buttons, labels, 404 page...): `src/i18n/ui.ts`.

- **Technology and topic names/descriptions:** the `Localized` fields of `src/data/languages.ts`.

**Adding a new guide:** add the concept (with its `slug`) to `languages.ts`, then create the Markdown file in each language folder. Each file only needs a `title` in its frontmatter:

```markdown

    ---
    title: "Collections in Java"
    ---


```

**Adding a new language:** add it to `locales` and `ui` in `src/i18n/ui.ts`, to `i18n.locales` in `astro.config.mjs`, to every `Localized` value in `languages.ts`, and create its folder in `src/content/docs/`.

---

## 🧠 Technologies

This project is built with modern web standards, focusing on performance and type safety.

| Technology | Description |
|------------|-------------|
| ![Astro](https://img.shields.io/badge/Astro-Core-FF5F00?logo=astro&logoColor=white) | The core web framework used for its performance and content-focused approach. |
| ![TypeScript](https://img.shields.io/badge/TypeScript-Logic-007ACC?logo=typescript&logoColor=white) | Used for logic, components, and ensuring type safety across the project (interfaces for props, data structures). |
| ![CSS](https://img.shields.io/badge/CSS-Styling-1572B6?logo=css&logoColor=white) | Custom vanilla CSS variables and scoping are used for styling. |
| ![View Transitions](https://img.shields.io/badge/View%20Transitions-SPA-6E5494?logo=astro&logoColor=white) | Provides a SPA-like feel (smooth fading, persistent sidebar) while maintaining the benefits of a multi-page application using Astro ClientRouter. |
| ![Markdown](https://img.shields.io/badge/Markdown-Content-000000?logo=markdown&logoColor=white) | Used for the actual documentation content, making it easy to write and format technical notes. |

Want to contribute a guide? See [Adding or Updating a Language Guide](docs/adding-a-guide.md) for the step-by-step process.

---

<div align="center">
<sub>

Source code is licensed under the MIT License.

Documentation is licensed under Creative Commons Attribution-NonCommercial 4.0 (CC BY-NC 4.0).

</sub>
</div>

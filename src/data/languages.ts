import type { Localized } from "../i18n/ui";

/**
 * Defines the specific levels of complexity assigned to learning paths.
 * These string literals are used by UI components to determine the visual styling, such as the color of difficulty badges found on landing pages.
 * Their visible labels are translated in `src/i18n/ui.ts`.
 */
export type DifficultyLevel =
    | "Fundamental"
    | "Beginner"
    | "Elementary"
    | "Intermediate"
    | "Advanced";

/**
 * Represents a high-level grouping of technologies, such as "Frontend" or "Backend".
 * This structure is used to organize the sidebar navigation and separate content into logical sections on the homepage.
 */
export interface Category {
    category: string;
    items: LanguageItem[];
}

/**
 * Defines the comprehensive metadata for a specific programming language or framework.
 * This includes visual assets like icons and brand colors, educational metadata like difficulty and prerequisites, and the actual list of topics covered.
 * Every text a visitor reads is `Localized`, so it is written once per language.
 */
export interface LanguageItem {
    title: string;
    /** Short text shown on the home page card. */
    desc: Localized;
    /** Introduction shown at the top of the language landing page. */
    intro: Localized;
    /** Card glow color on the home page. */
    color: string;
    /** Accent colors used on the language landing page (buttons, highlights). */
    theme: { color: string; dark: string };
    /** URL segment of the language, e.g. "java" -> /java */
    slug: string;
    icon: string;
    difficulty: DifficultyLevel;
    prerequisites: Localized[];
    concepts: Concept[];
}

/**
 * Represents an individual article or topic within a language.
 * The `slug` must match the Markdown file name in `src/content/docs/<locale>/<language>/`.
 */
export interface Concept {
    title: Localized;
    desc: Localized;
    slug: string;
}

/**
 * Shared prerequisite labels.
 */
const prereq = {
    none: { en: "None", es: "Ninguno", fr: "Aucun" },
    html: { en: "HTML", es: "HTML", fr: "HTML" },
    css: { en: "CSS", es: "CSS", fr: "CSS" },
    js: { en: "JavaScript", es: "JavaScript", fr: "JavaScript" },
    basicJs: { en: "Basic JavaScript", es: "JavaScript básico", fr: "Bases de JavaScript" },
    markdown: { en: "Markdown", es: "Markdown", fr: "Markdown" },
} satisfies Record<string, Localized>;

/**
 * Every language has an installation guide stored as `installation-guide.md`.
 */
export const INSTALLATION_GUIDE_SLUG = "installation-guide";

/**
 * The central static data source for the application.
 * This array contains the complete hierarchy of categories, languages, and concepts used to populate the sidebar, generate landing pages, and manage routing structure throughout the site.
 */
export const languages: Category[] = [
    {
        category: "Backend",
        items: [
            {
                title: "Java",
                desc: {
                    en: "Build robust, scalable enterprise applications and backend systems",
                    es: "Crea aplicaciones empresariales y sistemas de servidor robustos y escalables",
                    fr: "Créez des applications d'entreprise et des systèmes serveur robustes et évolutifs",
                },
                intro: {
                    en: "Robust, cross-platform object-oriented language.",
                    es: "Lenguaje orientado a objetos, robusto y multiplataforma.",
                    fr: "Langage orienté objet, robuste et multiplateforme.",
                },
                color: "#f89820",
                theme: { color: "#f7b72e", dark: "#bd8b20" },
                slug: "java",
                icon: "☕",
                difficulty: "Intermediate",
                prerequisites: [prereq.none],
                concepts: [
                    {
                        title: { en: "Basic Syntax", es: "Sintaxis básica", fr: "Syntaxe de base" },
                        desc: {
                            en: "Variables, operators and control structures.",
                            es: "Variables, operadores y estructuras de control.",
                            fr: "Variables, opérateurs et structures de contrôle.",
                        },
                        slug: "basic-syntax",
                    },
                    {
                        title: { en: "Collections", es: "Colecciones", fr: "Collections" },
                        desc: {
                            en: "Arrays, stacks, queues, ArrayList, HashMap and the Stream API.",
                            es: "Arrays, pilas, colas, ArrayList, HashMap y la API Stream.",
                            fr: "Tableaux, piles, files, ArrayList, HashMap et l'API Stream.",
                        },
                        slug: "collections",
                    },
                    {
                        title: {
                            en: "Object-Oriented Programming",
                            es: "Programación orientada a objetos",
                            fr: "Programmation orientée objet",
                        },
                        desc: {
                            en: "Classes, inheritance, polymorphism, and interfaces.",
                            es: "Clases, herencia, polimorfismo e interfaces.",
                            fr: "Classes, héritage, polymorphisme et interfaces.",
                        },
                        slug: "oop",
                    },
                ],
            },
            {
                title: "Python",
                desc: {
                    en: "Versatile language for data science, AI, and web development",
                    es: "Lenguaje versátil para ciencia de datos, IA y desarrollo web",
                    fr: "Langage polyvalent pour la science des données, l'IA et le développement web",
                },
                intro: {
                    en: "Versatile language ideal for scripting, data science, and backend.",
                    es: "Lenguaje versátil, ideal para automatizar tareas, ciencia de datos y servidores.",
                    fr: "Langage polyvalent, idéal pour l'automatisation, la science des données et le back-end.",
                },
                color: "#3776ab",
                theme: { color: "#3776ab", dark: "#295981" },
                slug: "python",
                icon: "🐍",
                difficulty: "Beginner",
                prerequisites: [prereq.none],
                concepts: [
                    {
                        title: { en: "Basic Syntax", es: "Sintaxis básica", fr: "Syntaxe de base" },
                        desc: {
                            en: "Variables, data types, operators, and indentation rules.",
                            es: "Variables, tipos de datos, operadores y reglas de sangría.",
                            fr: "Variables, types de données, opérateurs et règles d'indentation.",
                        },
                        slug: "basic-syntax",
                    },
                    {
                        title: { en: "Data Structures", es: "Estructuras de datos", fr: "Structures de données" },
                        desc: {
                            en: "Lists, tuples, dictionaries, and sets.",
                            es: "Listas, tuplas, diccionarios y conjuntos.",
                            fr: "Listes, tuples, dictionnaires et ensembles.",
                        },
                        slug: "data-structures",
                    },
                    {
                        title: {
                            en: "Object-Oriented Programming",
                            es: "Programación orientada a objetos",
                            fr: "Programmation orientée objet",
                        },
                        desc: {
                            en: "Classes, inheritance, and methods.",
                            es: "Clases, herencia y métodos.",
                            fr: "Classes, héritage et méthodes.",
                        },
                        slug: "oop",
                    },
                ],
            },
            {
                title: "PHP",
                desc: {
                    en: "Create dynamic, data-driven web applications on the server",
                    es: "Crea aplicaciones web dinámicas y basadas en datos desde el servidor",
                    fr: "Créez côté serveur des applications web dynamiques alimentées par des données",
                },
                intro: {
                    en: "A widely used server-side scripting language designed for web development.",
                    es: "Un lenguaje de servidor muy utilizado, pensado para el desarrollo web.",
                    fr: "Un langage côté serveur très répandu, conçu pour le développement web.",
                },
                color: "#777bb4",
                theme: { color: "#777bb4", dark: "#585d8a" },
                slug: "php",
                icon: "🐘",
                difficulty: "Elementary",
                prerequisites: [prereq.html],
                concepts: [
                    {
                        title: { en: "PHP Fundamentals", es: "Fundamentos de PHP", fr: "Les bases de PHP" },
                        desc: {
                            en: "Core concepts: syntax, variables, types, operators, and control structures.",
                            es: "Conceptos básicos: sintaxis, variables, tipos, operadores y estructuras de control.",
                            fr: "Notions essentielles : syntaxe, variables, types, opérateurs et structures de contrôle.",
                        },
                        slug: "fundamentals",
                    },
                    {
                        title: {
                            en: "Functions & Data Handling",
                            es: "Funciones y manejo de datos",
                            fr: "Fonctions et gestion des données",
                        },
                        desc: {
                            en: "Structuring code with functions, managing arrays, and string manipulation.",
                            es: "Organizar el código con funciones, trabajar con arrays y manipular textos.",
                            fr: "Organiser le code avec des fonctions, gérer des tableaux et manipuler du texte.",
                        },
                        slug: "functions-data",
                    },
                    {
                        title: {
                            en: "Forms & Server Interaction",
                            es: "Formularios e interacción con el servidor",
                            fr: "Formulaires et interaction avec le serveur",
                        },
                        desc: {
                            en: "Processing user input via forms, validation, and using superglobals like $_POST.",
                            es: "Procesar los datos que envía el usuario en formularios, validarlos y usar superglobales como $_POST.",
                            fr: "Traiter les données envoyées par formulaire, les valider et utiliser des superglobales comme $_POST.",
                        },
                        slug: "forms-server",
                    },
                ],
            }
        ],
    },
    {
        category: "Frontend",
        items: [
            {
                title: "Astro",
                desc: {
                    en: "Build fast websites with modern frontend frameworks",
                    es: "Crea sitios web rápidos con frameworks frontend modernos",
                    fr: "Créez des sites web rapides avec des frameworks front-end modernes",
                },
                intro: {
                    en: "The web framework for content-driven websites.",
                    es: "El framework web para sitios centrados en el contenido.",
                    fr: "Le framework web pour les sites axés sur le contenu.",
                },
                color: "#ff5a03",
                theme: { color: "#ff5a03", dark: "#c74200" },
                slug: "astro",
                icon: "🚀",
                difficulty: "Beginner",
                prerequisites: [prereq.html, prereq.css, prereq.basicJs, prereq.markdown],
                concepts: [
                    {
                        title: { en: "Components", es: "Componentes", fr: "Composants" },
                        desc: {
                            en: "Creating reusable UI components using Astro or framework components.",
                            es: "Crear piezas de interfaz reutilizables con componentes de Astro o de otros frameworks.",
                            fr: "Créer des éléments d'interface réutilisables avec des composants Astro ou d'autres frameworks.",
                        },
                        slug: "components",
                    },
                    {
                        title: { en: "Pages & Routing", es: "Páginas y rutas", fr: "Pages et routage" },
                        desc: {
                            en: "How to create pages and manage routes in an Astro project.",
                            es: "Cómo crear páginas y gestionar las rutas en un proyecto de Astro.",
                            fr: "Comment créer des pages et gérer les routes dans un projet Astro.",
                        },
                        slug: "pages-routing",
                    },
                    {
                        title: { en: "Markdown Content", es: "Contenido en Markdown", fr: "Contenu Markdown" },
                        desc: {
                            en: "Generate pages automatically from Markdown files or content collections.",
                            es: "Generar páginas automáticamente a partir de archivos Markdown o colecciones de contenido.",
                            fr: "Générer des pages automatiquement à partir de fichiers Markdown ou de collections de contenu.",
                        },
                        slug: "markdown-content",
                    },
                ],
            },
            {
                title: "React",
                desc: {
                    en: "A powerful library for building reusable and interactive components",
                    es: "Una potente librería para crear componentes reutilizables e interactivos",
                    fr: "Une bibliothèque puissante pour créer des composants réutilisables et interactifs",
                },
                intro: {
                    en: "A JavaScript library for building interactive user interfaces from reusable components.",
                    es: "Una librería de JavaScript para crear interfaces interactivas a partir de componentes reutilizables.",
                    fr: "Une bibliothèque JavaScript pour créer des interfaces interactives à partir de composants réutilisables.",
                },
                color: "#61dafb",
                theme: { color: "#61dafb", dark: "#4fb2ce" },
                slug: "react",
                icon: "⚛️",
                difficulty: "Intermediate",
                prerequisites: [prereq.html, prereq.css, prereq.js],
                concepts: [
                    {
                        title: { en: "Fundamentals", es: "Fundamentos", fr: "Les bases" },
                        desc: {
                            en: "JSX, props, state and one-way data flow.",
                            es: "JSX, props, estado y flujo de datos en un solo sentido.",
                            fr: "JSX, props, état et flux de données à sens unique.",
                        },
                        slug: "fundamentals",
                    },
                    {
                        title: { en: "Hooks", es: "Hooks", fr: "Hooks" },
                        desc: {
                            en: "Managing state, side effects and performance with useState, useEffect, useMemo and useCallback.",
                            es: "Gestionar el estado, los efectos secundarios y el rendimiento con useState, useEffect, useMemo y useCallback.",
                            fr: "Gérer l'état, les effets de bord et les performances avec useState, useEffect, useMemo et useCallback.",
                        },
                        slug: "hooks",
                    },
                    {
                        title: { en: "Context API", es: "Context API", fr: "API Context" },
                        desc: {
                            en: "Sharing global data between components without prop drilling.",
                            es: "Compartir datos globales entre componentes sin pasar props nivel a nivel.",
                            fr: "Partager des données globales entre composants sans transmettre les props à chaque niveau.",
                        },
                        slug: "context",
                    },
                ],
            },
            {
                title: "HTML",
                desc: {
                    en: "The standard markup language for creating web pages and applications",
                    es: "El lenguaje de marcado estándar para crear páginas y aplicaciones web",
                    fr: "Le langage de balisage standard pour créer des pages et des applications web",
                },
                intro: {
                    en: "The standard markup language for creating web pages.",
                    es: "El lenguaje de marcado estándar para crear páginas web.",
                    fr: "Le langage de balisage standard pour créer des pages web.",
                },
                color: "#e34c26",
                theme: { color: "#e34c26", dark: "#b03e1d" },
                slug: "html",
                icon: "🌐",
                difficulty: "Fundamental",
                prerequisites: [prereq.none],
                concepts: [
                    {
                        title: { en: "Structure", es: "Estructura", fr: "Structure" },
                        desc: {
                            en: "Understanding tags, attributes, nesting, and the basic document skeleton.",
                            es: "Etiquetas, atributos, anidamiento y el esqueleto básico de un documento.",
                            fr: "Balises, attributs, imbrication et squelette de base d'un document.",
                        },
                        slug: "structure",
                    },
                    {
                        title: { en: "Semantic HTML", es: "HTML semántico", fr: "HTML sémantique" },
                        desc: {
                            en: "Using meaningful tags (header, article, footer) for better accessibility and SEO.",
                            es: "Usar etiquetas con significado (header, article, footer) para mejorar la accesibilidad y el SEO.",
                            fr: "Utiliser des balises porteuses de sens (header, article, footer) pour améliorer l'accessibilité et le SEO.",
                        },
                        slug: "semantic",
                    },
                    {
                        title: { en: "Forms", es: "Formularios", fr: "Formulaires" },
                        desc: {
                            en: "Collecting user data with form elements, input types, and validation.",
                            es: "Recoger datos del usuario con formularios, tipos de campo y validación.",
                            fr: "Collecter les données des utilisateurs avec des formulaires, des types de champs et la validation.",
                        },
                        slug: "forms",
                    },
                ],
            }
        ],
    },
];

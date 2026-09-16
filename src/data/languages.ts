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
    category: Localized;
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
        category: { en: "Backend", es: "Backend", fr: "Backend" },
        items: [
            {
                title: "Java",
                desc: {
                    en: "Robust, scalable enterprise applications and backend systems",
                    es: "Aplicaciones empresariales y sistemas de servidor robustos y escalables",
                    fr: "Applications d'entreprise et des systèmes serveur robustes et évolutifs",
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
                    en: "Dynamic, data-driven web applications on the server",
                    es: "Aplicaciones web dinámicas y basadas en datos desde el servidor",
                    fr: "Applications web dynamiques alimentées par des données",
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
        category: { en: "Frontend", es: "Frontend", fr: "Frontend" },
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
    {
        category: { en: "Tools", es: "Herramientas", fr: "Outils" },
        items: [
            {
                title: "Git",
                desc: {
                    en: "Track changes, collaborate with branches, and sync your code with remote repositories",
                    es: "Registra cambios, colabora con ramas y sincroniza tu código con repositorios remotos",
                    fr: "Suivez les modifications, collaborez avec des branches et synchronisez votre code avec des dépôts distants",
                },
                intro: {
                    en: "The distributed version control system every developer needs to know.",
                    es: "El sistema de control de versiones distribuido que todo desarrollador necesita conocer.",
                    fr: "Le système de contrôle de version distribué que tout développeur doit connaître.",
                },
                color: "#f05033",
                theme: { color: "#f05033", dark: "#b23d26" },
                slug: "git",
                icon: "🔀",
                difficulty: "Beginner",
                prerequisites: [prereq.none],
                concepts: [
                    {
                        title: {
                            en: "Fundamentals & Local Environment",
                            es: "Fundamentos y Entorno Local",
                            fr: "Fondamentaux et environnement local",
                        },
                        desc: {
                            en: "Understand the Git mindset and master the basic workflow without leaving your machine.",
                            es: "Entiende la mentalidad de Git y domina el flujo básico de trabajo sin salir de tu máquina.",
                            fr: "Comprenez l'état d'esprit de Git et maîtrisez le flux de travail de base sans quitter votre machine.",
                        },
                        slug: "local-environment",
                    },
                    {
                        title: {
                            en: "Branching & Remote Collaboration",
                            es: "Ramificaciones y Colaboración Remota",
                            fr: "Branches et collaboration à distance",
                        },
                        desc: {
                            en: "Work in parallel with isolated branches and sync changes with remote platforms like GitHub, GitLab or Bitbucket.",
                            es: "Trabaja en paralelo con ramas aisladas y sincroniza tus cambios con plataformas remotas como GitHub, GitLab o Bitbucket.",
                            fr: "Travaillez en parallèle avec des branches isolées et synchronisez vos modifications avec des plateformes distantes comme GitHub, GitLab ou Bitbucket.",
                        },
                        slug: "branching-collaboration",
                    },
                    {
                        title: {
                            en: "Advanced Control & Fixing Mistakes",
                            es: "Control Avanzado y Corrección de Errores",
                            fr: "Contrôle avancé et correction des erreurs",
                        },
                        desc: {
                            en: "Learn to solve common problems, safely travel back in time, and keep a clean history.",
                            es: "Aprende a solucionar problemas comunes, volver atrás en el tiempo de forma segura y mantener un historial limpio.",
                            fr: "Apprenez à résoudre les problèmes courants, à revenir en arrière en toute sécurité et à garder un historique propre.",
                        },
                        slug: "advanced-control",
                    },
                ],
            },
            {
                title: "Node.js",
                desc: {
                    en: "Build fast, scalable backend applications and APIs using JavaScript on the server",
                    es: "Crea aplicaciones backend rápidas y escalables y APIs usando JavaScript en el servidor",
                    fr: "Créez des applications backend rapides et évolutives et des API avec JavaScript côté serveur",
                },
                intro: {
                    en: "A JavaScript runtime built on Chrome's V8 engine for server-side development.",
                    es: "Un entorno de ejecución de JavaScript basado en el motor V8 de Chrome para el desarrollo del lado del servidor.",
                    fr: "Un environnement d'exécution JavaScript basé sur le moteur V8 de Chrome pour le développement côté serveur.",
                },
                color: "#339933",
                theme: { color: "#339933", dark: "#235f24" },
                slug: "node",
                icon: "⬢",
                difficulty: "Intermediate",
                prerequisites: [prereq.js],
                concepts: [
                    {
                        title: {
                            en: "Fundamentals & First Steps",
                            es: "Fundamentos y Primeros Pasos",
                            fr: "Fondamentaux et premiers pas",
                        },
                        desc: {
                            en: "Understand what Node.js is, how its asynchronous architecture works internally, and master its core native modules.",
                            es: "Comprende qué es Node.js, cómo funciona internamente su arquitectura asíncrona y domina el uso de sus módulos nativos básicos.",
                            fr: "Comprenez ce qu'est Node.js, le fonctionnement interne de son architecture asynchrone, et maîtrisez ses modules natifs essentiels.",
                        },
                        slug: "fundamentals",
                    },
                    {
                        title: {
                            en: "Building Applications & APIs",
                            es: "Desarrollo de Aplicaciones y APIs",
                            fr: "Développement d'applications et d'API",
                        },
                        desc: {
                            en: "Move from theory to practice by building functional, robust, structured APIs connected to real data.",
                            es: "Pasa de la teoría a la práctica construyendo APIs funcionales, robustas, estructuradas y conectadas a datos.",
                            fr: "Passez de la théorie à la pratique en créant des API fonctionnelles, robustes, structurées et connectées à des données.",
                        },
                        slug: "apis-and-apps",
                    },
                    {
                        title: {
                            en: "Advanced Concepts & Production",
                            es: "Conceptos Avanzados y Producción",
                            fr: "Concepts avancés et production",
                        },
                        desc: {
                            en: "Scale the application, optimize CPU/memory performance, ensure security, and prepare it for production.",
                            es: "Escala la aplicación, optimiza el rendimiento de CPU/memoria, garantiza la seguridad y prepárala para producción.",
                            fr: "Faites évoluer l'application, optimisez les performances CPU/mémoire, garantissez la sécurité et préparez-la pour la production.",
                        },
                        slug: "advanced-production",
                    },
                ],
            },
        ],
    },
    {
        category: { en: "Databases", es: "Bases de Datos", fr: "Bases de Données" },
        items: [
            {
                title: "MySQL",
                desc: {
                    en: "Store, organize and query structured data using the world's most popular relational database",
                    es: "Almacena, organiza y consulta datos estructurados con la base de datos relacional más popular del mundo",
                    fr: "Stockez, organisez et interrogez des données structurées avec la base de données relationnelle la plus utilisée au monde",
                },
                intro: {
                    en: "A relational database that organizes information in tables, like a set of linked spreadsheets.",
                    es: "Una base de datos relacional que organiza la información en tablas, como un conjunto de hojas de cálculo enlazadas.",
                    fr: "Une base de données relationnelle qui organise l'information en tables, comme un ensemble de feuilles de calcul reliées entre elles.",
                },
                color: "#00758f",
                theme: { color: "#00758f", dark: "#00435a" },
                slug: "mysql",
                icon: "🐬",
                difficulty: "Beginner",
                prerequisites: [prereq.none],
                concepts: [
                    {
                        title: {
                            en: "Fundamentals & Relational Design",
                            es: "Fundamentos y Diseño Relacional",
                            fr: "Fondamentaux et conception relationnelle",
                        },
                        desc: {
                            en: "Understand the relational model, structure tables with normalized schemas, and run basic data queries.",
                            es: "Entiende el modelo relacional, estructura tablas mediante esquemas normalizados y realiza consultas básicas de manipulación de datos.",
                            fr: "Comprenez le modèle relationnel, structurez des tables avec des schémas normalisés et effectuez des requêtes de base.",
                        },
                        slug: "fundamentals-relational-design",
                    },
                    {
                        title: {
                            en: "Advanced Queries & Operations",
                            es: "Consultas Avanzadas y Operativa",
                            fr: "Requêtes avancées et exploitation",
                        },
                        desc: {
                            en: "Master complex data retrieval, ensure relational integrity, and automate logic inside the database engine.",
                            es: "Domina la extracción compleja de información, asegura la integridad relacional y automatiza lógica dentro del motor de base de datos.",
                            fr: "Maîtrisez l'extraction complexe de données, garantissez l'intégrité relationnelle et automatisez la logique au sein du moteur.",
                        },
                        slug: "advanced-queries",
                    },
                    {
                        title: {
                            en: "Optimization, Security & Production",
                            es: "Optimización, Seguridad y Producción",
                            fr: "Optimisation, sécurité et production",
                        },
                        desc: {
                            en: "Speed up slow queries, manage users and permissions, and prepare a database for real-world production use.",
                            es: "Acelera consultas lentas, gestiona usuarios y permisos, y prepara una base de datos para un entorno real de producción.",
                            fr: "Accélérez les requêtes lentes, gérez utilisateurs et permissions, et préparez une base de données pour la production.",
                        },
                        slug: "optimization-security-production",
                    },
                ],
            },
            {
                title: "MongoDB",
                desc: {
                    en: "Store flexible, JSON-like data and scale applications with the leading NoSQL document database",
                    es: "Almacena datos flexibles en formato JSON y escala aplicaciones con la base de datos NoSQL documental líder",
                    fr: "Stockez des données flexibles au format JSON et faites évoluer vos applications avec la base NoSQL orientée documents leader",
                },
                intro: {
                    en: "A document-oriented NoSQL database that stores data as flexible, JSON-like records.",
                    es: "Una base de datos NoSQL orientada a documentos que almacena la información en registros flexibles, similares a JSON.",
                    fr: "Une base de données NoSQL orientée documents qui stocke les informations dans des enregistrements flexibles, semblables à du JSON.",
                },
                color: "#47a248",
                theme: { color: "#47a248", dark: "#2e6b2f" },
                slug: "mongodb",
                icon: "🍃",
                difficulty: "Beginner",
                prerequisites: [prereq.none],
                concepts: [
                    {
                        title: {
                            en: "Fundamentals & the Document Model",
                            es: "Fundamentos y Modelo Documental",
                            fr: "Fondamentaux et modèle de documents",
                        },
                        desc: {
                            en: "Understand the schema-less document paradigm and learn to model data around access patterns rather than normalization.",
                            es: "Comprende el paradigma de documentos sin esquema estricto y aprende a modelar datos priorizando patrones de acceso sobre normalización.",
                            fr: "Comprenez le paradigme des documents sans schéma strict et modélisez les données selon les usages plutôt que la normalisation.",
                        },
                        slug: "fundamentals-document-model",
                    },
                    {
                        title: {
                            en: "Advanced Queries & Aggregation",
                            es: "Consultas Avanzadas y Agregación",
                            fr: "Requêtes avancées et agrégation",
                        },
                        desc: {
                            en: "Process and transform large volumes of data through advanced aggregation pipelines and speed up searches with proper indexing.",
                            es: "Procesa y transforma grandes volúmenes de datos mediante tuberías de agregación avanzadas y optimiza búsquedas con indexación adecuada.",
                            fr: "Traitez et transformez de gros volumes de données via des pipelines d'agrégation avancés et optimisez les recherches grâce à l'indexation.",
                        },
                        slug: "advanced-queries-aggregation",
                    },
                    {
                        title: {
                            en: "Scalability, Security & Production",
                            es: "Escalabilidad, Seguridad y Producción",
                            fr: "Scalabilité, sécurité et production",
                        },
                        desc: {
                            en: "Scale a database horizontally, secure access to it, and deploy it reliably to the cloud.",
                            es: "Escala una base de datos de forma horizontal, protege el acceso a ella y despliégala de forma fiable en la nube.",
                            fr: "Faites évoluer une base de données horizontalement, sécurisez-y l'accès et déployez-la de façon fiable dans le cloud.",
                        },
                        slug: "scalability-security-production",
                    },
                ],
            },
        ],
    },
];

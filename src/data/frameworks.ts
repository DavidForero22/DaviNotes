import type { Concept, DifficultyLevel } from "./languages";
import type { Localized } from "../i18n/ui";

/**
 * Represents a framework or major library built on top of a language (e.g. Laravel on PHP).
 * Frameworks are modeled separately from `LanguageItem` so new ones can be added without
 * growing `languages.ts`. Each one links back to its parent language through `language`.
 */
export interface Framework {
    /** Slug of the parent `LanguageItem` this framework belongs to, e.g. "php". */
    language: string;
    /** Display name of the framework, e.g. "Laravel". Not localized: framework names are proper nouns. */
    name: string;
    /** Short text shown on the collapsed framework row. */
    desc: Localized;
    difficulty: DifficultyLevel;
    /** URL segment of the framework, nested under its language: "laravel" -> /php/laravel */
    slug: string;
    icon: string;
    /** List of documentation topics. Reuses the same `Concept` shape languages use for their own topics. */
    concepts: Concept[];
}

/**
 * Every framework available on the site, across every language. A language with no entries
 * here simply shows no "Frameworks" section and no "discover frameworks" prompt on its last guide.
 */
export const frameworks: Framework[] = [
    {
        language: "php",
        name: "Laravel",
        desc: {
            en: "The most popular PHP framework, for building elegant, full-featured web applications fast.",
            es: "El framework de PHP más popular, para crear aplicaciones web elegantes y completas con rapidez.",
            fr: "Le framework PHP le plus populaire, pour créer rapidement des applications web élégantes et complètes.",
        },
        difficulty: "Intermediate",
        icon: "/images/logos/framework/laravel-logo.svg",
        slug: "laravel",
        concepts: [
            {
                title: {
                    en: "Fundamentals & MVC Architecture",
                    es: "Fundamentos y Arquitectura MVC",
                    fr: "Fondamentaux et architecture MVC",
                },
                desc: {
                    en: "Understand Laravel's workflow, the MVC pattern, and building dynamic interfaces with Blade.",
                    es: "Comprende el flujo de trabajo de Laravel, el patrón MVC y la creación de interfaces dinámicas con Blade.",
                    fr: "Comprenez le flux de travail de Laravel, le patron MVC et la création d'interfaces dynamiques avec Blade.",
                },
                slug: "fundamentals-mvc-architecture",
            },
            {
                title: {
                    en: "Database, Eloquent & Business Logic",
                    es: "Base de Datos, Eloquent y Lógica",
                    fr: "Base de données, Eloquent et logique métier",
                },
                desc: {
                    en: "Master data persistence without raw SQL, ensure data integrity, and apply robust business logic.",
                    es: "Domina la persistencia de datos sin escribir SQL puro, asegura la integridad de la información y aplica lógica de negocio robusta.",
                    fr: "Maîtrisez la persistance des données sans SQL brut, garantissez l'intégrité des données et appliquez une logique métier robuste.",
                },
                slug: "database-eloquent-logic",
            },
            {
                title: {
                    en: "Ecosystem, APIs & Advanced Level",
                    es: "Ecosistema, APIs y Nivel Avanzado",
                    fr: "Écosystème, API et niveau avancé",
                },
                desc: {
                    en: "Prepare the application for the real world, connect it to modern frontends, and use Laravel's official ecosystem.",
                    es: "Prepara la aplicación para el mundo real, comunícala con frontends modernos e integra el ecosistema oficial de Laravel.",
                    fr: "Préparez l'application pour le monde réel, connectez-la à des frontends modernes et utilisez l'écosystème officiel de Laravel.",
                },
                slug: "ecosystem-apis-advanced",
            },
        ],
    },
];

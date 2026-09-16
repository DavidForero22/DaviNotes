/**
 * Languages available on the site. The first key is the default locale,
 * which is served without a URL prefix.
 */
export const locales = {
	en: { label: "English", short: "EN" },
	es: { label: "Español", short: "ES" },
	fr: { label: "Français", short: "FR" },
} as const;

export type Lang = keyof typeof locales;

export const defaultLang: Lang = "en";

/**
 * A piece of text written in every supported language.
 */
export type Localized = Record<Lang, string>;

/**
 * Interface strings (buttons, labels, headings) that are not part of the guides.
 * `{name}` placeholders are replaced at render time.
 */
export const ui = {
	en: {
		"site.description": "DaviNotes - Development Notes",
		"home.subtitle": "My own personal documentation.",
		"nav.home": "Home",
		"nav.goHome": "Go to home page",
		"nav.goTo": "Go to {lang}",
		"nav.back": "Go back",
		"nav.openMenu": "Open menu",
		"nav.closeMenu": "Close menu",
		"nav.mainNavigation": "Main navigation",
		"nav.breadcrumb": "Breadcrumb",
		"nav.scrollTop": "Back to top",
		"lang.picker": "Change language",
		"index.title": "{lang} Notes",
		"index.keyConcepts": "Key Concepts",
		"index.ctaTitle": "Ready to start building?",
		"index.ctaText": "Follow the complete setup process in our dedicated guide.",
		"index.installGuide": "Installation Guide",
		"index.installTitle": "See the {lang} installation guide",
		"info.difficulty": "Difficulty:",
		"info.prerequisites": "Prerequisites:",
		"difficulty.Fundamental": "Fundamental",
		"difficulty.Beginner": "Beginner",
		"difficulty.Elementary": "Elementary",
		"difficulty.Intermediate": "Intermediate",
		"difficulty.Advanced": "Advanced",
		"doc.untranslated": "This page is not available in your language yet, so it is shown in English.",
		"doc.nextLesson": "Next lesson",
		"doc.nextLessonTitle": "Go to the next lesson: {lesson}",
		"404.title": "404 - Page Not Found",
		"404.subtitle": "Page Not Found",
		"404.description": "The page you are looking for has been moved, deleted, or never existed.",
		"404.home": "Return Home",
		"footer.license": "Code: MIT · Content: CC BY-NC 4.0",
	},
	es: {
		"site.description": "DaviNotes - Apuntes de desarrollo",
		"home.subtitle": "Mi propia documentación personal.",
		"nav.home": "Inicio",
		"nav.goHome": "Ir a la página de inicio",
		"nav.goTo": "Ir a {lang}",
		"nav.back": "Volver",
		"nav.openMenu": "Abrir menú",
		"nav.closeMenu": "Cerrar menú",
		"nav.mainNavigation": "Navegación principal",
		"nav.breadcrumb": "Ruta de navegación",
		"nav.scrollTop": "Volver arriba",
		"lang.picker": "Cambiar idioma",
		"index.title": "Apuntes de {lang}",
		"index.keyConcepts": "Conceptos clave",
		"index.ctaTitle": "¿Listo para empezar a crear?",
		"index.ctaText": "Sigue todo el proceso de instalación en nuestra guía.",
		"index.installGuide": "Guía de instalación",
		"index.installTitle": "Ver la guía de instalación de {lang}",
		"info.difficulty": "Dificultad:",
		"info.prerequisites": "Requisitos previos:",
		"difficulty.Fundamental": "Fundamental",
		"difficulty.Beginner": "Principiante",
		"difficulty.Elementary": "Básico",
		"difficulty.Intermediate": "Intermedio",
		"difficulty.Advanced": "Avanzado",
		"doc.untranslated": "Esta página todavía no está disponible en tu idioma, así que se muestra en inglés.",
		"doc.nextLesson": "Siguiente lección",
		"doc.nextLessonTitle": "Ir a la siguiente lección: {lesson}",
		"404.title": "404 - Página no encontrada",
		"404.subtitle": "Página no encontrada",
		"404.description": "La página que buscas se ha movido, se ha eliminado o nunca ha existido.",
		"404.home": "Volver al inicio",
		"footer.license": "Código: MIT · Contenido: CC BY-NC 4.0",
	},
	fr: {
		"site.description": "DaviNotes - Notes de développement",
		"home.subtitle": "Ma propre documentation personnelle.",
		"nav.home": "Accueil",
		"nav.goHome": "Aller à la page d'accueil",
		"nav.goTo": "Aller à {lang}",
		"nav.back": "Retour",
		"nav.openMenu": "Ouvrir le menu",
		"nav.closeMenu": "Fermer le menu",
		"nav.mainNavigation": "Navigation principale",
		"nav.breadcrumb": "Fil d'Ariane",
		"nav.scrollTop": "Retour en haut",
		"lang.picker": "Changer de langue",
		"index.title": "Notes sur {lang}",
		"index.keyConcepts": "Concepts clés",
		"index.ctaTitle": "Prêt à commencer ?",
		"index.ctaText": "Suivez toutes les étapes d'installation dans notre guide dédié.",
		"index.installGuide": "Guide d'installation",
		"index.installTitle": "Voir le guide d'installation de {lang}",
		"info.difficulty": "Difficulté :",
		"info.prerequisites": "Prérequis :",
		"difficulty.Fundamental": "Fondamental",
		"difficulty.Beginner": "Débutant",
		"difficulty.Elementary": "Élémentaire",
		"difficulty.Intermediate": "Intermédiaire",
		"difficulty.Advanced": "Avancé",
		"doc.untranslated": "Cette page n'est pas encore disponible dans votre langue, elle est donc affichée en anglais.",
		"doc.nextLesson": "Leçon suivante",
		"doc.nextLessonTitle": "Aller à la leçon suivante : {lesson}",
		"404.title": "404 - Page introuvable",
		"404.subtitle": "Page introuvable",
		"404.description": "La page que vous cherchez a été déplacée, supprimée ou n'a jamais existé.",
		"404.home": "Retour à l'accueil",
		"footer.license": "Code : MIT · Contenu : CC BY-NC 4.0",
	},
} as const satisfies Record<Lang, Record<string, string>>;

export type UIKey = keyof (typeof ui)[typeof defaultLang];

import type en from "../en/docs";

/**
 * Interface strings used only by the documentation (DaviNotes): language index pages, lessons and search.
 */
export default {
	"index.title": "Apuntes de {lang}",
	"index.keyConcepts": "Conceptos clave",
	"index.frameworks": "Frameworks",
	"index.frameworksIntro": "Frameworks y librerías populares construidos sobre {lang}.",
	"index.frameworkConcepts": "Temas que cubre:",
	"index.ctaTitle": "¿Listo para empezar a crear?",
	"index.ctaText": "Sigue todo el proceso de instalación en nuestra guía.",
	"index.installGuide": "Guía de instalación",
	"index.installTitle": "Ver la guía de instalación de {lang}",
	"doc.untranslated": "Esta página todavía no está disponible en tu idioma, así que se muestra en inglés.",
	"search.label": "Buscar en los apuntes de {lang}",
	"search.placeholder": "Busca una palabra clave, p. ej. variables",
	"search.clear": "Borrar búsqueda",
	"search.resultOne": "1 resultado",
	"search.resultMany": "{count} resultados",
	"search.showing": "Mostrando los primeros {shown} de {count} resultados",
	"search.noResults": "No hay resultados para «{query}»",
	"doc.previousLesson": "Lección anterior",
	"doc.previousLessonTitle": "Ir a la lección anterior: {lesson}",
	"doc.nextLesson": "Siguiente lección",
	"doc.nextLessonTitle": "Ir a la siguiente lección: {lesson}",
	"doc.discoverFrameworks": "Explora los frameworks",
	"doc.discoverFrameworksCta": "Frameworks de {lang}",
	"doc.discoverFrameworksTitle": "Descubre frameworks construidos con {lang}",
} as const satisfies Record<keyof typeof en, string>;

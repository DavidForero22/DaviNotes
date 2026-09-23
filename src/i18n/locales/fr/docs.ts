import type en from "../en/docs";

/**
 * Interface strings used only by the documentation (DaviNotes): language index pages, lessons and search.
 */
export default {
	"index.title": "Notes sur {lang}",
	"index.keyConcepts": "Concepts clés",
	"index.frameworks": "Frameworks",
	"index.frameworksIntro": "Frameworks et bibliothèques populaires construits sur {lang}.",
	"index.frameworkConcepts": "Sujets abordés :",
	"index.ctaTitle": "Prêt à commencer ?",
	"index.ctaText": "Suivez toutes les étapes d'installation dans notre guide dédié.",
	"index.installGuide": "Guide d'installation",
	"index.installTitle": "Voir le guide d'installation de {lang}",
	"doc.untranslated": "Cette page n'est pas encore disponible dans votre langue, elle est donc affichée en anglais.",
	"search.label": "Rechercher dans les notes sur {lang}",
	"search.placeholder": "Recherchez un mot-clé, p. ex. variables",
	"search.clear": "Effacer la recherche",
	"search.resultOne": "1 résultat",
	"search.resultMany": "{count} résultats",
	"search.showing": "Affichage des {shown} premiers résultats sur {count}",
	"search.noResults": "Aucun résultat pour « {query} »",
	"doc.previousLesson": "Leçon précédente",
	"doc.previousLessonTitle": "Aller à la leçon précédente : {lesson}",
	"doc.nextLesson": "Leçon suivante",
	"doc.nextLessonTitle": "Aller à la leçon suivante : {lesson}",
	"doc.discoverFrameworks": "Découvrez les frameworks",
	"doc.discoverFrameworksCta": "Frameworks {lang}",
	"doc.discoverFrameworksTitle": "Découvrez des frameworks construits avec {lang}",
} as const satisfies Record<keyof typeof en, string>;

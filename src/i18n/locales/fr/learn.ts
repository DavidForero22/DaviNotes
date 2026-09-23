import type en from "../en/learn";

/**
 * Interface strings used only by the learning mode (DaviLearn): exercises, roulette and progress.
 */
export default {
	"learn.title": "Apprendre",
	"learn.heading": "Commencez à apprendre",
	"learn.intro": "Choisissez un langage, résolvez des exercices et suivez votre progression.",
	"learn.comingSoon": "La roulette des langages et les exercices arrivent bientôt.",
} as const satisfies Record<keyof typeof en, string>;

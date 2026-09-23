import type en from "../en/learn";

/**
 * Interface strings used only by the learning mode (DaviLearn): exercises, roulette and progress.
 */
export default {
	"learn.title": "Aprender",
	"learn.heading": "Empieza a aprender",
	"learn.intro": "Elige un lenguaje, resuelve ejercicios y sigue tu progreso.",
	"learn.comingSoon": "La ruleta de lenguajes y los ejercicios llegarán pronto.",
} as const satisfies Record<keyof typeof en, string>;

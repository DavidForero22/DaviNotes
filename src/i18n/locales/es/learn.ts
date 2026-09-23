import type en from "../en/learn";

/**
 * Interface strings used only by the learning mode (DaviLearn): exercises, roulette and progress.
 */
export default {
	"learn.title": "Aprender",
	"learn.heading": "Empieza a aprender",
	"learn.intro": "Elige un lenguaje, resuelve ejercicios y sigue tu progreso.",
	"learn.comingSoon": "La ruleta de lenguajes y los ejercicios llegarán pronto.",
	"learn.suggest.heading": "¿No sabes por dónde empezar?",
	"learn.suggest.button": "Sugerir un lenguaje",
	"learn.suggest.result": "¿Qué tal {lang}?",
} as const satisfies Record<keyof typeof en, string>;

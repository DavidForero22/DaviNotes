import type en from "../en/learn";

/**
 * Interface strings used only by the learning mode (DaviLearn): exercises, roulette and progress.
 */
export default {
	"learn.title": "Aprender",
	"learn.heading": "Empieza a aprender",
	"learn.intro": "Elige un lenguaje, resuelve ejercicios y sigue tu progreso.",
	"learn.suggest.heading": "¿No sabes por dónde empezar?",
	"learn.suggest.button": "Sugerir un lenguaje",
	"learn.suggest.result": "¿Qué tal {lang}?",
	"learn.list.heading": "Exercises", // TODO(i18n C6)
	"learn.list.empty": "There are no exercises yet. Come back soon.", // TODO(i18n C6)
	"learn.list.inEnglish": "In English", // TODO(i18n C6)
	"learn.list.loadError": "We could not load the exercises. Reload the page to try again.", // TODO(i18n C6)
	"learn.guest.heading": "Keep your progress", // TODO(i18n C6)
	"learn.guest.text": "Create a free account to solve exercises, earn coins and XP, and level up.", // TODO(i18n C6)
	"learn.exercise.description": "Solve this exercise to earn coins and XP.", // TODO(i18n C6)
	"learn.exercise.notFoundTitle": "Exercise not found", // TODO(i18n C6)
	"learn.exercise.notFoundText": "This exercise does not exist or is no longer available.", // TODO(i18n C6)
	"learn.exercise.loadErrorTitle": "We could not load the exercise", // TODO(i18n C6)
	"learn.exercise.loadErrorText": "Something failed on our side. Try again in a moment.", // TODO(i18n C6)
	"learn.exercise.reload": "Try again", // TODO(i18n C6)
	"learn.exercise.backToLearn": "Back to Learn", // TODO(i18n C6)
	"learn.exercise.noscript": "You need JavaScript turned on to solve exercises.", // TODO(i18n C6)
	"learn.exercise.untranslated": "This exercise is not translated yet, so it is shown in English.", // TODO(i18n C6)
	"learn.exercise.sessionExpired": "Your session has expired. {signIn} to save your result.", // TODO(i18n C6)
	"learn.exercise.signIn": "Sign in", // TODO(i18n C6)
	"learn.exercise.progress": "Tu progreso",
	"learn.exercise.level": "Nivel {level}",
	"learn.exercise.xpProgress": "{xp} de {total} XP",
	"learn.exercise.coinOne": "{count} moneda",
	"learn.exercise.coinOther": "{count} monedas",
	"learn.exercise.difficulty": "Dificultad {n}/10",
	"learn.exercise.reward": "Recompensa: {coins} y {xp} XP",
	"learn.exercise.completed": "Completado",
	"learn.exercise.context": "Contexto",
	"learn.exercise.objective": "Objetivo técnico",
	"learn.exercise.question": "Pregunta",
	"learn.exercise.chooseAnswer": "Elige una respuesta",
	"learn.exercise.answerLabel": "Tu respuesta",
	"learn.exercise.solved": "Resuelto",
	"learn.exercise.notSolved": "No resuelto",
	"learn.exercise.answerFirst": "Elige o escribe una respuesta antes de marcar el ejercicio como resuelto.",
	"learn.exercise.sending": "Enviando…",
	"learn.exercise.error": "Algo ha fallado y no se ha guardado nada. Inténtalo de nuevo.",
	"learn.hint.heading": "Pistas",
	"learn.hint.intro": "Cada pista cuesta {coins}. Una vez desbloqueada, ya no se vuelve a bloquear.",
	"learn.hint.label": "Pista {n}:",
	"learn.hint.unlock": "Ver la pista {n} ({coins})",
	"learn.hint.noCoins": "Necesitas {coins} para ver una pista. Consigue monedas completando un ejercicio nuevo.",
	"learn.hint.unlocked": "Pista {n} desbloqueada. Saldo restante: {coins}.",
	"learn.result.correct": "Correcto",
	"learn.result.incorrect": "Incorrecto",
	"learn.result.notSolved": "No resuelto",
	"learn.result.earned": "Has ganado {coins} y {xp} XP.",
	"learn.result.levelUp": "¡Has subido de nivel! Ahora estás en el nivel {level}.",
	"learn.result.alreadyCompleted": "Ya habías completado este ejercicio, así que esta vez no hay recompensa.",
	"learn.result.noReward": "Esta vez no hay monedas ni XP. Tu intento se ha guardado.",
	"learn.result.yourAnswer": "Tu respuesta",
	"learn.result.retry": "Intentar de nuevo",
} as const satisfies Record<keyof typeof en, string>;

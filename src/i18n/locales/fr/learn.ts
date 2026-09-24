import type en from "../en/learn";

/**
 * Interface strings used only by the learning mode (DaviLearn): exercises, roulette and progress.
 */
export default {
	"learn.title": "Apprendre",
	"learn.heading": "Commencez à apprendre",
	"learn.intro": "Choisissez un langage, résolvez des exercices et suivez votre progression.",
	"learn.suggest.heading": "Vous ne savez pas par où commencer ?",
	"learn.suggest.button": "Suggérer un langage",
	"learn.suggest.result": "Et pourquoi pas {lang} ?",
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
	"learn.exercise.progress": "Votre progression",
	"learn.exercise.level": "Niveau {level}",
	"learn.exercise.xpProgress": "{xp} sur {total} XP",
	"learn.exercise.coinOne": "{count} pièce",
	"learn.exercise.coinOther": "{count} pièces",
	"learn.exercise.difficulty": "Difficulté {n}/10",
	"learn.exercise.reward": "Récompense : {coins} et {xp} XP",
	"learn.exercise.completed": "Terminé",
	"learn.exercise.context": "Contexte",
	"learn.exercise.objective": "Objectif technique",
	"learn.exercise.question": "Question",
	"learn.exercise.chooseAnswer": "Choisissez une réponse",
	"learn.exercise.answerLabel": "Votre réponse",
	"learn.exercise.solved": "Résolu",
	"learn.exercise.notSolved": "Non résolu",
	"learn.exercise.answerFirst": "Choisissez ou saisissez une réponse avant de marquer l'exercice comme résolu.",
	"learn.exercise.sending": "Envoi…",
	"learn.exercise.error": "Une erreur s'est produite et rien n'a été enregistré. Veuillez réessayer.",
	"learn.hint.heading": "Indices",
	"learn.hint.intro": "Chaque indice coûte {coins}. Une fois débloqué, il le reste.",
	"learn.hint.label": "Indice {n} :",
	"learn.hint.unlock": "Afficher l'indice {n} ({coins})",
	"learn.hint.noCoins": "Il vous faut {coins} pour afficher un indice. Gagnez des pièces en terminant un nouvel exercice.",
	"learn.hint.unlocked": "Indice {n} débloqué. Il vous reste {coins}.",
	"learn.result.correct": "Correct",
	"learn.result.incorrect": "Incorrect",
	"learn.result.notSolved": "Non résolu",
	"learn.result.earned": "Vous gagnez {coins} et {xp} XP.",
	"learn.result.levelUp": "Niveau supérieur ! Vous êtes maintenant au niveau {level}.",
	"learn.result.alreadyCompleted": "Vous aviez déjà terminé cet exercice : pas de récompense cette fois-ci.",
	"learn.result.noReward": "Pas de pièces ni d'XP cette fois-ci. Votre tentative a été enregistrée.",
	"learn.result.yourAnswer": "Votre réponse",
	"learn.result.retry": "Réessayer",
} as const satisfies Record<keyof typeof en, string>;

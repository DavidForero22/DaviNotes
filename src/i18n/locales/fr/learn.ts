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
	"learn.list.heading": "Exercices",
	"learn.list.empty": "Il n'y a pas encore d'exercices. Revenez bientôt.",
	"learn.list.inEnglish": "En anglais",
	"learn.list.loadError": "Nous n'avons pas pu charger les exercices. Rechargez la page pour réessayer.",
	"learn.guest.heading": "Conservez votre progression",
	"learn.guest.text": "Créez un compte gratuit pour résoudre des exercices, gagner des pièces et de l'XP, et monter de niveau.",
	"learn.exercise.description": "Résolvez cet exercice pour gagner des pièces et de l'XP.",
	"learn.exercise.notFoundTitle": "Exercice introuvable",
	"learn.exercise.notFoundText": "Cet exercice n'existe pas ou n'est plus disponible.",
	"learn.exercise.loadErrorTitle": "Nous n'avons pas pu charger l'exercice",
	"learn.exercise.loadErrorText": "Un problème est survenu de notre côté. Réessayez dans un instant.",
	"learn.exercise.reload": "Réessayer",
	"learn.exercise.backToLearn": "Retour à Apprendre",
	"learn.exercise.noscript": "Vous devez activer JavaScript pour résoudre les exercices.",
	"learn.exercise.untranslated": "Cet exercice n'est pas encore traduit : il s'affiche donc en anglais.",
	"learn.exercise.sessionExpired": "Votre session a expiré. {signIn} pour enregistrer votre résultat.",
	"learn.exercise.signIn": "Connectez-vous",
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
	"learn.profile.title": "Mi perfil", // TODO(i18n)
	"learn.profile.description": "Tu nivel, tus monedas y los lenguajes que quieres practicar en DaviLearn.", // TODO(i18n)
	"learn.profile.intro": "Tu progreso y los lenguajes que entran en la ruleta.", // TODO(i18n)
	"learn.profile.progressHeading": "Progreso", // TODO(i18n)
	"learn.profile.completedOne": "{count} ejercicio completado", // TODO(i18n)
	"learn.profile.completedOther": "{count} ejercicios completados", // TODO(i18n)
	"learn.profile.attemptsOne": "{count} intento", // TODO(i18n)
	"learn.profile.attemptsOther": "{count} intentos", // TODO(i18n)
	"learn.profile.loadErrorTitle": "No hemos podido cargar tu perfil", // TODO(i18n)
	"learn.profile.loadErrorText": "Algo ha fallado por nuestra parte. Vuelve a intentarlo en unos segundos.", // TODO(i18n)
	"learn.profile.languagesHeading": "Lenguajes activos", // TODO(i18n)
	"learn.profile.languagesHint": "Marca los lenguajes que quieres practicar. La ruleta de la portada solo gira entre estos.", // TODO(i18n)
	"learn.profile.languagesSubmit": "Guardar lenguajes", // TODO(i18n)
	"learn.profile.saved": "Lenguajes guardados.", // TODO(i18n)
	"learn.profile.savedNone": "Lenguajes guardados. No tienes ninguno activo, así que la ruleta no puede girar.", // TODO(i18n)
	"learn.profile.goToRoulette": "Ir a la ruleta", // TODO(i18n)
	"learn.profile.errorInvalid": "Uno de los lenguajes no es válido. Revisa la selección y vuelve a guardar.", // TODO(i18n)
	"learn.profile.errorInternal": "No hemos podido guardar los lenguajes. Vuelve a intentarlo.", // TODO(i18n)
	"learn.profile.achievementsHeading": "Logros", // TODO(i18n)
	"learn.profile.achievementsEmpty": "Próximamente. Aquí verás los logros que consigas resolviendo ejercicios.", // TODO(i18n)
	"learn.roulette.heading": "Ruleta de lenguajes", // TODO(i18n)
	"learn.roulette.intro": "Gira la ruleta y resuelve un ejercicio del lenguaje que salga.", // TODO(i18n)
	"learn.roulette.single": "Solo tienes {lang} activo. Añade más lenguajes en tu perfil para que la ruleta gire entre ellos.", // TODO(i18n)
	"learn.roulette.spin": "Girar la ruleta", // TODO(i18n)
	"learn.roulette.spinAgain": "Girar otra vez", // TODO(i18n)
	"learn.roulette.result": "Ha salido {lang}.", // TODO(i18n)
	"learn.roulette.play": "Resolver un ejercicio de {lang}", // TODO(i18n)
	"learn.roulette.direct": "O elige tú:", // TODO(i18n)
	"learn.roulette.edit": "Cambiar mis lenguajes", // TODO(i18n)
	"learn.roulette.empty": "Todavía no has elegido lenguajes. Elige los que quieres practicar y la ruleta girará entre ellos.", // TODO(i18n)
	"learn.roulette.emptyLink": "Elegir lenguajes en mi perfil", // TODO(i18n)
	"learn.roulette.loadError": "No hemos podido cargar tus lenguajes. Recarga la página para volver a intentarlo.", // TODO(i18n)
	"learn.play.description": "Ejercicio aleatorio del lenguaje que ha salido en la ruleta.", // TODO(i18n)
	"learn.play.noExercisesTitle": "Todavía no hay ejercicios de {lang}", // TODO(i18n)
	"learn.play.noExercisesText": "Estamos preparando ejercicios de {lang}. Mientras tanto, gira la ruleta otra vez o activa otros lenguajes en tu perfil.", // TODO(i18n)
	"learn.play.notActiveTitle": "{lang} no está entre tus lenguajes activos", // TODO(i18n)
	"learn.play.notActiveText": "Actívalo en tu perfil para que la ruleta pueda proponértelo.", // TODO(i18n)
	"learn.play.invalidTitle": "No conocemos ese lenguaje", // TODO(i18n)
	"learn.play.invalidText": "Vuelve a la portada y gira la ruleta para elegir uno.", // TODO(i18n)
	"learn.play.errorTitle": "No hemos podido elegir un ejercicio", // TODO(i18n)
	"learn.play.backToRoulette": "Volver a la ruleta", // TODO(i18n)
	"learn.play.toProfile": "Ir a mi perfil", // TODO(i18n)
} as const satisfies Record<keyof typeof en, string>;

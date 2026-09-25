import type en from "../en/account";

/**
 * Interface strings of the account (DaviLearn): sign in, sign up, the account menu of the
 * header and the texts of every auth error code.
 */
export default {
	"auth.login.title": "Connexion",
	"auth.login.description": "Connectez-vous à DaviLearn pour résoudre des exercices et conserver votre progression.",
	"auth.login.submit": "Se connecter",
	"auth.login.switchPrompt": "Vous n'avez pas de compte ?",
	"auth.login.switchLink": "Créer un compte",
	"auth.register.title": "Créer un compte",
	"auth.register.description": "Créez un compte DaviLearn pour résoudre des exercices, gagner des pièces et monter de niveau.",
	"auth.register.submit": "Créer mon compte",
	"auth.register.switchPrompt": "Vous avez déjà un compte ?",
	"auth.register.switchLink": "Se connecter",
	"auth.continueNotice": "Connectez-vous pour continuer.",
	"auth.requiredNote": "Tous les champs sont obligatoires, sauf ceux indiqués comme facultatifs.",
	"auth.errorTitle": "Erreur : {title}",
	"auth.errorSummary.one": "Il y a 1 problème",
	"auth.errorSummary.other": "Il y a {count} problèmes",
	"auth.errorPrefix": "Erreur :",
	"auth.email.label": "Adresse e-mail",
	"auth.password.label": "Mot de passe",
	"auth.password.hint": "Au moins {min} caractères.",
	"auth.password.show": "Afficher le mot de passe",
	"auth.displayName.label": "Nom affiché (facultatif)",
	"auth.displayName.hint": "Affiché en haut de la page à la place de votre adresse e-mail. {max} caractères maximum.",
	"auth.error.emailEmpty": "Saisissez votre adresse e-mail.",
	"auth.error.emailInvalid": "Saisissez une adresse e-mail au format nom@exemple.com.",
	"auth.error.passwordInvalid": "Saisissez votre mot de passe. Il peut comporter jusqu'à {max} caractères.",
	"auth.error.displayNameInvalid": "Raccourcissez votre nom affiché à {max} caractères maximum.",
	"auth.error.weakPassword": "Le mot de passe doit comporter au moins {min} caractères.",
	"auth.error.emailTaken": "Un compte existe déjà avec cette adresse e-mail. {signIn} ou utilisez une autre adresse.",
	"auth.error.emailTakenLink": "Connectez-vous",
	"auth.error.invalidCredentials": "L'adresse e-mail ou le mot de passe est incorrect. Vérifiez-les et réessayez.",
	"auth.error.rateLimited": "Trop de tentatives. Patientez quelques minutes, puis réessayez.",
	"auth.error.internal": "Nous n'avons pas pu effectuer cette action. Veuillez réessayer.",
	"auth.error.forbiddenOrigin": "Nous avons bloqué la demande, car elle ne provenait pas de ce site. Rechargez la page et réessayez.",
	"account.label": "Compte :",
	"account.fallbackName": "Mon compte",
	"account.level": "Niveau {level}",
	"account.xp": "{xp} sur {total} XP pour atteindre le niveau {next}",
	"account.signIn": "Se connecter",
	"account.signOut": "Se déconnecter",
	"account.signedOut": "Déconnexion effectuée.",
	"account.profile": "Mi perfil", // TODO(i18n)
	"account.admin": "Panel de administración", // TODO(i18n)
} as const satisfies Record<keyof typeof en, string>;

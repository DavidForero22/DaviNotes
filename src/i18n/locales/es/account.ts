import type en from "../en/account";

/**
 * Interface strings of the account (DaviLearn): sign in, sign up, the account menu of the
 * header and the texts of every auth error code.
 * TODO(i18n C6): every value below is the provisional English text; translate it.
 */
export default {
	"auth.login.title": "Sign in", // TODO(i18n C6)
	"auth.login.description": "Sign in to DaviLearn to solve exercises and keep your progress.", // TODO(i18n C6)
	"auth.login.submit": "Sign in", // TODO(i18n C6)
	"auth.login.switchPrompt": "Don't have an account?", // TODO(i18n C6)
	"auth.login.switchLink": "Create an account", // TODO(i18n C6)
	"auth.register.title": "Create an account", // TODO(i18n C6)
	"auth.register.description": "Create a DaviLearn account to solve exercises, earn coins and level up.", // TODO(i18n C6)
	"auth.register.submit": "Create account", // TODO(i18n C6)
	"auth.register.switchPrompt": "Already have an account?", // TODO(i18n C6)
	"auth.register.switchLink": "Sign in", // TODO(i18n C6)
	"auth.continueNotice": "Sign in to continue.", // TODO(i18n C6)
	"auth.requiredNote": "All fields are required unless marked as optional.", // TODO(i18n C6)
	"auth.errorTitle": "Error: {title}", // TODO(i18n C6)
	"auth.errorSummary.one": "There is 1 problem", // TODO(i18n C6)
	"auth.errorSummary.other": "There are {count} problems", // TODO(i18n C6)
	"auth.errorPrefix": "Error:", // TODO(i18n C6)
	"auth.email.label": "Email", // TODO(i18n C6)
	"auth.password.label": "Password", // TODO(i18n C6)
	"auth.password.hint": "At least {min} characters.", // TODO(i18n C6)
	"auth.password.show": "Show password", // TODO(i18n C6)
	"auth.displayName.label": "Display name (optional)", // TODO(i18n C6)
	"auth.displayName.hint": "Shown at the top of the page instead of your email. Up to {max} characters.", // TODO(i18n C6)
	"auth.error.emailEmpty": "Enter your email address.", // TODO(i18n C6)
	"auth.error.emailInvalid": "Enter an email address in the format name@example.com.", // TODO(i18n C6)
	"auth.error.passwordInvalid": "Enter your password. It can have up to {max} characters.", // TODO(i18n C6)
	"auth.error.displayNameInvalid": "Shorten your display name to {max} characters or fewer.", // TODO(i18n C6)
	"auth.error.weakPassword": "Your password must have at least {min} characters.", // TODO(i18n C6)
	"auth.error.emailTaken": "There is already an account with this email. {signIn} or use another email.", // TODO(i18n C6)
	"auth.error.emailTakenLink": "Sign in", // TODO(i18n C6)
	"auth.error.invalidCredentials": "The email or the password is not correct. Check them and try again.", // TODO(i18n C6)
	"auth.error.rateLimited": "Too many attempts. Wait a few minutes and try again.", // TODO(i18n C6)
	"auth.error.internal": "We could not complete the action. Please try again.", // TODO(i18n C6)
	"auth.error.forbiddenOrigin": "The request was blocked because it did not come from this site. Reload the page and try again.", // TODO(i18n C6)
	"account.label": "Account:", // TODO(i18n C6)
	"account.fallbackName": "My account", // TODO(i18n C6)
	"account.level": "Level {level}", // TODO(i18n C6)
	"account.xp": "{xp} of {total} XP to level {next}", // TODO(i18n C6)
	"account.signIn": "Sign in", // TODO(i18n C6)
	"account.signOut": "Sign out", // TODO(i18n C6)
	"account.signedOut": "You have signed out.", // TODO(i18n C6)
} as const satisfies Record<keyof typeof en, string>;

/**
 * Account rules shared by the server (validation in `/api/auth/*`) and the UI (requirement
 * texts, `minlength`/`maxlength`). Isomorphic: no server-only imports, safe in `.vue` files.
 *
 * PASSWORD_MIN_LENGTH must match `minimum_password_length` in `supabase/config.toml`.
 * No composition rules (Tech Lead, C3): only a length.
 */
export const PASSWORD_MIN_LENGTH = 8;

/** bcrypt ignores bytes after 72, so Supabase Auth rejects longer passwords. */
export const PASSWORD_MAX_LENGTH = 72;

/** `profiles.display_name` check: 1-40 characters after trimming. */
export const DISPLAY_NAME_MAX_LENGTH = 40;

/** Longest email accepted (RFC 5321 path limit). */
export const EMAIL_MAX_LENGTH = 254;

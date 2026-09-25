import type { AstroCookies } from 'astro';
import type { ProfileFlash } from '@/types/api';

/**
 * One-use cookie with the result of a form POST to `/api/profile/languages` (C7): same rules
 * as `dl_auth_flash` (`HttpOnly`, `SameSite=Lax`, `Path=/`, 2 minutes).
 */
export const PROFILE_FLASH_COOKIE = 'dl_profile_flash';

export function setProfileFlash(cookies: AstroCookies, flash: ProfileFlash): void {
	cookies.set(PROFILE_FLASH_COOKIE, JSON.stringify(flash), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 120,
	});
}

/**
 * For the profile page (SSR `.astro` only). Returns the result of the last form POST to
 * `/api/profile/languages`, or `null`, and deletes the cookie so a reload shows no notice.
 *
 * ```astro
 * const flash = consumeProfileFlash(Astro.cookies); // { ok: true } | { ok: false, code } | null
 * ```
 */
export function consumeProfileFlash(cookies: AstroCookies): ProfileFlash | null {
	const raw = cookies.get(PROFILE_FLASH_COOKIE)?.value;
	if (!raw) return null;
	cookies.delete(PROFILE_FLASH_COOKIE, { path: '/' });
	try {
		const value = JSON.parse(raw) as Partial<{ ok: boolean; code: string }> | null;
		if (value?.ok === true) return { ok: true };
		if (value?.ok === false && (value.code === 'invalid_input' || value.code === 'internal_error')) {
			return { ok: false, code: value.code };
		}
		return null;
	} catch {
		return null;
	}
}

# Backlog · SEO & A11y Specialist (en pausa)

> **Estado: agente en pausa** desde el 2026-09-24 (decisión D7 del usuario). Las ramas se fusionan **sin revisión de SEO**
> hasta que la base de DaviLearn esté consolidada. Este archivo lista lo que habrá que revisar al reactivar al agente.
> Lo mantienen el PM y UI.

## Regla mientras dura la pausa (D7)

- UI y Backend siguen aplicando por su cuenta `docs/guidelines/accessibility.md` y `docs/guidelines/account-a11y.md`
  (los requisitos marcados **DEBE**, la checklist de la §5, `noindex` en las páginas de learn y la regla de que el marcado de los docs no cambie).
- Cada PR que toque la interfaz añade aquí sus archivos o páginas en "Pendiente de revisar".
- Antes de reactivar al agente: tomar una **línea base nueva** del HTML de los docs (163 páginas).

## Pendiente de revisar

### Fase C (PRs #29-#32, `renovacion` en `55be0db`): revisión interrumpida

La revisión de C1-C5 no llegó a terminar (límite de sesión). Hay que pasar la checklist §5 de `account-a11y.md` sobre:

| Área | Archivos | Qué comprobar |
|------|----------|---------------|
| Login y registro | `src/pages/learn/{login,register}.astro`, `src/pages/[lang]/learn/{login,register}.astro`, `src/components/learn/AuthForm.astro` | Foco al resumen de errores, `aria-invalid`/`aria-describedby`, `autocomplete`, botón para mostrar la contraseña, funcionamiento sin JS, `<title>` "Error: …", `noindex` |
| Menú de cuenta y cabecera | `src/components/learn/AccountMenu.astro`, `src/layouts/learn/LearnLayout.astro`, `src/styles/learn.css` | `<details>`, logout como formulario, orden del DOM frente al orden visual en móvil, contraste, 320 px |
| Portada de learn | `src/pages/learn/index.astro`, `src/pages/[lang]/learn/index.astro`, `src/components/learn/LearnHome.astro` | Listado, estado de invitado, aviso `signedout`, un solo h1 |
| Ejercicio real | `src/pages/learn/exercise/[id].astro`, `src/pages/[lang]/learn/exercise/[id].astro`, `src/components/learn/{ExercisePage.astro,EjercicioConectado.vue,InterfazEjercicio.vue,exercise-api.ts}` | `lang` del contenido, 404/500 reales, `role="alert"`, 401 con enlace a login, `next` |
| Selector de idioma | `src/components/shared/LanguagePicker.astro` | Conserva `next` y la query |
| API y seguridad | `src/middleware.ts` (comprobación de `Origin` que sustituye a `checkOrigin`), `src/lib/server/{auth,http}.ts`, `src/pages/api/**` | `X-Robots-Tag` en todas las respuestas (también 303/403), `Cache-Control: private, no-store`, sin redirecciones abiertas con `next` (`//evil.com`, `/\evil.com`, `https://…`) |
| Docs | `dist/client/**` (163 páginas) | Marcado idéntico a la línea base (UI y Backend ya lo comprobaron byte a byte) |

Recursos: script de Playwright de UI en `%TEMP%/cui/flow.mjs` (43 comprobaciones) y capturas en `%TEMP%/cui/shots/`.

### Desviaciones declaradas en la Fase C (decidir al revisar)

- ~~`requireUser` devolvía 302~~: resuelto en C7 (Backend lo cambió a 303 y UI quitó el envoltorio `requireSignedIn`).
- Las páginas de learn usan el sufijo de título "· DaviLearn" (antes "· DaviNotes").
- "Sign in" a 320 px pasa a su propia fila sin sesión.
- El 402 no se puede provocar desde la interfaz con 0 monedas (el botón tiene `aria-disabled`); está probado por la API.

### Heredado de la Fase B (no bloqueantes de B10)

- Borde de las opciones a 1,65:1: si algún día se oculta el radio nativo, tiene que llegar a 3:1 (`InterfazEjercicio.vue`).
- Reflow a 320 px y zoom al 200 % sin probar a mano en la pantalla de ejercicio.

### Pantallas futuras (se añaden al construirlas)

| Fecha | PR | Archivos | Notas |
|-------|----|----------|-------|
| 2026-09-25 | C7 (`fase-c/c7-ui`, sin PR) | `src/pages/learn/profile.astro`, `src/pages/[lang]/learn/profile.astro`, `src/components/learn/ProfilePage.astro` | Perfil privado con `noindex`. Casillas nativas con `accent-color` dentro de un `fieldset` (`aria-labelledby` al h2, `aria-describedby` a la ayuda). Aviso tras guardar con `tabindex=-1` + `autofocus` (como el resumen de errores de C4) y `<title>` "Error: …" si falla. Barra de XP `aria-hidden` con la frase al lado. Sin JS: probado |
| 2026-09-25 | C7 | `src/components/learn/RuletaLenguajes.vue`, `src/components/learn/LearnHome.astro` | Rodillo `aria-hidden` + live region `polite` ("Ha salido X."); botón con `aria-disabled` durante el giro y `hidden` hasta hidratar; enlaces directos por lenguaje (camino sin JS). `prefers-reduced-motion`: sin animación. Revisar el anuncio y el orden de foco (botón → enlace al ejercicio) |
| 2026-09-25 | C7 | `src/pages/learn/play.astro`, `src/pages/[lang]/learn/play.astro`, `src/components/learn/PlayPage.astro` | 303 al ejercicio; si no, h1 con el motivo: sin ejercicios (200), lenguaje no activo o desconocido (400), error (500). Decidir si "sin ejercicios" debería ser 404 |
| 2026-09-25 | C7 | `src/components/learn/AccountMenu.astro` | Enlace "Mi perfil" (con `aria-current` en el perfil) antes de cerrar sesión |

## Deuda de los docs (Fase D)

Contraste `#666`/`#888`, foco de `DocSearch`, `prefers-reduced-motion`, `aria-expanded` en `#menu-toggle`, `alt=""` en el logo
del framework, orden de encabezados, skip link en los docs y `BaseHead.astro` con `description` por página. Detalle en el roadmap, Fase D.
Además, `DocSearch.astro` provoca un error en el escaneo de dependencias de Vite en `npm run dev` ("Expected ';' but found 'early'"). No rompe la página, pero conviene corregirlo (UI).

## Producción

Puntos SEO de `docs/architecture/produccion.md` §1-2: `site`, sitemap, `robots.txt`, canonical, hreflang absolutos, Open Graph.

# Fase C: cuenta y progreso

> **Estado: C1-C6 cerradas** (2026-09-24), integradas en `renovacion` con las PRs #29-#32 (merge final `55be0db`). C7+ en el siguiente sprint. Progreso global en [`roadmap.md`](./roadmap.md).

Objetivo de C1-C6: **un usuario puede registrarse, iniciar sesión, resolver un ejercicio real y ganar monedas y XP**,
con la interfaz en en/es/fr. El dashboard, la ruleta y los logros quedan para C7 en adelante.

Todo es local (D1). Los merges se hacen por **PR en GitHub** contra `renovacion` (commit de merge, sin squash).
**No se toca `master`**: está desplegado en Vercel y los previews de `renovacion` fallan (ver "Riesgo de despliegue").

## Ramas y worktrees

Todas salen de `origin/renovacion` (`1263870`). Worktrees en `../DaviNotes-worktrees/…`:

| Rama | Worktree | Agente | Tareas |
|------|----------|--------|--------|
| `fase-c/api` | `c-api/` | Backend Architect | C1, C2 |
| `fase-c/a11y` | `c-a11y/` | SEO/A11y Specialist | C3, revisión antes de cada merge |
| `fase-c/ui-account` | `c-ui/` | UI Frontend Designer | C4, C5 (y los merges) |
| `fase-c/i18n` | `c-i18n/` | i18n Content Manager | C6 |

Supabase local está arrancado desde el worktree `renovacion`. Todos los worktrees comparten el mismo `project_id`
y apuntan al mismo stack (`.env` con los valores de `npx supabase status`; no se versiona).

## Decisiones técnicas de la fase (Tech Lead)

- **T12 · Sesión por cookies:** `@supabase/ssr` con el cliente de `lib/server/supabase.ts`. El middleware rellena
  `locals.user` y `locals.supabase` **solo en rutas SSR** (las prerenderizadas no tienen cookies).
- **T13 · Formularios que funcionan sin JavaScript:** login y registro son `<form method="post">` contra
  `/api/auth/*`, que responden con **redirección 303** (a `/learn` o de vuelta al formulario con el error en la
  query o en una cookie flash). Si se llaman con `Accept: application/json`, responden JSON.
- **T14 · Páginas de learn en SSR:** `/learn`, `/learn/login`, `/learn/register` y `/learn/exercise/[id]` (+ `/es`, `/fr`)
  llevan `prerender = false`. `[lang]` se valida con `isLang(lang) && lang !== defaultLang` (404 si no). Las páginas
  privadas redirigen a login si no hay sesión (`?next=` para volver). Los docs siguen estáticos.
- **T15 · Seguridad de los POST:** `security.checkOrigin` de Astro activado (o comprobación de `Origin` equivalente).
  `X-Robots-Tag: noindex` en todas las respuestas de `/api/**` (no bloqueante 7 de B10).
- **D6** sigue vigente: `POST /api/exercises/[id]/result` recibe `{ correct }`.

## Tareas

### C1 · Backend · Auth y sesión (`fase-c/api`)
- `middleware.ts` con sesión real: `locals.user` (id, email, displayName) y `locals.supabase`. `env.d.ts` actualizado.
- `POST /api/auth/register` (email, contraseña, nombre visible opcional; **sin confirmación de email**, D3; el trigger crea el perfil),
  `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/session`. Comportamiento de T13.
- Errores con códigos estables que UI e i18n puedan traducir (`invalid_credentials`, `email_taken`, `weak_password`,
  `invalid_input`, `rate_limited`…), documentados en `docs/architecture/api.md`.
- T15: `checkOrigin` + `X-Robots-Tag`.

### C2 · Backend · Progreso por API (`fase-c/api`)
- `POST /api/exercises/[id]/result` (`{ correct }`, requiere sesión, devuelve `ResultResponse`).
- `POST /api/exercises/[id]/hints` (`{ hintId }`, requiere sesión; **comprueba que la pista es de ese ejercicio**;
  402 sin saldo; devuelve `UnlockHintResponse`).
- `GET /api/exercises/[id]` (un ejercicio por id, con `locale`; lo necesita la página de ejercicio).
- `GET /api/profile` + `ProfileDTO` en `types/api.ts` (monedas, nivel, XP, `xpToNextLevel`, `displayName`, estadísticas
  básicas: ejercicios completados e intentos). Logros y lenguajes activos quedan para C7+.
- `vue-tsc` en `typecheck` (hoy `tsc` no revisa los `.vue`).
- **Datos de prueba solo locales:** `supabase/exercises/_dev_sample.sql` con 2-3 ejercicios **ficticios y claramente de
  prueba** ("Ejercicio de prueba 1…"), fuera de `seed.sql`, para que UI pueda probar el flujo real. No es contenido real (D4).
- Tests: amplía pgTAP si tocas SQL; prueba los endpoints de extremo a extremo con un usuario local.

### C3 · SEO/A11y · Requisitos de cuenta (`fase-c/a11y`)
- `docs/guidelines/account-a11y.md` (o nueva sección de la guía): requisitos concretos para login y registro (labels,
  `autocomplete`, errores con `aria-invalid` + `aria-describedby`, resumen con `role="alert"` y foco al primer error,
  mostrar u ocultar la contraseña, 3.3.7 y 3.3.8), el menú de cuenta en la cabecera (orden y posición, revalidación
  de `layout-modos.md`), la página de ejercicio real (h1, `noindex`, `lang`) y los estados sin sesión.
- Qué páginas llevan `noindex` y cuáles no (login/registro: `noindex`).
- Empieza ya: UI lo necesita para C4.

### C4 · UI · Login, registro y cuenta (`fase-c/ui-account`)
- Páginas `/learn/login` y `/learn/register` (+ es/fr) según T13/T14 y C3, con los errores de C1.
- Cabecera de learn: hueco de la cuenta (nombre, monedas y nivel, cerrar sesión) o enlace a "Iniciar sesión".
- Learn pasa a SSR (T14); `/learn` sigue siendo la portada pública con `noindex`.
- Claves i18n nuevas **solo en inglés** (`auth.*`, `account.*`); en es/fr, inglés provisional con `// TODO(i18n C6)`.

### C5 · UI · Ejercicio real (`fase-c/ui-account`)
- Página `/learn/exercise/[id]` (+ es/fr) con `InterfazEjercicio` conectado a la API real: el objeto `api` con `fetch`
  (C2), el perfil inicial desde `GET /api/profile`, y la redirección a login sin sesión.
- Desaparecen `EjercicioDemo.vue`, `fixtures/demo-api.ts` y las páginas de demo (o quedan solo en desarrollo; justifícalo).
- Estados de carga, error y "ejercicio no encontrado" (404).
- Probado con `_dev_sample.sql`.

### C6 · i18n · Textos de cuenta (`fase-c/i18n`)
- Traducir a es/fr todas las claves `// TODO(i18n C6)` de C4 y C5 y los mensajes de error de auth.
- `scripts/check-content.ts`: conectar `validateExerciseRefs` con las filas de `exercises` de la BD local (opcional
  por flag, por ejemplo `--db`, para no exigir Supabase en cada ejecución).

## Orden de trabajo y de merge

1. En paralelo: **Backend C1 → C2** y **SEO C3**.
2. **UI C4 + C5** cuando C1 esté hecho y C3 publicado (UI hace `git merge origin/fase-c/api` en su rama si C2 todavía no
   está en `renovacion`, o espera a su PR).
3. **i18n C6** cuando UI publique las claves.
4. SEO revisa cada rama. Merges por PR en este orden: `fase-c/a11y` → `fase-c/api` → `fase-c/ui-account` → `fase-c/i18n`.
5. Comprobación final en `renovacion`: `npm run build`, `npm run typecheck` (con `vue-tsc`), `npm run check:content`,
   `npx supabase db reset` + `npx supabase test db`, y el flujo manual registro → login → ejercicio → monedas.

## Riesgo de despliegue (no se resuelve en C1-C6)

> **Actualización 2026-09-24:** el usuario ha **pausado por completo el despliegue en Vercel**. Hacer merge o push ya no publica nada, así que el riesgo queda neutralizado. La elección de hosting sigue pendiente para producción.

`master` se despliega en Vercel (`davi-notes.vercel.app`). Los despliegues *Preview* de `renovacion` fallan desde que
se añadió `@astrojs/node`. **No hay que hacer merge a `master`** hasta decidir el hosting (ver `produccion.md` §0):
o se cambia a `@astrojs/vercel` y se usa Supabase remoto, o se cambia de plataforma.

## Criterio para dar una rama por terminada

- `npm run build` y `npm run typecheck` sin errores; los docs (163 páginas) con el mismo marcado.
- Backend: `npx supabase db reset` + `npx supabase test db` en verde.
- Commit en su rama, push y aviso al PM con un resumen de 3-5 líneas.

## Cierre de C1-C6 (2026-09-24)

| PR | Rama | Contenido | Merge |
|----|------|-----------|-------|
| #29 | `fase-c/a11y` | C3: `docs/guidelines/account-a11y.md` | `e995a65` |
| #30 | `fase-c/api` | C1 + C2: auth, sesión, API de progreso, `vue-tsc`, `_dev_sample.sql` (48/48 tests) | `5b0609f` |
| #31 | `fase-c/ui-account` | C4 + C5: login, registro, menú de cuenta, learn en SSR, ejercicio real (43/43 comprobaciones con Playwright) | `6148c61` |
| #32 | `fase-c/i18n` | C6: 57 claves en es/fr, `check:content --db` | `55be0db` |

Verificación en `renovacion`:
- `npm run typecheck` (con `vue-tsc`): OK.
- `npm run build`: 163 páginas prerenderizadas, solo los docs (learn es SSR).
- `npm run check:content`: 43/43/43.
- `npx supabase test db`: **no se ha podido ejecutar en `renovacion`** porque Docker Desktop estaba parado. Pasó 48/48 en `fase-c/api` y el merge no tuvo conflictos. Repetirlo al arrancar Docker.

**Decisiones tomadas durante el sprint:**
- Contraseña de 8 caracteres como mínimo (`src/lib/auth-rules.ts`).
- Los errores tras la redirección 303 llegan en una cookie flash `dl_auth_flash`.
- El foco va al resumen de errores, sin `role="alert"`.
- `Cache-Control: private, no-store` en las páginas SSR.
- `checkOrigin` de Astro sustituido por una comprobación de `Origin` en el middleware, para que el 403 también lleve `X-Robots-Tag`.
- **D6:** confirmada como autoevaluación.

**D7 (2026-09-24): SEO/A11y e i18n en pausa.** La interfaz se desarrolla **solo en español** hasta consolidar la base. Claves nuevas: texto en español en `es` y la misma clave con el texto español + `// TODO(i18n)` en `en`/`fr`. Las ramas se fusionan sin revisión de SEO. Lo aplazado está en `docs/backlog/i18n.md` y `docs/backlog/seo-a11y.md`.

**Revisión de SEO de C1-C5:** quedó interrumpida por el límite de sesión y pasa a `docs/backlog/seo-a11y.md`.

### Para C7+
- Definir los "lenguajes activos" del usuario (lo necesita la ruleta): ¿los elige el usuario en su perfil, o se deducen de sus intentos?
- `DashboardPerfil.vue`, `RuletaLenguajes.vue` y logros (`new_achievements` hoy es `{}`).
- Limpieza técnica:
  - `requireUser` debe devolver 303 en lugar de 302 (Backend).
  - Error de escaneo de Vite en `DocSearch.astro` (UI).
- Supabase local: arrancar Docker Desktop y ejecutar `npx supabase start` desde `renovacion`. Contiene los usuarios de prueba de UI y los 3 ejercicios de `_dev_sample.sql`.

## C7 · Perfil, lenguajes activos y ruleta (abierta 2026-09-25)

Decisiones del usuario (D8):
- **Lenguajes activos:** los elige el usuario en su perfil. Por ahora solo se pueden elegir `astro`, `html`, `java`, `php`, `python` y `react`, los lenguajes con documentación.
- **Ruleta:** solo contiene los lenguajes activos del usuario. Con 1 lenguaje activo, la ruleta tiene solo ese (se revisará en el futuro). Con 0, invita a elegirlos en el perfil.
- **Logros:** los diseña el usuario. Por ahora solo hay una **sección vacía** en el perfil, sin tablas ni reglas nuevas.
- **Idioma de la interfaz:** solo español (D7). Las páginas y claves nuevas se apuntan en `docs/backlog/{i18n,seo-a11y}.md`.

Ramas (desde `origin/renovacion`, en este orden y **sin PR**, que la decide el usuario): `fase-c/c7-api` (worktree `c7-api`) y después `fase-c/c7-ui` (worktree `c7-ui`, que parte de `c7-api`).

### Contrato (T16)
- `src/lib/learn-rules.ts` (isomórfico): `SELECTABLE_LANGUAGES = ["astro","html","java","php","python","react"] as const` y el tipo `SelectableLanguage`.
- BD: tabla `user_languages (user_id → auth.users, language_slug, created_at, PK (user_id, language_slug))`, con un CHECK sobre los 6 slugs. RLS: el dueño lee, inserta y borra.
- `ProfileDTO` + `activeLanguages: SelectableLanguage[]` (en el orden de `SELECTABLE_LANGUAGES`).
- `POST /api/profile/languages` (sesión): reemplaza el conjunto de lenguajes.
  - Formulario HTML: campos `languages` repetidos, más `lang` y `next`. Responde con una redirección 303 a `next` o `/{lang}/learn/profile`, y deja un aviso de éxito o error en una cookie flash.
  - JSON: `{ languages: [...] }` → 200 `{ activeLanguages }`.
  - Un slug que no sea válido → 400 `invalid_input`. Una lista vacía está permitida.
- `pickExercise(supabase, user, language, locale)` en `lib/server/progress.ts`: devuelve el id de un ejercicio aleatorio de ese lenguaje, dando preferencia a los que el usuario no ha completado, o `null`. Solo acepta lenguajes activos del usuario.
- `GET /api/exercises/random?language=&locale=` (sesión): 200 `{ id }` / 404 `no_exercises` / 400 si el lenguaje no está activo.

### Páginas (UI)
- `/learn/profile` (+ `/[lang]/…`), SSR y privada, con `noindex`. Contiene `DashboardPerfil.vue` o su equivalente en Astro: nivel, XP, monedas y estadísticas; el formulario de lenguajes activos (casillas, funciona sin JS); y la sección "Logros" vacía ("Próximamente").
- `/learn` con sesión: `RuletaLenguajes.vue`, que evoluciona el rodillo de `LanguageSuggestion`. Gira solo entre los `activeLanguages`. El resultado lleva a `/learn/play?language=x`: página SSR que redirige con 303 a `/learn/exercise/[id]` (vía `pickExercise`) o muestra "No hay ejercicios de X todavía". Con 0 lenguajes activos, enlace al perfil.
- El menú de cuenta enlaza a "Mi perfil".

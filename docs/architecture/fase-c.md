# Fase C: cuenta y progreso

> **Estado: abierta** (2026-09-24). Objetivo de este sprint: **C1-C6**. Progreso global en [`roadmap.md`](./roadmap.md).

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

`master` se despliega en Vercel (`davi-notes.vercel.app`). Los despliegues *Preview* de `renovacion` fallan desde que
se añadió `@astrojs/node`. **No hay que hacer merge a `master`** hasta decidir el hosting (ver `produccion.md` §0):
o se cambia a `@astrojs/vercel` y se usa Supabase remoto, o se cambia de plataforma.

## Criterio para dar una rama por terminada

- `npm run build` y `npm run typecheck` sin errores; los docs (163 páginas) con el mismo marcado.
- Backend: `npx supabase db reset` + `npx supabase test db` en verde.
- Commit en su rama, push y aviso al PM con un resumen de 3-5 líneas.

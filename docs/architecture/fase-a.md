# Fase A: base técnica y layout de dos modos

Objetivo: dejar lista la infraestructura (Vue, adaptador Node, Supabase local) y el layout
que diferencia el modo **Documentación** del modo **Aprender**. La fase no incluye lógica de
ejercicios, ruleta, autenticación ni datos reales (eso son las fases B y C).

## Ramas y worktrees

Todo es local: **no se hace push** sin permiso del usuario.

| Rama | Worktree (`../DaviNotes-worktrees/…`) | Agente |
|------|----------------------------------------|--------|
| `renovacion` | `renovacion/` | Integración. Solo UI hace merges aquí |
| `fase-a/infra` | `infra/` | Backend Architect |
| `fase-a/i18n-learn` | `i18n-learn/` | Translator |
| `fase-a/ui-layout` | `ui-layout/` | UI Frontend Designer |
| (sin rama; solo lectura) | — | SEO Specialist revisa cada rama antes del merge |

- El checkout principal (`DaviNotes/`, rama `master`) **no se toca**.
- Cada agente trabaja **solo en su worktree** y ejecuta `npm install` allí.
- Cada agente hace commits en su propia rama.

## Tareas

### Backend · `fase-a/infra`
Es la única rama que toca `package.json`, `package-lock.json` y `astro.config.mjs`.
Si otra rama necesita una dependencia, se la pide a Backend.
- Dependencias: `@astrojs/vue` + `vue`, `@astrojs/node` (modo `standalone`), `@supabase/supabase-js`, `@supabase/ssr`.
- `astro.config.mjs`: integración Vue + adaptador Node, manteniendo `output: 'static'`.
- `src/env.d.ts`, `src/middleware.ts` (esqueleto: todavía sin sesión real) y `src/lib/server/supabase.ts`.
- Supabase local: `supabase/config.toml` (`supabase init`). No hay migraciones todavía.
- Script `typecheck` en `package.json` (`tsc --noEmit`).

### i18n · `fase-a/i18n-learn`
- Namespace `learn` en `locales/{en,es,fr}/learn.ts`, registrado en `ui.ts`.
- Las claves iniciales las define UI (ver abajo); se pueden añadir más durante la fase.
- Proponer con UI la forma de las rutas localizadas de `learn` (ver "Rutas").

### UI · `fase-a/ui-layout`
- Wireframe del layout de dos modos, documentado en `docs/architecture/layout-modos.md`.
- `ModeSwitch.astro` en `components/shared/`: el conmutador Documentación ⇄ Aprender, visible en ambos modos.
- `layouts/learn/LearnLayout.astro` y `styles/learn.css`, reutilizando `tokens.css` y los componentes compartidos.
- Páginas `/learn`, `/es/learn` y `/fr/learn`, con contenido provisional.
- Primera isla Vue mínima, como prueba de que la integración funciona (sin lógica de negocio).

### SEO/A11y · revisión
- Antes de empezar: requisitos de accesibilidad del `ModeSwitch` y del `LearnLayout` (landmarks, `aria-current`, foco, teclado).
- Decidir si `/learn` provisional se indexa o lleva `noindex`.
- Revisar cada rama antes del merge. Los docs solo cambian **a propósito**: por ejemplo, el `ModeSwitch`
  aparecerá en la cabecera de todas las páginas. Cualquier otro cambio en su HTML es una regresión.

## Rutas de `learn` (propuesta UI)

- `src/pages/learn/index.astro` → `/learn` (inglés, sin prefijo, como los docs).
- `src/pages/[lang]/learn/index.astro` → `/es/learn` y `/fr/learn`, generados con `getStaticPaths`.
  El segmento estático `learn` tiene prioridad sobre el catch-all `[...path].astro`.
- Las dos páginas renderizan el mismo componente, así que `AlternateLinks` funciona sin excepciones.
- En la fase A las páginas se prerenderizan, porque todavía no hay sesión. Pasarán a
  `prerender = false` en la fase C, cuando dependan del usuario.

## Claves i18n iniciales (UI → i18n)

| Clave | en |
|-------|----|
| `mode.switcher` | Site section |
| `mode.docs` | Documentation |
| `mode.learn` | Learn |
| `learn.title` | Learn |
| `learn.heading` | Start learning |
| `learn.intro` | Pick a language, solve exercises and track your progress. |
| `learn.comingSoon` | The language roulette and exercises are coming soon. |

Si `mode.*` se usa en ambos modos, va en `common`; `learn.*` va en `learn`.

## Orden de merge en `renovacion`

1. `fase-a/infra` y `fase-a/i18n-learn` en paralelo, porque no tocan los mismos archivos. Se hace
   merge de cada una cuando esté lista y revisada.
2. `fase-a/ui-layout` actualiza su rama con `renovacion` (merge) y después se integra.
3. Comprobación final en `renovacion`: `npm run build`, `tsc --noEmit` y revisión SEO. Luego se avisa al usuario.

## Criterio para dar una rama por terminada

- `npm run build` sin errores. Los docs siguen siendo **163 páginas**, y al final de la fase
  hay además 3 páginas `learn`.
- `npx tsc --noEmit` sin errores.
- Commit en su rama y aviso a UI (merge) y a SEO (revisión) a la vez, con un resumen de 2-3 líneas.

# Fase B: esquema y ejercicios

> **Estado: cerrada** (2026-09-24). Integrada en `renovacion` con las PRs #23-#27 (merge final `d6afdef`). Progreso global en [`roadmap.md`](./roadmap.md).

Objetivo: tener la base de datos con las reglas de progresión cerradas (roadmap §4), la lectura de ejercicios
por API y la pantalla de ejercicio funcionando con **datos de prueba** (fixtures). La fase **no incluye**
autenticación, sesión, envío de resultados, desbloqueo real de pistas, perfil ni ruleta: todo eso es la Fase C.

Todo es local: no se despliega, y el push a GitHub solo se hace cuando el usuario lo pide. Docker ya está instalado (Docker 29.7), así que
`npx supabase start` funciona.

## Ramas y worktrees

Todas salen de `renovacion`. Worktrees en `../DaviNotes-worktrees/…`:

| Rama | Worktree | Agente | Tareas |
|------|----------|--------|--------|
| `renovacion` | `renovacion/` | Integración. **Solo UI hace merges aquí** (el PM hace commit de la documentación) | — |
| `fase-b/a11y` | `b-a11y/` | SEO/A11y Specialist | B5 + validación pendiente de la Fase A |
| `fase-b/db` | `b-db/` | Backend Architect | B1, B2, B3, B4 (+ script npm de B9) |
| `fase-b/i18n` | `b-i18n/` | i18n Content Manager | B9, B11 y después B8 |
| `fase-b/ui-exercise` | `b-ui/` | UI Frontend Designer | B6, B7 |

- El checkout principal (`DaviNotes/`, rama `master`) **no se toca**.
- Cada agente trabaja **solo en su worktree**, ejecuta `npm install` allí la primera vez y hace commits en su rama.
- Para recibir lo que otros ya han integrado: `git merge renovacion` dentro de tu rama.

## Tareas

### SEO/A11y · `fase-b/a11y` (empieza ya; no depende de nadie)
- **B5** `docs/guidelines/accessibility.md`: `alt` obligatorio en logros e iconos, umbrales de contraste
  (4,5:1 para texto, 3:1 para texto grande, UI y foco), teclado, live regions, `prefers-reduced-motion`, foco visible
  y **controles deshabilitados con explicación** (pistas sin saldo: `aria-disabled` + texto asociado, no solo `disabled`).
  Incluye cómo marcar los estados de éxito y error sin depender solo del color.
- Validar el orden visual frente al orden de tabulación en móvil de la cabecera de learn (pendiente en `layout-modos.md`).
- Revisar cada rama antes de su merge (como en la Fase A). En esta fase el HTML de los docs **no debe cambiar**.

### Backend · `fase-b/db` (empieza ya)
Es la única rama que toca `package.json`, `package-lock.json` y `astro.config.mjs` (T8).
- **B1** Migración inicial en `supabase/migrations/`:
  - Tablas: `profiles` (`coins` 0, `level` 1, `xp` 0), `exercise_categories` + `exercise_category_translations`,
    `exercises` (`difficulty smallint CHECK (difficulty BETWEEN 1 AND 10)`, `language_slug`, `framework_slug?`,
    `concept_slug?`, `category`, `type`), `exercise_translations` (por `locale`), `hints` + `hint_translations`,
    `attempts`, `hint_unlocks`, `achievements` + `user_achievements`.
  - RLS en todas; el cliente **no puede escribir** `coins`, `xp` ni `level` (T11).
  - Trigger que crea el perfil al registrarse.
  - RPC `security definer` `submit_result` y `unlock_hint` con las reglas del roadmap §4 (se crean ahora y se exponen por API en la Fase C).
  - Tests SQL mínimos de las RPC (primera vez frente a repetición, saldo insuficiente, subida de varios niveles).
  - `config.toml`: `enable_confirmations = false` (D3).
  - **La tabla `exercises` queda vacía** (D4). `seed.sql` solo lleva las categorías iniciales acordadas con i18n (B11).
- **B2** `npx supabase gen types typescript --local > src/types/database.ts` + DTOs en `src/types/api.ts` (roadmap §5).
  Cuando esté, avisa a UI: B7 pasa a usar estos tipos.
- **B3** `src/pages/api/exercises/index.ts` (`GET`, `prerender = false`, filtros `language`, `concept`, `difficulty`,
  `locale`, `category`; sin sesión en esta fase) + `docs/architecture/api.md` con request, response y errores.
- **B4** `supabase/exercises/README.md` + un ejemplo **comentado** del script de inserción que escribirá el usuario
  (ejercicio, traducciones y pistas en una transacción). Sin preguntas reales.
- Añadir a `package.json` el script `"check:content": "node scripts/check-content.ts"` cuando i18n lo pida (B9).

### i18n · `fase-b/i18n` (empieza ya)
- **B11** Proponer las **categorías iniciales** de ejercicios (slugs + nombre en en/es/fr) y pasárselas a Backend
  para `seed.sql`. Contexto temático: se guarda como texto por idioma en `exercise_translations.context`; no hace falta catálogo.
- **B9** `scripts/check-content.ts` (Node 24 ejecuta TS sin compilar; usa solo sintaxis que se pueda borrar,
  sin `enum` ni `namespace`): cada concepto de `data/` tiene su `.md` en los 3 idiomas y no hay `.md` huérfanos.
  Deja preparada la función que validará `languageSlug`/`conceptSlug` de los ejercicios contra el catálogo (T4);
  se conecta a la BD en la Fase C. Pide a Backend la entrada `check:content` en `package.json`.
- **B8** (después de que UI publique sus claves) `learn.exercise.*`, `learn.hint.*` (con `{coins}`) y
  `learn.result.*` en `locales/{en,es,fr}/learn.ts`.

### UI · `fase-b/ui-exercise`
- **B6** (cuando B5 esté en `renovacion`) Ampliar `styles/tokens.css`: sustituir los hex sueltos de learn y
  añadir `--success`, `--error`, `--warning` y sus fondos, que cumplan B5. En los docs solo se sustituyen
  hex por tokens **con el mismo valor** (el HTML y el aspecto de los docs no cambian en esta fase).
- **B7** `src/components/learn/InterfazEjercicio.vue` + una página de demostración con `noindex`:
  contexto, objetivo técnico, enunciado y código, opciones, pistas de 1 moneda (deshabilitadas sin saldo,
  con explicación), botones "Resuelto / No resuelto" y el resultado (monedas y XP ganadas, subida de nivel).
  - Datos: fixtures en `src/components/learn/fixtures/` tipados con el roadmap §5; cuando B2 llegue a `renovacion`,
    pasan a importar de `@/types/api`. Sin llamadas reales a la API.
  - Textos por props (T6). Publica las claves que necesites en un comentario de la PR/merge para i18n (B8);
    mientras tanto usa las claves en `en`.
  - Nunca importar de `@/lib/server` (T9).

## Orden de merge en `renovacion` (lo hace UI)

1. `fase-b/a11y` (B5).
2. `fase-b/db` (B1-B4). Antes, SEO confirma que los docs no cambian.
3. `fase-b/i18n` (B9 + B11).
4. `fase-b/ui-exercise` (B6 + B7), después de hacer merge de `renovacion` en la rama.
5. `fase-b/i18n` otra vez (B8), después de hacer merge de `renovacion`.
6. Comprobación final en `renovacion`: `npm run build`, `npm run typecheck`, `npm run check:content`, revisión a11y de
   `InterfazEjercicio` (B10, SEO) y aviso al PM para cerrar la fase en el roadmap.

## Criterio para dar una rama por terminada

- `npm run build` sin errores: 163 páginas de docs + 3 de learn (+ la página de demostración de B7).
- `npm run typecheck` sin errores.
- Backend: `npx supabase db reset` aplica las migraciones sin errores y los tests de las RPC pasan.
- Commit en su rama y aviso a UI (merge) y a SEO (revisión), con un resumen de 2-3 líneas.

## Punto de parada (2026-09-23)

Sesión cerrada aquí. En GitHub: `master`, `renovacion` (hasta `1cf6133`; este cierre y el merge de B5 solo en local) y `fase-b/db` (subida por el agente de Backend, pendiente de confirmar por el usuario).

### Estado de cada rama
| Rama | Último commit | Estado | Integrada en `renovacion` |
|------|---------------|--------|----------------------------|
| `fase-b/a11y` | `ead271b` | ✅ B5 + orden de tabulación en móvil validado (cumple, sin cambios) | ✅ `803a4c7` |
| `fase-b/db` | `38aaf99` | ✅ B1-B4 + seed de categorías + `check:content` + `typecheck` con `astro sync` + `@types/node`. 36/36 tests pgTAP; docs idénticos | ⏳ |
| `fase-b/i18n` | `d0aa03a` | ✅ B11 (8 categorías, `exercise-categories.md`) + B9 (`scripts/check-content.ts`: 43/43/43 OK) | ⏳ |
| `fase-b/ui-exercise` | `5ea9f9a` | ✅ B6 (tokens de estado + `.sr-only`) + B7 (`InterfazEjercicio.vue`, demo en `/learn/demo/exercise/` ×3 idiomas). 169 páginas | ⏳ (espera B10) |

Supabase local: el stack quedó arrancado desde `b-db`. `npx supabase stop` para pararlo.

### Próximos pasos (en este orden)
1. **SEO · B10**: revisar `fase-b/ui-exercise` (demo, live region, pistas con `aria-disabled`, `lang="en"` en contenido de fixtures) y `fase-b/db`.
   Criterio actualizado: en los docs solo puede cambiar el bloque `<style>` incrustado (tokens nuevos que resuelven a los **mismos valores**); el marcado debe ser idéntico. UI dejó scripts de comparación en `%TEMP%/cmp.mjs` y `cmpstyles.mjs`.
   Decidir si prefiere un texto de "sin monedas" por pista o el párrafo compartido actual.
2. **UI · merges** en `renovacion`: `fase-b/db` → `fase-b/i18n` → `fase-b/ui-exercise` (tras B10). Conflictos esperables solo en `roadmap.md` (§5 lo cambió Backend) y en los archivos de agente.
3. **UI · ajustes tras el merge**:
   - Importar los tipos de `@/types/api` y borrar `fixtures/api-contract.ts`.
   - Usar `UnlockHintResponse` (nombre de Backend) en lugar de `HintUnlockResponse`.
   - Cambiar las categorías provisionales de los fixtures (`fundamentals`) por los slugs de B11, y mostrar `categoryName`.
4. **i18n · B8**: traducir a es/fr las 35 claves `learn.exercise.*`, `learn.hint.*` y `learn.result.*` marcadas con `// TODO(i18n B8)`. `{coins}` llega formateado con `Intl.PluralRules`. Opcional: pasar `check-content.ts` a imports normales de `node:fs` (ya existe `@types/node`).
5. **Comprobación final** en `renovacion`: `npm run build`, `npm run typecheck`, `npm run check:content`, `npx supabase db reset` + `npx supabase test db`. Después el PM cierra la Fase B en el roadmap.

### Decisiones y acuerdos pendientes para la Fase C
- **D6 (decidida, 2026-09-24):** en desarrollo el cliente decide si la respuesta es correcta; `POST /api/exercises/[id]/result` lleva `{ correct }`. Se revisará antes de producción.
  UI hoy envía el índice de la opción, el texto escrito o `null` ("No resuelto").
- **Backend + UI:** confirmar que `xpToNextLevel` = XP que **falta** (`level × 100 − xp`), que es como lo interpreta la barra de UI.
- **Backend:** exportar `ProfileSnapshot` o el DTO de `GET /api/profile` (UI deriva hoy el saldo de `ResultResponse`).
- **Backend (producción):** las categorías viven en `seed.sql`, que no se ejecuta en producción; pasarlas a una migración antes de desplegar (anotado en `produccion.md` de `fase-b/db`).
- **Usuario:** `npx supabase db reset` borra los ejercicios; hay que volver a ejecutar los scripts de inserción (ver `supabase/exercises/README.md`).
- **UI (Fase D):** hex sueltos de los docs sin token (`#444`, `#aaa`, `#7e678b`, `#e0e0e0`) y colores en línea de `DifficultyBadge`.

## Cierre (2026-09-24)

| PR | Rama | Merge |
|----|------|-------|
| #23 | `fase-b/a11y` (B5 + informe B10) | `db23a82` |
| #24 | `fase-b/db` (B1-B4 + seed de categorías) | `1668787` |
| #25 | `fase-b/i18n` (B9 + B11) | `e8f760d` |
| #26 | `fase-b/ui-exercise` (B6 + B7 + tipos de `@/types/api` + correcciones de B10) | `4fc89fa` |
| #27 | `fase-b/i18n` (B8: 35 claves en es/fr) | `d6afdef` |

Verificación final en `renovacion`:
- `npm run build`: 169 páginas.
- `npm run typecheck`: OK.
- `npm run check:content`: 43/43/43.
- `npx supabase db reset`: 8 categorías, 24 traducciones, 0 ejercicios.
- `npx supabase test db`: 36/36.
- `GET /api/exercises?locale=es`: 200 `[]`; `?difficulty=11`: 400.

Sin conflictos de merge. `xpToNextLevel` confirmado como la XP que **falta** para el siguiente nivel (`level*100 - xp`).
Supabase local queda arrancado desde el worktree `renovacion` (`.env` local copiado, no versionado).

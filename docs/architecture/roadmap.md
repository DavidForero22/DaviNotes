# Roadmap global · DaviNotes → DaviLearn

Mantenido por: **Project Manager & Tech Lead** (`.claude/agents/00-project-manager.md`).
Última revisión: **2026-09-24**, sobre la rama de integración `renovacion` (`d6afdef`).

Leyenda: ✅ hecho · 🟡 parcial · ⏳ pendiente · ⛔ bloqueado

> **Entorno:** todo el desarrollo es **local** (decisión D1): no se despliega. El push a GitHub se hace solo cuando el usuario lo pide.
> Los cambios necesarios para pasar a un dominio de producción están en [`produccion.md`](./produccion.md).

---

## 1. Foto actual

| Área | Estado | Evidencia (rama `renovacion`) |
|------|--------|-------------------------------|
| Build | ✅ | `npm run build` → 169 páginas (163 docs + 3 learn + 3 demo de ejercicio); `typecheck` y `check:content` OK |
| DaviNotes (docs) | ✅ Funcional; solo cambia el `ModeSwitch` en la cabecera | 43 `.md` por idioma (en/es/fr), sin huecos |
| Infraestructura | ✅ Vue, `@astrojs/node` con `output: 'static'`, Supabase SDK + CLI (devDependency), `supabase/config.toml` | `astro.config.mjs`, `package.json` |
| Backend | 🟡 Esquema + RLS + RPC de progresión (36/36 tests pgTAP), seed de 8 categorías, `GET /api/exercises` | Falta auth/sesión y los POST (Fase C) |
| Modo Aprender | 🟡 Layout, conmutador, rutas localizadas, `LanguageSuggestion.vue` y `InterfazEjercicio.vue` con demo (`/learn/demo/exercise/`) sobre fixtures | Sin datos reales ni sesión (Fase C) |
| i18n | ✅ `learn.*` completo en en/es/fr (incluidas las 35 claves de ejercicio); `npm run check:content` | `locales/*/learn.ts`, `scripts/check-content.ts` |
| SEO técnico | ⏸ Aparcado hasta producción | Ver `produccion.md` |
| A11y | 🟡 Guía `docs/guidelines/accessibility.md`; learn revisado (B10: APTA); los docs arrastran deuda | Ver Fase D |

### Ramas y worktrees
| Rama | Worktree | Uso |
|------|----------|-----|
| `master` | `DaviNotes/` | Estable. **No se toca** hasta el merge final de la renovación |
| `renovacion` | `../DaviNotes-worktrees/renovacion/` | Integración: aquí se hace merge de las ramas de cada fase |
| `fase-b/*` | `../DaviNotes-worktrees/b-{a11y,db,i18n,ui}/` | Fase B cerrada: fusionadas en `renovacion` con las PRs #23-#27. Se pueden borrar ramas y worktrees |

---

## 2. Fases

### Fase 0 · Reorganización modular ✅
`295b895` (en `master`). Carpetas `shared/docs/learn`, `i18n/locales`, alias `@/`. Verificada por SEO: HTML idéntico a la línea base.

### Fase A · Base técnica y layout de dos modos ✅
Plan en [`fase-a.md`](./fase-a.md) y diseño en [`layout-modos.md`](./layout-modos.md) (dirección "C · Arena").
- ✅ Backend (`fase-a/infra`): dependencias, adaptador Node, integración Vue, `supabase init`, `middleware.ts` (esqueleto), `lib/server/supabase.ts`, `env.d.ts` y script `typecheck`.
- ✅ i18n (`fase-a/i18n-learn`, `fase-a/i18n-suggest`): namespace `learn`, claves `mode.*`, `a11y.skipToContent` y `learn.suggest.*`.
- ✅ UI (`fase-a/ui-layout`): `ModeSwitch`, `LearnLayout`, `learn.css`, `/learn` y `/[lang]/learn` prerenderizadas con `noindex`, isla `LanguageSuggestion.vue`, token `--focus-ring`.
- ✅ SEO/A11y: requisitos de `ModeSwitch` y `LearnLayout` (skip link, landmarks, un solo h1, `aria-current`, live region) y correcciones de contraste en learn (`5e7e43d`).
- 🟡 Queda pendiente la validación de SEO del orden visual frente al orden de tabulación en móvil (en `layout-modos.md`).

### Fase B · Esquema y ejercicios ✅ (plan y cierre: [`fase-b.md`](./fase-b.md))
Objetivo: la base de datos con las reglas de progresión cerradas (§4) y la pantalla de ejercicio funcionando con datos de prueba.

| # | Tarea | Agente | Depende de | Estado |
|---|-------|--------|-----------|--------|
| B1 | Migración inicial: tablas + RLS + trigger de perfil + RPC `submit_result` y `unlock_hint` según §4. **Tabla `exercises` vacía** (D4). | Backend | — (Docker ya instalado) | ✅ `60cd66f` |
| B2 | `supabase gen types` → `types/database.ts`; DTOs en `types/api.ts` (§5). | Backend | B1 | ✅ `32746d0` |
| B3 | `GET /api/exercises` (filtros `language`, `concept`, `difficulty`, `locale`) + `docs/architecture/api.md`. | Backend | B2 | ✅ `32746d0` |
| B4 | Plantilla documentada del script de inserción de ejercicios que escribirá el usuario (`supabase/exercises/README.md` + ejemplo comentado, **sin datos**). | Backend | B1 | ✅ `e369f50` |
| B5 | `docs/guidelines/accessibility.md` (alt, contraste, teclado, live regions, reduced-motion, foco). | SEO/A11y | — | ✅ integrada (`803a4c7`) |
| B6 | Ampliar `tokens.css` (hoy hay ~79 hex sueltos) + estados de éxito y error accesibles. | UI | B5 | ✅ `62e4e18` |
| B7 | `InterfazEjercicio.vue` con **fixtures** que cumplan `types/api.ts` (pistas, "Resuelto / No resuelto"). | UI | B6 (B2 para pasar de fixtures a los tipos definitivos) | ✅ `18704bb` |
| B8 | Claves `learn.exercise.*`, `learn.hint.*` (`{coins}`) y `learn.result.*`. | i18n | B7 (UI define las claves) | ✅ PR #27 (`1e7ecb7`) |
| B9 | `scripts/check-content.ts` + `npm run check:content` (slug ↔ `.md` en 3 idiomas; slugs de ejercicios ↔ catálogo). | i18n | — | ✅ `fase-b/i18n` (`d0aa03a`) |
| B10 | Revisión a11y de `InterfazEjercicio` (teclado en pistas, anuncio del resultado). | SEO/A11y | B7 | ✅ APTA sin bloqueantes (`docs/reviews/fase-b-b10.md`) |
| B11 | Categorías iniciales de ejercicios (slugs + nombres en en/es/fr) para `seed.sql`. | i18n → Backend | — | ✅ `fase-b/i18n` + seed en `fase-b/db` |

### Fase C · Cuenta y progreso 🟡 ← **SPRINT ACTUAL: C1-C6** (plan: [`fase-c.md`](./fase-c.md))
Objetivo de C1-C6: registrarse, iniciar sesión, resolver un ejercicio real y ganar monedas y XP, con la interfaz en en/es/fr.

| # | Tarea | Agente | Depende de | Estado |
|---|-------|--------|-----------|--------|
| C1 | Auth sin confirmación de email (D3) + sesión en `middleware.ts` + `checkOrigin` + `X-Robots-Tag` en `/api/**` | Backend | — | ⏳ |
| C2 | `POST .../result`, `POST .../hints`, `GET /api/exercises/[id]`, `GET /api/profile` + `ProfileDTO`, `vue-tsc`, `_dev_sample.sql` (solo local) | Backend | C1 | ⏳ |
| C3 | Requisitos a11y de login/registro, menú de cuenta, página de ejercicio y `noindex` | SEO/A11y | — | ⏳ |
| C4 | Páginas de login y registro, cuenta en la cabecera, learn en SSR | UI | C1, C3 | ⏳ |
| C5 | `/learn/exercise/[id]` con `InterfazEjercicio` conectado a la API real; se retira la demo | UI | C2, C4 | ⏳ |
| C6 | Traducciones es/fr de C4-C5 y errores de auth; `check:content --db` | i18n | C4, C5 | ⏳ |
| C7+ | `DashboardPerfil.vue`, `RuletaLenguajes.vue` (necesita definir los "lenguajes activos"), logros | UI/Backend/i18n | C6 | ⏳ |

Arrastra de la Fase B: no bloqueantes 5, 6 y 8 de B10 (borde de las opciones, reflow a 320 px y zoom al 200 %).
**Despliegue:** Vercel está **pausado por completo** (decisión del usuario, 2026-09-24): los previews de `renovacion` fallaban con `@astrojs/node`, pero ahora ni `master` ni las ramas se despliegan. El hosting se decide antes de producción (`produccion.md` §0).

### Fase D · Pulido y deuda de DaviNotes ⏳
Cambia el HTML de los docs **a propósito**: SEO toma una línea base nueva antes de empezar.
- ⏳ Contraste: `#666` sobre `#1e2127` (2,81:1) y `#888` sobre `--card-bg` (4,27:1).
- ⏳ Foco visible en `DocSearch`; `prefers-reduced-motion` en fadeInUp y en el acordeón de frameworks.
- ⏳ `#menu-toggle` con `aria-expanded`/`aria-controls`; la SideBar móvil cerrada no debe ser enfocable.
- ⏳ Logo decorativo del framework → `alt=""`; skip link también en los docs.
- ⏳ `components/shared/seo/BaseHead.astro`: unificar el `<head>` (Home, DocInfo, 404, Learn) + `description` por página.
- ⏳ Orden de encabezados (h2/h3 de SideBar y HelpModal antes del h1).
- ⏳ Revisión de diseño pendiente de la Fase A: texto con degradado y borde lateral grueso en `global.css`.
- ⏳ i18n: extraer los textos `Localized` de `data/languages.ts` y `data/frameworks.ts` a `locales/*/catalog.ts`.

### Producción ⏸ (fuera de alcance mientras el desarrollo sea local)
Checklist completa en [`produccion.md`](./produccion.md).

---

## 3. Decisiones

### Decisiones del usuario (2026-09-23)
| ID | Decisión |
|----|----------|
| **D1** | Todo el desarrollo es **local**. Lo que haya que cambiar para producción se documenta en `produccion.md` y no se aplica todavía. |
| **D2** | Reglas de progresión **cerradas** (ver §4). El esquema de la BD se diseña sobre ellas. |
| **D3** | El registro **no exige** confirmar el email. |
| **D4** | El contenido real de los ejercicios lo escribe el usuario en un script de inserción propio. **La tabla `exercises` empieza vacía**: el seed no incluye ejercicios. |
| **D6** | Durante el desarrollo **el cliente decide si la respuesta es correcta**: `submit_result(p_exercise_id, p_correct)` se queda como está, por simplicidad. Riesgo aceptado: un usuario con sesión podría otorgarse monedas y XP. **Se revisa antes de producción** (validar contra `exercise_answers` en la BD; ver `produccion.md`). |
| **D5** | El usuario instalará las herramientas locales cuando haga falta. Supabase CLI ya viene como devDependency (`npx supabase`). Docker Desktop ya está instalado (v29.7), así que `supabase start` está disponible. |

### Decisiones del Tech Lead (vigentes salvo que el usuario diga lo contrario)
| ID | Decisión | Estado |
|----|----------|--------|
| **T1** | `learn` se localiza como los docs: `/learn`, `/es/learn`, `/fr/learn`. | ✅ Aplicada en la Fase A |
| **T2** | `output: 'static'` + `@astrojs/node`; `prerender = false` solo en `api/**` y en `learn/**` cuando dependan de la sesión. | ✅ Aplicada |
| **T3** | El contenido de los ejercicios (enunciado y pistas) va en la BD por idioma (`exercise_translations`); los textos de la interfaz, en `locales/*/learn.ts`. | Vigente |
| **T4** | Un ejercicio se vincula a la documentación con una clave compuesta `languageSlug` + `conceptSlug` (+ `frameworkSlug` opcional). | Vigente |
| **T5** | La **dificultad de un ejercicio es un entero de 1 a 10** (`smallint CHECK (difficulty BETWEEN 1 AND 10)`), independiente de `DifficultyLevel` (los 5 niveles de las lecciones). | Revisada por D2 |
| **T6** | Las islas Vue reciben los textos por props. | ✅ Aplicada (`LanguageSuggestion`) |
| **T7** | CSS nativo + tokens; no se adopta Tailwind. | Vigente |
| **T8** | Solo Backend edita `package.json`, `package-lock.json` y `astro.config.mjs`; los demás le piden los cambios. | Vigente (heredada de `fase-a.md`) |
| **T9** | Ningún `.vue` ni `components/**` importa de `@/lib/server`. | Vigente |
| **T10** | Antes de cada commit: `npm run typecheck` + `npm run build`. | Vigente |
| **T11** | Las monedas, la XP y el nivel **solo** se modifican dentro de funciones RPC `security definer`; RLS impide que el cliente escriba en `profiles` esas columnas. | Nueva |

---

## 4. Reglas de progresión (D2, cerradas)

| Regla | Valor |
|-------|-------|
| Monedas iniciales | **0** |
| Nivel y XP iniciales | nivel **1**, **0** XP *(supuesto del Tech Lead)* |
| Coste de una pista | **1 moneda**. Sin saldo suficiente no se puede desbloquear. Una pista desbloqueada no se vuelve a cobrar. |
| Recompensa por completar un ejercicio **nuevo** | Dificultad 1-3 → **1 moneda** · 4-6 → **2 monedas** · 7-10 → **3 monedas** |
| XP por completar un ejercicio nuevo | **dificultad × 10** |
| Repetir un ejercicio ya completado | **0 monedas y 0 XP** |
| Ejercicio "No resuelto" | 0 monedas y 0 XP; queda registrado el intento |
| Subida de nivel | Para pasar del nivel *N* al *N+1* hacen falta **N × 100 XP**. La XP sobrante pasa al nivel siguiente y puede encadenar varias subidas *(supuesto del Tech Lead)* |

Implementación de referencia (dentro de `submit_result`):
```
if correcto and not completado_antes:
    coins += (1 if d <= 3 else 2 if d <= 6 else 3)
    xp    += d * 10                 -- xp = XP acumulada dentro del nivel actual
    while xp >= level * 100:
        xp    -= level * 100
        level += 1
```
Consecuencia: con 0 monedas iniciales, las pistas no están disponibles hasta completar el primer ejercicio. La UI debe mostrarlo (botón deshabilitado con explicación accesible).

---

## 5. Contrato de datos de ejercicios (v2.1 · fijado en `src/types/api.ts`)

Fuente de verdad: [`src/types/api.ts`](../../src/types/api.ts). Detalle de los endpoints: [`api.md`](./api.md).
Cambios respecto a v2 (Fase B, Backend): `categoryName` en `ExerciseDTO`; `Locale` y `ExerciseType` salen de los enums de la BD;
tipos nuevos `ExerciseListQuery`, `ExerciseListResponse` (= `ExerciseDTO[]`), `ResultRequest`, `UnlockHintRequest`,
`UnlockHintResponse` y `ApiError`. Los opcionales se **omiten** cuando no hay valor (nunca `null`).

```ts
type Locale = "en" | "es" | "fr";                                   // enum public.locale
type ExerciseType = "multiple_choice" | "fill_blank" | "code_output"; // enum public.exercise_type

interface HintDTO { id: string; order: number; cost: 1; unlocked: boolean; text?: string } // text solo si unlocked

interface ExerciseDTO {
  id: string;                 // uuid
  slug: string;
  languageSlug: string;       // = slug de data/languages.ts
  frameworkSlug?: string;     // p. ej. "laravel"
  conceptSlug?: string;       // enlaza con la lección (T4)
  category: string;           // slug (seed: syntax, data-structures, …)
  categoryName: string;       // nombre de la categoría en `locale`   ← nuevo en v2.1
  difficulty: number;         // 1-10 (T5)
  type: ExerciseType;
  locale: Locale;
  title: string; context?: string; objective: string; prompt: string; code?: string;
  options?: string[];         // solo multiple_choice
  reward: { coins: 1 | 2 | 3; xp: number }; // derivado de difficulty (§4)
  hints: HintDTO[];
  completed: boolean;         // por usuario (false sin sesión)
}

// GET /api/exercises?language&framework&concept&category&difficulty&locale&limit&offset → ExerciseDTO[]

// POST /api/exercises/[id]/result · body { correct: boolean } → la respuesta correcta NUNCA viaja al cliente
interface ResultResponse {
  correct: boolean; firstCompletion: boolean;
  coinsAwarded: number; xpAwarded: number;
  coins: number; xp: number; level: number; xpToNextLevel: number;
  newAchievements: string[];  // slugs; vacío hasta que se definan los logros (Fase C)
}

// POST /api/exercises/[id]/hints · body { hintId: string } → { hint: HintDTO; coins: number } | 402 insufficient_coins

// Error (cualquier no-2xx)
interface ApiError { error: { code: "invalid_query" | "invalid_body" | "unauthorized" | "insufficient_coins" | "not_found" | "internal_error"; message: string; field?: string } }
```

---

## 6. Reglas de coordinación
- Cada fase usa ramas `fase-x/<area>` en worktrees propios; **solo UI hace merge en `renovacion`** (como en la Fase A). El PM puede hacer commit de la documentación directamente en `renovacion`.
- `package.json`, `package-lock.json` y `astro.config.mjs`: solo Backend (T8).
- `layouts/` es de UI; SEO puede proponer cambios (skip link, `BaseHead`) y UI los integra.
- Un cambio que altere el HTML de los docs necesita una línea base de SEO antes y una comparación después.
- No se hace push sin permiso del usuario.

## 7. Historial de revisiones
- **2026-09-23 (v1)**: primer roadmap, basado solo en `master`.
- **2026-09-23 (v2)**: corregido tras revisar `renovacion` (Fase A ya completada). Se incorporan D1-D5 y las reglas de progresión, se renumeran las fases (0, A, B, C, D, Producción) y se crea `produccion.md`.
- **2026-09-24 (v6)**: abierta la Fase C (C1-C6) con [`fase-c.md`](./fase-c.md), ramas `fase-c/*` y decisiones T12-T15. Detectado el fallo de los previews de Vercel.
- **2026-09-24 (v5)**: **Fase B cerrada.** PRs #23-#27 fusionadas en `renovacion` en GitHub; B8 y B10 hechas; verificación final (build 169, typecheck, check:content, `db reset` 8/24/0, 36/36 tests, API 200/400). D6 decidida: el cliente decide la corrección en desarrollo.
- **2026-09-23 (v4)**: punto de parada de la Fase B. B1-B7, B9 y B11 hechas en sus ramas; B5 integrada; pendientes B10, merges y B8. Nueva decisión pendiente D6. Contrato v2.1 (en `fase-b/db`).
- **2026-09-23 (v3)**: Fase A archivada (ramas y worktrees `fase-a/*` borrados); abierta la Fase B con sus ramas y worktrees; `renovacion` publicada en GitHub.

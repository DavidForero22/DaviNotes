---
name: "ui-frontend-designer"
description: "Diseñador de la interfaz de usuario e integrador de islas en Vue 3 para la parte interactiva."
---

# Identity: UI & Frontend Designer (Vue + Astro)

## Rol y Objetivo
Eres el Diseñador UI y Desarrollador Frontend. Tu misión es unificar visualmente la sección de Documentación estática (DaviNotes) con la nueva sección interactiva de Aprendizaje (DaviLearn). Trabajarás diseñando **Islas de Astro utilizando Vue 3** para toda la lógica interactiva (ruleta, ejercicios, pistas), asegurando una navegación fluida que se sienta como una única plataforma.

## Stack Tecnológico
- Astro (Layouts y Routing)
- Vue 3 (Componentes interactivos, Composition API)
- CSS nativo (variables globales en `styles/tokens.css`). **No se adopta Tailwind** (decisión T7 del roadmap).

## Estado (revisión 2026-09-24)
Fase A cerrada en `renovacion` (dirección de diseño "C · Arena", ver `docs/architecture/layout-modos.md`). Sigues siendo quien hace los merges en `renovacion`.

**Fase B:** rama `fase-b/ui-exercise`, worktree `../DaviNotes-worktrees/b-ui/`. Plan y orden de merge (los haces tú): `docs/architecture/fase-b.md`.
- B5 integrada en `renovacion` (`803a4c7`).
- B6 y B7 integradas en `renovacion` tras la revisión B10 de SEO (APTA). Los merges se hacen por PR en GitHub (`gh`, commit de merge, sin squash).
- `InterfazEjercicio` usa los tipos de `@/types/api` (contrato v2.1, `UnlockHintResponse`); `ProfileSnapshot` se deriva de `ResultResponse`.
  Los fixtures usan las categorías de B11 y muestran `categoryName`. `xpToNextLevel` es la XP que **falta** (`level × 100 − xp`, confirmado en `submit_result`).
- Aplicados los no bloqueantes 1, 3 y 4 de B10: error de envío en un contenedor `role="alert"` siempre presente, el anuncio del resultado sin el título (ya lo lee el foco) y la barra de progreso como `div role="group"`.
- D6: en desarrollo el cliente decide si la respuesta es correcta y `POST .../result` lleva `{ correct }`. En la Fase C, el `api` real de `InterfazEjercicio` convierte la respuesta en `{ correct }`.
- Demo: `/learn/demo/exercise/` (+ `/es/`, `/fr/`). El build de la rama genera 169 páginas (163 de docs + 3 de learn + 3 de demo).
- Reglas de trabajo que salen de B6: usa siempre tokens de `tokens.css` (nada de hex nuevos), estados con icono + texto,
  `.sr-only` de `learn.css` para texto solo para lectores de pantalla.
- `tokens.css` y `global.css` se incrustan en el `<style>` de cada página de los docs: cualquier token nuevo cambia
  ese CSS (no el marcado). Compara el HTML fuera de `<style>` y comprueba que los valores resueltos no cambian.

## Tareas Pendientes [ ]
- [ ] **Fase B (cierre)** Merge por PR de `fase-b/i18n` con B8 (traducciones es/fr) cuando i18n la entregue, y comprobación final en `renovacion`.
- [ ] **Fase C** Páginas de Login y Registro; hueco de la cuenta en la cabecera de learn.
- [ ] **Fase C** Crear componente Vue: `RuletaLenguajes.vue`, evolucionando el rodillo de `LanguageSuggestion.vue` y usando los lenguajes activos del usuario.
- [ ] **Fase C** Crear componente Vue: `DashboardPerfil.vue` (nivel, XP hasta el siguiente nivel, monedas, lenguajes, logros).
- [ ] **Fase C** Conectar las islas con la API real (textos por props, T6; nunca importar de `@/lib/server`, T9) y pasar learn a `prerender = false`. `InterfazEjercicio` recibe un objeto `api` (`exercise-ui.ts`): en la Fase C se le pasa uno con `fetch` y desaparecen `EjercicioDemo.vue` y `fixtures/demo-api.ts`.
- [ ] **Fase C** Navegación propia de learn y enlace a Learn o a Login según la sesión.
- [ ] **Fase D** Deuda de los docs (con SEO): contraste, foco en DocSearch, reduced-motion, `aria-expanded` en `#menu-toggle`, texto con degradado y borde lateral grueso de `global.css`. Quedan hex sin token en los docs: `#444`, `#aaa`, `#7e678b`, `#e0e0e0` y los colores de `DifficultyBadge` (van en un `style` del HTML).

## Tareas Completadas [x]
- [x] Fase 0: `components/{shared,docs,learn}`, `layouts/{home,docs,learn}`, `styles/{tokens,global,docs}.css`, alias `@/`.
- [x] Fase A: wireframes en `layout-modos.md`, `ModeSwitch.astro`, `LearnLayout.astro`, `learn.css`, rutas `/learn` + `/[lang]/learn` con `noindex`, isla `LanguageSuggestion.vue`, token `--focus-ring`, correcciones de contraste en learn.
- [x] Merges de la Fase A en `renovacion` (`5b08dcb`).
- [x] Fase B: merge de `fase-b/a11y` (B5) en `renovacion` (`803a4c7`).
- [x] **B6** `tokens.css` con superficies, textos, marca y `--success`/`--error`/`--warning` + fondos con su ratio de contraste; hex sustituidos por tokens del mismo valor (marcado de los docs idéntico, CSS con los mismos valores resueltos); `.sr-only` en `learn.css` (`62e4e18`).
- [x] **B7** `InterfazEjercicio.vue`, `EjercicioDemo.vue`, fixtures (4 escenarios) y API simulada con las reglas §4 (solo demo); claves `learn.exercise.*`, `learn.hint.*`, `learn.result.*` en `en` (es/fr con el inglés provisional y `TODO(i18n B8)`) (`18704bb`).
- [x] **B7 (cierre)** Tipos de `@/types/api`, `fixtures/api-contract.ts` borrado, categorías de B11, no bloqueantes 1/3/4 de B10 y merge en `renovacion` por PR (con a11y, db e i18n antes).

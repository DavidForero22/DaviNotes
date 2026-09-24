---
name: "i18n-content-manager"
description: "Gestor de internacionalización, migraciones de texto y estructuración de diccionarios multi-idioma."
---

# Identity: i18n & Content Manager

## Rol y Objetivo
Eres el gestor de internacionalización y estructura de contenido. El proyecto actual tiene un archivo `languages.ts` monolítico que mezcla metadatos técnicos con textos traducidos. Tu objetivo es refactorizar esta estructura dividiendo las traducciones en archivos específicos por idioma, manteniendo el tipado estricto, y asegurando que los nuevos campos (ejercicios, pistas, contextos temáticos) soporten EN, ES y FR de forma escalable.

## Stack Tecnológico
- Typescript
- Sistema de colecciones y locales de Astro (`src/i18n`)

## Estado (revisión 2026-09-23)
Namespace `learn` creado en la Fase A (`learn.*`, `learn.suggest.*`) y claves comunes `mode.*` y `a11y.skipToContent`. Contenido de los docs completo: 43 `.md` por idioma. El contenido de los ejercicios vive en la BD por idioma (T3) y lo escribe el usuario con su propio script (D4); tú validas los slugs. Diccionarios en TS con `satisfies` (no JSON).

**Fase B:** rama `fase-b/i18n`, worktree `../DaviNotes-worktrees/b-i18n/`. Plan: `docs/architecture/fase-b.md`. B11 y B9 hechos en `fase-b/i18n`; queda B8 (espera las claves de UI). Categorías de ejercicios en `docs/architecture/exercise-categories.md` (slugs estables; renombrar solo el texto visible).

## Tareas Pendientes [ ]
- [ ] **B8** Claves `learn.exercise.*`, `learn.hint.*` (con `{coins}`) y `learn.result.*` en en/es/fr, a partir de las que defina UI para `InterfazEjercicio`.
- [ ] Confirmar que Backend añade `"check:content": "node scripts/check-content.ts"` a `package.json` (T8).
- [ ] **Fase C** Conectar `validateExerciseRefs` (`scripts/check-content.ts`) a las filas de `exercises` de la BD.
- [ ] Si Backend añade `@types/node`, pasar `check-content.ts` a imports `node:fs` normales (ahora usa `process.getBuiltinModule` con tipos mínimos locales).
- [ ] **Fase C** Claves de auth, perfil, ruleta y logros.
- [ ] **Fase D** Claves para `description` por página.
- [ ] **Fase D** Refactorizar `data/languages.ts` y `data/frameworks.ts`: extraer los campos `Localized` a `locales/*/catalog.ts` con claves derivadas del slug.

## Tareas Completadas [x]
- [x] Fase 0: `src/i18n/config.ts`, `locales/{en,es,fr}/{common,docs,index}.ts`, `README.md`; API pública sin cambios.
- [x] Tipado estricto: `en` como referencia y `es`/`fr` con `satisfies`.
- [x] Verificación de la cobertura: 43/43/43 `.md` y slugs coherentes con `data/`.
- [x] Fase A: namespace `learn` (`locales/*/learn.ts`), `mode.*`, `a11y.skipToContent` y `learn.suggest.*`.
- [x] **B11** 8 categorías iniciales de ejercicios (slug + en/es/fr) y SQL para `seed.sql` en `docs/architecture/exercise-categories.md`. Los contextos temáticos no llevan catálogo: texto libre por idioma en `exercise_translations.context`.
- [x] **B9** `scripts/check-content.ts`: `.md` en los 3 idiomas para cada concepto (incluidos `installation-guide` y frameworks), sin huérfanos, coherencia del catálogo y `validateExerciseRefs` (T4).

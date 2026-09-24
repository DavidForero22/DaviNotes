# Categorías de ejercicios (B11)

> Propuesta de i18n (2026-09-23) para `supabase/seed.sql`. Backend ajusta los nombres de columnas si difieren.

Cada ejercicio tiene **una** categoría (`exercises.category` → `exercise_categories.slug`). Las categorías son
transversales: describen *qué habilidad* se practica, no *qué tecnología* (eso lo dicen `language_slug`,
`framework_slug` y `concept_slug`, T4). Así un mismo filtro sirve en Java, en MySQL o en Git.

## Reglas

- El `slug` es kebab-case, en inglés y **estable**: no se renombra una vez haya ejercicios que lo usen
  (se puede cambiar el nombre visible, no el slug).
- Cada categoría tiene nombre en **en, es y fr** (`exercise_category_translations`, una fila por `locale`).
- El orden de la tabla es el orden de presentación recomendado (de lo básico a lo avanzado).
- Añadir una categoría: nueva fila en las dos tablas (3 traducciones) mediante una migración o el seed, y aviso a i18n.
- El **contexto temático** no es una categoría: es texto libre por idioma en `exercise_translations.context`.

## Categorías iniciales

| # | `slug` | en | es | fr | Qué cubre (ejemplos) |
|---|--------|----|----|----|-----------------------|
| 1 | `syntax` | Syntax & Basics | Sintaxis y fundamentos | Syntaxe et fondamentaux | Variables, tipos, operadores, etiquetas HTML, sentencias SQL básicas, comandos Git |
| 2 | `data-structures` | Data Structures | Estructuras de datos | Structures de données | Arrays, listas, mapas, colecciones, tablas y relaciones, documentos JSON/BSON |
| 3 | `control-flow` | Control Flow & Logic | Control de flujo y lógica | Flux de contrôle et logique | Condicionales, bucles, iteradores, `WHERE`/`CASE`, renderizado condicional |
| 4 | `functions` | Functions & Modularity | Funciones y modularidad | Fonctions et modularité | Funciones, parámetros, ámbito, módulos, componentes, hooks |
| 5 | `design-architecture` | Design & Architecture | Diseño y arquitectura | Conception et architecture | POO, patrones, MVC, estructura de componentes, modelado de datos, ramas en Git |
| 6 | `debugging` | Debugging & Errors | Depuración y errores | Débogage et erreurs | Leer la salida de un programa, encontrar el fallo, excepciones, conflictos de merge |
| 7 | `best-practices` | Best Practices & Security | Buenas prácticas y seguridad | Bonnes pratiques et sécurité | Legibilidad, rendimiento, accesibilidad, validación, inyección SQL, índices |
| 8 | `tooling` | Tools & Workflow | Herramientas y flujo de trabajo | Outils et flux de travail | CLI, gestores de paquetes, configuración, despliegue, flujo de trabajo con Git |

## Seed

```sql
insert into exercise_categories (slug) values
  ('syntax'),
  ('data-structures'),
  ('control-flow'),
  ('functions'),
  ('design-architecture'),
  ('debugging'),
  ('best-practices'),
  ('tooling');

insert into exercise_category_translations (category_slug, locale, name) values
  ('syntax',              'en', 'Syntax & Basics'),
  ('syntax',              'es', 'Sintaxis y fundamentos'),
  ('syntax',              'fr', 'Syntaxe et fondamentaux'),
  ('data-structures',     'en', 'Data Structures'),
  ('data-structures',     'es', 'Estructuras de datos'),
  ('data-structures',     'fr', 'Structures de données'),
  ('control-flow',        'en', 'Control Flow & Logic'),
  ('control-flow',        'es', 'Control de flujo y lógica'),
  ('control-flow',        'fr', 'Flux de contrôle et logique'),
  ('functions',           'en', 'Functions & Modularity'),
  ('functions',           'es', 'Funciones y modularidad'),
  ('functions',           'fr', 'Fonctions et modularité'),
  ('design-architecture', 'en', 'Design & Architecture'),
  ('design-architecture', 'es', 'Diseño y arquitectura'),
  ('design-architecture', 'fr', 'Conception et architecture'),
  ('debugging',           'en', 'Debugging & Errors'),
  ('debugging',           'es', 'Depuración y errores'),
  ('debugging',           'fr', 'Débogage et erreurs'),
  ('best-practices',      'en', 'Best Practices & Security'),
  ('best-practices',      'es', 'Buenas prácticas y seguridad'),
  ('best-practices',      'fr', 'Bonnes pratiques et sécurité'),
  ('tooling',             'en', 'Tools & Workflow'),
  ('tooling',             'es', 'Herramientas y flujo de trabajo'),
  ('tooling',             'fr', 'Outils et flux de travail');
```

Si Backend añade una columna de orden (p. ej. `position`), usar el número `#` de la tabla.

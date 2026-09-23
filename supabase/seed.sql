-- =====================================================================================
-- Local development seed, loaded by `npx supabase db reset`.
--
-- Decision D4: the `exercises` table starts EMPTY. Exercises are inserted by the user's
-- own script (see supabase/exercises/README.md). This file only holds the initial
-- exercise categories (task B11, docs/architecture/exercise-categories.md).
--
-- Category slugs are never renamed once exercises use them.
-- The seed is not run in production: there the categories must be inserted separately
-- (see docs/architecture/produccion.md, section Supabase).
-- =====================================================================================

insert into public.exercise_categories (slug, sort_order) values
	('syntax', 1),
	('data-structures', 2),
	('control-flow', 3),
	('functions', 4),
	('design-architecture', 5),
	('debugging', 6),
	('best-practices', 7),
	('tooling', 8);

insert into public.exercise_category_translations (category_slug, locale, name) values
	('syntax', 'en', 'Syntax & Basics'),
	('syntax', 'es', 'Sintaxis y fundamentos'),
	('syntax', 'fr', 'Syntaxe et fondamentaux'),
	('data-structures', 'en', 'Data Structures'),
	('data-structures', 'es', 'Estructuras de datos'),
	('data-structures', 'fr', 'Structures de données'),
	('control-flow', 'en', 'Control Flow & Logic'),
	('control-flow', 'es', 'Control de flujo y lógica'),
	('control-flow', 'fr', 'Flux de contrôle et logique'),
	('functions', 'en', 'Functions & Modularity'),
	('functions', 'es', 'Funciones y modularidad'),
	('functions', 'fr', 'Fonctions et modularité'),
	('design-architecture', 'en', 'Design & Architecture'),
	('design-architecture', 'es', 'Diseño y arquitectura'),
	('design-architecture', 'fr', 'Conception et architecture'),
	('debugging', 'en', 'Debugging & Errors'),
	('debugging', 'es', 'Depuración y errores'),
	('debugging', 'fr', 'Débogage et erreurs'),
	('best-practices', 'en', 'Best Practices & Security'),
	('best-practices', 'es', 'Buenas prácticas y seguridad'),
	('best-practices', 'fr', 'Bonnes pratiques et sécurité'),
	('tooling', 'en', 'Tools & Workflow'),
	('tooling', 'es', 'Herramientas y flujo de trabajo'),
	('tooling', 'fr', 'Outils et flux de travail');

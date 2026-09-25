# Flujo de trabajo eficiente (D9, 2026-09-25)

Reglas acordadas con el usuario para reducir el consumo de recursos. Se aplican a todos los agentes y prevalecen
sobre lo que digan los planes de fase anteriores.

## 1. Modelos
- **Backend Architect → Sonnet** por defecto (`model: sonnet` en su definición). El PM puede lanzarlo con Opus
  solo para diseño de esquema o decisiones de arquitectura complejas.
- **UI Frontend Designer → Opus**: el diseño es lo que más lo necesita.
- **PM → Opus.** SEO/A11y e i18n están en pausa (D7).

## 2. Verificación
- **En cada tarea o rama:** `npm run typecheck` + `npm run build` y, si se toca SQL, `npx supabase test db`.
  Nada más.
- **Solo al cerrar una fase:** flujos de extremo a extremo (curl, Playwright), `db reset`, comparación del HTML
  de los docs y capturas.

## 3. Agentes
- **Tareas pequeñas que tocan Backend y UI** (un endpoint + una pantalla simple): **un solo agente**, normalmente UI,
  en vez de dos que leen el mismo contexto. El PM lo decide al repartir.
- Tareas grandes o de diseño: siguen divididas por área.

## 4. Comunicación
- **Prompts del PM:** cortos. Dicen qué hacer y enlazan a la sección del plan; no copian el contrato.
- **Informes de los agentes:** 15 líneas como máximo, con hashes, desviaciones y lo que el siguiente necesita.
  Sin repetir lo que ya está en los documentos.
- El usuario indicará qué archivos o carpetas revisar para acotar las lecturas.

## 5. Documentación
- **El roadmap, los planes de fase y los archivos de agente se actualizan solo al cerrar un bloque o fase**,
  no en cada tarea.
- Durante el bloque, cada agente solo actualiza lo imprescindible: `api.md` si cambia el contrato, y los
  backlogs (`docs/backlog/`) si añade textos o pantallas (D7).
- Las PR las decide el usuario: el PM le indica qué ramas están listas.

# API de DaviLearn

Mantenido por: **Backend Architect**. Tipos: [`src/types/api.ts`](../../src/types/api.ts) (contrato v2.1, [roadmap §5](./roadmap.md)).
Esquema y reglas: `supabase/migrations/20260923120000_initial_schema.sql` y [roadmap §4](./roadmap.md).

## Convenciones

- Rutas bajo `/api/*`, sin prefijo de idioma. Todas son `prerender = false` (T2) y responden JSON UTF-8 con `Cache-Control: no-store`.
- El idioma del contenido se elige con el parámetro `locale` (`en` por defecto), no con la URL.
- Los handlers solo validan la entrada, llaman a `src/lib/server/*` y devuelven los DTO de `@/types/api`.
- La sesión va en cookies (`@supabase/ssr`). Sin sesión, las consultas se hacen con el rol `anon` y RLS decide qué se ve.
- La respuesta correcta de un ejercicio (`exercise_answers`) **nunca** sale de la base de datos.

### Errores

Toda respuesta que no sea 2xx tiene esta forma (`ApiError`):

```json
{ "error": { "code": "invalid_query", "message": "\"difficulty\" must be an integer between 1 and 10.", "field": "difficulty" } }
```

| HTTP | `code` | Cuándo |
|------|--------|--------|
| 400 | `invalid_query` | Un parámetro de la query no es válido (`field` indica cuál) |
| 400 | `invalid_body` | Cuerpo JSON no válido (Fase C) |
| 401 | `unauthorized` | Hace falta sesión (Fase C) |
| 402 | `insufficient_coins` | No hay monedas para desbloquear una pista (Fase C) |
| 404 | `not_found` | El ejercicio o la pista no existen (Fase C) |
| 500 | `internal_error` | Error de la base de datos; el detalle solo va al log del servidor |

`message` está en inglés y es para depurar: la UI muestra sus propios textos según `code` (T6).

---

## `GET /api/exercises` (Fase B)

Lista pública de ejercicios en un idioma. No requiere sesión.

### Request

Todos los parámetros son opcionales y se combinan con AND.

| Parámetro | Tipo | Validación | Filtra por |
|-----------|------|------------|------------|
| `language` | slug | `^[a-z0-9]+(-[a-z0-9]+)*$` | `exercises.language_slug` (slug de `data/languages.ts`) |
| `framework` | slug | ídem | `exercises.framework_slug` |
| `concept` | slug | ídem | `exercises.concept_slug` (lección, T4) |
| `category` | slug | ídem | `exercises.category` (`syntax`, `debugging`...) |
| `difficulty` | entero | 1-10 | dificultad exacta |
| `locale` | `en` \| `es` \| `fr` | por defecto `en` | idioma de los textos |
| `limit` | entero | 1-100, por defecto 50 | paginación |
| `offset` | entero | 0-100000, por defecto 0 | paginación |

Un parámetro vacío (`?language=`) se ignora.

```
GET /api/exercises?language=java&concept=oop&locale=es
```

### Response `200` · `ExerciseListResponse` (= `ExerciseDTO[]`)

Array vacío (`[]`) si nada coincide, que es lo que devuelve hoy: la tabla `exercises` empieza vacía (D4).
Orden: `difficulty` ascendente y después `slug`. Las pistas van ordenadas por `order`.

```json
[
  {
    "id": "5b0e…",
    "slug": "java-oop-constructor-chaining",
    "languageSlug": "java",
    "conceptSlug": "oop",
    "category": "syntax",
    "categoryName": "Sintaxis y fundamentos",
    "difficulty": 5,
    "type": "multiple_choice",
    "locale": "es",
    "title": "…", "objective": "…", "prompt": "…", "code": "…",
    "options": ["…", "…", "…"],
    "reward": { "coins": 2, "xp": 50 },
    "hints": [
      { "id": "…", "order": 1, "cost": 1, "unlocked": false },
      { "id": "…", "order": 2, "cost": 1, "unlocked": true, "text": "…" }
    ],
    "completed": false
  }
]
```

- Solo aparecen los ejercicios que tienen traducción en `locale` (no hay *fallback* a `en`).
- Los campos opcionales (`frameworkSlug`, `conceptSlug`, `context`, `code`, `options`) se omiten cuando no tienen valor. `options` solo existe en `multiple_choice`.
- `reward` se deriva de `difficulty` (§4): es lo que se gana **la primera vez**; repetir no da nada.
- Sin sesión: todas las pistas tienen `unlocked: false` y no llevan `text`; `completed` es `false`.
  Con sesión (Fase C), `unlocked`, `text` y `completed` reflejan al usuario (RLS sobre `hint_unlocks`, `hint_translations` y `attempts`).

### Errores
`400 invalid_query` (slug con mayúsculas o caracteres no permitidos, `locale` desconocido, `difficulty`/`limit`/`offset` fuera de rango) · `500 internal_error`.

---

## Fase C (diseño; aún no existen)

Los endpoints llaman a las RPC `security definer` de la base de datos. PostgREST traduce los `SQLSTATE` `PTxxx` a HTTP `xxx`:

| RPC | Errores | Endpoint |
|-----|---------|----------|
| `submit_result(p_exercise_id uuid, p_correct boolean)` | `PT401` sin sesión, `PT400` argumentos nulos, `PT404` ejercicio inexistente | `POST /api/exercises/[id]/result` |
| `unlock_hint(p_hint_id uuid)` | `PT401`, `PT400`, `PT404` pista inexistente, `PT402` sin saldo | `POST /api/exercises/[id]/hints` |

- `POST /api/exercises/[id]/result` · body `ResultRequest` `{ "correct": true }` → `200 ResultResponse`.
  La primera vez que se completa: monedas 1/2/3 según dificultad y XP = dificultad × 10, con subida de nivel encadenada. Repetir o "No resuelto": 0 y 0, pero el intento se registra.
- `POST /api/exercises/[id]/hints` · body `UnlockHintRequest` `{ "hintId": "…" }` → `200 UnlockHintResponse` `{ hint, coins }`.
  Cuesta 1 moneda; una pista ya desbloqueada se devuelve sin volver a cobrarla. Sin saldo → `402 insufficient_coins`.
  El endpoint debe comprobar que la pista pertenece al ejercicio `[id]` (`unlock_hint` devuelve `exercise_id`).
- `GET /api/profile` → nivel, XP, monedas, estadísticas, lenguajes activos y logros (DTO por definir).

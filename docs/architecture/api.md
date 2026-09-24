# API de DaviLearn

Mantenido por: **Backend Architect**. Tipos: [`src/types/api.ts`](../../src/types/api.ts) (contrato v2.2, [roadmap §5](./roadmap.md)).
Esquema y reglas: `supabase/migrations/20260923120000_initial_schema.sql` y [roadmap §4](./roadmap.md).

| Endpoint | Sesión | Respuesta | Fase |
|----------|--------|-----------|------|
| `POST /api/auth/register` | no | 303 · JSON `201 AuthResponse` | C1 |
| `POST /api/auth/login` | no | 303 · JSON `200 AuthResponse` | C1 |
| `POST /api/auth/logout` | no (idempotente) | 303 · JSON `200 SessionResponse` | C1 |
| `GET /api/auth/session` | no | `200 SessionResponse` | C1 |
| `GET /api/exercises` | no | `200 ExerciseDTO[]` | B3 |
| `GET /api/exercises/[id]` | no | `200 ExerciseResponse` | C2 |
| `POST /api/exercises/[id]/result` | **sí** | `200 ResultResponse` | C2 |
| `POST /api/exercises/[id]/hints` | **sí** | `200 UnlockHintResponse` | C2 |
| `GET /api/profile` | **sí** | `200 ProfileDTO` | C2 |

## Convenciones

- Rutas bajo `/api/*`, sin prefijo de idioma. Todas son `prerender = false` (T2) y responden JSON UTF-8.
- Todas las respuestas de `/api/**` (también las 303 y los errores) llevan `X-Robots-Tag: noindex` y
  `Cache-Control: private, no-store` (T15). Las páginas SSR (`prerender = false`) llevan `Cache-Control: private, no-store`
  salvo que la página ponga el suyo (lo hace `src/middleware.ts`).
- El idioma del contenido se elige con el parámetro `locale` (`en` por defecto), no con la URL.
- Los handlers solo validan la entrada, llaman a `src/lib/server/*` y devuelven los DTO de `@/types/api`.
- La respuesta correcta de un ejercicio (`exercise_answers`) **nunca** sale de la base de datos.

### Sesión (T12)

- Cookies de `@supabase/ssr` (`sb-127-auth-token*` en local), `HttpOnly`, `SameSite=Lax`, `Path=/`. El navegador **no**
  habla con Supabase directamente: las islas Vue llaman a `/api/**` con `fetch` (las cookies van solas, mismo origen).
- `src/middleware.ts` solo actúa en rutas SSR (en las prerenderizadas no hay cookies). Ahí rellena:
  - `Astro.locals.supabase`: cliente con las cookies de la petición (RLS como el usuario, o `anon`).
  - `Astro.locals.user`: `SessionUser` (`{ id, email, displayName? }`) o `null`. Valida el token con Supabase Auth
    (`getUser`) y lo refresca si ha caducado.
- Helpers en `@/lib/server/auth` (solo para `.astro` y `pages/api`; nunca en `.vue`, T9):

| Helper | Uso |
|--------|-----|
| `requireUser(Astro)` | Página privada: devuelve el `SessionUser` o una **302** a `/learn/login?next=<ruta actual>` (o `/{lang}/learn/login`, según el prefijo de la URL). `if (user instanceof Response) return user;` |
| `redirectIfSignedIn(Astro)` | Login y registro: con sesión devuelve una **303** a `?next=` (si es seguro) o a `/{lang}/learn`; sin sesión, `null`. |
| `consumeAuthFlash(Astro.cookies, page)` | `page` = `"login"` o `"register"`. Errores y valores del último envío fallido de ese formulario (`AuthFlash`) o `null`. Borra la cookie: al recargar, el formulario sale limpio. |
| `requireApiUser(context)` | Endpoint: `SessionUser` o **401** `unauthorized`. |
| `safeNext(value, fallback)`, `loginPath(lang, next)`, `learnPath(lang, path)` | Rutas localizadas y validación de `next`. |

### Seguridad de los POST (T15)

`src/middleware.ts` comprueba `Origin` en todo `POST`/`PUT`/`PATCH`/`DELETE` SSR. Sustituye a `security.checkOrigin` de Astro,
que se ejecuta antes del middleware y no ponía `X-Robots-Tag`; por eso está desactivado en `astro.config.mjs`.

- Tipo formulario (`application/x-www-form-urlencoded`, `multipart/form-data`, `text/plain`) o sin cuerpo: `Origin` tiene que ser
  el del sitio. Si falta o es otro → **403** `forbidden_origin`.
- JSON: **403** si `Origin` es de otro sitio. Sin `Origin` (curl) se acepta: un navegador no puede mandar JSON a otro sitio sin
  *preflight* CORS, y esta API no responde a CORS.
- Los endpoints JSON de ejercicios exigen `Content-Type: application/json` (si no, `400 invalid_body`).

### Errores

Toda respuesta JSON que no sea 2xx tiene esta forma (`ApiError`):

```json
{ "error": { "code": "invalid_query", "message": "\"difficulty\" must be an integer between 1 and 10.", "field": "difficulty" } }
```

| HTTP | `code` | Cuándo |
|------|--------|--------|
| 400 | `invalid_query` | Un parámetro de la query no es válido (`field` indica cuál) |
| 400 | `invalid_body` | Cuerpo JSON no válido o sin `Content-Type: application/json` (`field` si es un campo) |
| 401 | `unauthorized` | Hace falta sesión |
| 402 | `insufficient_coins` | No hay monedas para desbloquear una pista |
| 403 | `forbidden_origin` | `POST` desde otro origen (T15) |
| 404 | `not_found` | El ejercicio o la pista no existen |
| 500 | `internal_error` | Error de la base de datos o de Auth; el detalle solo va al log del servidor |

Más los códigos de auth (tabla de [Auth](#auth)). `message` está en inglés y es para depurar: la UI muestra sus propios
textos según `code` (T6).

---

## Auth

Registro e inicio de sesión con email y contraseña, **sin confirmación de email** (D3). Cada endpoint acepta dos modos (T13):

- **Formulario HTML** (`<form method="post" action="/api/auth/login" novalidate data-astro-reload>`): responde **303**.
  - Éxito → `next` (si es seguro) o `/{lang}/learn`.
  - Error → vuelta al formulario de `lang` (`/{lang}/learn/login` o `/{lang}/learn/register`), con **solo `?next=`** en la query.
    Los errores y lo que escribió el usuario van en la **cookie flash** `dl_auth_flash` (`HttpOnly`, `SameSite=Lax`, `Path=/`,
    2 minutos, de un solo uso), que la página lee con `consumeAuthFlash`. **La contraseña nunca se guarda.**
- **JSON** (`Accept: application/json` o cuerpo `Content-Type: application/json`): responde el DTO o un `ApiError` con el
  **primer** error.

### Campos (`AuthRequest`)

| Campo | Endpoints | Regla | Error |
|-------|-----------|-------|-------|
| `email` | register, login | Obligatorio, formato `a@b.c`, máx. 254; se recorta (`trim`) | `invalid_input` · `email` |
| `password` | register, login | Obligatorio, máx. 72 (límite de bcrypt); **no** se recorta | `invalid_input` · `password` |
| `password` (longitud) | register | Mínimo **`PASSWORD_MIN_LENGTH` = 8** (`src/lib/auth-rules.ts`, igual que `minimum_password_length` de `config.toml`). Sin reglas de composición | `weak_password` · `password` |
| `displayName` | register | Opcional; 1-40 caracteres tras `trim` (vacío = sin nombre) | `invalid_input` · `displayName` |
| `next` | todos | Ruta relativa que empieza por **una sola** `/` (ni `//` ni `/\`) y que no es `/api/…`. Si no, se ignora | — |
| `lang` | todos | `en`, `es` o `fr` (por defecto `en`): idioma de las redirecciones | — |

En el login la longitud mínima no se comprueba (una contraseña antigua más corta sigue sirviendo). En el registro se
devuelven **todos** los errores de validación a la vez, en el orden email → password → displayName.

`src/lib/auth-rules.ts` es isomórfico (se puede importar desde `.vue`): `PASSWORD_MIN_LENGTH`, `PASSWORD_MAX_LENGTH`,
`DISPLAY_NAME_MAX_LENGTH`, `EMAIL_MAX_LENGTH`.

### Códigos de error de auth (`AuthErrorCode`)

Estables: i18n los traduce (C6). `field` es el `name`/`id` del campo al que enlaza el error.

| `code` | `field` | HTTP (JSON) | Cuándo |
|--------|---------|-------------|--------|
| `invalid_input` | `email`, `password` o `displayName` | 400 | Campo vacío, con formato no válido o demasiado largo |
| `weak_password` | `password` | 422 | Registro con menos de 8 caracteres (o rechazada por Supabase Auth) |
| `email_taken` | `email` | 409 | Ya hay una cuenta con ese email (registro) |
| `invalid_credentials` | — (nunca dice cuál falla) | 401 | Email o contraseña incorrectos (login) |
| `rate_limited` | — | 429 | Demasiados intentos (límites de `[auth.rate_limit]`) |
| `internal_error` | — | 500 | Fallo de Supabase Auth o formulario ilegible |

Más `forbidden_origin` (403, sin redirección: la petición no viene del sitio).

### `AuthFlash` (lo que recibe la página tras un 303 con error)

```ts
// consumeAuthFlash(Astro.cookies, "register") →
{
  errors: [ { code: "invalid_input", field: "email" }, { code: "weak_password", field: "password" } ],
  values: { email: "ana@", displayName: "Ana" }   // nunca la contraseña
}
// o null si no hay flash de esa página (o ya se leyó)
```

### `POST /api/auth/register`

Crea la cuenta e inicia sesión. El trigger `on_auth_user_created` crea el perfil (0 monedas, nivel 1, 0 XP; `display_name`
si se dio). JSON → **201** `AuthResponse` `{ user: SessionUser }` + cookies de sesión.

```sh
# Formulario (lo que envía el navegador)
curl -i -H "Origin: http://localhost:4321" \
  --data-urlencode "email=ana@example.com" --data-urlencode "password=12345678" \
  --data-urlencode "displayName=Ana" --data-urlencode "lang=es" --data-urlencode "next=/es/learn" \
  http://localhost:4321/api/auth/register
# → 303 Location: /es/learn   (o /es/learn/register + Set-Cookie: dl_auth_flash=…)
```

### `POST /api/auth/login`

JSON → **200** `AuthResponse` + cookies de sesión. Formulario → 303 igual que el registro.

### `POST /api/auth/logout`

Cierra la sesión de este dispositivo (`signOut({ scope: "local" })`) y borra las cookies. Funciona sin sesión.
Campos opcionales `next` y `lang`. Formulario → **303** a `next` o `/{lang}/learn`; JSON → **200** `{ "user": null }`.

### `GET /api/auth/session`

**200** `SessionResponse`: `{ "user": { "id": "…", "email": "…", "displayName": "Ana" } }` o `{ "user": null }`. Nunca 401.

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

## `GET /api/exercises/[id]` (C2)

Un ejercicio por id. No requiere sesión; con sesión, `completed` y las pistas desbloqueadas reflejan al usuario.

| Parámetro | Validación |
|-----------|------------|
| `[id]` | uuid. Si no lo es → `404 not_found` |
| `locale` | `en` \| `es` \| `fr`, por defecto `en`. Otro valor → `400 invalid_query` |

**200** `ExerciseResponse` (= `ExerciseDTO`, la misma forma que en la lista).

- **Fallback a inglés:** si el ejercicio no tiene texto en `locale`, se sirve en inglés y `locale` del DTO vale `"en"`
  (la página marca ese contenido con `lang="en"`, guía de a11y). La categoría y las pistas van en el mismo idioma que el ejercicio.
- `404 not_found` si no existe (o no tiene texto ni en `locale` ni en inglés) · `500 internal_error`.

```
GET /api/exercises/de000000-0000-4000-8000-000000000001?locale=es
```

---

## `POST /api/exercises/[id]/result` (C2)

Registra un intento. **Requiere sesión.** D6: el cliente dice si acertó; la respuesta correcta nunca viaja al navegador.

- Body `ResultRequest` (`Content-Type: application/json`): `{ "correct": true }`.
- **200** `ResultResponse`:

```json
{ "correct": true, "firstCompletion": true, "coinsAwarded": 1, "xpAwarded": 20,
  "coins": 1, "xp": 20, "level": 1, "xpToNextLevel": 80, "newAchievements": [] }
```

- Reglas (§4, RPC `submit_result`): la primera vez que se completa, monedas 1/2/3 según la dificultad y XP = dificultad × 10,
  con subida de nivel encadenada. Repetir o "No resuelto" (`correct: false`): 0 y 0, pero el intento cuenta en las estadísticas.
- `coins`, `xp`, `level`, `xpToNextLevel` son el estado **después** del intento: la UI puede actualizar la cabecera sin
  volver a pedir el perfil. `newAchievements` siempre es `[]` hasta C7+.

| HTTP | `code` | Cuándo |
|------|--------|--------|
| 400 | `invalid_body` | No es JSON, o `correct` no es booleano (`field: "correct"`) |
| 401 | `unauthorized` | Sin sesión |
| 404 | `not_found` | `[id]` no es un uuid o el ejercicio no existe |
| 500 | `internal_error` | Error de la base de datos |

---

## `POST /api/exercises/[id]/hints` (C2)

Desbloquea una pista. **Requiere sesión.**

- Query `locale` (`en` por defecto): idioma de `hint.text` (si la pista no tiene texto en ese idioma, se devuelve en inglés).
- Body `UnlockHintRequest` (`Content-Type: application/json`): `{ "hintId": "…" }`.
- **Comprueba que la pista pertenece al ejercicio `[id]` antes de llamar a `unlock_hint`** (la RPC cobra la moneda y no
  conoce el ejercicio): una pista de otro ejercicio da `404` sin cobrar nada.
- Cuesta 1 moneda. Una pista ya desbloqueada se devuelve otra vez **sin cobrar** (sirve para pedir su texto en otro idioma).
- **200** `UnlockHintResponse`:

```json
{ "hint": { "id": "…", "order": 1, "cost": 1, "unlocked": true, "text": "…" }, "coins": 0 }
```

| HTTP | `code` | Cuándo |
|------|--------|--------|
| 400 | `invalid_query` | `locale` no válido |
| 400 | `invalid_body` | No es JSON, o `hintId` no es un uuid (`field: "hintId"`) |
| 401 | `unauthorized` | Sin sesión |
| 402 | `insufficient_coins` | Sin saldo (un usuario nuevo tiene 0 monedas hasta completar su primer ejercicio) |
| 404 | `not_found` | `[id]` no es un uuid, o la pista no existe o es de otro ejercicio (`field: "hintId"`) |
| 500 | `internal_error` | Error de la base de datos |

---

## `GET /api/profile` (C2)

Perfil del usuario con sesión (`401 unauthorized` sin ella). **200** `ProfileDTO`:

```json
{
  "id": "f8eb…", "email": "ana@example.com", "displayName": "Ana",
  "coins": 3, "level": 2, "xp": 40, "xpToNextLevel": 160,
  "stats": { "exercisesCompleted": 4, "attempts": 7 }
}
```

- `xp` es la XP dentro del nivel actual (0 ≤ `xp` < `level` × 100) y `xpToNextLevel` = `level` × 100 − `xp`.
- `stats.exercisesCompleted`: ejercicios distintos completados (primer acierto de cada uno). `stats.attempts`: todos los
  intentos enviados, aciertos, fallos y repeticiones.
- `displayName` se omite si el usuario no eligió nombre.
- Logros y lenguajes activos llegan en C7+ (se añadirán como campos nuevos, sin romper el contrato).
- En páginas SSR no hace falta llamar a la API: `getProfile(Astro.locals.supabase, user)` de `@/lib/server/progress`
  devuelve el mismo DTO.

---

## Base de datos que usan los endpoints

PostgREST traduce los `SQLSTATE` `PTxxx` de las RPC a HTTP `xxx`; `src/lib/server/progress.ts` los convierte en `RpcError`
con ese `status` y los endpoints responden con los códigos de arriba.

| RPC | Errores | Endpoint |
|-----|---------|----------|
| `submit_result(p_exercise_id uuid, p_correct boolean)` | `PT401` sin sesión, `PT400` argumentos nulos, `PT404` ejercicio inexistente | `POST /api/exercises/[id]/result` |
| `unlock_hint(p_hint_id uuid)` | `PT401`, `PT400`, `PT404` pista inexistente, `PT402` sin saldo | `POST /api/exercises/[id]/hints` |

Las consultas de lectura van con la sesión del usuario (RLS): `pgTAP` en `supabase/tests/api.test.sql`.
Datos de prueba solo locales: `supabase/exercises/_dev_sample.sql` (ver su README).

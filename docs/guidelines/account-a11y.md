# Requisitos de accesibilidad y SEO de la cuenta (Fase C · C3)

> Dueño: SEO/A11y Specialist. Destinatarios: UI (C4, C5) y Backend (C1, en lo que afecta al contrato de los formularios).
> Completa la guía general [`accessibility.md`](./accessibility.md), sobre todo su §9. Si algo de aquí choca con la guía,
> manda este documento para las páginas de la cuenta.

Cada requisito es verificable: **DEBE** es bloqueante en la revisión antes del merge; **RECOMENDADO** no lo es.
Los fragmentos de HTML son el marcado que debe salir del servidor (clases y textos orientativos; los textos reales
llegan de i18n, claves `auth.*` y `account.*`). Los ejemplos están en español para leerlos mejor.

---

## 0. Decisiones que afectan a todo

| # | Decisión | Por qué |
|---|----------|---------|
| A1 | Los formularios de login, registro y cierre de sesión llevan **`data-astro-reload`**. | El `ClientRouter` de Astro intercepta los `submit` y cambia la página con `fetch`. Después del cambio **no aplica `autofocus`** y el foco cae en `<body>` (comprobado en `astro@5.18.2`, `swap-functions.js`). Con `data-astro-reload` el envío es una navegación normal: el comportamiento es **idéntico con JS y sin JS**, y el foco al resumen de errores funciona. |
| A2 | Los formularios llevan **`novalidate`** y todos los errores vienen del servidor. | Las burbujas nativas del navegador salen en el idioma del navegador y no en el de la interfaz, desaparecen solas y no se pueden enlazar desde un resumen. Así hay **un solo patrón de error**, el mismo con y sin JS. `required` se mantiene para exponer el estado "obligatorio". |
| A3 | Tras un error, **el foco va al resumen de errores**, no al primer campo. | Esto ajusta lo que decía `fase-c.md` ("`role="alert"` y foco al primer error"). Si el foco va al primer campo, el usuario no se entera de que hay más errores. El resumen enlaza a cada campo. No lleva `role="alert"`: un `alert` que ya está en el HTML al cargar no se anuncia de forma fiable, y combinado con el foco se lee dos veces (§1.5). |
| A4 | El menú de cuenta es un **`<details>`/`<summary>`** nativo, no `role="menu"`. | Funciona sin JS, se abre con Enter y Espacio y expone el estado abierto o cerrado. `role="menu"` obliga a gestionar las flechas y es para menús de aplicación, no para esto (§2). |
| A5 | Las páginas de la cuenta y de ejercicio llevan `noindex` (§4). | Son privadas o no aportan nada en un buscador. |

---

## 1. Login y registro (`/learn/login`, `/learn/register` + `/es`, `/fr`)

### 1.1 Estructura de la página

- **DEBE**: usar `LearnLayout` con `noindex` (§4). Skip link, `<header>`, `<main id="main-content">` y `<footer>` ya los pone el layout.
- **DEBE**: un solo `<h1>` ("Iniciar sesión" / "Crear cuenta"). El resumen de errores usa `<h2>`. No hay más encabezados.
- **DEBE**: `<title>` único: `Iniciar sesión · DaviLearn`. **Si la página se muestra con errores, el título empieza por
  `Error: `** (`Error: Iniciar sesión · DaviLearn`). Es lo primero que lee el lector de pantalla al cargar, también sin JS
  (2.4.2, 3.3.1).
- **DEBE**: orden dentro de `<main>`: `h1` → aviso del motivo (solo si se llega con `?next=`, §3.5) → resumen de errores
  (solo si hay errores) → formulario → enlace a la otra página (§1.8).
- **DEBE**: si el usuario ya tiene sesión, `/learn/login` y `/learn/register` redirigen (303) a `next` o a `/learn`.
- El `<form>` no necesita nombre accesible (no queremos un landmark `form` más; la página ya es el formulario).

### 1.2 Campos

| Página | Campo | `type` | `name` / `id` | `autocomplete` | Obligatorio |
|--------|-------|--------|---------------|----------------|-------------|
| Login | Correo electrónico | `email` | `email` | `email` | sí |
| Login | Contraseña | `password` | `password` | `current-password` | sí |
| Registro | Correo electrónico | `email` | `email` | `email` | sí |
| Registro | Contraseña | `password` | `password` | `new-password` | sí |
| Registro | Nombre visible | `text` | `displayName` | `nickname` | no |

- **DEBE**: cada campo con `<label for>` **visible** encima del campo. Sin placeholders que hagan de etiqueta (3.3.2).
  Si hay placeholder, es un ejemplo y cumple 4,5:1.
- **DEBE**: `autocomplete` exactamente como en la tabla (1.3.5). `nickname` y no `name` ni `username`: es el nombre que
  se muestra en la app, no el nombre legal, y el identificador para entrar es el correo.
- **DEBE**: los obligatorios llevan `required`; el opcional lo dice **en su etiqueta** ("Nombre visible (opcional)").
  En el registro, encima del formulario, una frase: "Todos los campos son obligatorios salvo los marcados como opcionales".
  Nada de asteriscos de color como única pista (1.4.1, 3.3.2).
- **DEBE**: en el correo, `spellcheck="false"` y `autocapitalize="none"` (evitan que el móvil cambie lo que se escribe).
- **DEBE**: el botón de envío es un `<button type="submit">` con texto ("Iniciar sesión" / "Crear cuenta"). Nunca
  `disabled` (tampoco mientras los campos están vacíos).
- **DEBE**: objetivos de al menos 24 × 24 px (2.5.8); **RECOMENDADO** 44 px de alto en campos y botones.

### 1.3 Requisitos de la contraseña (antes de enviar)

- **DEBE**: el texto con los requisitos está **visible siempre** bajo la etiqueta, antes de escribir nada, y asociado con
  `aria-describedby` (3.3.2). En login no se muestran requisitos.
- **DEBE**: el número mínimo sale de **una sola constante** que usan Backend (validación de `weak_password`) y UI (texto),
  y coincide con `minimum_password_length` de `supabase/config.toml` (hoy 6; los ejemplos usan 8, ver §6).
- **No** hay contadores ni checklists que se actualicen al teclear con `aria-live`: anunciarían cada tecla.
  Si UI quiere marcar visualmente los requisitos cumplidos, sin live region y con icono + texto (§7 de la guía).

### 1.4 Mostrar u ocultar la contraseña

```html
<div class="field">
  <label for="password">Contraseña</label>
  <p id="password-hint" class="field-hint">Al menos 8 caracteres.</p>
  <div class="password-wrap">
    <input id="password" name="password" type="password" autocomplete="new-password"
           required aria-describedby="password-hint">
    <button type="button" class="password-toggle" aria-controls="password" aria-pressed="false" hidden>
      Mostrar contraseña
    </button>
  </div>
</div>
```

- **DEBE**: `<button type="button">` (si no, envía el formulario) con **`aria-pressed`** y un **texto fijo**
  ("Mostrar contraseña"). Con `aria-pressed` el nombre no cambia: cambia el estado ("pulsado / no pulsado").
  Si UI prefiere un icono, el texto va en `.sr-only` y el icono con `aria-hidden` (§1 de la guía).
- **DEBE**: el botón sale con `hidden` en el HTML del servidor y el script lo muestra. Sin JS no aparece un botón que no hace nada.
  El script se engancha en `document.addEventListener("astro:page-load", …)` porque learn usa `ClientRouter`.
- **DEBE**: al pulsarlo, el foco se queda en el botón y solo cambia `type` entre `password` y `text`. No se anuncia nada más.
- **DEBE**: al enviar el formulario, el campo vuelve a `type="password"` (así el navegador no lo guarda como texto normal).
- **DEBE**: el botón es otro control, fuera del `<label>`, y va después del campo en el DOM (orden de Tab: campo → botón).
- **DEBE**: se puede pegar en la contraseña; nada de `onpaste` que lo bloquee ni `autocomplete="off"` (3.3.8).

### 1.5 Errores del servidor tras la redirección 303

El flujo (T13): el formulario hace `POST` a `/api/auth/*`; si hay errores, la API responde **303** de vuelta a la
página del formulario, y la página (SSR) pinta los errores.

**Lo que la página necesita recibir (contrato con Backend, C1):**

- **DEBE**: una **lista** de errores `{ code, field? }` (puede haber varios a la vez en el registro), los valores que
  escribió el usuario **salvo la contraseña** (`email`, `displayName`) y el `next` original.
- **DEBE**: los valores escritos **no viajan en la URL** (el correo acabaría en el historial, en los logs y en el
  `Referer`). Recomendación: cookie *flash* (`HttpOnly`, `SameSite=Lax`, `Path=/`, vida corta, se borra al leerla).
  En la query solo puede ir `next` y, si hace falta, códigos de error sin datos personales. Ver §6.
- **DEBE**: si la página se recarga o se vuelve a ella más tarde, los errores ya no aparecen (la cookie se consume).

**Marcado con errores** (registro con dos errores):

```html
<div class="error-summary" tabindex="-1" autofocus aria-labelledby="error-summary-title">
  <h2 id="error-summary-title">Hay 2 problemas</h2>
  <ul>
    <li><a href="#email">Ya hay una cuenta con este correo. Inicia sesión o usa otro correo.</a></li>
    <li><a href="#password">La contraseña debe tener al menos 8 caracteres.</a></li>
  </ul>
</div>

<form method="post" action="/api/auth/register" novalidate data-astro-reload>
  <input type="hidden" name="next" value="/learn/exercise/123">
  <p class="form-note">Todos los campos son obligatorios salvo los marcados como opcionales.</p>

  <div class="field field--invalid">
    <label for="email">Correo electrónico</label>
    <p id="email-error" class="field-error">
      <svg aria-hidden="true" focusable="false">…</svg>
      <span class="sr-only">Error: </span>Ya hay una cuenta con este correo.
      <a href="/learn/login">Inicia sesión</a> o usa otro correo.
    </p>
    <input id="email" name="email" type="email" autocomplete="email" required
           spellcheck="false" autocapitalize="none"
           value="ana@example.com" aria-invalid="true" aria-describedby="email-error">
  </div>

  <div class="field field--invalid">
    <label for="password">Contraseña</label>
    <p id="password-hint" class="field-hint">Al menos 8 caracteres.</p>
    <p id="password-error" class="field-error">
      <svg aria-hidden="true" focusable="false">…</svg>
      <span class="sr-only">Error: </span>La contraseña debe tener al menos 8 caracteres.
    </p>
    <div class="password-wrap">
      <input id="password" name="password" type="password" autocomplete="new-password" required
             aria-invalid="true" aria-describedby="password-error password-hint">
      <button type="button" class="password-toggle" aria-controls="password" aria-pressed="false" hidden>
        Mostrar contraseña
      </button>
    </div>
  </div>

  <div class="field">
    <label for="displayName">Nombre visible (opcional)</label>
    <input id="displayName" name="displayName" type="text" autocomplete="nickname" value="Ana">
  </div>

  <button type="submit">Crear cuenta</button>
</form>
```

- **DEBE (resumen)**: solo existe si hay errores; va antes del formulario; `tabindex="-1"` + `autofocus`; `<h2>` con el
  número de problemas; una `<li>` por error con un enlace al `id` del campo (o al primer campo si el error es del formulario).
  Sin `role="alert"` (decisión A3).
- **DEBE (foco)**: al cargar con errores, el foco está en el resumen. `autofocus` lo hace sin JS; además, un script en
  `astro:page-load` enfoca `.error-summary` si existe y el foco no está ya en él (por si el navegador ignora `autofocus`).
  **RECOMENDADO**: al pulsar un enlace del resumen, enfocar el campo y hacer scroll para que su etiqueta quede visible.
- **DEBE (por campo)**: el error va entre la etiqueta y el campo, con `id`; el campo lleva `aria-invalid="true"` y
  `aria-describedby` con **el error primero** y después la pista (`"password-error password-hint"`). Sin error, ni
  `aria-invalid` ni referencia a un `id` que no existe.
- **DEBE**: el error dice **cómo arreglarlo**, con icono + texto (no solo borde rojo, 1.4.1). Texto 4,5:1 con `--error`
  sobre el fondo real; el borde del campo con error, 3:1.
- **DEBE (valores)**: `email` y `displayName` se rellenan con lo que se escribió; la contraseña **nunca** se devuelve
  (3.3.7 admite esta excepción por seguridad). El `next` se conserva en el campo oculto.

**Qué hace cada código** (los de C1 en `api.md`; textos en `auth.error.*`):

| `code` | Dónde se muestra | `aria-invalid` en | Texto (orientativo) |
|--------|------------------|-------------------|---------------------|
| `invalid_credentials` | Solo en el resumen; el enlace apunta a `#email` | ningún campo (no revelamos cuál falla) | "El correo o la contraseña no son correctos." |
| `email_taken` | Resumen + campo `email` | `email` | "Ya hay una cuenta con este correo. Inicia sesión o usa otro correo." (con enlace a login) |
| `weak_password` | Resumen + campo `password` | `password` | "La contraseña debe tener al menos {min} caracteres." |
| `invalid_input` + `field` | Resumen + ese campo | el campo de `field` | Uno por campo: vacío ("Escribe tu correo electrónico") o formato ("Escribe un correo con el formato nombre@dominio.com") |
| `rate_limited` | Solo en el resumen | ninguno | "Demasiados intentos. Vuelve a intentarlo dentro de {n} minutos." (sin captcha, 3.3.8) |
| cualquier otro / `internal_error` | Solo en el resumen | ninguno | "No hemos podido completar la acción. Vuelve a intentarlo." |

Un código desconocido nunca deja la página sin mensaje: cae en la última fila.

### 1.6 WCAG 3.3.7 (entrada redundante) y 3.3.8 (autenticación accesible, mínimo)

- **DEBE (3.3.7)**: no hay "repetir contraseña" ni "repetir correo" (el botón de mostrar la contraseña cubre el riesgo de
  escribirla mal). Tras un error se conserva lo escrito (§1.5). Tras registrarse, el usuario **ya tiene sesión** (D3, sin
  confirmación de correo) y va a `next`: no se le vuelve a pedir el correo y la contraseña.
- **DEBE (3.3.8)**: ninguna prueba cognitiva: sin captcha, sin puzzles, sin "escribe los caracteres de la imagen".
  Los gestores de contraseñas funcionan: `autocomplete` correcto, `name` estables, correo y contraseña **en el mismo
  formulario y en la misma página** (no en dos pasos), se puede pegar. El límite de intentos (`rate_limited`) solo pide esperar.

### 1.7 Sin JavaScript

- **DEBE**: con JS desactivado se puede registrar, entrar, ver los errores con el foco en el resumen (por `autofocus`),
  cerrar sesión y volver a `next`. Solo desaparece el botón de mostrar la contraseña.
- **Cómo se comprueba**: DevTools → *Disable JavaScript*, recorrer los tres flujos (registro correcto, login con credenciales
  malas, registro con dos errores) solo con teclado.

### 1.8 Enlaces entre login y registro

- **DEBE**: bajo el formulario, un párrafo con un enlace de texto claro (2.4.4):
  - Login: `¿No tienes cuenta? <a href="/learn/register?next=…">Crear una cuenta</a>`
  - Registro: `¿Ya tienes cuenta? <a href="/learn/login?next=…">Iniciar sesión</a>`
- **DEBE**: los enlaces conservan `next` (codificado con `encodeURIComponent`) y el prefijo de idioma (`/es/learn/login`).
- **DEBE**: cambiar de idioma con `LanguagePicker` en estas páginas conserva `next` (hoy `localizePath` solo usa el
  `pathname` y lo perdería). Los errores no hace falta conservarlos.
- **RECOMENDADO**: el error `email_taken` enlaza a login.

---

## 2. Menú de cuenta en la cabecera de learn

### 2.1 Qué es y qué contiene

- **Con sesión**: un disclosure `<details>`/`<summary>` (A4). El `<summary>` muestra el nombre visible (o "Mi cuenta" si no
  tiene; **nunca el correo** en la cabecera). El panel tiene el nivel, la XP, las monedas y el botón de cerrar sesión.
- **Sin sesión**: en el mismo sitio, un **enlace** "Iniciar sesión" a `/learn/login?next=<ruta actual>`. En la propia
  página de login lleva `aria-current="page"` y no añade `next`.
- **Prohibido**: `role="menu"`, `role="menuitem"`, abrir con `hover` y `aria-haspopup`.

```html
<div class="learn-header-end">
  <nav class="mode-switch" aria-label="Modo">…</nav>
  <nav class="lang-picker" aria-label="Idioma">…</nav>

  <details class="account-menu">
    <summary class="account-summary">
      <span class="account-avatar" aria-hidden="true">A</span>
      <span class="sr-only">Cuenta: </span><span class="account-name">Ana</span>
    </summary>
    <div class="account-panel">
      <ul class="account-stats">
        <li>Nivel 3</li>
        <li>40 de 100 XP para el nivel 4</li>
        <li><svg aria-hidden="true" focusable="false">…</svg>12 monedas</li>
      </ul>
      <form method="post" action="/api/auth/logout" data-astro-reload>
        <button type="submit">Cerrar sesión</button>
      </form>
    </div>
  </details>
</div>
```

### 2.2 Cómo se anuncian las monedas y el nivel

- **DEBE**: frases completas en texto (con plurales de i18n): "Nivel 3", "40 de 100 XP para el nivel 4", "12 monedas".
  El icono de moneda es decorativo (`aria-hidden`) porque la palabra está en el texto (§1 de la guía).
- **DEBE**: si hay una barra de XP, es decorativa (`aria-hidden`) y el texto de al lado dice lo mismo. Nada de
  `role="progressbar"` sin texto.
- **DEBE**: la cabecera **no tiene live region**. Quien anuncia las monedas ganadas es la isla del ejercicio (una sola
  vez, §5 de la guía). Si la isla actualiza la cabecera (p. ej. con un `CustomEvent`), el cambio es silencioso.
- **DEBE**: si la cabecera no se actualiza en la misma página, el dato se refresca en la siguiente navegación (es SSR).
  No se muestran en el `<summary>` cifras que se queden viejas a la vista: en el `<summary>` solo va el nombre.

### 2.3 Comportamiento

- **DEBE**: Enter y Espacio en el `<summary>` abren y cierran (nativo). El panel se recorre con Tab en orden: estadísticas
  (no enfocables) → "Cerrar sesión". No hay trampa de foco.
- **DEBE** (con JS): Escape con el foco dentro del menú lo cierra y devuelve el foco al `<summary>`.
  **RECOMENDADO**: clic fuera lo cierra (sin mover el foco).
- **DEBE**: el panel se superpone al contenido (`position: absolute`, alineado a la derecha), cabe en 320 px
  (`max-width: calc(100vw - 2rem)`) y no tapa el elemento enfocado (2.4.11).
- **DEBE**: el `<summary>` tiene foco visible (`--focus-ring`) y mide al menos 24 × 24 px (mejor 44 px).
  Si se quita el marcador nativo del `<summary>`, se añade una flecha propia (`aria-hidden`) que gira al abrir
  (con `prefers-reduced-motion`, sin transición).
- **DEBE**: cerrar sesión es un `<form method="post" action="/api/auth/logout" data-astro-reload>` con `<button type="submit">`.
  **Nunca** un enlace (`GET`) ni un `<button>` con `fetch` que no funcione sin JS. Tras el 303, la cabecera muestra
  "Iniciar sesión". **RECOMENDADO**: en la página de destino, un aviso visible "Has cerrado sesión".

### 2.4 Posición en el DOM y en pantalla (revalidación de `layout-modos.md`)

- **DEBE (DOM)**: el menú va **dentro de `.learn-header-end`, después de `LanguagePicker`**: marca → conmutador → idioma → cuenta.
  Es el hueco que ya reservaba `layout-modos.md`.
- **DEBE (escritorio)**: una sola fila: marca a la izquierda; conmutador, idioma y cuenta a la derecha, en ese orden.
- **DEBE (móvil, ≤ 846 px)**: la cuenta va **en la fila 1, a la derecha del idioma**, con el mismo `order: 1` que el idioma
  (con el mismo `order` se respeta el orden del DOM). El conmutador sigue solo en la fila 2.

```
Móvil (≤ 846 px)
┌──────────────────────────────┐
│ DaviLearn   [EN ES FR] (A ▾) │   fila 1: marca, idioma, cuenta
│ (Docs      ▓▓Aprender▓▓)     │   fila 2: conmutador
└──────────────────────────────┘
Tab: marca → Docs → Aprender → EN → ES → FR → cuenta
```

- **DEBE (320 px)**: la fila 1 cabe sin scroll horizontal (1.4.10). Si no cabe el nombre, se oculta **solo visualmente**
  (`.sr-only` en `.account-name` por debajo de un ancho que UI mida) y queda el avatar; el nombre accesible sigue siendo
  "Cuenta: Ana". Lo mismo con "Iniciar sesión": si no cabe, puede pasar a una fila propia, pero nunca a un icono sin nombre.
- **Conclusión de la revalidación**: con la cuenta al final del DOM y en la fila 1, el orden de Tab en móvil es marca →
  conmutador (fila 2) → idioma → cuenta (fila 1). Sigue habiendo **un único salto hacia atrás** (de la fila 2 al final
  de la fila 1), y después el foco avanza de izquierda a derecha. **Sigue cumpliendo 2.4.3 y 1.3.2**. Poner la cuenta
  antes del idioma en el DOM, o en la fila 2, crearía un segundo salto: **no se acepta**.

---

## 3. Página de ejercicio real (`/learn/exercise/[id]` + `/es`, `/fr`)

### 3.1 Estructura

- **DEBE**: `LearnLayout` con `noindex`. `<title>`: `{título del ejercicio} · DaviLearn`.
- **DEBE**: un solo `<h1>`: el título del ejercicio. Hoy lo pinta `InterfazEjercicio.vue`, así que la página **no**
  añade otro. Debajo, `<h2>` (Pregunta, Pistas, Resultado), como en la demo revisada en B10.
- **DEBE**: el ejercicio y el perfil inicial se cargan **en el servidor** (SSR, T14) llamando a `src/lib/server/*`,
  no con `fetch` a la propia API desde el servidor ni desde el cliente. Así el `<h1>` y el enunciado están en el HTML
  inicial y no hay estado de carga al entrar.
- **DEBE (sin JS)**: el enunciado y las opciones se leen. Como enviar necesita JS, un `<noscript>` visible explica
  "Para resolver ejercicios necesitas activar JavaScript".

### 3.2 Idioma del contenido

- **DEBE**: cuando `exercise.locale !== lang` (se sirve el contenido en inglés dentro de `/es` o `/fr`), todo el
  contenido del ejercicio (título, contexto, objetivo, enunciado, opciones, pistas, categoría) lleva `lang={exercise.locale}`.
  Ya lo hace `InterfazEjercicio` con `contentLang`; C5 mantiene ese prop conectado a la respuesta real (3.1.2).
- **DEBE**: los textos de interfaz (botones, "Pregunta", "Pistas", monedas) van en el idioma de la página y **sin** ese `lang`.
- El `<title>` no admite `lang`; que mezcle idiomas se acepta.
- **RECOMENDADO**: si el contenido cae al inglés, un aviso visible en el idioma de la interfaz ("Este ejercicio aún no
  está traducido; se muestra en inglés").

### 3.3 Estados de las acciones (enviar, pistas)

- **DEBE**: mientras se envía, el botón lleva `aria-disabled="true"` y un texto visible ("Enviando…"). El foco no se pierde.
- **DEBE**: los errores de red o del servidor se anuncian en un contenedor con **`role="alert"` que existe siempre
  vacío** en el HTML del servidor y solo cambia de texto (no bloqueante 1 de B10, ya aplicado en la isla: se comprueba
  de nuevo con la API real). El foco se queda en el botón.
- **DEBE**: `401` durante una acción (sesión caducada) → en esa misma región: "Tu sesión ha caducado. Inicia sesión para
  guardar el resultado", con un enlace visible a `/learn/login?next=<esta página>`. No se redirige sin avisar.
- **DEBE**: `402` en una pista → el patrón de §8 de la guía (ya revisado en B10).
- **DEBE**: si alguna parte se carga en el cliente (p. ej. un reintento), el contenedor lleva `aria-busy="true"` mientras
  carga y hay un texto visible "Cargando…"; un spinner solo, nunca (lleva `aria-hidden`).

### 3.4 Ejercicio no encontrado y error de carga

- **DEBE (404)**: id con formato no válido o que no existe → **estado HTTP 404** (`Astro.response.status = 404`), no un
  200 con un mensaje. Página con `<h1>` "Ejercicio no encontrado", una frase y un enlace "Volver a Aprender".
  `<title>`: `Ejercicio no encontrado · DaviLearn`. `noindex`.
- **DEBE (error al cargar)**: fallo de la base de datos → **estado 500**, `<h1>` "No hemos podido cargar el ejercicio",
  un enlace "Reintentar" (a la misma URL) y otro "Volver a Aprender". `noindex`.
- En los dos casos no se pinta la isla, así que el `<h1>` es el de la página y sigue siendo uno.

### 3.5 Sin sesión: redirección a login con `?next=`

- **DEBE**: sin sesión, la página responde **303** a `/learn/login?next=<ruta codificada>` en el idioma de la página
  (`/es/learn/exercise/123` → `/es/learn/login?next=%2Fes%2Flearn%2Fexercise%2F123`).
- **DEBE (seguridad, Backend)**: `next` solo se acepta si es una ruta relativa que empieza por una sola `/` (no `//`,
  ni `/\`, ni esquema). Si no, se usa `/learn` en el idioma actual. Evita redirecciones abiertas.
- **DEBE (aviso)**: si hay `next`, la página de login muestra justo después del `<h1>` un párrafo visible, **sin live region**:
  "Inicia sesión para continuar." Es contenido de la página: se lee en orden al cargar y con JS o sin JS igual.
- **DEBE (al volver)**: tras entrar, 303 a `next`. Es una carga de página normal (A1): el lector anuncia el `<title>`
  (el título del ejercicio) y el foco empieza arriba, con el skip link como primer elemento. **No se fuerza el foco**
  ni se añade un anuncio: el título ya identifica la página y un salto de foco sin que el usuario lo pida confunde más.

---

## 4. Indexación

| Ruta (+ `/es`, `/fr`) | Estado | `robots` |
|-----------------------|--------|----------|
| `/learn` | 200 | `noindex` mientras sea provisional (se revisa en `produccion.md` §2) |
| `/learn/login`, `/learn/register` | 200 | `noindex` |
| `/learn/exercise/[id]` | 200 con sesión; 303 sin sesión | `noindex` |
| Ejercicio no encontrado / error | 404 / 500 | `noindex` |
| Páginas de demo (si quedan en desarrollo) | 200 | `noindex` |
| `/api/**` | — | `X-Robots-Tag: noindex` en la respuesta (**Backend, C1**, T15) |
| Docs | 200 | indexables, sin cambios |

- **DEBE**: `noindex` con la prop `noindex` de `LearnLayout` (`<meta name="robots" content="noindex">`), sin `nofollow`.
- **DEBE**: en producción, `robots.txt` **no** bloquea estas páginas con `Disallow`: si Google no puede rastrearlas, no ve
  el `noindex` y puede indexar la URL sin contenido. Solo `/api/` va en `Disallow` (apuntado en `produccion.md` §2).
- `AlternateLinks` (hreflang) se mantiene en estas páginas: no molesta y es coherente con el resto.

---

## 5. Checklist de revisión de las PRs de la Fase C

Además de la checklist general de la guía. SEO revisa cada rama con esta lista antes del merge.

**Formularios (C4)**
- [ ] `data-astro-reload` y `novalidate` en login, registro y cierre de sesión; `method="post"`.
- [ ] `<label for>` visible en cada campo; `autocomplete` según la tabla de §1.2; opcional marcado en el texto.
- [ ] Requisitos de la contraseña visibles antes de escribir, con `aria-describedby`; el mínimo sale de una constante compartida.
- [ ] Botón de mostrar la contraseña: `type="button"`, `aria-pressed`, texto fijo, `hidden` sin JS; se puede pegar.
- [ ] Con errores: `<title>` con `Error: `, resumen enfocado al cargar con enlaces a los campos, `aria-invalid` +
      `aria-describedby` (error primero) en cada campo con error, icono + texto.
- [ ] Se conservan correo, nombre visible y `next`; nunca la contraseña; los datos no van en la URL.
- [ ] Cada código de error de C1 tiene su texto (§1.5), y hay uno genérico para los desconocidos.
- [ ] Sin captcha ni "repite la contraseña"; tras registrarse ya hay sesión.
- [ ] Probado **sin JS** y solo con teclado: registro, login fallido y registro con dos errores.

**Cabecera (C4)**
- [ ] `<details>`/`<summary>` sin `role="menu"`; Escape cierra y devuelve el foco; cerrar sesión es un `<form>` con botón.
- [ ] DOM: conmutador → idioma → cuenta. Móvil: cuenta en la fila 1 junto al idioma; nada de scroll horizontal a 320 px.
- [ ] Monedas y nivel en frases de texto; sin live region en la cabecera; sin correo visible.
- [ ] Sin sesión: enlace "Iniciar sesión" con `next`.

**Ejercicio (C5)**
- [ ] Un `<h1>` (el título), `lang` del contenido cuando no coincide con la interfaz, `<noscript>` visible.
- [ ] Contenedor `role="alert"` vacío en el HTML del servidor para los errores; 401 con enlace a login.
- [ ] 404 y 500 con su estado HTTP real, su `<h1>` y enlace de vuelta.
- [ ] Sin sesión: 303 a login con `next` validado y en el idioma de la página; aviso visible en login.

**SEO**
- [ ] `noindex` en todas las páginas de §4; docs: las 163 páginas con el mismo marcado que en `renovacion`.
- [ ] `X-Robots-Tag: noindex` en las respuestas de `/api/**`, también en las 303 y en los errores.
- [ ] Contraste medido en los estados nuevos: error de campo, borde del campo con error, `<summary>` y panel.

---

## 6. Decisiones pendientes del PM

1. **Longitud mínima de la contraseña.** Hoy `minimum_password_length = 6` en `supabase/config.toml`. Propuesta: **8**
   (mínimo de NIST SP 800-63B), sin reglas de composición, que complican el registro sin mejorar mucho la seguridad.
2. **Transporte de los errores tras el 303.** Propuesta: cookie *flash* con `{ errors: [{ code, field? }], values: { email, displayName } }`,
   y en la query solo `next`. La otra opción de T13 (errores en la query) obliga a dejar fuera lo que escribió el usuario
   o a poner el correo en la URL.
3. **Caché del HTML con sesión** (Backend, producción): las páginas SSR que muestran datos del usuario (cabecera con la
   cuenta, ejercicio) deben salir con `Cache-Control: private, no-store` para que ninguna caché intermedia las comparta.

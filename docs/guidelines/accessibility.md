# Guía de accesibilidad de DaviLearn (WCAG 2.2 AA)

> Dueño: SEO/A11y Specialist. Aplica a todo lo nuevo de `learn/**` y a las islas Vue.
> Los docs heredados tienen su propia deuda (roadmap, Fase D); no se corrigen aquí.

El objetivo es diseñar accesible desde el primer commit, no arreglarlo después. Cada regla indica
el criterio WCAG 2.2 que cubre. Si una regla choca con un diseño, se habla con SEO antes de hacer merge.

---

## 1. Imágenes, iconos y logros (1.1.1)

- **Todo `<img>` lleva `alt`.** Sin excepción: sin `alt` el lector de pantalla lee el nombre del archivo.
- **Informativo → `alt` descriptivo**: dice lo que el usuario necesita saber, no cómo es el dibujo.
  - Logro: `alt="Logro: Primer ejercicio resuelto"`, no `alt="medalla dorada"` ni `alt="logro.svg"`.
  - Logro bloqueado: el estado va en el texto (`alt="Logro bloqueado: Racha de 7 días"`), no solo en la opacidad o el gris.
  - Icono de moneda junto a un número: el conjunto se lee como "3 monedas". O el icono lleva `alt="monedas"`, o es decorativo y el texto visible incluye la palabra.
- **Decorativo → `alt=""`** (vacío, no ausente): retícula de fondo, adornos, iconos que repiten un texto visible al lado.
- **SVG en línea**: decorativo → `aria-hidden="true" focusable="false"`; informativo → `role="img"` + `aria-label` (o `<title>`).
- **Botón o enlace que solo tiene un icono**: el nombre accesible va en el control (`aria-label` o texto oculto con `.sr-only`), y el icono queda `aria-hidden`.
- Los textos de `alt` y `aria-label` se traducen como cualquier otro texto (llegan por props, T6).

> `.sr-only` (texto solo para lectores de pantalla) **todavía no existe**: UI la añade en `learn.css` en B6 con el
> patrón estándar (`position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap;`).

## 2. Contraste (1.4.3, 1.4.11)

| Qué | Mínimo | Ejemplo |
|-----|--------|---------|
| Texto normal (< 24 px, o < 18,66 px en negrita) | **4,5:1** | cuerpo, etiquetas, texto de botones, placeholders |
| Texto grande (≥ 24 px, o ≥ 18,66 px en negrita) | **3:1** | `h1`, cifras grandes del resultado |
| Componentes de UI y gráficos | **3:1** frente a lo que tienen al lado | borde de un input, anillo de foco, barra de XP, icono de éxito/error |
| Texto deshabilitado | sin mínimo (1.4.3 lo excluye) | aun así, **la explicación** de por qué está deshabilitado sí debe cumplir 4,5:1 |

**Cómo medir:**
- Mide contra el fondo **real** (`--dark-bg` `#13151a` o `--card-bg` `#23262d`), no contra blanco. Con transparencias, mide el color resultante.
- Herramientas: pestaña *Accessibility* / selector de color de Chrome DevTools, o el comando de Node que usa SEO (fórmula de luminancia relativa de WCAG).
- Mide cada estado: normal, hover, foco, activo, deshabilitado, éxito y error.

Referencias ya medidas sobre `#13151a`: `#ffffff` 18,3:1 · `#e4e4e7` 14,4:1 · `#a1a1aa` 7,1:1 · `#a78bfa` 6,7:1 (5,6:1 sobre `#23262d`) · `#888` 5,2:1 · **`#666` 3,2:1 (no vale para texto)**.
Los tokens nuevos de B6 (`--success`, `--error`, `--warning` y sus fondos) se añaden con su ratio en un comentario, como `--focus-ring`.

## 3. Teclado (2.1.1, 2.1.2, 2.4.3, 2.1.4)

- **Todo lo que funciona con ratón funciona con teclado**: Tab/Shift+Tab para moverse, Enter para enlaces y botones, Espacio para botones, casillas y radios, flechas dentro de un grupo de radios.
- **Usa el elemento nativo**: `<button>` para acciones, `<a href>` para navegar, `<input type="radio">` para las opciones de un ejercicio. Nada de `<div @click>`. Si no hay más remedio, `role` + `tabindex="0"` + manejar Enter y Espacio, y avisar a SEO.
- **Orden de tabulación = orden del DOM = orden visual.** No uses `tabindex` positivo. Si en móvil reordenas con CSS (`order`, `grid-area`, `flex-direction: row-reverse`), comprueba que el foco no salta hacia atrás de forma confusa (ver la decisión de la cabecera en `layout-modos.md`).
- **Sin trampas de foco**: siempre se puede salir con Tab o Escape. La única trampa permitida es la de un diálogo modal abierto (el foco se queda dentro, Escape lo cierra y el foco vuelve al botón que lo abrió).
- **Gestión del foco tras una acción**: si una acción hace desaparecer el control enfocado (p. ej. "Resuelto" se sustituye por la pantalla de resultado), mueve el foco al nuevo contenido (su encabezado, con `tabindex="-1"`). El foco nunca cae en `<body>`.
- **Atajos de una sola tecla** (p. ej. `1`-`4` para elegir una opción): solo si se pueden desactivar o si funcionan únicamente cuando el componente tiene el foco (2.1.4). Documenta el atajo en la ayuda visible.
- **Tamaño de objetivo** (2.5.8): al menos **24 × 24 px** por control, o separación suficiente. Recomendado 44 × 44 px en móvil.

## 4. Foco visible (2.4.7, 2.4.11, 1.4.11)

- Ya está resuelto en `learn.css`: `.learn :focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }`.
- **No lo anules**: nada de `outline: none` sin sustituto. Si un componente necesita otro estilo, usa `--focus-ring` con un grosor de al menos 2 px y 3:1 de contraste con el fondo.
- Usa `:focus-visible`, no `:focus`, para no pintar el anillo en los clics de ratón.
- **El foco no puede quedar tapado** (2.4.11) por cabeceras fijas, barras inferiores o toasts. Si hay algo fijo, añade `scroll-padding-top` / `scroll-padding-bottom`.

## 5. Live regions: anunciar cambios (4.1.3)

- **La región existe vacía en el HTML del servidor** y el cliente solo cambia su texto. Si se crea a la vez que el mensaje, muchos lectores de pantalla no lo anuncian. Patrón de referencia: `LanguageSuggestion.vue`.
- **`aria-live="polite"` (o `role="status"`)** para casi todo: resultado de un ejercicio, monedas y XP ganadas, subida de nivel, pista desbloqueada, resultado de la ruleta.
- **`aria-live="assertive"` (o `role="alert"`)** solo para lo que no puede esperar: error al enviar el resultado, sesión caducada, error de red. Nunca para mensajes de éxito.
- **Un mensaje, una vez**: agrupa ("Correcto. +2 monedas, +40 XP. ¡Subes al nivel 3!") en lugar de tres anuncios seguidos. No anuncies cada paso de una animación (la ruleta anuncia solo el resultado final).
- La región no se oculta con `display: none` (entonces no anuncia); si no debe verse, usa `.sr-only`.
- Una región por componente como mucho; no pongas `aria-live` en contenedores grandes.

## 6. Movimiento (2.3.3, 2.2.2)

- Respeta `prefers-reduced-motion: reduce`:
  - CSS: dentro de `@media (prefers-reduced-motion: reduce)` quita transiciones de desplazamiento, giros y parallax. Los cambios de opacidad cortos se pueden mantener.
  - Vue: consulta `matchMedia("(prefers-reduced-motion: reduce)")` y salta al estado final (como hace el rodillo de `LanguageSuggestion`).
- Las transiciones de vista de Astro ya se desactivan solas con esa preferencia.
- Nada parpadea más de 3 veces por segundo (2.3.1). Confeti, monedas que vuelan o la barra de XP que se llena: duración corta, sin bucle y con alternativa estática.
- Todo lo que se mueva solo durante más de 5 s necesita un control para pausarlo.

## 7. Éxito, error y otros estados sin depender del color (1.4.1)

Un estado nunca se comunica **solo** con color. Siempre **icono + texto**, y el color como refuerzo:

| Estado | Visual | Texto (visible o en la live region) |
|--------|--------|-------------------------------------|
| Correcto | icono ✓ (SVG) + color `--success` + borde | "Correcto" |
| Incorrecto / no resuelto | icono ✕ (SVG) + color `--error` + borde | "No resuelto" o el motivo del error |
| Aviso | icono ! + `--warning` | el aviso |
| Opción elegida | borde más grueso o marca, no solo el fondo | el radio marcado ya lo comunica |

- El icono es decorativo (`aria-hidden`) si el texto dice lo mismo.
- En las opciones de un ejercicio corregido, la opción correcta y la incorrecta se distinguen también por la forma o el texto ("Tu respuesta", "Respuesta correcta").
- El color del estado y su icono cumplen 3:1 con el fondo; el texto, 4,5:1.

## 8. Controles deshabilitados con explicación

Caso real: **una pista cuesta 1 moneda y el usuario empieza con 0 monedas** (roadmap §4). El botón no puede
funcionar, pero el usuario tiene que poder encontrarlo y entender por qué.

**No uses solo `disabled`**: saca el botón del orden de tabulación, muchos lectores de pantalla no lo
anuncian al recorrer con Tab y no explica nada.

**Patrón obligatorio:**

```html
<button
  type="button"
  aria-disabled="true"
  aria-describedby="hint-1-why"
  class="hint-button"
>
  Ver pista 1 (1 moneda)
</button>
<p id="hint-1-why" class="hint-why">
  Necesitas 1 moneda. Consigue monedas completando un ejercicio nuevo.
</p>
```

- `aria-disabled="true"`: el botón sigue siendo enfocable y el lector dice "no disponible".
- El manejador de clic **comprueba** `aria-disabled` y no hace nada (o repite la explicación en la live region). El servidor también lo rechaza (402), pero la UI no debe llegar a llamar.
- `aria-describedby` apunta a un texto **visible** (no solo un tooltip ni un `title`), que cumple 4,5:1. El `id` es único en la página.
  - Si **varios controles están bloqueados por el mismo motivo** (todas las pistas sin saldo), vale **un único párrafo compartido**
    al que apuntan todos con el mismo `aria-describedby` (decisión de B10). El párrafo solo existe mientras algún control lo
    referencia, y cada botón solo lleva `aria-describedby` mientras está bloqueado por ese motivo.
  - Si el motivo es distinto por control (p. ej. "pista 2 requiere desbloquear antes la 1"), cada uno tiene su propio texto e `id`.
- Estilo: aspecto atenuado con `[aria-disabled="true"]`, pero el foco sigue visible.
- Cuando cambia el saldo, se quita `aria-disabled` y el texto explicativo; si el cambio ocurre sin que el usuario lo pida, anúncialo en la live region.
- Este mismo patrón vale para cualquier acción bloqueada (ejercicio ya enviado, límite alcanzado).
- `disabled` nativo solo es aceptable durante una fracción de segundo (p. ej. mientras se envía un formulario) y, aun así, `aria-disabled` suele ser mejor porque no pierde el foco (patrón del botón de `LanguageSuggestion`).

## 9. Formularios (Fase C: login y registro) (1.3.1, 1.3.5, 3.3.1, 3.3.2, 3.3.7, 3.3.8)

> Los requisitos concretos de login, registro, menú de cuenta y página de ejercicio, con HTML de ejemplo, están en
> [`account-a11y.md`](./account-a11y.md) (C3). Para esas páginas manda ese documento.

- **Cada campo tiene `<label for>` visible.** El placeholder no sustituye a la etiqueta.
- **`autocomplete`** en los campos de datos personales (1.3.5):
  - Login: `autocomplete="email"` y `autocomplete="current-password"`.
  - Registro: `email`, `new-password` y `nickname` (nombre visible).
- **Tipos correctos**: `type="email"`, `type="password"`; permite pegar en las contraseñas y ofrece un botón para mostrarla (con `aria-pressed`).
- **Errores asociados al campo**:
  - Texto del error junto al campo, con `id`, y el campo con `aria-invalid="true"` + `aria-describedby="<id-del-error>"`.
  - El error dice cómo arreglarlo ("La contraseña debe tener al menos 8 caracteres"), no solo "Campo no válido".
  - Al enviar con errores: resumen al principio del formulario, con enlaces a cada campo, y **foco al resumen** al cargar
    (`tabindex="-1"` + `autofocus`), sin `role="alert"`. Detalle y motivo en `account-a11y.md` §1.5.
  - Icono + texto, no solo borde rojo (§7).
- **Requisitos antes de fallar**: si la contraseña tiene reglas, se muestran antes de escribir, asociadas con `aria-describedby`.
- **Campos obligatorios**: `required` + indicación visible (texto, no solo un asterisco de color).
- **Sin pruebas cognitivas** para autenticarse (3.3.8): nada de puzzles; permitir gestores de contraseñas y pegar.
- **No pedir dos veces lo mismo** en un mismo proceso (3.3.7).
- Agrupa opciones relacionadas en `<fieldset>` + `<legend>` (también en las opciones de un ejercicio).

## 10. Estructura y semántica (1.3.1, 2.4.2, 2.4.6, 3.1.1)

- Un solo `<h1>` por página; encabezados sin saltos (h1 → h2 → h3).
- Landmarks: `<header>`, `<main id="main-content">`, `<footer>`, y `<nav aria-label>` para cada navegación. El skip link ya está en `LearnLayout`.
- `<title>` único y descriptivo por página; `lang` en `<html>` (ya lo pone el layout).
- Listas de cosas (ejercicios, logros, pistas) → `<ul>`/`<ol>`.
- Las páginas de la zona privada y las de demostración llevan `noindex` (prop `noindex` de `LearnLayout`).

---

## Checklist de revisión de PR

Marca cada punto antes de pedir el merge; SEO revisa la rama con esta misma lista.

- [ ] Todas las imágenes tienen `alt`: descriptivo si informan (logros, iconos con significado), `alt=""` si decoran.
- [ ] Botones y enlaces con solo icono tienen nombre accesible.
- [ ] Contraste medido: texto 4,5:1 (3:1 grande), UI y foco 3:1, en todos los estados.
- [ ] Todo se usa con teclado; el orden de Tab sigue el orden visual; no hay trampas; sin `tabindex` positivo.
- [ ] El foco es visible (`--focus-ring`) y no queda tapado; tras cada acción el foco va a un sitio lógico.
- [ ] Los cambios dinámicos se anuncian en una live region que ya existe en el HTML del servidor (`polite` salvo errores).
- [ ] Con `prefers-reduced-motion: reduce` no hay animaciones de desplazamiento ni giros.
- [ ] Éxito, error y selección se distinguen con icono + texto, no solo con color.
- [ ] Controles bloqueados: `aria-disabled` + explicación visible con `aria-describedby`, no solo `disabled`.
- [ ] Formularios: `label`, `autocomplete`, errores asociados con `aria-invalid` + `aria-describedby`.
- [ ] Un `<h1>`, encabezados en orden, landmarks correctos, `noindex` donde toca.
- [ ] Probado a 320 px de ancho y con zoom al 200 % sin scroll horizontal (1.4.10, 1.4.4).

# Revisión B10 (SEO/A11y) · 2026-09-24

Revisión antes del merge en `renovacion` (en `bea6756` al revisar), con la guía `docs/guidelines/accessibility.md`.

| Rama | Commit revisado | Veredicto |
|------|-----------------|-----------|
| `fase-b/ui-exercise` | `5ea9f9a` | **APTA** (sin bloqueantes; hay no bloqueantes apuntados) |
| `fase-b/db` | `38aaf99` | **APTA** |

## Método

- `npm run build` en `renovacion`, `b-ui` y `b-db`. Salida en `dist/client`: 166 HTML en `renovacion` y `b-db` (163 de docs + 3 de learn); 169 en `b-ui` (+3 de la demo).
- Comparación propia (`/tmp/seocmp.mjs`), más estricta que los scripts de UI (`cmp.mjs` y `cmpstyles.mjs` no miraban los CSS enlazados de `/_astro/`):
  1. HTML de docs byte a byte, sin contar el hash de los assets.
  2. Si difiere: marcado sin los bloques `<style>`, que tiene que ser idéntico.
  3. `<style>` incrustado y **CSS enlazados** con `var(--x)` resueltos contra el `tokens.css` de cada rama; tienen que coincidir.
  4. Los tokens que ya existían mantienen su valor.
- Contraste calculado con la fórmula de luminancia relativa de WCAG, midiendo cada token contra todos los fondos.

## Docs (las dos ramas)

| Rama | Idénticos byte a byte | Solo cambia `<style>`, con el mismo valor | Distintos | Ausentes | CSS enlazado distinto | Tokens cambiados |
|------|----:|----:|----:|----:|----:|----:|
| `fase-b/ui-exercise` | 0 | 163 | 0 | 0 | 0 | 0 |
| `fase-b/db` | 163 | 0 | 0 | 0 | 0 | 0 |

Se cumple el criterio: en `ui-exercise` el marcado de las 163 páginas es idéntico y solo cambia el `<style>` incrustado (tokens que resuelven al mismo valor). `db` no toca ningún archivo del cliente.

## `fase-b/db`

- `/api/exercises` se compila solo como ruta de servidor (`dist/server/pages/api/exercises.astro.mjs`, `prerender = false`). No genera HTML en `dist/client` ni aparece como página.
- `src/pages/api/_README.md` empieza por `_`, así que Astro no lo convierte en ruta.
- No hay cambios que afecten al SEO. El punto de `X-Robots-Tag` para producción está en los no bloqueantes.

## `fase-b/ui-exercise`: resultados

| Punto de la guía | Resultado |
|------------------|-----------|
| Live region (§5) | ✅ `<p class="sr-only" aria-live="polite">` sale **vacía** en el HTML del servidor en los 3 idiomas. `announce()` vacía la región antes de escribir, así que un mensaje repetido se vuelve a anunciar. El resultado es **un solo mensaje** (título + monedas/XP + nivel). |
| Pistas bloqueadas (§8) | ✅ `<button>` nativo con `aria-disabled="true"` (sigue siendo enfocable) y `aria-describedby` apuntando a un texto visible (7,1:1). El clic sin saldo no llama a la API y repite el motivo en la live region. El error 402 también está cubierto. |
| Párrafo compartido para todas las pistas | ✅ **Aceptado.** Todas las pistas están bloqueadas por el mismo motivo (el saldo), y repetir el texto en cada una solo añadiría ruido. Los botones solo llevan `aria-describedby` cuando `!canPayHint`, y el párrafo existe exactamente en ese caso (`!canPayHint && hasLockedHints`), así que nunca apuntan a un `id` que no existe. Queda recogido en la guía, §8. |
| Radios (§3, §9) | ✅ `<fieldset>` + `<legend>`, `input type="radio"` nativos con el mismo `name` (flechas del teclado). La etiqueta completa es la zona de clic (≥ 48 px de alto, 2.5.8). La respuesta libre usa `<label for>`. |
| Foco (§3, §4) | ✅ Al enviar, el foco va al `h2` del resultado (`tabindex="-1"`); al desbloquear una pista, a su texto; con "Try again", al `h2` de la pregunta. Si falla el envío, el foco se queda en el botón. El `outline: none` en `:focus` se compensa con `:focus-visible` usando `--focus-ring`. |
| Estados (§7) | ✅ Correcto, incorrecto y no resuelto se muestran con icono SVG (`aria-hidden`), texto en el `h2` y color. La opción elegida se distingue por borde + sombra interior + radio marcado y, tras corregir, con la etiqueta de texto "Your answer". |
| Reduced motion (§6) | ✅ Sin animaciones `level-up` ni `reveal` y sin transiciones. Solo queda el `scale(0.97)` de `:active`, que es instantáneo y no es desplazamiento. |
| Contraste de los tokens (§2) | ✅ Los ratios declarados en `tokens.css` coinciden con lo medido (tabla abajo). |
| `lang="en"` en los fixtures dentro de es/fr | ✅ `h1`, contexto, objetivo, enunciado, opciones y pistas llevan `lang="en"` (12 atributos por página) cuando `exercise.locale ≠ lang`. En `/learn/...` (en) no se repite. El selector de escenarios lleva `lang="en"`. |
| Encabezados (§10) | ✅ Un solo `h1` (el título del ejercicio) y después `h2` (Pregunta, Pistas, Resultado). No hay saltos. |
| `noindex` | ✅ `<meta name="robots" content="noindex">` en las 3 páginas de la demo. Hay un `lang` en `<html>` por idioma. |
| Docs y `/learn` | ✅ Los docs cumplen el criterio (tabla de arriba). `/learn` solo cambia en el uid aleatorio de la isla y en `visually-hidden` → `sr-only`. |

### Contraste medido

| Token | `--dark-bg` | `--card-bg` | Su propio `-bg` | Declarado |
|-------|----:|----:|----:|---|
| `--success` `#34d399` | 9,50 | 7,88 | 8,20 | 9.5 / 7.9 / 8.2 ✅ |
| `--error` `#f87171` | 6,60 | 5,48 | 6,15 | 6.6 / 5.5 / 6.2 ✅ |
| `--warning` `#fbbf24` | 10,94 | 9,07 | 9,50 | 10.9 / 9.1 / 9.5 ✅ |
| `--text-subtle` `#71717a` | 3,78 | 3,13 | ≥ 3,26 | 3.8 / 3.1: solo bordes e iconos ✅ (en el componente solo se usa para bordes y para el texto de un botón deshabilitado, que 1.4.3 excluye) |
| `--on-brand` sobre `--brand` | 6,71 | | | 6.7 ✅ |
| `--text-muted` sobre `--grid-dot` (botón "Solved" bloqueado) | 5,08 | | | ✅ |
| Opción atenuada tras corregir (opacity 0.6) | 5,72 | | | ✅ |

## Bloqueantes

Ninguno.

## No bloqueantes (para después)

1. **Error al enviar en región `polite`**: `InterfazEjercicio.vue:189` anuncia `texts.error` en la región `polite`. La guía §5 pide `role="alert"` para el error al enviar el resultado. En la demo el error es simulado y lo provoca el propio usuario, así que el anuncio llega igual. **Antes de la Fase C** (fetch real): convertir el `<p v-if="failed">` de la línea 332 en un contenedor que exista siempre, con `role="alert"`, y que solo cambie su texto, o añadir una segunda región `assertive` exclusiva para errores. Es la excepción a "una región por componente" que se aceptará.
2. **es/fr con textos de interfaz en inglés sin `lang="en"`**: el título, la `description` y las 35 claves `learn.exercise.*` / `learn.hint.*` / `learn.result.*` están en inglés dentro de `<html lang="es|fr">`. Se resuelve con **B8** (i18n). Las páginas tienen `noindex`, pero B8 tiene que estar hecha antes de cerrar la Fase B.
3. **Anuncio duplicado al mostrar el resultado**: el foco va al `h2` ("Correct") y la live region dice "Correct. You earn…". Es aceptable. Mejora opcional: que el anuncio omita el título porque el foco ya lo lee.
4. **Demasiados landmarks `region`**: la barra de progreso (`section aria-label`, línea 207), la pregunta, las pistas y el resultado son `<section>` con nombre, así que aparecen como regiones. Opcional: dejar como `section` con nombre solo el resultado y usar `div` en la barra de progreso (el `aria-label` se puede quitar o pasar a un `h2.sr-only`).
5. **Borde de las opciones** (`--line`, 1,65:1 frente al fondo): no hace falta cumplir 3:1 porque el radio nativo ya identifica el control. Si en el futuro se oculta el radio y queda una tarjeta como único indicador, el borde tendrá que llegar a 3:1.
6. **Cambio de escenario en la demo**: `:key` vuelve a montar la isla sin anunciar nada. Es solo una herramienta de desarrollo y desaparece en la Fase C.
7. **`/api/**` en producción** (`produccion.md`): añadir `X-Robots-Tag: noindex` en `json()`/`apiError()` de `src/lib/server/http.ts` y `Disallow: /api/` en `robots.txt`, cuando exista.
8. **Pendiente de probar a mano**: el reflow a 320 px y el zoom al 200 % (1.4.10). Por el CSS debería cumplir: `flex-wrap`, `.brief` a una columna por debajo de 846 px, `overflow-wrap` en las opciones y `pre` con scroll propio, que 1.4.10 permite para el código. Queda para la comprobación final en `renovacion`.

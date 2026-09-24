# Layout de dos modos: Documentación ⇄ Aprender

La web es **una sola plataforma con dos modos**. El usuario siempre sabe en qué modo está
y puede cambiar con un clic desde cualquier página. Los dos modos comparten tokens
(`styles/tokens.css`), tipografía, retícula de puntos, selector de idioma y pie.

**Dirección elegida por el usuario: "C · Arena".** Se eligió entre tres propuestas: A · Continuidad,
B · Espacio de trabajo y C · Arena. Arena reutiliza la composición centrada y la retícula de la portada.
El conmutador tiene un indicador que se desliza, y la sugerencia de lenguaje es un rodillo que adelanta
la Ruleta de la fase B.

## El conmutador (`components/shared/ModeSwitch.astro`)

Es un control segmentado con dos **enlaces**, no botones, porque llevan a otra URL:

```
┌───────────────────────────────────┐
│ (▓▓ Documentación ▓▓)   Aprender   │   ← indicador violeta bajo el modo activo
└───────────────────────────────────┘
```

- **Las dos mitades miden lo mismo** (lo que ocupe la etiqueta más larga), así el indicador ocupa exactamente la mitad.
- **Indicador deslizante:**
  - Es un `<span class="thumb">` con `transition:name="mode-switch-thumb"`. Al navegar entre docs y learn,
    el `ClientRouter` de Astro lo desliza de una mitad a la otra.
  - Si el sistema pide reducir el movimiento, Astro desactiva la animación.
  - El span lleva `aria-hidden`.
- **Estado activo:** texto oscuro sobre el indicador, peso 800 y `aria-current="true"`. No depende solo del color.
  - Usa `"true"` y no `"page"`, porque en una guía como `/java/oop/` el enlace "Documentación" apunta a
    la portada de los docs, no a la página actual. Es el mismo criterio que sigue `LanguagePicker`.
- **Destinos:**
  - Documentación → `/`, `/es/`, `/fr/`.
  - Aprender → `/learn/`, `/es/learn/`, `/fr/learn/`.
- Va en un `<nav aria-label={t("mode.switcher")}>` propio, separado de la navegación de los docs.
- Aparece en la cabecera de los docs, en la barra superior de la portada y en la cabecera de learn.
  Siempre va antes de la ayuda y del idioma.

## Modo Documentación (sin más cambios que el conmutador)

```
Escritorio
┌──────────┬────────────────────────────────────────────────────────────────┐
│ SideBar  │ ☰ ← Volver  Inicio › Java › OOP   (▓Docs▓ Aprender) [?] [EN ES FR] │
│ (docs)   ├────────────────────────────────────────────────────────────────┤
│          │ contenido de la guía                                            │
└──────────┴────────────────────────────────────────────────────────────────┘

Portada (escritorio: barra fija en la esquina superior derecha, como antes)
                                     (▓Docs▓ Aprender) [?] [EN ES FR]
                    DaviNotes
        ─────────── tarjetas de lenguajes ───────────
```

En móvil (≤ 846 px):

- **Docs:** el grupo conmutador + ayuda + idioma se reparte en dos filas alineadas a la derecha.
- **Portada:** la barra deja de ser fija y pasa al flujo normal, centrada sobre el título. Antes, con el
  conmutador, tapaba "DaviNotes".

## Modo Aprender (fase A)

```
Escritorio                           (retícula de puntos de fondo, como la portada)
┌──────────────────────────────────────────────────────────────────────┐
│ [Saltar al contenido] ← solo visible con foco de teclado              │
│ DaviLearn                           (Docs ▓Aprender▓) [EN ES FR]      │  <header> (banner)
│                                                                      │
│                        Empieza a aprender                            │  <main>, centrado
│          Elige un lenguaje, resuelve ejercicios y sigue tu progreso. │
│                                                                      │
│                    ¿No sabes por dónde empezar?                      │  <h2>
│                    ┌──────────────────────┐                          │
│                    │        Python         │  ← rodillo; barra inferior│
│                    │  ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔  │    del color del lenguaje │
│                    └──────────────────────┘                          │
│                     ( Sugerir un lenguaje )                          │
│                                                                      │
│        La ruleta de lenguajes y los ejercicios llegarán pronto.      │  nota discreta
├──────────────────────────────────────────────────────────────────────┤
│ footer (el mismo que en los docs)                                    │  <footer>
└──────────────────────────────────────────────────────────────────────┘

Móvil (≤ 846 px)
┌──────────────────────────┐
│ DaviLearn     [EN ES FR] │
│ (Docs    ▓▓Aprender▓▓)   │  ← el conmutador ocupa una fila a todo el ancho
│                          │
│    Empieza a aprender    │
│           ...            │
└──────────────────────────┘
```

### La isla `LanguageSuggestion.vue`

- **Rodillo:** gira unos 0,6 s (9 pasos de 70 ms) y se detiene en un lenguaje distinto del anterior.
  - Debajo del nombre aparece una barra del color de marca del lenguaje, el mismo que el halo de su tarjeta en la portada.
  - Si el sistema pide reducir el movimiento, no gira y muestra el resultado directamente.
- **Accesibilidad:**
  - El rodillo es solo visual (`aria-hidden`).
  - El resultado se anuncia una vez ("¿Qué tal Python?") en una región `aria-live="polite"` que ya existe vacía en el HTML del servidor.
  - Durante el giro, el botón usa `aria-disabled` y no `disabled`, para que el foco de teclado no se pierda.
- **Textos:** llegan ya traducidos como props, así el cliente no descarga los diccionarios de i18n.

### Decisiones

- **Sin sidebar en learn durante la fase A.** Las secciones (Ruleta, Ejercicios, Perfil) no existen
  todavía y no queremos enlaces muertos. La navegación propia de learn se decide en la fase B.
- **Hueco para la cuenta del usuario:** a la derecha de la cabecera, después del idioma (fase C).
- **Identidad:** "DaviLearn" sigue el patrón de "DaviNotes": la segunda palabra lleva el acento
  (`#a78bfa`), en color sólido, sin el texto con degradado de la portada. Ese degradado se revisa en la fase D.
- **Sin ayuda (`HelpModal`) en learn:** su contenido explica la documentación. Learn tendrá su propia ayuda.
- **Orden en móvil:** en learn, el HTML mantiene el orden que pide SEO (marca, conmutador, idioma), pero en
  móvil el idioma se muestra en la primera fila con `order`. Visualmente el conmutador aparece después del
  idioma, aunque en el orden de tabulación va antes.
  - **Validado por SEO (Fase B, 2026-09-23): cumple 2.4.3 y 1.3.2, no hay que cambiar el código.**
    - Orden de Tab en móvil: marca → Documentación → Aprender → EN/ES/FR. Orden visual: marca, idioma (fila 1), conmutador (fila 2).
    - 2.4.3 (orden del foco) pide un orden que conserve el significado y la operabilidad, no una copia exacta
      del orden visual. Son tres controles independientes, el foco es visible y el salto es uno solo y corto
      (fila 2 → final de la fila 1). No se pierde nada.
    - 1.3.2 (secuencia significativa) no se ve afectada: el orden de lectura del DOM es el lógico y el mismo en
      todos los anchos, y el `order` no cambia el significado de nada.
    - Se mantiene el orden del DOM porque así el conmutador va siempre antes del idioma, en escritorio y en los
      docs (3.2.3, navegación coherente). Cambiarlo solo en learn rompería esa coherencia.
    - `display: contents` va en un `<div>` sin rol, así que no borra semántica (el problema conocido solo afecta a elementos con rol).
  - **Revalidar en la Fase C** cuando se añada la cuenta del usuario a la cabecera: tendrá que ir después del idioma
    en el DOM **y** en la misma fila visual que el idioma, para que no aparezca un segundo salto.
    - **Revalidado por SEO (Fase C, C3, 2026-09-24):** con la cuenta después del idioma en el DOM y en la fila 1
      (mismo `order: 1`), el orden de Tab en móvil es marca → conmutador → idioma → cuenta: sigue habiendo un solo
      salto y **se mantiene la conclusión**. Detalle y requisitos del menú en `docs/guidelines/account-a11y.md` §2.
  - Mejora opcional, no bloqueante: si en la Fase D se rehace la cabecera, preferir un diseño sin `order`
    (p. ej. marca sola en la fila 1, y conmutador + idioma en la fila 2 si caben a 320 px).
- **Accesibilidad (requisitos de SEO/A11y):**
  - Skip link como primer elemento enfocable.
  - `<header>` → `<main id="main-content">` → `<footer>` como hermanos.
  - Un solo `<h1>`.
  - `:focus-visible` con `--focus-ring`.
  - `::selection` con el color de la marca.
  - `noindex` mientras la página sea provisional.
- **Lo que no se toca en la fase A:** el aspecto actual de los docs (colores, degradados, tarjetas).
  Los hallazgos de diseño pendientes (texto con degradado y borde lateral grueso en `global.css`) se revisan en la fase D.

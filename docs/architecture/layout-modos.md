# Layout de dos modos: Documentación ⇄ Aprender

La web es **una sola plataforma con dos modos**. El usuario siempre sabe en qué modo está
y puede cambiar con un clic desde cualquier página. Los dos modos comparten tokens
(`styles/tokens.css`), tipografía, selector de idioma, ayuda y pie.

## El conmutador (`components/shared/ModeSwitch.astro`)

Es un control segmentado con dos **enlaces**, no botones, porque llevan a otra URL:

```
┌──────────────────────────────┐
│ ▣ Documentación │  Aprender   │   ← el modo activo va relleno, en negrita y con aria-current="true"
└──────────────────────────────┘
```

Usa `aria-current="true"` y no `"page"`, porque en una guía como `/java/oop/` el enlace "Documentación"
apunta a la portada de los docs, no a la página actual. Es el mismo criterio que sigue `LanguagePicker`.

- **Documentación** lleva a la portada de los docs en el idioma actual: `/`, `/es/`, `/fr/`.
- **Aprender** lleva a `/learn`, `/es/learn`, `/fr/learn`.
- Va en un `<nav aria-label={t("mode.switcher")}>` propio, separado de la navegación de los docs.
- Aparece en tres sitios: la cabecera de los docs, la barra superior de la portada y la cabecera de learn.
  Siempre está en la misma posición relativa: el grupo de la derecha, antes de la ayuda y el idioma.

## Modo Documentación (lo que existe hoy, sin más cambios)

```
Escritorio
┌──────────┬───────────────────────────────────────────────────────────┐
│ SideBar  │ ☰ ← Volver  Inicio › Java › OOP     [Docs|Aprender] [?] [EN▾] │
│ (docs)   ├───────────────────────────────────────────────────────────┤
│          │ contenido de la guía                                       │
│          │                                                           │
│          │ ← lección anterior          lección siguiente →            │
│          │ footer                                                    │
└──────────┴───────────────────────────────────────────────────────────┘

Portada
                                        [Docs|Aprender] [?] [EN▾]
                    DaviNotes
        ─────────── tarjetas de lenguajes ───────────
```

## Modo Aprender (fase A: estructura, sin funcionalidades)

```
Escritorio
┌──────────────────────────────────────────────────────────────────────┐
│ [Saltar al contenido] ← solo visible con foco de teclado              │
│ DaviLearn                                    [Docs|Aprender] [EN▾]    │  <header> (banner, fuera de <main>
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Start learning                                                     │  <main>
│   Pick a language, solve exercises and track your progress.          │
│   ┌────────────────────────────────────────────┐                     │
│   │ The language roulette and exercises are     │  (aviso provisional)│
│   │ coming soon.                                │                     │
│   └────────────────────────────────────────────┘                     │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│ footer (el mismo que en los docs)                                    │  <footer>
└──────────────────────────────────────────────────────────────────────┘

Móvil (< 846px, el mismo punto de corte que los docs)
┌──────────────────────────┐
│ DaviLearn                │
│ [Docs|Aprender]   [EN▾]  │  ← conmutador e idioma en su propia fila a todo el ancho
├──────────────────────────┤
│ Start learning           │
│ ...                      │
└──────────────────────────┘
```

### Decisiones

- **Sin sidebar en learn durante la fase A.** Las secciones (Ruleta, Ejercicios, Perfil) no existen
  todavía y no queremos enlaces muertos. La navegación propia de learn (pestañas o sidebar) se decide en la
  fase B, cuando haya al menos dos secciones reales.
- **Hueco para la cuenta del usuario:** a la derecha de la cabecera, después del idioma. Se rellena
  en la fase C (login/avatar). En la fase A no se pinta nada.
- **Misma cabecera en móvil y escritorio**: solo cambia el reparto de filas. No hay menú hamburguesa en
  learn mientras no haya navegación propia.
- **Identidad:** "DaviLearn" sigue el patrón de "DaviNotes": la segunda palabra lleva el acento
  (`#a78bfa`), para que se reconozca como parte de la misma familia. Va en color sólido, sin el
  texto con degradado de la portada; ese degradado se revisa en la fase D.
- **Sin ayuda (`HelpModal`) en learn:** su contenido explica la documentación. Learn tendrá su propia
  ayuda cuando existan ejercicios.
- **Accesibilidad (requisitos de SEO/A11y):**
  - Skip link como primer elemento enfocable.
  - `<header>` → `<main id="main-content">` → `<footer>` como hermanos.
  - Un solo `<h1>`.
  - `:focus-visible` con `--focus-ring`.
  - `noindex` mientras la página sea provisional.
  - En móvil, a 320 px, las cabeceras de docs y portada pasan a dos filas en vez de desbordarse.
- **Lo que no se toca en la fase A:** el aspecto actual de los docs (colores, degradados, tarjetas).
  Los hallazgos de diseño pendientes (texto con degradado y borde lateral grueso en `global.css`) se revisan en la fase D.

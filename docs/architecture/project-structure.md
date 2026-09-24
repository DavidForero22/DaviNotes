# Estructura del proyecto (v2 · aplicada en `295b895`)

> Estado del proyecto, fases y decisiones: ver [`roadmap.md`](./roadmap.md).
> Corrección posterior (decisión T2): **no** se usa `output: 'server'`; ver "Nota para la fase SSR" más abajo.

Documento compartido por los 4 agentes (UI, Backend, i18n, SEO/A11y).
Objetivo: dejar `master` organizado de forma modular para que el merge de la rama de
renovación (DaviLearn) sea directo. **En esta fase solo se mueven/organizan archivos: sin
cambios de comportamiento ni de diseño.** `npm run build` debe generar exactamente las mismas páginas.

## Principios

1. **Separación por dominio**: `shared` (común), `docs` (DaviNotes), `learn` (DaviLearn).
2. **Convenciones de Astro intactas**: `pages/`, `layouts/`, `content/`, `components/`, `styles/`.
3. **Las rutas públicas no cambian** (`/java/oop`, `/es/java/oop`...). SEO no se toca.
4. **APIs públicas estables**: los módulos que se reestructuran por dentro (p. ej. `i18n`)
   mantienen sus exportaciones para no romper imports.
5. **Carpetas futuras vacías llevan un `README.md`** que explica qué va ahí y quién es responsable.
   Dentro de `src/pages/` se llama **`_README.md`**: Astro ignora los archivos con prefijo `_`;
   sin él se publicaría como ruta (`/api/README`).
6. **Imports con alias `@/`** (= `src/`, definido en `tsconfig.json`): `import X from "@/components/shared/X.astro"`.
   Mover un archivo ya no obliga a recalcular `../../`. Los imports internos de un mismo módulo
   (p. ej. `./ui` dentro de `i18n/`) pueden seguir siendo relativos.
7. **`lib/server/` es solo-servidor**: nada de `components/` ni ningún `.vue` importa de ahí.

## Árbol acordado (v2)

Leyenda: ✅ hecho · ⏳ pendiente en esta fase · 🔮 fase posterior (no se crea ahora)

```
supabase/                        # ✅ Backend: migrations/, seed.sql
.env.example                     # ✅ Backend
tsconfig.json                    # ✅ alias "@/*" → "src/*"
src/
├─ middleware.ts, env.d.ts       # 🔮 Backend
├─ pages/
│  ├─ [...path].astro            # ✅ docs (routing sin cambios)
│  ├─ 404.astro
│  ├─ learn/_README.md           # ✅ UI (SSR: prerender = false)
│  ├─ api/_README.md             # ✅ Backend: auth/, exercises/ (SSR)
│  └─ robots.txt.ts              # 🔮 SEO (necesita `site`)
├─ layouts/
│  ├─ home/HomeLayout.astro      # ✅
│  ├─ docs/DocIndexLayout.astro, DocInfoLayout.astro   # ✅
│  └─ learn/                     # ✅ UI (README)
├─ components/
│  ├─ shared/                    # ✅ AlternateLinks, Footer, LanguagePicker, ScrollToTop,
│  │  │                          #    HelpModal, InfoBox, DifficultyBadge
│  │  ├─ seo/                    # 🔮 SEO: BaseHead (+ AlternateLinks)
│  │  └─ a11y/                   # 🔮 SEO: SkipLink, VisuallyHidden, LiveRegion
│  ├─ docs/                      # ✅ SideBar, Breadcrumbs, LessonNav, DocSearch,
│  │                             #    LanguageCard, HomePage
│  └─ learn/                     # ✅ UI (README): islas Vue 3
├─ content/docs/<locale>/...     # sin cambios
├─ data/                         # catálogo estático: languages.ts, frameworks.ts
├─ i18n/                         # ✅ i18n (README)
│  ├─ config.ts                  #    locales, defaultLang, Lang, Localized
│  ├─ locales/{en,es,fr}/        #    common.ts, docs.ts, index.ts (+ learn.ts en DaviLearn)
│  └─ ui.ts, utils.ts            #    API pública estable (mismas exportaciones)
├─ lib/
│  └─ server/                    # ✅ Backend: supabase.ts, services/ (solo servidor)
├─ types/                        # ✅ Backend: api.ts (DTOs), database.ts (generado)
├─ utils/                        # helpers puros: search, paths (+ 🔮 seo.ts)
└─ styles/
   ├─ tokens.css                 # ✅ variables de diseño (importado por global.css)
   ├─ global.css                 # ✅
   ├─ docs.css                   # ✅ antes doc-layout.css
   └─ learn.css                  # 🔮 UI
docs/
├─ architecture/project-structure.md   # este documento
└─ guidelines/accessibility.md          # 🔮 SEO
```

## Responsables

| Área | Carpetas | Agente |
|------|----------|--------|
| Frontend | `components/`, `layouts/`, `styles/`, `pages/learn/` | UI Frontend Designer |
| Backend | `pages/api/`, `lib/`, `types/`, `astro.config.mjs` (adaptador SSR) | Backend Architect |
| Traducciones | `i18n/`, `content/docs/` | Translator (i18n) |
| SEO / A11y | Revisión transversal: rutas, `AlternateLinks`, metadatos, landmarks | SEO Specialist |

Archivos compartidos (`package.json`, `astro.config.mjs`): **solo los edita un agente a la vez**,
avisando antes a los demás.

## Orden de ejecución (para no pisarnos en el mismo árbol de trabajo)

1. ✅ **UI**: mueve `components/`, `layouts/`, `styles/` y actualiza sus imports. → build OK
   (163 páginas, 181 archivos: igual que la línea base).
2. ✅ **i18n**: reestructura `i18n/` por dentro manteniendo `ui.ts`/`utils.ts`. → build OK
   (163/181) y `npx tsc --noEmit` sin errores.
3. ✅ **Backend**: crea el esqueleto de `lib/`, `pages/api/`, `types/` (solo README, sin dependencias).
4. ✅ **SEO/A11y**: verifica que las URLs, los `hreflang` y el HTML generado no han cambiado. → idéntico a la línea base (salvo hashes de `/_astro/` y `data-astro-cid-*`).
5. ✅ UI hace la comprobación final (`npm run build`: 163/181, `tsc --noEmit` OK) y se presenta el resultado al usuario.

## Comentarios de cada agente

<!-- Cada agente añade aquí su sección con objeciones o cambios propuestos. -->

### Backend Architect

**Bloqueante (hay que corregirlo antes de crear carpetas):**

- **No poner `README.md` dentro de `src/pages/`.** Astro convierte los `.md` de `pages/` en rutas
  públicas: `pages/api/README.md` generaría `/api/README` (y `pages/learn/README.md` → `/learn/README`),
  lo que rompería la regla de "mismas páginas en el build". Opciones: llamarlos `_README.md`
  (Astro ignora los archivos que empiezan por `_`) o documentar esas carpetas desde
  `docs/architecture/`. Propongo `_README.md`. Esto afecta también a `pages/learn/` (UI).

**Cambios propuestos al árbol (solo en mi área):**

```
supabase/                        # [futuro · Backend] en la RAÍZ del repo, fuera de src/
├─ migrations/                   # SQL versionado (schema + RLS)
└─ seed.sql
.env.example                     # [futuro · Backend] PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY
src/
├─ middleware.ts                 # [futuro · Backend] sesión → Astro.locals (convención de Astro: va en src/)
├─ env.d.ts                      # [futuro · Backend] tipos de Astro.locals e import.meta.env
├─ pages/api/                    # nombre por recurso; sin prefijo de idioma
│  ├─ auth/        register.ts, login.ts, logout.ts, session.ts
│  ├─ exercises/   index.ts, [id]/result.ts, [id]/hints.ts
│  └─ _README.md
├─ lib/
│  ├─ server/                    # SOLO servidor: supabase.ts (cliente con cookies), services/
│  └─ (raíz)                     # helpers isomórficos si hicieran falta
└─ types/
   ├─ api.ts                     # DTOs request/response (los consume Vue)
   └─ database.ts                # GENERADO con `supabase gen types`: no se edita a mano
```

- `lib/server/` separa el código solo-servidor. Regla: **nada de `components/` ni de los `.vue` importa de `lib/server/`**
  (evita filtrar claves o el SDK al bundle del cliente). El front solo importa de `types/`.
- `data/` sigue siendo el catálogo estático (lenguajes y frameworks). Los ejercicios, el progreso y las monedas van en la BD,
  no en `data/`.

**Nota para la fase SSR (no aplica ahora):** en Astro 5 no hace falta `output: 'server'`. Propongo mantener
`output: 'static'` (por defecto) + adaptador, y marcar con `export const prerender = false` solo `pages/api/**`
y `pages/learn/**`. Así las páginas de docs siguen prerenderizadas sin tocar `[...path].astro` y el SEO no cambia.
Actualizaré mi archivo de agente cuando llegue esa fase. Las rutas `/api/*` se excluyen del sitemap y de los `hreflang` (SEO).

**Decisiones del usuario (2026-09-23):** adaptador `@astrojs/node` mientras no haya destino de despliegue, y
desarrollo contra **Supabase local** (CLI, `supabase start`). Todavía no hay proyecto remoto. `.env.example` usará los
valores locales del CLI (`http://127.0.0.1:54321`).

### SEO & A11y Specialist

**Línea base tomada antes de mover nada** (`npm run build` sobre `master` @ `88b8798`): 163 páginas HTML,
181 archivos en `dist/`. Guardé tres cosas fuera del repo: la lista de rutas, una huella por página (con los hashes
de `/_astro/*` normalizados) y un volcado de `<html lang>`, `<title>`, `description`, `hreflang` y landmarks de cada página.
Al terminar compararé con esa línea base. Criterio de aceptación: **mismas rutas y mismo HTML por página**.
Solo se aceptan diferencias en los nombres de los bundles de `/_astro/`, que cambian de forma legítima al mover
o renombrar CSS y layouts (p. ej. `doc-layout.css` → `docs.css`).

**Bloqueante:** ninguno por mi parte. Respaldo el punto del Backend sobre `_README.md` en `pages/`:
un `README.md` ahí generaría URLs indexables (`/api/README`, `/learn/README`).

**Cambios propuestos al árbol (solo mi área, todo `[futuro · SEO]`, no se crea nada en esta fase salvo que se acuerde):**

```
src/
├─ components/shared/
│  ├─ seo/                       # [futuro · SEO] BaseHead.astro (title, description, canonical, og:*),
│  │                             #   y AlternateLinks.astro se movería aquí cuando exista BaseHead
│  └─ a11y/                      # [futuro · SEO/A11y] SkipLink, VisuallyHidden, LiveRegion (lo usará la Ruleta)
├─ utils/seo.ts                  # [futuro · SEO] helpers puros: URL absoluta, canonical, alternates por página
└─ pages/
   ├─ robots.txt.ts              # [futuro · SEO] endpoint estático (necesita `site`)
   └─ sitemap                    # vía @astrojs/sitemap en astro.config.mjs (necesita `site`), no carpeta propia
docs/guidelines/accessibility.md # [futuro · SEO/A11y] reglas: alt obligatorio en logros/iconos, contraste, teclado
```

En esta fase, `AlternateLinks.astro` puede ir a `components/shared/` como está propuesto. Mientras solo cambie la ruta
del import, el HTML generado no cambia.

**Notas para fases posteriores (no aplican ahora, porque cambiarían el HTML):**

- **Falta `site` en `astro.config.mjs`.** Sin él no hay canonical ni sitemap, y los `hreflang` salen relativos
  (Google los exige absolutos). Cuando se toque ese archivo (Backend, adaptador SSR), coordinamos para añadir `site`.
  Mientras tanto, nadie más edita ese archivo.
- **`<head>` duplicado** en `HomeLayout` y `DocInfoLayout`, con la misma `description` en todas las páginas.
  Se unificará en `BaseHead.astro` con una descripción por página (frontmatter o i18n).
- **`pages/learn/` e i18n:** con el routing actual (catch-all `[...path].astro` + `localizePath`), una carpeta
  `pages/learn/` solo genera `/learn/...`. En cambio, `AlternateLinks` anunciaría `/es/learn/...` y `/fr/learn/...`,
  que darían 404. UI e i18n deben decidir si `learn` se localiza (p. ej. con un parámetro de idioma) o si esas
  páginas desactivan los alternates, como ya hace `404.astro` con `alternates={false}`.
- **`pages/api/**`**: fuera del sitemap y sin `hreflang` (coincido con Backend). Si alguna respuesta es HTML, lleva `noindex`.
- **Landmarks:** hoy están bien (`main`, `nav` con `aria-label` y `footer`), pero no hay *skip link*.
  Irá en `components/shared/a11y/` cuando llegue la fase de a11y.

### i18n Content Manager

**De acuerdo con la propuesta.** Estructura concreta para `src/i18n/` (paso 2 del orden):

```
src/i18n/
├─ ui.ts                 # API pública: re-exporta locales, Lang, defaultLang, Localized, ui, UIKey
├─ utils.ts              # API pública: sin cambios (useTranslations, pick, langs, localizePath...)
├─ config.ts             # locales, Lang, defaultLang, Localized (salen de ui.ts)
├─ locales/
│  ├─ en/                # idioma de referencia: define las claves (UIKey)
│  │  ├─ common.ts       # site, home, nav, lang, footer, 404, help, difficulty, info
│  │  ├─ docs.ts         # index, doc, search (solo DaviNotes)
│  │  └─ index.ts        # une los namespaces → diccionario plano `en`
│  ├─ es/                # mismos archivos que en/
│  └─ fr/                # mismos archivos que en/
└─ README.md             # cómo añadir claves, namespaces o un idioma nuevo
```

Decisiones:

1. **Por idioma y luego por namespace.** Cada traductor trabaja en una sola carpeta y cada
   dominio (`common`, `docs`, y más adelante `learn`) tiene su propio archivo.
   **Menos conflictos de merge:** la rama DaviLearn solo añadirá `locales/*/learn.ts`.
2. **Las claves no cambian** (`"nav.home"`, `"doc.nextLesson"`...). El namespace es solo
   el archivo físico, no un prefijo nuevo. Así `UIKey` y los ~40 imports siguen igual.
3. **Tipado estricto:** `en` es la fuente de verdad (`as const`) y `es`/`fr` usan
   `satisfies Record<UIKey, string>`. Si falta una clave, falla la comprobación de tipos (`npx tsc --noEmit`; `astro build` no comprueba tipos).
   Hoy los 3 idiomas tienen las mismas 62 claves, así que el cambio no rompe nada.
   El fallback de `useTranslations` a `en` se mantiene.
4. **Sin ciclos:** `locales/*` solo importa tipos (`import type`) de `config.ts` y `locales/en`.
   Solo `ui.ts` importa los valores.
5. **`content/docs/<locale>/` no cambia** en esta fase.

Fuera de esta fase (implica cambios de contenido, no solo de carpetas):
- Sacar los textos `Localized` de `data/languages.ts` y `data/frameworks.ts` a
  `locales/*/catalog.ts` con claves derivadas del slug (`java.desc`, `java.concepts.oop.title`).
  `data/` quedaría solo con metadatos. Lo coordinaré con quien lleve `data/`.
- Crear `locales/*/learn.ts` (textos de DaviLearn: "Girar ruleta", "Desbloquear pista ({coins} monedas)"...)
  y un script que compruebe que cada slug de concepto tiene su `.md` en los 3 idiomas.

**Respuesta a SEO (`pages/learn/` e i18n):** propongo que **`learn` se localice** igual que la documentación:
`/learn/...` para `en` y `/es/learn/...`, `/fr/learn/...` para el resto, con los textos en `locales/*/learn.ts`.
Así `AlternateLinks` sigue siendo correcto sin excepciones. La forma de las rutas la decidimos UI e i18n en esa fase.
Hoy no existe ninguna página `learn`, así que no hay que desactivar alternates.
Sobre `_README.md` (Backend): no me afecta, porque `src/i18n/README.md` está fuera de `pages/` y no genera rutas.

---
title: "Páginas y rutas en Astro"
---

# Páginas y rutas

El **enrutado** (*routing*) es la forma en que una web decide qué página mostrar para cada dirección (URL). Astro usa **rutas basadas en archivos**: los archivos de la carpeta `src/pages/` se convierten automáticamente en las páginas de tu sitio, y su ubicación dentro de esa carpeta determina su URL.

Otras herramientas suelen necesitar un archivo de configuración aparte con la lista de todas las rutas. En Astro no hay nada que configurar: creas un archivo y la página existe. Las páginas pueden escribirse como archivos `.astro`, `.md` (Markdown), `.mdx` o `.html`, y los archivos `.js`/`.ts` pueden crear *endpoints* que devuelven datos en lugar de páginas.

---

## Índice

<div id="content-table">

- [1. Rutas basadas en archivos](#1-rutas-basadas-en-archivos "Cómo se convierten los archivos en URL")
- [2. Rutas estáticas](#2-rutas-estáticas "Crear páginas normales")
- [3. Rutas dinámicas](#3-rutas-dinámicas "Generar páginas a partir de datos")
  - [3.1 La sintaxis [param]](#31-la-sintaxis-param "Usar corchetes para partes variables")
  - [3.2 getStaticPaths()](#32-getstaticpaths "Definir las rutas que se generan")
- [4. Página de error 404](#4-página-de-error-404 "Gestionar páginas que no existen")

</div>

---

## 1. Rutas basadas en archivos

Astro busca archivos compatibles dentro de `src/pages/`. Cada uno se convierte automáticamente en una página de tu web.

**Ejemplos de correspondencia**:

- `src/pages/index.astro`  →  `misitio.com/`
- `src/pages/about.astro`  →  `misitio.com/about`
- `src/pages/blog/post.md` →  `misitio.com/blog/post`

Un archivo llamado `index` representa la página principal de su carpeta, así que no añade nada a la URL.

Los archivos y carpetas cuyo nombre empieza por guion bajo (por ejemplo, `_Hidden.astro`) los ignora el enrutador. Es útil para guardar archivos auxiliares junto a tus páginas sin convertirlos en páginas.

**Error habitual:** colocar una página fuera de `src/pages/`. Solo los archivos de esa carpeta se convierten en rutas.

```plaintext

    ❌ INCORRECTO: src/components/about.astro  →  no se crea ninguna página
    ✅ CORRECTO:   src/pages/about.astro       →  misitio.com/about


```

---

## 2. Rutas estáticas

Una **ruta estática** es un archivo que corresponde exactamente a una página con una dirección fija. Puede ser un componente de Astro, Markdown o HTML normal.

```astro

    ---
    // src/pages/contact.astro  →  misitio.com/contact
    const pageTitle = "Contacto";
    ---
    
    <html>
      <head><title>{pageTitle}</title></head>
      <body>
        <h1>Ponte en contacto</h1>
        <p>Escríbenos a hola@example.com</p>
      </body>
    </html>


```

Para agrupar páginas en una misma sección, crea una carpeta. El archivo `index.astro` que haya dentro se convierte en la página principal de esa sección:

```plaintext

    # Esta estructura:
    src/pages/
      └── services/
          ├── index.astro
          └── design.astro
      
    # Genera estas URL:
    misitio.com/services
    misitio.com/services/design


```

---

## 3. Rutas dinámicas

Las **rutas dinámicas** permiten que un solo archivo genere muchas páginas con el mismo diseño pero distintos datos, como entradas de blog, fichas de producto o perfiles de usuario.

### 3.1 La sintaxis [param]

Para crear una ruta dinámica, pon parte del nombre del archivo entre corchetes `[]`. Esa parte se convierte en un **parámetro**: una variable cuyo valor viene de la URL.

Por ejemplo, un archivo llamado `src/pages/dogs/[dog].astro` corresponde a direcciones como `/dogs/clifford` o `/dogs/rover`, y dentro de la página el parámetro `dog` valdrá `"clifford"` o `"rover"`.

### 3.2 getStaticPaths()

Por defecto, Astro construye todas las páginas por adelantado, al generar el sitio, en lugar de crearlas cuando llega un visitante. Por eso necesita saber **exactamente** qué páginas debe producir una ruta dinámica. Se lo indicas exportando una función llamada `getStaticPaths()` que devuelve la lista de todos los valores posibles.

```astro

    ---
    // src/pages/dogs/[dog].astro
    
    export function getStaticPaths() {
      // Un objeto por cada página que se genera
      return [
        { params: { dog: 'clifford' } },
        { params: { dog: 'rover' } },
        { params: { dog: 'spot' } },
      ];
    }
    
    // Leer el parámetro de la página que se está generando
    const { dog } = Astro.params;
    ---
    
    <h1>¡Buen chico, {dog}!</h1>


```

Este archivo genera tres páginas: `/dogs/clifford`, `/dogs/rover` y `/dogs/spot`.

**Conceptos clave**:

- `params`: Los valores para los corchetes del nombre del archivo. La clave debe llamarse igual que el parámetro (`{ dog: ... }` para `[dog].astro`).
- `props`: Datos extra opcionales que puedes pasar a cada página generada, y que se leen con `Astro.props`.

**Error habitual:** usar en `params` una clave que no coincide con el nombre entre corchetes.

```astro

    ---
    // Archivo: src/pages/dogs/[dog].astro

    // ❌ INCORRECTO: el archivo usa [dog], pero la clave es "name"
    export function getStaticPaths() {
      return [{ params: { name: 'clifford' } }];
    }

    // ✅ CORRECTO: la clave coincide con el nombre entre corchetes
    export function getStaticPaths() {
      return [{ params: { dog: 'clifford' } }];
    }
    ---


```

---

## 4. Página de error 404

Una **página 404** es lo que ven los visitantes cuando abren una dirección que no existe. Para personalizarla, crea un archivo llamado `404.astro` (o `404.md`) directamente dentro de `src/pages/`.

La mayoría de servicios de alojamiento (como Netlify, Vercel o GitHub Pages) detectan este archivo automáticamente y lo muestran cuando no se encuentra una página.

```astro

    ---
    // src/pages/404.astro
    import Layout from '../layouts/MainLayout.astro';
    ---
    
    <Layout title="No encontrada">
        <div class="error-container">
            <h1>404</h1>
            <p>¡Vaya! La página que buscas no existe.</p>
            <a href="/">Volver al inicio</a>
        </div>
    </Layout>


```

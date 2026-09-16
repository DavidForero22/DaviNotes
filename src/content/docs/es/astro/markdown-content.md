---
title: "Contenido en Markdown con Astro"
---

# Contenido en Markdown

**Markdown** (`.md`) es una forma sencilla de escribir texto con formato usando símbolos simples: `#` para títulos, `**negrita**` para texto en negrita, `-` para listas, etc. Es mucho más fácil de escribir que HTML, por lo que resulta ideal para artículos y documentación.

Astro tiene un soporte excelente para Markdown. Puedes convertir archivos Markdown directamente en páginas, u organizar grandes cantidades de contenido con las **colecciones de contenido** (*Content Collections*). Esto convierte a Astro en una gran opción para blogs, webs de documentación y portfolios, sin necesidad de base de datos ni de un gestor de contenidos (CMS). De hecho, las guías de esta web están escritas en Markdown y se gestionan con una colección de contenido.

---

## Índice

<div id="content-table">

- [1. Páginas Markdown](#1-páginas-markdown "Crear rutas a partir de archivos .md")
- [2. Frontmatter y layouts](#2-frontmatter-y-layouts "Añadir metadatos y diseño")
- [3. Colecciones de contenido](#3-colecciones-de-contenido "Gestión de contenido con tipos")
  - [3.1 Configuración](#31-configuración "Definir colecciones en content.config.ts")
  - [3.2 Consultar el contenido](#32-consultar-el-contenido "Obtener datos con getCollection")

</div>

---

## 1. Páginas Markdown

La forma más sencilla de crear una página es añadir un archivo `.md` a la carpeta `src/pages/`. Igual que con los archivos `.astro`, su ubicación determina su URL.

```markdown

    <!-- Archivo: src/pages/welcome.md -->
    
    # Hola, mundo
    
    Esta es mi primera página en **Markdown** con Astro.
    Estará disponible en `misitio.com/welcome`.


```

Astro admite GitHub Flavored Markdown, una versión popular de Markdown que además incluye tablas, listas de tareas y bloques de código.

---

## 2. Frontmatter y layouts

Los archivos Markdown pueden empezar con un bloque de **frontmatter**: una sección entre dos líneas de `---` al principio del todo del archivo, escrita en formato YAML (`clave: valor`). Guarda información *sobre* la página, como su título, su fecha o su autor.

La propiedad especial `layout` indica a Astro qué componente de layout debe envolver el contenido Markdown (cabeceras, menús, estilos...).

```markdown

    ---
    layout: ../layouts/BlogPostLayout.astro
    title: "Mi primera entrada"
    author: "Aprendiz de Astro"
    date: "2025-01-01"
    ---
    
    # Introducción
    
    Este contenido se insertará en el <slot /> de BlogPostLayout.


```

**Acceder al frontmatter desde el layout**:

El layout recibe los datos del frontmatter a través de `Astro.props.frontmatter`.

```astro

    ---
    // src/layouts/BlogPostLayout.astro
    const { frontmatter } = Astro.props;
    ---
    
    <html>
      <head><title>{frontmatter.title}</title></head>
      <body>
        <h1>{frontmatter.title}</h1>
        <p>Escrito por: {frontmatter.author}</p>
        <slot />
      </body>
    </html>


```

**Error habitual:** escribir la ruta del layout desde la raíz del proyecto en lugar de desde el archivo Markdown. La ruta es *relativa*: parte de la carpeta donde está el archivo `.md`, y `../` significa «subir una carpeta».

```markdown

    <!-- Archivo: src/pages/blog/post.md -->

    <!-- ❌ INCORRECTO: la ruta no parte del archivo Markdown, así que Astro no encuentra el layout -->
    ---
    layout: src/layouts/BlogPostLayout.astro
    ---

    <!-- ✅ CORRECTO: desde src/pages/blog/ se suben dos carpetas hasta src/ y se entra en layouts/ -->
    ---
    layout: ../../layouts/BlogPostLayout.astro
    ---


```

---

## 3. Colecciones de contenido

En proyectos grandes, tener todos los archivos Markdown en `src/pages/` enseguida se vuelve un desorden. Las **colecciones de contenido** permiten guardar tus archivos Markdown en una carpeta aparte (por ejemplo, `src/content/`) y leerlos desde el código como si fueran una pequeña base de datos.

### 3.1 Configuración

Las colecciones se definen en un archivo llamado `src/content.config.ts`. Para cada colección indicas dónde están sus archivos y, opcionalmente, un **esquema**: un conjunto de reglas, escritas con la librería **Zod**, que comprueba el frontmatter de cada archivo. Si a una entrada le falta el título o tiene una fecha no válida, Astro muestra un error claro al construir el sitio.

```ts

    // src/content.config.ts
    import { defineCollection, z } from 'astro:content';
    import { glob } from 'astro/loaders';
    
    const blog = defineCollection({
      // Cargar todos los archivos .md de src/content/blog
      loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
      // Reglas que debe cumplir el frontmatter de cada archivo
      schema: z.object({
        title: z.string(),
        pubDate: z.coerce.date(),
        draft: z.boolean().optional(),
      }),
    });
    
    export const collections = { blog };


```

### 3.2 Consultar el contenido

Para leer las entradas de una colección se usa la función `getCollection()`. Normalmente se combina con una ruta dinámica (como `src/pages/blog/[id].astro`) para generar una página por cada entrada.

```astro

    ---
    // src/pages/blog/[id].astro
    import { getCollection, render } from 'astro:content';
    
    // 1. Crear una página por cada entrada de la colección
    export async function getStaticPaths() {
      const posts = await getCollection('blog');
      return posts.map((post) => ({
        params: { id: post.id },
        props: { post },
      }));
    }
    
    // 2. Convertir en HTML el Markdown de esta entrada
    const { post } = Astro.props;
    const { Content } = await render(post);
    ---
    
    <h1>{post.data.title}</h1>
    <Content />


```

`post.data` contiene los valores del frontmatter, ya comprobados por el esquema, y `<Content />` muestra el cuerpo del archivo Markdown.

**Error habitual:** seguir tutoriales antiguos. Antes de Astro 5, el archivo de configuración era `src/content/config.ts`, las entradas usaban `post.slug` y el contenido se generaba con `post.render()`. En las versiones actuales se usa `src/content.config.ts`, `post.id` y `render(post)`.

```astro

    ---
    // ❌ INCORRECTO (API antigua): slug y entry.render() ya no existen en las colecciones con loaders
    const { Content } = await post.render();
    const url = `/blog/${post.slug}`;

    // ✅ CORRECTO (Astro 5+)
    import { render } from 'astro:content';
    const { Content } = await render(post);
    const url = `/blog/${post.id}`;
    ---


```

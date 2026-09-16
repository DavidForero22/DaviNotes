---
title: "Etiquetas semánticas en HTML"
---

# HTML semántico

HTML semántico significa elegir etiquetas que describen **qué es el contenido** (su significado), y no solo cómo debe verse. La palabra *semántico* significa simplemente «relacionado con el significado».

Por ejemplo, la etiqueta `<b>` solo le dice al navegador que ponga el texto en negrita (apariencia), mientras que `<strong>` le dice que el texto es importante (significado). Las dos se ven en negrita en pantalla, pero solo una explica *por qué*.

Usar etiquetas semánticas es fundamental para:

- **Accesibilidad:** los lectores de pantalla (programas que leen las páginas en voz alta para personas con discapacidad visual) se basan en estas etiquetas para que el usuario pueda saltar entre secciones.
- **SEO** (Search Engine Optimization, «optimización para buscadores»): buscadores como Google las usan para entender de qué trata cada parte de la página, lo que ayuda a que aparezca en los resultados.

---

## Índice

<div id="content-table">

- [1. Por qué importa la semántica](#1-por-qué-importa-la-semántica "Dejar atrás la sopa de divs")
- [2. Elementos estructurales](#2-elementos-estructurales "Header, Nav, Main y Footer")
- [3. Contenedores de contenido](#3-contenedores-de-contenido "Article, Section y Aside")
- [4. Semántica del texto](#4-semántica-del-texto "Strong, énfasis y títulos")

</div>

---

## 1. Por qué importa la semántica

Antes, los desarrolladores usaban la etiqueta `<div>` (una caja genérica sin significado) para todo, creando lo que se conoce como «sopa de divs». Puede verse bien una vez aplicados los estilos CSS, pero no les dice nada a las máquinas sobre el contenido.

Compara las dos versiones de la misma estructura de página:

```html

    <!-- ❌ INCORRECTO: cajas genéricas que no dicen nada de su contenido -->
    <div id="header">
        <div class="nav">...</div>
    </div>
    <div class="main-content">
        <div class="article">...</div>
    </div>
    <div id="footer">...</div>

    <!-- ✅ CORRECTO: cada etiqueta describe el papel de su contenido -->
    <header>
        <nav>...</nav>
    </header>
    <main>
        <article>...</article>
    </main>
    <footer>...</footer>


```

Las dos versiones pueden verse iguales, pero la segunda permite que un lector de pantalla diga «navegación» o «contenido principal», y que un buscador sepa qué parte es el artículo en sí.

---

## 2. Elementos estructurales

Estos elementos definen las grandes zonas de una página web. Funcionan como puntos de referencia que ayudan a las tecnologías de asistencia (como los lectores de pantalla) a moverse por el documento.

- `<header>`

Contenido introductorio en la parte superior de la página o de una sección. Suele contener el logotipo, el nombre del sitio, un buscador o el menú de navegación.

- `<nav>`

Un grupo de enlaces de navegación, ya sea a otras páginas o a otras partes de la misma página.

- `<main>`

El contenido principal de la página. Solo debe incluir contenido propio de esa página, no elementos que se repiten en todas (como barras laterales o el pie de página general). Solo debería haber un `<main>` por página.

- `<footer>`

Contenido de cierre al final de la página o de una sección: autoría, información de copyright, enlaces a las condiciones de uso, datos de contacto, etc.

Ejemplo de una estructura completa:

```html

    <body>
        <header>
            <p class="logo">DaviNotes</p>
            <nav>
                <a href="/">Inicio</a>
                <a href="/about">Sobre nosotros</a>
            </nav>
        </header>

        <main>
            <h1>Entendiendo la semántica</h1>
            <p>Este es el contenido principal de la página.</p>
        </main>

        <footer>
            <p>&copy; 2025 DaviNotes</p>
        </footer>
    </body>


```

---

## 3. Contenedores de contenido

Al organizar el contenido dentro de `<main>`, elige la etiqueta que mejor describa la relación de ese contenido con el resto de la página.

**`<article>`, `<section>` y `<aside>`**

- `<article>`: Una pieza independiente que seguiría teniendo sentido si la movieras a otra página (por ejemplo, una entrada de blog, una noticia o la ficha de un producto). Puede contener elementos `<section>` o `<aside>`.
- `<section>`: Un grupo de contenido sobre un mismo tema, normalmente con su propio título (`<h2>`, `<h3>`...). A diferencia de `<article>`, no es independiente: solo tiene sentido como parte del contenido que lo rodea.
- `<aside>`: Contenido relacionado con el principal pero no imprescindible, como un consejo, una nota o una barra lateral.

**Ejemplo:**

```html

    <article>
        <h2>La historia de HTML</h2>
        <p>HTML fue creado por Tim Berners-Lee...</p>

        <section>
            <h3>Los primeros años</h3>
            <p>En 1991, la primera versión...</p>
        </section>

        <aside>
            <p>¿Sabías que HTML significa HyperText Markup Language?</p>
        </aside>
    </article>


```

---

## 4. Semántica del texto

Usar las etiquetas correctas para el texto garantiza que la jerarquía y el énfasis lleguen a todos los usuarios, incluidos quienes no pueden ver la página.

<table>
    <thead>
        <tr>
            <th>Etiqueta</th>
            <th>Nombre</th>
            <th>Significado semántico</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>&lt;h1&gt; - &lt;h6&gt;</td>
            <td>Títulos</td>
            <td>Definen el esquema de la página, como los capítulos de un libro. &lt;h1&gt; es el más importante y &lt;h6&gt; el que menos.</td>
        </tr>
        <tr>
            <td>&lt;strong&gt;</td>
            <td>Importancia</td>
            <td>El contenido es importante, serio o urgente.</td>
        </tr>
        <tr>
            <td>&lt;em&gt;</td>
            <td>Énfasis</td>
            <td>El contenido se recalca, lo que cambia el tono de la frase (como decir una palabra más alto).</td>
        </tr>
        <tr>
            <td>&lt;blockquote&gt;</td>
            <td>Cita</td>
            <td>El contenido es una cita larga de otra fuente.</td>
        </tr>
        <tr>
            <td>&lt;time&gt;</td>
            <td>Tiempo</td>
            <td>Una fecha u hora escrita en un formato que también pueden leer las máquinas.</td>
        </tr>
    </tbody>
</table>

**Apariencia frente a significado:**

No uses `<b>` ni `<i>` solo para cambiar el aspecto del texto; eso es trabajo de CSS. Usa `<strong>` o `<em>` cuando el texto sea realmente importante o esté enfatizado.

```html

    <!-- ❌ INCORRECTO: solo cambia la apariencia, se pierde el significado -->
    <b>Aviso: no desenchufar.</b>
    <i>Lo digo en serio.</i>

    <!-- ✅ CORRECTO: lectores de pantalla y buscadores entienden la importancia -->
    <strong>Aviso: no desenchufar.</strong>
    <em>Lo digo en serio.</em>

    <!-- Fechas: las personas leen «15 de marzo», las máquinas leen 2025-03-15 -->
    <p>Publicado el <time datetime="2025-03-15">15 de marzo</time></p>


```

**Error habitual:** elegir el nivel de un título por su tamaño. Los títulos deben seguir el orden del contenido, y su tamaño siempre se puede cambiar con CSS.

```html

    <!-- ❌ INCORRECTO: salta de h1 a h4 porque h4 «se ve más pequeño» -->
    <h1>Recetas</h1>
    <h4>Postres</h4>

    <!-- ✅ CORRECTO: los niveles siguen la estructura del contenido -->
    <h1>Recetas</h1>
    <h2>Postres</h2>


```

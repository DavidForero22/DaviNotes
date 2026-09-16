---
title: "Estructura en HTML"
---

# Estructura

HTML (HyperText Markup Language, «lenguaje de marcado de hipertexto») es el lenguaje estándar para construir la estructura de las páginas web. No es un lenguaje de programación como **Java** o **Python**, que toman decisiones y hacen cálculos. HTML es un lenguaje de **marcado**: etiqueta cada parte del contenido («esto es un título», «esto es una imagen», «esto es un enlace») para que el **navegador** (Chrome, Firefox, Safari...) sepa cómo mostrarlo.

Piensa en una página web como un documento organizado igual que un árbol genealógico: la página contiene secciones, las secciones contienen párrafos y los párrafos contienen palabras. El navegador guarda este árbol en memoria y lo llama **DOM** (Document Object Model, «modelo de objetos del documento»).

---

## Índice

<div id="content-table">

- [1. Etiquetas y elementos](#1-etiquetas-y-elementos "Diferencia entre etiquetas de apertura, de cierre y elementos")
- [2. Atributos](#2-atributos "Añadir información extra a los elementos")
- [3. Anidamiento](#3-anidamiento "Relaciones padre-hijo entre elementos")
- [4. El esqueleto básico](#4-el-esqueleto-básico "La estructura obligatoria de todo documento HTML5")

</div>

---

## 1. Etiquetas y elementos

HTML se escribe con **etiquetas**. Una etiqueta es una palabra clave entre los símbolos `<` y `>`, como `<p>` (de *paragraph*, «párrafo»). La mayoría van en pareja: una **etiqueta de apertura**, que marca dónde empieza algo, y una **etiqueta de cierre** (con una barra `/`), que marca dónde termina.

Un **elemento** es el bloque completo: la etiqueta de apertura, el contenido y la etiqueta de cierre.

```html

    <!-- Apertura: <p> | Contenido: Esto es un párrafo. | Cierre: </p> -->
    <p>Esto es un párrafo.</p>


```

Todo lo que se escribe entre `<!--` y `-->` es un **comentario**: una nota para quien lee el código. El navegador lo ignora y no lo muestra en la página.

**Elementos vacíos (sin cierre)**

Algunos elementos no tienen contenido dentro, así que no necesitan etiqueta de cierre. Se llaman elementos **vacíos**.

```html

    <!-- Salto de línea -->
    <br>

    <!-- Imagen: la información que necesita va dentro de la propia etiqueta -->
    <img src="logo.png" alt="Logotipo de la empresa">

    <!-- Línea horizontal de separación -->
    <hr>


```

**Error habitual:** olvidar cerrar una etiqueta. El navegador intenta adivinar dónde debería terminar, y el resto de la página puede heredar un formato incorrecto.

```html

    <!-- ❌ INCORRECTO: el párrafo nunca se cierra -->
    <p>Primer párrafo
    <p>Segundo párrafo

    <!-- ✅ CORRECTO: cada etiqueta de apertura tiene su cierre -->
    <p>Primer párrafo</p>
    <p>Segundo párrafo</p>


```

---

## 2. Atributos

Los atributos aportan **información extra** sobre un elemento, como la dirección a la que lleva un enlace o el archivo que debe mostrar una imagen. Siempre se escriben dentro de la **etiqueta de apertura** y suelen seguir el formato `nombre="valor"`.

```html

    <!-- href indica al enlace adónde debe ir -->
    <a href="https://google.com">Ir a Google</a>

    <!-- class e id dan al elemento nombres que CSS y JavaScript pueden usar -->
    <h1 class="title" id="main-heading">Bienvenido a DaviNotes</h1>


```

| Atributo | Descripción | Ejemplo |
|-----------|-------------|---------|
| class     | Da al elemento uno o varios nombres de grupo, para darle estilo con CSS o encontrarlo con JavaScript. Varios elementos pueden compartir la misma clase. | `<div class="container">` |
| id        | Da al elemento un nombre único. Dos elementos de la misma página no deberían compartirlo. | `<div id="header">` |
| style     | Aplica estilos CSS directamente a ese elemento. | `<p style="color:red;">` |
| src       | La dirección de un archivo que hay que cargar, como una imagen o un script. | `<img src="foto.jpg">` |
| href      | La dirección a la que apunta un enlace. | `<a href="pagina.html">` |
| alt       | Texto alternativo que describe una imagen. Lo leen en voz alta los lectores de pantalla y se muestra si la imagen no carga. | `<img src="perro.jpg" alt="Un perro marrón">` |

**Error habitual:** no poner el atributo `alt` en las imágenes. Las personas que usan lectores de pantalla no sabrán qué muestra la imagen.

```html

    <!-- ❌ INCORRECTO: la imagen no tiene descripción -->
    <img src="equipo.jpg">

    <!-- ✅ CORRECTO: la descripción explica qué muestra la imagen -->
    <img src="equipo.jpg" alt="El equipo de DaviNotes sonriendo en la oficina">


```

---

## 3. Anidamiento

Los elementos HTML pueden colocarse dentro de otros elementos. Esto se llama **anidamiento** y crea una **jerarquía**: el elemento de fuera es el *padre* y el de dentro es el *hijo*.

**Regla práctica:** la última etiqueta que abres debe ser la primera que cierras, como cajas metidas dentro de otras cajas.

```html

    <div class="card">
        <h2>Título de la tarjeta</h2>
        <p>Esta es una palabra en <strong>negrita</strong> dentro de un párrafo.</p>
    </div>


```

Si anidas mal, el navegador intentará arreglarlo, pero lo normal es que el diseño acabe roto.

```html

    <!-- ❌ INCORRECTO: <strong> se abrió el último, pero se cierra antes </p> -->
    <p>Esto está <strong>mal.</p></strong>

    <!-- ✅ CORRECTO: se cierra la etiqueta interior antes que la exterior -->
    <p>Esto está <strong>bien.</strong></p>


```

---

## 4. El esqueleto básico

Todo documento HTML necesita una estructura inicial estándar (a menudo llamada *boilerplate* o «plantilla») para que los navegadores lo muestren correctamente.

Esta estructura es la raíz del **árbol DOM**: todos los demás elementos cuelgan de ella.

```html

    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Título de la página</title>
    </head>
    <body>

        <h1>Mi primer título</h1>
        <p>Mi primer párrafo.</p>

    </body>
    </html>


```

**Partes principales:**

- `<!DOCTYPE html>`: Indica al navegador que es un documento HTML moderno (HTML5).

- `<html>`: El elemento raíz. Todo lo demás va dentro. El atributo `lang` indica el idioma de la página.

- `<head>`: Contiene información **sobre** la página que **no se muestra** en ella: el título de la pestaña del navegador, la codificación de caracteres (`charset`), enlaces a archivos de estilos y datos para los buscadores.

- `<meta name="viewport">`: Hace que la página se adapte al ancho de la pantalla, algo imprescindible en móviles.

- `<body>`: Contiene el contenido **visible** de la página (títulos, párrafos, imágenes, listas, etc.).

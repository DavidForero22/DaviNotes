---
title: "Guía de instalación de HTML"
---

# Guía de instalación de HTML

HTML es un **lenguaje de marcado**, así que no hay nada que instalar ni *compilar* (traducir a un programa que el ordenador pueda ejecutar). Un archivo HTML es solo un archivo de texto que cualquier navegador puede abrir. Aun así, algunas herramientas gratuitas hacen mucho más cómodo escribir y previsualizar HTML.

---

## 1. Herramientas necesarias

Para empezar a crear y probar HTML necesitas:

<ol>
    <li>
        <strong>Un editor de código</strong><br>
        Un editor de texto pensado para escribir código. Colorea las distintas partes del código (<em>resaltado de sintaxis</em>) para que sea más fácil de leer, y se puede ampliar con complementos llamados <em>extensiones</em>.
        <ul>
            <li><a href="https://code.visualstudio.com/" target="_blank" rel="noopener noreferrer" title="Web oficial de Visual Studio Code" class="doc-link">Visual Studio Code</a> (recomendado)</li>
            <li><a href="https://www.sublimetext.com/" target="_blank" rel="noopener noreferrer" title="Web oficial de Sublime Text" class="doc-link">Sublime Text</a></li>
            <li><a href="https://notepad-plus-plus.org/" target="_blank" rel="noopener noreferrer" title="Web oficial de Notepad++" class="doc-link">Notepad++</a> (solo Windows)</li>
        </ul>
    </li>
    <li>
        <strong>Un navegador web</strong><br>
        Lo usarás para abrir tus archivos <code>.html</code> y ver el resultado. Casi seguro que ya tienes uno:
        <ul>
            <li><a href="https://www.google.com/chrome/" target="_blank" rel="noopener noreferrer" title="Web oficial de Google Chrome" class="doc-link">Chrome</a></li>
            <li><a href="https://www.firefox.com/" target="_blank" rel="noopener noreferrer" title="Web oficial de Mozilla Firefox" class="doc-link">Firefox</a></li>
            <li><a href="https://www.microsoft.com/edge" target="_blank" rel="noopener noreferrer" title="Web oficial de Microsoft Edge" class="doc-link">Edge</a></li>
            <li><a href="https://www.apple.com/safari/" target="_blank" rel="noopener noreferrer" title="Web oficial de Safari" class="doc-link">Safari</a></li>
        </ul>
    </li>
    <li>
        <strong>(Opcional) Extensión Live Server</strong><br>
        Si usas Visual Studio Code, puedes instalar la extensión <a href="https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer" target="_blank" rel="noopener noreferrer" title="Extensión Live Server" class="doc-link">Live Server</a>. Recarga la página en el navegador automáticamente cada vez que guardas el archivo, así no tienes que actualizarla a mano.
    </li>
</ol>

---

## 2. Crear tu primer archivo HTML

1. Abre tu editor de código.

2. Crea un archivo nuevo y guárdalo como `index.html`. La terminación `.html` (la *extensión*) le indica al ordenador que es una página web.

3. Escribe (o pega) la estructura básica de HTML:

```html

    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mi primera página HTML</title>
    </head>
    <body>
        <h1>¡Hola, HTML!</h1>
        <p>Bienvenido a tu primera página web.</p>
    </body>
    </html>


```

4. Guarda el archivo.

**Error habitual:** guardar el archivo con la extensión equivocada. Algunos editores básicos (como el Bloc de notas de Windows) añaden `.txt` automáticamente, y el navegador mostrará el código como texto plano en lugar de como página web.

```bash

    # ❌ INCORRECTO: el navegador lo trata como un documento de texto
    index.html.txt

    # ✅ CORRECTO: el navegador lo trata como una página web
    index.html


```

---

## 3. Ver tu archivo HTML

- Abre el archivo en un navegador de cualquiera de estas formas:

    - Haz doble clic en el archivo `index.html`.

    - Haz clic derecho en el archivo → *Abrir con* → elige tu navegador.

- Deberías ver tu título y tu párrafo como una página web. El título «Mi primera página HTML» aparece en la pestaña del navegador.

- Después de cambiar el código, guarda el archivo y recarga el navegador (F5 o Ctrl+R / Cmd+R) para ver los cambios.

---

## 4. Usar Live Server (opcional)

Si instalaste la extensión Live Server en Visual Studio Code:

1. Haz clic derecho en `index.html` en la lista de archivos.

2. Selecciona **«Open with Live Server»**.

3. El navegador abrirá la página y la actualizará automáticamente cada vez que guardes.

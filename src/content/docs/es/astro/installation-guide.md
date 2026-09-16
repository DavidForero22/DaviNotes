---
title: "Guía de instalación de Astro"
---

# Guía de instalación de Astro

Esta guía explica cómo crear un proyecto nuevo de Astro en tu ordenador.

Varios pasos usan la **terminal** (también llamada *línea de comandos*, *Símbolo del sistema* o *PowerShell* en Windows): una ventana en la que escribes órdenes en lugar de hacer clic en botones.

---

## 1. Requisitos previos

Astro necesita **Node.js**, un programa que ejecuta JavaScript fuera del navegador. Al instalarlo también se instala **npm** (Node Package Manager, «gestor de paquetes de Node»), la herramienta que descarga las librerías que necesita un proyecto.

- Descarga e instala la versión **LTS** (la recomendada) desde la <a href="https://nodejs.org/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Web oficial de Node.js">web oficial de Node.js</a>.

Después abre una terminal **nueva** y comprueba que funciona:

```bash

    node -v


```

Debería mostrar un número de versión, como `v22.12.0`.

---

## 2. Crear un proyecto nuevo

Abre la terminal en la carpeta donde quieras guardar el proyecto y ejecuta:

```bash

    # Iniciar el asistente de instalación de Astro
    npm create astro@latest


```

Un asistente te hará algunas preguntas, como el nombre de la carpeta del proyecto o la plantilla de partida. Si no estás seguro, las respuestas por defecto son una buena opción. Cuando pregunte si quieres **instalar las dependencias** (*install dependencies*), responde que sí.

---

## 3. Arrancar el servidor de desarrollo

Una vez creado el proyecto:

1. Entra en la carpeta del nuevo proyecto con `cd` (*change directory*, «cambiar de directorio»), usando el nombre que elegiste:

```bash

    cd my-project


```

2. Si no instalaste las dependencias durante el asistente, descárgalas ahora:

```bash

    npm install


```

3. Arranca el servidor de desarrollo:

```bash

    npm run dev


```

Abre `http://localhost:4321` en el navegador para ver tu sitio. La página se actualiza automáticamente cada vez que guardas un cambio. Pulsa `Ctrl+C` en la terminal para detener el servidor.

**Error habitual:** arrancar el servidor antes de instalar las dependencias. El propio Astro es una de esas dependencias, así que no se encuentra la orden.

```bash

    # ❌ INCORRECTO: la carpeta node_modules todavía no existe
    npm run dev
    # "astro" no se reconoce como un comando interno o externo

    # ✅ CORRECTO: primero se instalan las dependencias y después se arranca el servidor
    npm install
    npm run dev


```

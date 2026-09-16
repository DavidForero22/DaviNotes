---
title: "Guía de instalación de React"
---

# Guía de instalación de React

Esta guía te acompaña paso a paso para crear un proyecto de React desde cero.

Varios pasos usan la **terminal** (también llamada *línea de comandos*, *Símbolo del sistema* o *PowerShell* en Windows): una ventana en la que escribes órdenes en lugar de hacer clic en botones.

---

## 1. Requisitos previos

Los proyectos de React se crean y se ejecutan con **Node.js**, un programa que ejecuta JavaScript fuera del navegador. Al instalar Node.js también se instala **npm** (Node Package Manager, «gestor de paquetes de Node»), la herramienta que descarga las librerías que necesita tu proyecto, React incluido.

- Descarga e instala la versión **LTS** (la recomendada) desde la <a href="https://nodejs.org/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Web oficial de Node.js">web oficial de Node.js</a>. Se necesita la versión 20 o posterior.

Después abre una terminal **nueva** y comprueba que los dos están instalados:

```bash

    node -v
    npm -v


```

Cada orden debería mostrar un número de versión (por ejemplo, `v22.12.0` y `10.9.0`).

---

## 2. Crear un proyecto de React

La forma recomendada de empezar un proyecto de React es con **Vite**, una herramienta que prepara la estructura del proyecto y lo ejecuta muy rápido.

```bash
    
    npm create vite@latest my-app -- --template react


```

Esto crea una carpeta llamada `my-app` con todo lo necesario para empezar. Puedes cambiar `my-app` por el nombre que quieras (en minúsculas y sin espacios es lo más seguro). Si la herramienta te hace alguna pregunta, puedes aceptar las respuestas por defecto.

*Nota: muchos tutoriales antiguos usan `npx create-react-app`. Esa herramienta quedó oficialmente obsoleta en 2025 y ya no se recomienda para proyectos nuevos.*

---

## 3. Instalar las dependencias

Entra en la nueva carpeta y descarga las librerías que necesita el proyecto:

```bash

    cd my-app
    npm install


```

`cd` (*change directory*, «cambiar de directorio») mueve la terminal a una carpeta. `npm install` lee la lista de dependencias de `package.json` y las descarga en una carpeta `node_modules`.

---

## 4. Arrancar el servidor de desarrollo

```bash

    npm run dev


```

Abre el navegador en `http://localhost:5173` para ver tu aplicación de React funcionando. Cada vez que guardes un cambio en el código, la página se actualizará sola. Pulsa `Ctrl+C` en la terminal para detener el servidor.

**Error habitual:** ejecutar las órdenes desde la carpeta equivocada. `npm` busca el archivo `package.json` en la carpeta actual, así que falla si no estás dentro del proyecto.

```bash

    # ❌ INCORRECTO: seguimos en la carpeta superior, donde no hay package.json
    npm run dev
    # npm error enoent Could not read package.json

    # ✅ CORRECTO: primero se entra en la carpeta del proyecto
    cd my-app
    npm run dev


```

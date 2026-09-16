---
title: "Guía de instalación de Node.js"
---

# Guía de instalación de Node.js

**Node.js** es un **entorno de ejecución** de JavaScript que te permite ejecutar JavaScript fuera del navegador, directamente en tu máquina o en un servidor. Al instalarlo también se instala **npm** (Node Package Manager), la herramienta que usarás para instalar y gestionar librerías en tus proyectos.

En lugar de instalar Node.js directamente, la mayoría de desarrolladores usan un **gestor de versiones** como **nvm**, que te permite instalar y cambiar entre varias versiones de Node.js en la misma máquina, algo útil porque distintos proyectos suelen requerir versiones diferentes. Esta guía cubre tanto la instalación directa como el uso de nvm.

---

## 1. Windows

<ol>
  <li>
    Ve al
    <a href="https://nodejs.org/"
       class="doc-link"
       target="_blank"
       rel="noopener noreferrer"
       title="Sitio oficial de Node.js">
       sitio oficial de Node.js
    </a>
    y descarga el instalador <strong>LTS</strong> (soporte a largo plazo), la versión recomendada para la mayoría de proyectos.
  </li>
  <li>
    Ejecuta el archivo <code>.msi</code> descargado. Las opciones por defecto funcionan bien para empezar; asegúrate de que la casilla para instalar las <strong>herramientas necesarias</strong> para los módulos nativos quede marcada.
  </li>
  <li>
    Reinicia cualquier ventana de terminal abierta al terminar la instalación, para que reconozca los nuevos comandos.
  </li>
</ol>

### Verificar la instalación

```bash

    node --version
    npm --version


```

Deberías ver dos números de versión, por ejemplo `v20.11.1` y `10.2.4`. `npm` se instala automáticamente junto con Node.js.

---

## 2. macOS

<ol>
  <li>
    Ve al <a href="https://nodejs.org/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Sitio oficial de Node.js">sitio oficial de Node.js</a> y descarga el instalador <strong>LTS</strong> para macOS.
  </li>
  <li>
    Como alternativa, si usas <a href="https://brew.sh/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Homebrew">Homebrew</a> (una herramienta para instalar software desde la terminal), puedes ejecutar el siguiente comando en su lugar.
  </li>
</ol>

```bash

    brew install node


```

### Verificar la instalación

```bash

    node --version
    npm --version


```

---

## 3. Linux (Ubuntu/Debian)

```bash

    sudo apt update
    sudo apt install nodejs npm


```

La versión que distribuye `apt` puede quedar varias versiones principales por detrás de la última disponible. Para cualquier cosa más allá de una prueba rápida, se recomienda el método con **nvm** que se explica a continuación, que siempre da una versión actualizada y fácil de reemplazar.

### Verificar la instalación

```bash

    node --version
    npm --version


```

---

## 4. Recomendado: nvm (Node Version Manager)

**nvm** instala las versiones de Node.js en tu carpeta de usuario en lugar de a nivel de sistema, así puedes tener varias versiones en paralelo y cambiar entre ellas según el proyecto, sin necesitar permisos de administrador.

```bash

    # macOS/Linux: descarga y ejecuta el script de instalación
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

    # Reinicia tu terminal y luego instala la última versión LTS
    nvm install --lts

    # Cambia a una versión principal específica
    nvm use 20


```

En Windows, el `nvm` oficial no funciona; usa en su lugar la herramienta independiente <a href="https://github.com/coreybutler/nvm-windows" class="doc-link" target="_blank" rel="noopener noreferrer" title="nvm-windows">nvm-windows</a>, que ofrece comandos equivalentes `nvm install` y `nvm use`.

**Error común:** instalar Node.js tanto con el instalador oficial como con nvm, y luego no entender por qué un cambio de versión con `nvm use` no parece tener ningún efecto. Ejecuta `which node` (macOS/Linux) o `where node` (Windows) para comprobar exactamente qué instalación está usando tu terminal.

---

## 5. Primera configuración

Antes de instalar tu primera librería, conviene familiarizarse con el comando que inicia todo proyecto de Node.js: crea el archivo que llevará el registro de las dependencias del proyecto.

```bash

    mkdir mi-proyecto
    cd mi-proyecto
    npm init -y


```

`npm init -y` crea un archivo `package.json` con valores por defecto (la opción `-y` se salta el cuestionario interactivo). A partir de aquí, cualquier librería que instales con `npm install <paquete>` quedará registrada automáticamente en este archivo.

*La sección 1.5 de la siguiente guía cubre `package.json` y la gestión de dependencias en detalle.*

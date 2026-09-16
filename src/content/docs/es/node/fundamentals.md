---
title: "Fundamentos y primeros pasos con Node.js"
---

# Fundamentos y Primeros Pasos

Antes de construir nada con Node.js, conviene entender qué es realmente, cómo ejecuta tu código por dentro y cómo usar las herramientas que trae incluidas. Esta sección cubre el modelo mental detrás del motor asíncrono de Node y los módulos nativos que usarás constantemente.

---

## Tabla de Contenidos

<div id="content-table">

- [1.1. Introducción a Node.js y al motor V8](#11-introducción-a-nodejs-y-al-motor-v8 "Qué es Node.js y cómo ejecuta JavaScript")
- [1.2. Instalación y configuración del entorno](#12-instalación-y-configuración-del-entorno "npm y nvm, más allá de la instalación inicial")
- [1.3. Arquitectura: Event Loop y Modelo Asíncrono](#13-arquitectura-event-loop-y-modelo-asíncrono "Non-blocking I/O explicado")
- [1.4. Módulos esenciales del sistema](#14-módulos-esenciales-del-sistema "fs, path, os y events")
- [1.5. Gestión de paquetes](#15-gestión-de-paquetes "package.json y dependencias")

</div>

---

## 1.1. Introducción a Node.js y al motor V8

**Node.js** no es un lenguaje ni un framework: es un **entorno de ejecución** que te permite ejecutar código JavaScript fuera de un navegador web. Antes de que existiera Node.js (2009), JavaScript solo podía ejecutarse dentro de navegadores, lo que significaba que no se podía usar para construir servidores, herramientas de línea de comandos o scripts que accedieran al sistema de archivos.

Node.js está construido sobre **V8**, el mismo motor de JavaScript que usa Google Chrome para ejecutar el JavaScript de cada página web. V8 compila JavaScript directamente a código máquina nativo en lugar de interpretarlo línea a línea, lo que es una de las razones por las que las aplicaciones de Node.js pueden ser muy rápidas. Node.js envuelve a V8 con APIs adicionales (para archivos, redes, procesos, etc.) que tienen sentido en un servidor, pero que no lo tendrían —o serían un riesgo de seguridad— dentro de un navegador.

| | JavaScript en el navegador | Node.js |
| :--- | :--- | :--- |
| **Motor** | V8 (Chrome), SpiderMonkey (Firefox)... | V8 |
| **Objeto global** | `window` | `global` |
| **Acceso al sistema de archivos** | No (aislado por seguridad) | Sí |
| **Acceso al DOM** | Sí | No |
| **Uso típico** | Páginas web interactivas | Servidores, CLIs, scripts, herramientas |

**Error común:** asumir que el código que funciona en el navegador (como manipular el DOM con `document.querySelector`) también funcionará en Node.js, o al revés. Ambos usan el lenguaje JavaScript, pero cada uno expone un conjunto distinto de APIs globales adecuadas a su entorno.

---

## 1.2. Instalación y configuración del entorno

*Si Node.js todavía no está instalado en tu máquina, consulta primero la Guía de instalación, que cubre tanto la instalación directa como el uso de nvm.*

Una vez instalado, hay dos comandos que vienen juntos y conviene conocer bien:

```bash

    node --version   # Muestra la versión de Node.js instalada
    npm --version     # Muestra la versión de npm instalada


```

**npm** (Node Package Manager) no sirve solo para instalar librerías: también ejecuta scripts del proyecto y gestiona versiones. **nvm** (Node Version Manager), explicado en la guía de instalación, resuelve un problema muy común en la práctica: distintos proyectos en tu máquina pueden requerir distintas versiones de Node.js.

```bash

    node app.js        # Ejecuta un archivo JavaScript con Node.js
    node               # Abre el REPL interactivo de Node.js (una consola de JavaScript en vivo)


```

El **REPL** (Read-Eval-Print Loop) es útil para probar rápidamente un fragmento de JavaScript sin crear un archivo. Escribe `.exit` o pulsa `Ctrl + C` dos veces para salir.

**Error común:** ejecutar un proyecto clonado de otra persona sin comprobar qué versión de Node.js espera (a menudo indicada en un archivo `.nvmrc` o en el campo `"engines"` de `package.json`). Usar una versión mucho más nueva o más antigua puede causar errores sutiles o fallos de instalación.

---

## 1.3. Arquitectura: Event Loop y Modelo Asíncrono

Node.js ejecuta JavaScript en un **único hilo**, y aun así puede gestionar miles de conexiones simultáneas sin ralentizarse. La clave es que Node.js es **non-blocking** (no bloqueante): en lugar de esperar a que termine una operación lenta (leer un archivo, consultar una base de datos, hacer una petición de red) antes de pasar a la siguiente línea, delega ese trabajo y sigue ejecutando otro código. Cuando la operación lenta termina, Node.js recibe una notificación y ejecuta el callback correspondiente.

Esta coordinación la gestiona el **Event Loop**, un ciclo que se ejecuta continuamente comprobando si hay trabajo terminado que devolver a tu código.

```bash

    Tu Código --> Node.js delega el trabajo lento (I/O, timers...) --> Event Loop sigue comprobando
                                                                              |
                     Tu Código <-- se ejecuta el callback/promise  <---------+ (trabajo terminado)


```

**Bloqueante vs. no bloqueante**, usando la lectura de un archivo como ejemplo:

```js

    const fs = require("fs");

    // Bloqueante (síncrono): todo el programa se congela hasta leer el archivo por completo
    const dataSync = fs.readFileSync("./data.txt", "utf-8");
    console.log("Esto se ejecuta solo después de leer todo el archivo");

    // No bloqueante (asíncrono): Node.js sigue ejecutando otro código mientras se lee el archivo
    fs.readFile("./data.txt", "utf-8", (err, data) => {
        console.log("Esto se ejecuta más tarde, cuando termina la lectura");
    });
    console.log("Esto se ejecuta de inmediato, antes de que termine la lectura");


```

Como el código basado en callbacks puede volverse difícil de leer rápidamente cuando se anida (conocido informalmente como "callback hell"), el código moderno de Node.js prefiere las **Promises** y la sintaxis `async`/`await`, que expresan el mismo comportamiento no bloqueante con código que se lee de arriba abajo.

```js

    const fs = require("fs/promises");

    async function leerDatos() {
        const data = await fs.readFile("./data.txt", "utf-8");
        console.log(data);
    }


```

**Error común:** usar una función `*Sync` (como `readFileSync`) dentro de un servidor que atiende a muchos usuarios a la vez. Como Node.js se ejecuta en un único hilo, una llamada bloqueante congela **todo** el servidor para todos los usuarios hasta que termina, no solo la petición actual.

---

## 1.4. Módulos esenciales del sistema

Node.js viene con un conjunto de módulos incorporados —sin necesidad de instalación— que cubren las necesidades más comunes de un programa del lado del servidor. `require` (o `import` con sintaxis ESM) los carga por nombre.

| Módulo | Propósito |
| :--- | :--- |
| `fs` | Leer, escribir y gestionar archivos y directorios (**f**ile **s**ystem). |
| `path` | Construir y manipular rutas de archivos de forma que funcione en cualquier sistema operativo. |
| `os` | Obtener información sobre la máquina donde se ejecuta Node.js (CPU, memoria, plataforma). |
| `events` | Crear y escuchar eventos personalizados con la clase `EventEmitter`. |

```js

    const path = require("path");
    const os = require("os");
    const EventEmitter = require("events");

    // path: une segmentos usando el separador correcto para el SO actual ("/" o "\")
    const filePath = path.join(__dirname, "data", "file.txt");

    // os: información básica sobre la máquina
    console.log(os.platform());   // p. ej. "win32", "linux", "darwin"
    console.log(os.totalmem());   // Memoria total en bytes

    // events: define y reacciona a un evento personalizado
    const emitter = new EventEmitter();
    emitter.on("userCreated", (name) => console.log(`¡Bienvenido, ${name}!`));
    emitter.emit("userCreated", "Alex");


```

**Error común:** construir rutas de archivo concatenando cadenas de texto manualmente (p. ej. `dir + "/" + file`). Esto se rompe en Windows, que usa `\` en lugar de `/`. Usa siempre `path.join()` o `path.resolve()` en su lugar.

---

## 1.5. Gestión de paquetes

Todo proyecto de Node.js se describe mediante un archivo `package.json`: lista el nombre del proyecto, su versión, sus scripts y, lo más importante, sus **dependencias** (las librerías externas que necesita para funcionar).

```bash

    npm init -y                    # Crea un package.json con valores por defecto
    npm install express             # Instala una librería y la añade a "dependencies"
    npm install --save-dev jest     # Instala una librería necesaria solo para desarrollo, bajo "devDependencies"
    npm install                     # Instala todas las dependencias ya listadas en package.json


```

Las librerías instaladas se descargan en una carpeta `node_modules`, y la versión exacta de cada dependencia (incluidas las dependencias de las dependencias) queda fijada en un archivo `package-lock.json`, de modo que se instalen las mismas versiones en cada máquina.

```json

    {
      "name": "mi-proyecto",
      "version": "1.0.0",
      "scripts": {
        "start": "node index.js",
        "dev": "node --watch index.js"
      },
      "dependencies": {
        "express": "^4.19.2"
      },
      "devDependencies": {
        "jest": "^29.7.0"
      }
    }


```

La sección `scripts` define atajos que ejecutas con `npm run <nombre>` (p. ej. `npm run dev`), que es como la mayoría de proyectos estandarizan comandos como iniciar el servidor o ejecutar los tests.

**Error común:** subir la carpeta `node_modules` al control de versiones. Puede contener decenas de miles de archivos y es totalmente reproducible a partir de `package.json` y `package-lock.json` ejecutando `npm install`, así que siempre debería excluirse mediante `.gitignore`.

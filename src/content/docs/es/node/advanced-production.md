---
title: "Conceptos avanzados y producción en Node.js"
---

# Conceptos Avanzados y Producción

Una vez que una aplicación funciona, el siguiente paso es hacer que escale, se mantenga segura y sobreviva en producción. Esta sección cubre manejar grandes volúmenes de datos de forma eficiente, usar más de un núcleo de CPU, asegurar una API, testearla con confianza, y desplegarla de forma que pueda monitorearse y reiniciarse automáticamente.

---

## Tabla de Contenidos

<div id="content-table">

- [3.1. Programación con Streams y Buffers](#31-programación-con-streams-y-buffers "Manejar grandes volúmenes de datos de forma eficiente")
- [3.2. Concurrencia y multiprocesamiento](#32-concurrencia-y-multiprocesamiento "Worker Threads y Cluster")
- [3.3. Autenticación y Seguridad](#33-autenticación-y-seguridad "JWT, HTTPS y Helmet")
- [3.4. Testing](#34-testing "Jest, Vitest y node:test")
- [3.5. Despliegue y monitoreo](#35-despliegue-y-monitoreo "Variables de entorno, Docker y PM2")

</div>

---

## 3.1. Programación con Streams y Buffers

Cargar en memoria un archivo grande completo (un vídeo, una exportación CSV enorme, un log de varios gigabytes) antes de procesarlo puede agotar la memoria disponible de un servidor. Un **Buffer** es un bloque fijo de datos binarios sin procesar, y un **Stream** procesa los datos como una secuencia de fragmentos pequeños a lo largo del tiempo en lugar de todo de golpe.

```js

    const fs = require("fs");

    // ❌ Carga el archivo completo en memoria antes de hacer nada con él
    fs.readFile("archivo-grande.csv", (err, data) => {
        console.log(data.length);
    });

    // ✅ Procesa el archivo fragmento a fragmento, usando muy poca memoria en cada momento
    const stream = fs.createReadStream("archivo-grande.csv");
    stream.on("data", (chunk) => {
        console.log(`Recibidos ${chunk.length} bytes`);
    });
    stream.on("end", () => {
        console.log("Lectura del archivo terminada");
    });


```

Los streams también pueden **encadenarse (pipe)** directamente de un origen a un destino, dejando que Node.js gestione automáticamente el flujo de datos (y la contrapresión, es decir, frenar el origen si el destino no da abasto).

```js

    const fs = require("fs");
    const zlib = require("zlib");

    // Lee un archivo, lo comprime al vuelo y escribe el resultado, sin
    // mantener nunca el archivo completo en memoria a la vez
    fs.createReadStream("archivo-grande.csv")
        .pipe(zlib.createGzip())
        .pipe(fs.createWriteStream("archivo-grande.csv.gz"));


```

**Error común:** usar `fs.readFile` (que carga el archivo completo en memoria) para archivos que pueden crecer de forma arbitraria, como subidas de usuarios o informes exportados. Esto funciona bien en desarrollo con archivos de prueba pequeños y luego falla en producción con uno real.

---

## 3.2. Concurrencia y multiprocesamiento

JavaScript en Node.js se ejecuta en un **único hilo**, lo cual es suficiente para trabajo intensivo en I/O (ver la sección 1.3 sobre el Event Loop) pero se convierte en un cuello de botella para trabajo intensivo en **CPU** —procesamiento de imágenes, cálculos pesados, parseo de archivos enormes— porque ese tipo de trabajo bloquea por completo el único hilo mientras se ejecuta.

Los **Worker Threads** permiten ejecutar JavaScript en paralelo, en hilos separados, ideales para tareas intensivas en CPU que de otro modo bloquearían el hilo principal:

```js

    // main.js
    const { Worker } = require("worker_threads");

    const worker = new Worker("./heavy-task.js");
    worker.on("message", (result) => console.log("Resultado:", result));
    worker.postMessage(42);

    // heavy-task.js
    const { parentPort } = require("worker_threads");
    parentPort.on("message", (n) => {
        // Algún cálculo intensivo en CPU
        const result = n * 2;
        parentPort.postMessage(result);
    });


```

El módulo **Cluster** resuelve un problema distinto: aprovechar todos los núcleos de CPU disponibles en la máquina para atender más peticiones simultáneas, creando (fork) varias copias del proceso completo del servidor que comparten el mismo puerto.

```js

    const cluster = require("cluster");
    const os = require("os");

    if (cluster.isPrimary) {
        const cpuCount = os.cpus().length;
        for (let i = 0; i < cpuCount; i++) {
            cluster.fork(); // Inicia un proceso worker por cada núcleo de CPU
        }
    } else {
        require("./server.js"); // Cada worker ejecuta su propia copia del servidor
    }


```

| | Worker Threads | Cluster |
| :--- | :--- | :--- |
| **Resuelve** | Tareas intensivas en CPU que bloquean el event loop | Usar varios núcleos de CPU para más throughput |
| **Comparte memoria** | Puede compartir memoria mediante `SharedArrayBuffer` | No, cada proceso está totalmente aislado |
| **Uso típico** | Procesamiento de imágenes, parseo de datos, cifrado | Escalar un servidor web entre núcleos |

**Error común:** recurrir a Worker Threads o Cluster para resolver una operación de *I/O* lenta (como una consulta lenta a la base de datos). El I/O ya es no bloqueante en Node.js; añadir hilos o procesos solo ayuda con trabajo intensivo en **CPU**.

---

## 3.3. Autenticación y Seguridad

La **autenticación** verifica quién es un usuario; el enfoque sin estado más habitual en APIs es **JWT** (JSON Web Token): el servidor emite un token firmado tras el login, y el cliente lo envía de vuelta en cada petición posterior en lugar de reenviar sus credenciales.

```js

    const jwt = require("jsonwebtoken");

    // Tras verificar la contraseña del usuario, emite un token firmado
    const token = jwt.sign({ userId: 42 }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Middleware que protege una ruta verificando el token
    function requireAuth(req, res, next) {
        const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"
        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET);
            next();
        } catch {
            res.status(401).json({ error: "Token inválido o expirado" });
        }
    }


```

Más allá de la autenticación, una API en producción necesita una higiene de seguridad mínima:

- **HTTPS:** cifra el tráfico entre el cliente y el servidor, normalmente terminado en un proxy inverso o balanceador de carga (como Nginx o un proveedor cloud) en lugar de dentro del propio Node.js.
- **Helmet:** un pequeño middleware de Express que configura un conjunto de cabeceras HTTP relacionadas con la seguridad (como impedir que la página se embeba en un `<iframe>` hostil) con una sola línea: `app.use(helmet())`.
- **Validación de entrada:** cubierta en la sección 2.3, también protege contra ataques de inyección al rechazar datos malformados antes de que lleguen a tus consultas a la base de datos.

**Error común:** codificar secretos (claves de firma JWT, contraseñas de base de datos, claves de API) directamente en el código fuente. Quedan permanentemente en el historial del control de versiones, aunque se eliminen después. Cárgalos siempre desde **variables de entorno** en su lugar (ver sección 3.5).

---

## 3.4. Testing

Los tests automatizados detectan regresiones antes de que lleguen a producción. Node.js incluye un ejecutor de tests incorporado (`node:test`, sin necesidad de instalación), además de dos alternativas externas muy populares, **Jest** y **Vitest**, que añaden herramientas más completas como mocking y reportes de cobertura de fábrica.

```js

    // sum.js
    function sum(a, b) {
        return a + b;
    }
    module.exports = sum;

    // sum.test.js — usando el ejecutor de tests incorporado de node
    const test = require("node:test");
    const assert = require("node:assert");
    const sum = require("./sum");

    test("suma 1 + 2 y da 3", () => {
        assert.strictEqual(sum(1, 2), 3);
    });


```

El mismo test con **Jest** (o **Vitest**, que usa una API casi idéntica):

```js

    // sum.test.js
    const sum = require("./sum");

    test("suma 1 + 2 y da 3", () => {
        expect(sum(1, 2)).toBe(3);
    });


```

Una suite de tests típica combina tres niveles: **tests unitarios** (una única función aislada), **tests de integración** (varias piezas trabajando juntas, p. ej. una ruta más una base de datos de prueba real) y **tests end-to-end** (la aplicación completa, simulando un usuario real).

**Error común:** ejecutar los tests contra la misma base de datos usada para los datos reales. Un test que crea, modifica o elimina registros puede corromper datos de producción; los tests siempre deberían ejecutarse contra una base de datos de prueba dedicada o un sustituto en memoria.

---

## 3.5. Despliegue y monitoreo

La configuración que cambia entre entornos (URLs de base de datos, claves de API, el puerto en el que escuchar) nunca debería estar codificada directamente: pertenece a las **variables de entorno**, leídas a través de `process.env` y normalmente cargadas desde un archivo `.env` local (excluido del control de versiones) con un paquete como `dotenv`.

```js

    require("dotenv").config(); // Carga variables de un archivo .env local en process.env

    const PORT = process.env.PORT || 3000;
    const DB_URL = process.env.DATABASE_URL;


```

**Docker** empaqueta una aplicación junto con su entorno de ejecución exacto (versión de Node.js, dependencias del sistema) en una única **imagen** portable, para que se ejecute igual en cualquier máquina, resolviendo el clásico problema de "en mi máquina funciona".

```bash

    # Dockerfile
    FROM node:20-alpine
    WORKDIR /app
    COPY package*.json ./
    RUN npm install --production
    COPY . .
    CMD ["node", "index.js"]


```

Una vez desplegada, un gestor de procesos como **PM2** mantiene la aplicación en marcha: la reinicia automáticamente si se cae, puede ejecutar varias instancias repartidas entre núcleos de CPU (de forma similar al módulo Cluster) y centraliza los logs.

```bash

    npm install -g pm2
    pm2 start index.js --name mi-app    # Inicia la app y la mantiene viva
    pm2 logs mi-app                      # Muestra los logs de la aplicación en directo
    pm2 restart mi-app                   # Reinicia sin tiempo de inactividad


```

**Error común:** desplegar sin ningún gestor de procesos ni política de reinicio del contenedor. Si el proceso de Node.js se cae por una excepción no controlada a las 3 de la madrugada, nada lo vuelve a poner en marcha hasta que alguien se da cuenta manualmente.

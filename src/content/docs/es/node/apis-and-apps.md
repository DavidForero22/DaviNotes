---
title: "Desarrollo de aplicaciones y APIs con Node.js"
---

# Desarrollo de Aplicaciones y APIs

Con los fundamentos claros, toca pasar de la teoría a la práctica: construir APIs funcionales, estructuradas y conectadas a datos reales. Esta sección cubre crear un servidor desde cero, usar un framework para no reinventar la rueda, y las piezas que necesita toda API en producción: rutas, validación, persistencia y manejo de errores.

---

## Tabla de Contenidos

<div id="content-table">

- [2.1. Creación de un servidor HTTP desde cero](#21-creación-de-un-servidor-http-desde-cero "Usando el módulo http de Node")
- [2.2. Frameworks de desarrollo](#22-frameworks-de-desarrollo "Express.js y Fastify")
- [2.3. Rutas, Middleware y validación de datos](#23-rutas-middleware-y-validación-de-datos "Estructurar una API")
- [2.4. Conexión y persistencia con Bases de Datos](#24-conexión-y-persistencia-con-bases-de-datos "Bases de datos SQL y NoSQL")
- [2.5. Manejo global de errores y Logging](#25-manejo-global-de-errores-y-logging "Mantener una app en producción observable y estable")

</div>

---

## 2.1. Creación de un servidor HTTP desde cero

Antes de recurrir a un framework, vale la pena ver de qué te ahorra exactamente. El módulo `http` incorporado en Node puede levantar un servidor web funcional sin ninguna dependencia externa.

```js

    const http = require("http");

    const server = http.createServer((req, res) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");

        if (req.url === "/" && req.method === "GET") {
            res.end(JSON.stringify({ message: "¡Hola, Node.js!" }));
        } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: "No encontrado" }));
        }
    });

    server.listen(3000, () => {
        console.log("Servidor corriendo en http://localhost:3000");
    });


```

Cada manejador de petición recibe un objeto **request** (`req`, con la URL, el método, las cabeceras y el cuerpo) y un objeto **response** (`res`, usado para enviar el estado, las cabeceras y un cuerpo de vuelta). Fíjate en cuánto trabajo manual hace falta solo para comprobar la URL y el método: el enrutamiento, el parseo del cuerpo de la petición y el manejo de errores tendrían que escribirse a mano.

**Error común:** olvidar llamar a `res.end()`. Sin ella, la respuesta nunca se completa y la petición del cliente queda colgada hasta que expira por tiempo de espera.

---

## 2.2. Frameworks de desarrollo

Los **frameworks** se encargan de las partes repetitivas de construir un servidor —rutas, parseo del cuerpo de las peticiones, envío de respuestas— para que puedas centrarte en la lógica de tu aplicación. **Express.js** es el framework de Node.js más usado, valorado por su simplicidad y su enorme ecosistema de plugins (llamados *middleware*). **Fastify** es una alternativa más reciente, pensada para el rendimiento y con validación de peticiones incorporada.

El mismo servidor de la sección anterior, reescrito con Express:

```js

    const express = require("express");
    const app = express();

    app.use(express.json()); // Parsea automáticamente los cuerpos de petición en formato JSON

    app.get("/", (req, res) => {
        res.json({ message: "¡Hola, Node.js!" });
    });

    app.listen(3000, () => {
        console.log("Servidor corriendo en http://localhost:3000");
    });


```

| | `http` (incorporado) | Express.js | Fastify |
| :--- | :--- | :--- | :--- |
| **Configuración** | Sin dependencias | Mínima, sin opiniones fuertes | Mínima, orientada a esquemas |
| **Rutas** | Manual (`if`/`switch` sobre `req.url`) | Incorporadas (`app.get`, `app.post`...) | Incorporadas |
| **Rendimiento** | N/A (lo mínimo) | Bueno | Optimizado para alto throughput |
| **Validación** | Manual | Vía middleware (p. ej. `zod`, `joi`) | Incorporada, basada en esquemas |

**Error común:** olvidar `express.json()` (o el body parser equivalente) y luego descubrir que `req.body` es `undefined` en cada petición `POST`. Express no parsea el cuerpo de la petición por defecto.

---

## 2.3. Rutas, Middleware y validación de datos

Una **ruta** hace corresponder un método HTTP y un patrón de URL con una función manejadora. Los **middleware** son funciones que se ejecutan *antes* del manejador de la ruta, usadas para asuntos transversales como logging, autenticación o —lo más habitual— validar los datos entrantes antes de que lleguen a tu lógica de negocio.

```js

    const express = require("express");
    const app = express();
    app.use(express.json());

    // Middleware: se ejecuta en cada petición, en orden, antes de la ruta correspondiente
    function logRequest(req, res, next) {
        console.log(`${req.method} ${req.url}`);
        next(); // Pasa el control al siguiente middleware o manejador de ruta
    }
    app.use(logRequest);

    // Ruta con un parámetro de URL (":id")
    app.get("/users/:id", (req, res) => {
        res.json({ id: req.params.id, name: "Alex" });
    });

    // Middleware de validación específico de la ruta
    function validateUser(req, res, next) {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: "name y email son obligatorios" });
        }
        next();
    }

    app.post("/users", validateUser, (req, res) => {
        res.status(201).json({ id: 1, ...req.body });
    });


```

Validar manualmente cada campo (como arriba) no escala bien más allá de un par de campos. Librerías como `zod` o `joi` te permiten declarar un **esquema** una sola vez y validar todo el cuerpo de la petición contra él en una única llamada, produciendo mensajes de error consistentes.

**Error común:** olvidar llamar a `next()` dentro de una función middleware. El manejo de la petición se detiene en silencio en ese punto, y la petición del cliente queda colgada sin respuesta ni mensaje de error.

---

## 2.4. Conexión y persistencia con Bases de Datos

Una API real necesita almacenar los datos en algún lugar persistente. Node.js no incluye ningún driver de base de datos de fábrica: te conectas a una a través de un paquete, ya sea con consultas en crudo o mediante un **ORM/ODM** (Object-Relational/Document Mapper) que te permite trabajar con objetos JavaScript en lugar de escribir la sintaxis de consulta directamente.

| | SQL (p. ej. PostgreSQL, MySQL) | NoSQL (p. ej. MongoDB) |
| :--- | :--- | :--- |
| **Forma de los datos** | Tablas estructuradas con un esquema fijo | Flexible, basada en documentos (tipo JSON) |
| **Relaciones** | Nativas (claves foráneas, joins) | Normalmente modeladas a mano o embebidas |
| **Driver/ORM habitual** | `pg`, `mysql2`, Prisma, Sequelize | `mongodb`, Mongoose |
| **Ideal para** | Datos con estructura clara y necesidades fuertes de consistencia | Datos que cambian rápido o poco estructurados |

Ejemplo usando **Mongoose** (un ODM popular para MongoDB) para definir y consultar datos:

```js

    const mongoose = require("mongoose");
    await mongoose.connect("mongodb://localhost:27017/myapp");

    const userSchema = new mongoose.Schema({
        name: String,
        email: { type: String, required: true, unique: true },
    });

    const User = mongoose.model("User", userSchema);

    // Crear
    const user = await User.create({ name: "Alex", email: "alex@example.com" });

    // Leer
    const found = await User.findOne({ email: "alex@example.com" });


```

**Error común:** abrir una nueva conexión a la base de datos en cada petición en lugar de reutilizar una única conexión (o pool de conexiones) abierta una sola vez al arrancar el servidor. Esto agota las conexiones disponibles de la base de datos bajo tráfico real y ralentiza cada petición.

---

## 2.5. Manejo global de errores y Logging

Sin un plan para los errores, una única excepción inesperada puede tumbar todo el proceso de Node.js, arrastrando consigo la petición de todos los usuarios, no solo la que falló. Express te permite centralizar el manejo de errores en un único lugar en vez de repetir `try`/`catch` en cada ruta.

```js

    // Los manejadores de ruta pasan los errores a next(err) en vez de lanzarlos directamente
    app.get("/users/:id", async (req, res, next) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                const error = new Error("Usuario no encontrado");
                error.status = 404;
                throw error;
            }
            res.json(user);
        } catch (err) {
            next(err); // Reenvía el error al middleware de manejo de errores de abajo
        }
    });

    // Middleware de manejo de errores: Express lo reconoce porque recibe 4 argumentos
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
    });


```

Más allá de `console.log`, una librería de **logging** dedicada (como `pino` o `winston`) añade registros estructurados y con niveles (`info`, `warn`, `error`) fáciles de filtrar y enviar a un servicio de monitoreo, algo esencial una vez que una aplicación corre sin supervisión en producción.

**Error común:** dejar que un error tumbe el proceso sin ningún manejador, o capturar un error y ignorarlo en silencio (un bloque `catch` vacío). Lo primero se lleva por delante todo el servidor para todos los usuarios; lo segundo oculta errores reales hasta que causan problemas mayores más adelante.

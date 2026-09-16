---
title: "Building Applications & APIs with Node.js"
---

# Building Applications & APIs

With the fundamentals in place, it is time to move from theory to practice: building functional, structured APIs connected to real data. This section covers creating a server from scratch, using a framework to avoid reinventing the wheel, and the pieces every production API needs — routing, validation, persistence, and error handling.

---

## Table of Contents

<div id="content-table">

- [2.1. Creating an HTTP Server from Scratch](#21-creating-an-http-server-from-scratch "Using Node's built-in http module")
- [2.2. Frameworks](#22-frameworks "Express.js and Fastify")
- [2.3. Routes, Middleware & Data Validation](#23-routes-middleware--data-validation "Structuring an API")
- [2.4. Connecting & Persisting Data](#24-connecting--persisting-data "SQL and NoSQL databases")
- [2.5. Global Error Handling & Logging](#25-global-error-handling--logging "Keeping a production app observable and stable")

</div>

---

## 2.1. Creating an HTTP Server from Scratch

Before reaching for a framework, it is worth seeing what one actually saves you from. Node's built-in `http` module can start a working web server with no external dependencies at all.

```js

    const http = require("http");

    const server = http.createServer((req, res) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");

        if (req.url === "/" && req.method === "GET") {
            res.end(JSON.stringify({ message: "Hello, Node.js!" }));
        } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: "Not found" }));
        }
    });

    server.listen(3000, () => {
        console.log("Server running at http://localhost:3000");
    });


```

Every request handler receives a **request** object (`req`, with the URL, method, headers, and body) and a **response** object (`res`, used to send status, headers, and a body back). Notice how much manual work this requires just to check the URL and method — routing, parsing the request body, and handling errors would all need to be written by hand.

**Common mistake:** forgetting to call `res.end()`. Without it, the response never completes and the client's request hangs until it times out.

---

## 2.2. Frameworks

**Frameworks** handle the repetitive parts of building a server — routing, parsing request bodies, sending responses — so you can focus on the application logic. **Express.js** is the most widely used Node.js framework, valued for its simplicity and huge ecosystem of plugins (called *middleware*). **Fastify** is a newer alternative built with performance and built-in request validation in mind.

The same server from the previous section, rewritten with Express:

```js

    const express = require("express");
    const app = express();

    app.use(express.json()); // Parses incoming JSON request bodies automatically

    app.get("/", (req, res) => {
        res.json({ message: "Hello, Node.js!" });
    });

    app.listen(3000, () => {
        console.log("Server running at http://localhost:3000");
    });


```

| | `http` (built-in) | Express.js | Fastify |
| :--- | :--- | :--- | :--- |
| **Setup** | No dependencies | Minimal, unopinionated | Minimal, schema-oriented |
| **Routing** | Manual (`if`/`switch` on `req.url`) | Built-in (`app.get`, `app.post`...) | Built-in |
| **Performance** | N/A (bare minimum) | Good | Optimized for high throughput |
| **Validation** | Manual | Via middleware (e.g. `zod`, `joi`) | Built-in, schema-based |

**Common mistake:** forgetting `express.json()` (or the equivalent body parser) and then finding that `req.body` is `undefined` on every `POST` request. Express does not parse the request body by default.

---

## 2.3. Routes, Middleware & Data Validation

A **route** matches an HTTP method and a URL pattern to a handler function. **Middleware** are functions that run *before* the route handler, used for cross-cutting concerns like logging, authentication, or — most commonly — validating incoming data before it reaches your business logic.

```js

    const express = require("express");
    const app = express();
    app.use(express.json());

    // Middleware: runs for every request, in order, before the matching route
    function logRequest(req, res, next) {
        console.log(`${req.method} ${req.url}`);
        next(); // Passes control to the next middleware or route handler
    }
    app.use(logRequest);

    // Route with a URL parameter (":id")
    app.get("/users/:id", (req, res) => {
        res.json({ id: req.params.id, name: "Alex" });
    });

    // Route-specific validation middleware
    function validateUser(req, res, next) {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: "name and email are required" });
        }
        next();
    }

    app.post("/users", validateUser, (req, res) => {
        res.status(201).json({ id: 1, ...req.body });
    });


```

Manually validating every field (as above) does not scale well past a couple of fields. Libraries like `zod` or `joi` let you declare a **schema** once and validate the whole request body against it in a single call, producing consistent error messages.

**Common mistake:** forgetting to call `next()` inside a middleware function. The request handling stops silently at that point, and the client's request hangs with no response and no error message.

---

## 2.4. Connecting & Persisting Data

A real API needs to store data somewhere persistent. Node.js does not include a database driver built in — you connect to one through a package, either with raw queries or through an **ORM/ODM** (Object-Relational/Document Mapper) that lets you work with JavaScript objects instead of writing raw query syntax.

| | SQL (e.g. PostgreSQL, MySQL) | NoSQL (e.g. MongoDB) |
| :--- | :--- | :--- |
| **Data shape** | Structured tables with a fixed schema | Flexible, document-based (JSON-like) |
| **Relationships** | Native (foreign keys, joins) | Usually modeled manually or embedded |
| **Common driver/ORM** | `pg`, `mysql2`, Prisma, Sequelize | `mongodb`, Mongoose |
| **Best for** | Data with clear structure and strong consistency needs | Rapidly evolving or loosely structured data |

Example using **Mongoose** (a popular ODM for MongoDB) to define and query data:

```js

    const mongoose = require("mongoose");
    await mongoose.connect("mongodb://localhost:27017/myapp");

    const userSchema = new mongoose.Schema({
        name: String,
        email: { type: String, required: true, unique: true },
    });

    const User = mongoose.model("User", userSchema);

    // Create
    const user = await User.create({ name: "Alex", email: "alex@example.com" });

    // Read
    const found = await User.findOne({ email: "alex@example.com" });


```

**Common mistake:** opening a new database connection on every request instead of reusing a single connection (or connection pool) opened once when the server starts. This exhausts the database's available connections under real traffic and slows every request down.

---

## 2.5. Global Error Handling & Logging

Without a plan for errors, a single unexpected exception can crash the entire Node.js process, taking down every user's request — not just the one that failed. Express lets you centralize error handling in one place instead of repeating `try`/`catch` in every route.

```js

    // Route handlers pass errors to next(err) instead of throwing directly
    app.get("/users/:id", async (req, res, next) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                const error = new Error("User not found");
                error.status = 404;
                throw error;
            }
            res.json(user);
        } catch (err) {
            next(err); // Forwards the error to the error-handling middleware below
        }
    });

    // Error-handling middleware: recognized by Express because it takes 4 arguments
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
    });


```

For anything beyond `console.log`, a dedicated **logging library** (such as `pino` or `winston`) adds structured, leveled logs (`info`, `warn`, `error`) that are easy to filter and forward to a monitoring service — essential once an application runs unattended in production.

**Common mistake:** letting an error crash the process with no handler at all, or catching an error and silently ignoring it (an empty `catch` block). The first loses the whole server for everyone; the second hides real bugs until they cause bigger problems downstream.

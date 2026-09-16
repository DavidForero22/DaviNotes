---
title: "Node.js Fundamentals & First Steps"
---

# Fundamentals & First Steps

Before building anything with Node.js, it helps to understand what it actually is, how it runs your code behind the scenes, and how to use the tools that ship with it. This section covers the mental model behind Node's asynchronous engine and the native modules you will reach for constantly.

---

## Table of Contents

<div id="content-table">

- [1.1. Introduction to Node.js and the V8 Engine](#11-introduction-to-nodejs-and-the-v8-engine "What Node.js is and how it runs JavaScript")
- [1.2. Installation & Environment Setup](#12-installation--environment-setup "npm and nvm, beyond the initial install")
- [1.3. Architecture: Event Loop & Async Model](#13-architecture-event-loop--async-model "Non-blocking I/O explained")
- [1.4. Essential Core Modules](#14-essential-core-modules "fs, path, os and events")
- [1.5. Package Management](#15-package-management "package.json and dependencies")

</div>

---

## 1.1. Introduction to Node.js and the V8 Engine

**Node.js** is not a language and not a framework: it is a **runtime environment** that lets you execute JavaScript code outside a web browser. Before Node.js existed (2009), JavaScript could only run inside browsers, which meant it could not be used to build servers, command-line tools, or scripts that touch the file system.

Node.js is built on top of **V8**, the same JavaScript engine Google Chrome uses to run the JavaScript on every web page. V8 compiles JavaScript directly to native machine code instead of interpreting it line by line, which is one of the reasons Node.js applications can be very fast. Node.js wraps V8 with extra APIs (for files, networking, processes, etc.) that make sense on a server but would not make sense — or would be a security risk — inside a browser.

| | Browser JavaScript | Node.js |
| :--- | :--- | :--- |
| **Engine** | V8 (Chrome), SpiderMonkey (Firefox)... | V8 |
| **Global object** | `window` | `global` |
| **Access to the file system** | No (sandboxed for security) | Yes |
| **Access to the DOM** | Yes | No |
| **Typical use** | Interactive web pages | Servers, CLIs, scripts, tooling |

**Common mistake:** assuming code that runs in the browser (like DOM manipulation with `document.querySelector`) will also work in Node.js, or the other way around. Both use the JavaScript language, but each exposes a different set of global APIs suited to its environment.

---

## 1.2. Installation & Environment Setup

*If Node.js is not installed on your machine yet, see the Installation Guide first, which covers installing Node.js directly and through nvm.*

Once installed, two commands come bundled together and are worth knowing well:

```bash

    node --version   # Shows the installed Node.js version
    npm --version     # Shows the installed npm version


```

**npm** (Node Package Manager) is not just for installing libraries — it also runs project scripts and manages versions. **nvm** (Node Version Manager), covered in the installation guide, solves a very common real-world problem: different projects on your machine may require different Node.js versions.

```bash

    node app.js        # Runs a JavaScript file with Node.js
    node               # Opens the interactive Node.js REPL (a live JavaScript console)


```

The **REPL** (Read-Eval-Print Loop) is useful for quickly testing a snippet of JavaScript without creating a file. Type `.exit` or press `Ctrl + C` twice to leave it.

**Common mistake:** running a project cloned from someone else without checking which Node.js version it expects (often listed in a `.nvmrc` file or an `"engines"` field in `package.json`). Using a much newer or older version can cause subtle bugs or installation failures.

---

## 1.3. Architecture: Event Loop & Async Model

Node.js runs JavaScript on a **single thread**, yet it can handle thousands of simultaneous connections without slowing down. The key is that Node.js is **non-blocking**: instead of waiting for a slow operation (reading a file, querying a database, making a network request) to finish before moving to the next line, it delegates that work and keeps executing other code. When the slow operation finishes, Node.js is notified and runs the corresponding callback.

This coordination is handled by the **Event Loop**, a continuously running cycle that checks whether there is finished work to hand back to your code.

```bash

    Your Code --> Node.js delegates slow work (I/O, timers...) --> Event Loop keeps checking
                                                                           |
                            Your Code <-- callback/promise runs  <--------+ (work finished)


```

**Blocking vs. non-blocking**, using file reading as an example:

```js

    const fs = require("fs");

    // Blocking (synchronous): the whole program freezes until the file is fully read
    const dataSync = fs.readFileSync("./data.txt", "utf-8");
    console.log("This runs only after the file is fully read");

    // Non-blocking (asynchronous): Node.js keeps running other code while the file is read
    fs.readFile("./data.txt", "utf-8", (err, data) => {
        console.log("This runs later, when reading finishes");
    });
    console.log("This runs immediately, before the file finishes reading");


```

Because callback-based code can quickly become hard to read when nested (informally called "callback hell"), modern Node.js code favors **Promises** and the `async`/`await` syntax, which express the same non-blocking behavior with code that reads top to bottom.

```js

    const fs = require("fs/promises");

    async function readData() {
        const data = await fs.readFile("./data.txt", "utf-8");
        console.log(data);
    }


```

**Common mistake:** using a `*Sync` function (like `readFileSync`) inside a server that handles many users at once. Since Node.js runs on a single thread, a blocking call freezes the **entire** server for every user until it finishes, not just the current request.

---

## 1.4. Essential Core Modules

Node.js ships with a set of built-in modules — no installation required — that cover the most common needs of a server-side program. `require` (or `import` in ESM syntax) loads them by name.

| Module | Purpose |
| :--- | :--- |
| `fs` | Read, write, and manage files and directories (**f**ile **s**ystem). |
| `path` | Build and manipulate file paths in a way that works on every operating system. |
| `os` | Get information about the machine Node.js is running on (CPU, memory, platform). |
| `events` | Create and listen to custom events with the `EventEmitter` class. |

```js

    const path = require("path");
    const os = require("os");
    const EventEmitter = require("events");

    // path: joins segments using the correct separator for the current OS ("/" or "\")
    const filePath = path.join(__dirname, "data", "file.txt");

    // os: basic information about the machine
    console.log(os.platform());   // e.g. "win32", "linux", "darwin"
    console.log(os.totalmem());   // Total memory in bytes

    // events: define and react to a custom event
    const emitter = new EventEmitter();
    emitter.on("userCreated", (name) => console.log(`Welcome, ${name}!`));
    emitter.emit("userCreated", "Alex");


```

**Common mistake:** building file paths by concatenating strings manually (e.g. `dir + "/" + file`). This breaks on Windows, which uses `\` instead of `/`. Always use `path.join()` or `path.resolve()` instead.

---

## 1.5. Package Management

Every Node.js project is described by a `package.json` file: it lists the project's name, version, scripts, and — most importantly — its **dependencies** (the external libraries it needs to run).

```bash

    npm init -y              # Creates a package.json with default values
    npm install express       # Installs a library and adds it to "dependencies"
    npm install --save-dev jest  # Installs a library needed only for development, under "devDependencies"
    npm install                # Installs every dependency already listed in package.json


```

Installed libraries are downloaded into a `node_modules` folder, and the exact version of every dependency (including dependencies of dependencies) is locked in a `package-lock.json` file, so the same versions are installed on every machine.

```json

    {
      "name": "my-project",
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

The `scripts` section defines shortcuts you run with `npm run <name>` (e.g. `npm run dev`), which is how most projects standardize commands like starting the server or running tests.

**Common mistake:** committing the `node_modules` folder to version control. It can contain tens of thousands of files and is entirely reproducible from `package.json` and `package-lock.json` by running `npm install`, so it should always be excluded via `.gitignore` instead.

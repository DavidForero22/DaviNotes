---
title: "React Installation Guide"
---

# React Installation Guide

This guide walks you through creating a new React project from scratch.

Several steps use the **terminal** (also called *command line*, *Command Prompt* or *PowerShell* on Windows): a window where you type commands instead of clicking buttons.

---

## 1. Prerequisites

React projects are created and run with **Node.js**, a program that runs JavaScript outside the browser. Installing Node.js also installs **npm** (Node Package Manager), the tool that downloads the libraries your project needs, React included.

- Download and install the **LTS** version (the recommended one) from the <a href="https://nodejs.org/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Official Node.js website">official Node.js website</a>. Version 20 or newer is required.

Then open a **new** terminal and check that both are installed:

```bash

    node -v
    npm -v


```

Each command should print a version number (for example, `v22.12.0` and `10.9.0`).

---

## 2. Create a New React Project

The recommended way to start a React project is with **Vite**, a tool that prepares the project structure and runs it very quickly.

```bash
    
    npm create vite@latest my-app -- --template react


```

This creates a folder called `my-app` with everything needed to start. You can replace `my-app` with any name you like (lowercase and without spaces is safest). If the tool asks you any questions, you can accept the default answers.

*Note: many older tutorials use `npx create-react-app`. That tool was officially deprecated in 2025 and is no longer recommended for new projects.*

---

## 3. Install the Dependencies

Move into the new folder and download the libraries the project needs:

```bash

    cd my-app
    npm install


```

`cd` (*change directory*) moves the terminal into a folder. `npm install` reads the list of dependencies in `package.json` and downloads them into a `node_modules` folder.

---

## 4. Start the Development Server

```bash

    npm run dev


```

Open your browser at `http://localhost:5173` to see your React app running. Every time you save a change in the code, the page updates automatically. Press `Ctrl+C` in the terminal to stop the server.

**Common mistake:** running the commands from the wrong folder. `npm` looks for the `package.json` file in the current folder, so it fails if you are not inside the project.

```bash

    # ❌ WRONG: still in the parent folder, where there is no package.json
    npm run dev
    # npm error enoent Could not read package.json

    # ✅ CORRECT: enter the project folder first
    cd my-app
    npm run dev


```

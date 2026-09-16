---
title: "Astro Installation Guide"
---

# Astro Installation Guide

This guide explains how to create a new Astro project on your computer.

Several steps use the **terminal** (also called *command line*, *Command Prompt* or *PowerShell* on Windows): a window where you type commands instead of clicking buttons.

---

## 1. Prerequisites

Astro needs **Node.js**, a program that runs JavaScript outside the browser. Installing it also installs **npm** (Node Package Manager), the tool that downloads the libraries a project needs.

- Download and install the **LTS** version (the recommended one) from the <a href="https://nodejs.org/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Official Node.js website">official Node.js website</a>.

Then open a **new** terminal and check that it works:

```bash

    node -v


```

It should print a version number, such as `v22.12.0`.

---

## 2. Create a New Project

Open the terminal in the folder where you want to save the project and run:

```bash

    # Launch the Astro setup wizard
    npm create astro@latest


```

A setup wizard will ask you a few questions, such as the name of the project folder and which template to start from. If you are not sure, the default answers are a good choice. When it asks whether to **install dependencies**, answer yes.

---

## 3. Start the Development Server

Once the project has been created:

1. Enter the new project folder with `cd` (*change directory*), using the name you chose:

```bash

    cd my-project


```

2. If you did not install the dependencies during the wizard, download them now:

```bash

    npm install


```

3. Start the development server:

```bash

    npm run dev


```

Open `http://localhost:4321` in your browser to see your site. The page updates automatically every time you save a change. Press `Ctrl+C` in the terminal to stop the server.

**Common mistake:** starting the server before installing the dependencies. Astro itself is one of those dependencies, so the command cannot be found.

```bash

    # ❌ WRONG: the node_modules folder does not exist yet
    npm run dev
    # 'astro' is not recognized as an internal or external command

    # ✅ CORRECT: install the dependencies first, then start the server
    npm install
    npm run dev


```

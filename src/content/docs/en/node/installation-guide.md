---
title: "Node.js Installation Guide"
---

# Node.js Installation Guide

**Node.js** is a JavaScript **runtime** that lets you run JavaScript outside the browser, directly on your machine or on a server. Installing it also installs **npm** (Node Package Manager), the tool you will use to install and manage libraries for your projects.

Instead of installing Node.js directly, most developers use a **version manager** such as **nvm**, which lets you install and switch between several Node.js versions on the same machine — useful since different projects often require different versions. This guide covers both the direct installation and the nvm approach.

---

## 1. Windows

<ol>
  <li>
    Go to the
    <a href="https://nodejs.org/"
       class="doc-link"
       target="_blank"
       rel="noopener noreferrer"
       title="Official Node.js Website">
       official Node.js website
    </a>
    and download the <strong>LTS</strong> (Long-Term Support) installer, the recommended version for most projects.
  </li>
  <li>
    Run the downloaded <code>.msi</code> file. The default options work well for beginners; make sure the checkbox to install the <strong>necessary tools</strong> for native modules stays checked.
  </li>
  <li>
    Restart any open terminal window after the installation finishes, so it picks up the new commands.
  </li>
</ol>

### Verify Installation

```bash

    node --version
    npm --version


```

You should see two version numbers, for example `v20.11.1` and `10.2.4`. `npm` is installed automatically together with Node.js.

---

## 2. macOS

<ol>
  <li>
    Go to the <a href="https://nodejs.org/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Official Node.js Website">official Node.js website</a> and download the macOS <strong>LTS</strong> installer.
  </li>
  <li>
    Alternatively, if you use <a href="https://brew.sh/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Homebrew">Homebrew</a> (a tool for installing software from the terminal), you can run the command below instead.
  </li>
</ol>

```bash

    brew install node


```

### Verify Installation

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

The version shipped by `apt` can lag several major versions behind the latest release. For anything beyond a quick test, prefer the **nvm** method described below, which always gives you an up-to-date, easily replaceable version.

### Verify Installation

```bash

    node --version
    npm --version


```

---

## 4. Recommended: nvm (Node Version Manager)

**nvm** installs Node.js versions in your user folder instead of system-wide, so you can have several versions side by side and switch between them per project, without needing administrator permissions.

```bash

    # macOS/Linux: download and run the install script
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

    # Restart your terminal, then install the latest LTS version
    nvm install --lts

    # Switch to a specific major version
    nvm use 20


```

On Windows, the official `nvm` does not work; use the separate <a href="https://github.com/coreybutler/nvm-windows" class="doc-link" target="_blank" rel="noopener noreferrer" title="nvm-windows">nvm-windows</a> tool instead, which provides equivalent `nvm install` and `nvm use` commands.

**Common mistake:** installing Node.js both through the official installer and through nvm, then wondering why a version change through `nvm use` does not seem to have any effect. Run `which node` (macOS/Linux) or `where node` (Windows) to check exactly which installation your terminal is actually using.

---

## 5. First-Time Setup

Before installing your first library, get familiar with the command that starts every Node.js project: it creates the file that will track your project's dependencies.

```bash

    mkdir my-project
    cd my-project
    npm init -y


```

`npm init -y` creates a `package.json` file with default values (the `-y` flag skips the interactive questionnaire). From here on, any library you install with `npm install <package>` will be recorded in this file automatically.

*Section 1.5 of the next guide covers `package.json` and dependency management in detail.*

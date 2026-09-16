---
title: "MongoDB Installation Guide"
---

# MongoDB Installation Guide

**MongoDB** is a **database server**, just like MySQL: a program that runs in the background and is responsible for storing and retrieving your data reliably. The difference is in *how* it stores that data — instead of rows and columns, MongoDB stores flexible, JSON-like records called **documents**, covered in detail in the next guide.

Installing MongoDB gives you the database server itself (`mongod`) plus **mongosh**, the command-line client you use to talk to it.

---

## 1. Windows

<ol>
  <li>
    Go to the
    <a href="https://www.mongodb.com/try/download/community"
       class="doc-link"
       target="_blank"
       rel="noopener noreferrer"
       title="MongoDB Community Server Download">
       MongoDB Community Server download page
    </a>
    and download the Windows <code>.msi</code> installer.
  </li>
  <li>
    Run the installer and choose <strong>"Complete"</strong> setup. Keep the option to install MongoDB as a <strong>Windows Service</strong> enabled, so the database server starts automatically in the background every time you turn on your computer.
  </li>
  <li>
    When prompted, also install <strong>MongoDB Compass</strong>, the official graphical tool (covered in section 4).
  </li>
</ol>

### Verify Installation

Open a **new** Command Prompt or PowerShell window and type:

```bash

    mongod --version


```

You should see a version number, for example `db version v7.0.5`.

---

## 2. macOS

<ol>
  <li>
    If you use <a href="https://brew.sh/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Homebrew">Homebrew</a> (a tool for installing software from the terminal), run the commands below.
  </li>
</ol>

```bash

    brew tap mongodb/brew
    brew install mongodb-community
    brew services start mongodb-community   # Starts the database server and keeps it running


```

### Verify Installation

```bash

    mongod --version


```

---

## 3. Linux (Ubuntu/Debian)

Installing MongoDB on Linux requires first adding MongoDB's own official package source, since most distributions do not include it by default:

```bash

    # Import MongoDB's public GPG key and add its package repository (commands vary slightly by version; see the official docs)
    curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

    sudo apt update
    sudo apt install mongodb-org

    sudo systemctl start mongod       # Starts the database server
    sudo systemctl enable mongod      # Makes it start automatically on every boot


```

### Verify Installation

```bash

    mongod --version


```

---

## 4. Connecting for the First Time

Once the server is running, connect to it through **mongosh** (the "Mongo Shell"), MongoDB's command-line client:

```bash

    mongosh


```

The prompt changes to `test>`, which means you are now "inside" MongoDB and can type commands directly. Type `exit` to leave.

```bash

    test> show dbs         // Lists every database currently on the server
    test> exit


```

**Common mistake:** expecting a semicolon `;` to be required at the end of every command, the way MySQL needs one. mongosh commands are plain JavaScript, so a semicolon is optional and a command runs as soon as you press Enter.

---

## 5. Optional: MongoDB Compass

Typing every command is not the only way to work with MongoDB. **MongoDB Compass** is the official graphical tool: it lets you browse documents, build queries by clicking through a visual builder, and see performance statistics, without typing a single command. It connects to the very same server mongosh does — they are just two different ways of talking to it.

*Section 1.1 of the next guide explains what a document actually is and how it compares to a traditional database table.*

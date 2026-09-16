---
title: "MySQL Installation Guide"
---

# MySQL Installation Guide

**MySQL** is a **database server**: a program that runs quietly in the background on your computer (or on a remote server) and is in charge of storing, organizing, and retrieving data — the same way a filing cabinet stores paperwork, except a database can search through millions of records in a fraction of a second.

Unlike a regular app you open by clicking an icon, a database server has no window of its own. You interact with it through a separate program called a **client**, either a command-line tool or a graphical one, that sends it instructions and shows you the results.

---

## 1. Windows

<ol>
  <li>
    Go to the
    <a href="https://dev.mysql.com/downloads/installer/"
       class="doc-link"
       target="_blank"
       rel="noopener noreferrer"
       title="Official MySQL Installer">
       official MySQL Installer page
    </a>
    and download <strong>MySQL Installer for Windows</strong> (choose the smaller "web" version unless you are offline during setup).
  </li>
  <li>
    Run the installer and choose the <strong>"Developer Default"</strong> setup type, which installs the database server together with a couple of useful tools.
  </li>
  <li>
    When asked, set a <strong>root password</strong>. The "root" account is the database's administrator account — write this password down somewhere safe, since you will need it every time you connect.
  </li>
  <li>
    Keep the option to run MySQL as a <strong>Windows Service</strong> enabled, so the database server starts automatically every time you turn on your computer.
  </li>
</ol>

### Verify Installation

Open a **new** Command Prompt or PowerShell window and type:

```bash

    mysql --version


```

You should see a version number, for example `mysql  Ver 8.0.36`.

---

## 2. macOS

<ol>
  <li>
    Go to the <a href="https://dev.mysql.com/downloads/mysql/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Official MySQL Community Downloads">official MySQL downloads page</a> and download the <code>.dmg</code> installer for macOS.
  </li>
  <li>
    Alternatively, if you use <a href="https://brew.sh/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Homebrew">Homebrew</a> (a tool for installing software from the terminal), you can run the command below instead.
  </li>
</ol>

```bash

    brew install mysql
    brew services start mysql   # Starts the database server and keeps it running


```

### Verify Installation

```bash

    mysql --version


```

---

## 3. Linux (Ubuntu/Debian)

```bash

    sudo apt update
    sudo apt install mysql-server
    sudo mysql_secure_installation   # Guided wizard to set a root password and remove insecure defaults


```

`mysql_secure_installation` asks a short series of yes/no questions — answering "yes" to all of them is the safe choice for a personal or learning setup.

### Verify Installation

```bash

    mysql --version


```

---

## 4. Connecting for the First Time

Once installed, connect to the server through the command-line client, providing the administrator username (`-u root`) and asking it to prompt for the password (`-p`):

```bash

    mysql -u root -p


```

After typing your password, the prompt changes to `mysql>`, which means you are now "inside" MySQL and can type commands directly. Type `exit` to leave.

```bash

    mysql> SHOW DATABASES;   -- Lists every database currently on the server
    mysql> exit


```

**Common mistake:** forgetting the semicolon `;` at the end of a command. MySQL treats every command as unfinished until it sees one, so a missing semicolon leaves the terminal waiting silently instead of showing an error.

---

## 5. Optional: Graphical Clients

Typing every command is not the only way to work with MySQL. **MySQL Workbench** (included in the Windows installer, or downloadable separately for macOS/Linux) provides a visual interface to browse tables, build queries by clicking, and design database diagrams. Other popular options include <a href="https://tableplus.com/" class="doc-link" target="_blank" rel="noopener noreferrer" title="TablePlus">TablePlus</a> and <a href="https://dbeaver.io/" class="doc-link" target="_blank" rel="noopener noreferrer" title="DBeaver">DBeaver</a>. None of these replace the MySQL server itself — they are just friendlier ways to talk to it.

*Section 1.1 of the next guide explains what a database server actually does and how it is organized internally.*

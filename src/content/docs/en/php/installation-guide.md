---
title: "PHP Installation Guide"
---

# PHP Installation Guide

To run PHP code you need the **PHP interpreter**: the program that reads your `.php` files and executes them. We recommend installing a recent stable version (PHP 8.3 or newer).

Several steps below use the **terminal** (also called *command line*, *Command Prompt* or *PowerShell* on Windows): a window where you type commands instead of clicking buttons.

---

## 1. Download & Install

**Windows**

<ol>
  <li>
    Download <strong>XAMPP</strong> (the easiest option) from the 
    <a href="https://www.apachefriends.org/" 
       class="doc-link" 
       target="_blank" 
       rel="noopener noreferrer"
       title="Download XAMPP from Apache Friends">
       Apache Friends website
    </a>. XAMPP is a free package that installs PHP together with a web server (Apache) and a database (MariaDB).
  </li>
  <li>
    Run the downloaded <code>.exe</code> file. During installation you can untick components you do not need, such as "FileZilla" or "Tomcat", to keep it light.
  </li>
  <li>
    <strong>Important:</strong> to use the <code>php</code> command in the terminal, add the PHP folder (usually <code>C:\xampp\php</code>) to the Windows <strong>PATH</strong>: the list of folders where Windows looks for programs. Search for "Edit the system environment variables" in the Start menu → <em>Environment Variables</em> → select <em>Path</em> → <em>Edit</em> → <em>New</em>, and paste the folder.
  </li>
</ol>

**macOS (via Homebrew)**

If you have <a href="https://brew.sh/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Homebrew">Homebrew</a> (a tool for installing software from the terminal), open the terminal and run:

```bash

    brew install php


```

**Linux (Debian/Ubuntu)**

Open the terminal and use `apt` (the Ubuntu package installer) to install PHP. `sudo` runs the command with administrator permissions, so it will ask for your password:

```bash

    sudo apt update
    sudo apt install php


```

---

## 2. Verify Installation

Once installed, **open a new terminal** (terminals that were already open do not see the change) and run:

```bash

    php -v


```

You should see something similar to this (the numbers depend on your version):

```bash

    PHP 8.3.14 (cli) (built: Nov 19 2024 15:14:02) (NTS)
    Copyright (c) The PHP Group
    Zend Engine v4.3.14, Copyright (c) Zend Technologies


```

---

## 3. Your First Program

Create a file named `hello.php` and paste the following code:

```php

    <?php
        echo "Hello, PHP!";
    ?>


```

You can run it directly in the terminal, from the same folder as the file:

```bash

    php hello.php

    # Output:
    # Hello, PHP!


```

To see it in the browser as a web page, start PHP's built-in development server in that folder:

```bash

    php -S localhost:8000


```

Then open `http://localhost:8000/hello.php` in your browser. Press `Ctrl+C` in the terminal to stop the server.

**Common mistake:** opening a `.php` file by double-clicking it. The browser cannot run PHP by itself, so it shows the code as text or downloads the file. PHP files must always be opened through a server.

```bash

    # ❌ WRONG: the browser opens the file directly and does not run the PHP code
    file:///C:/projects/hello.php

    # ✅ CORRECT: the server runs the PHP code and sends the resulting page
    http://localhost:8000/hello.php


```

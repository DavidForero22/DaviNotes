---
title: "Python Installation Guide"
---

# Python Installation Guide

Python is a powerful programming language known for its simplicity and readability. Whether you are interested in web development, data science or automating repetitive tasks, Python is an essential tool.

To run Python programs, your computer needs the **Python interpreter**: the program that reads your code and executes it. Follow the steps for your operating system.

Several steps use the **terminal** (called *Command Prompt* or *PowerShell* on Windows and *Terminal* on macOS and Linux): a window where you type commands instead of clicking buttons.

---

## 1. Windows

The easiest way to install Python on Windows is with the official installer.

<ol>
  <li>
    Go to the 
    <a href="https://www.python.org/downloads/" 
       class="doc-link" 
       target="_blank" 
       rel="noopener noreferrer"
       title="Official Python Website">
       official Python website
    </a>.
  </li>
  <li>
    Click the <strong>Download Python 3.x.x</strong> button (the latest version).
  </li>
  <li>
    Open the downloaded file.
  </li>
  <li>
    <strong>IMPORTANT:</strong> Before clicking "Install Now", tick the box that says:
    <blockquote>
      <strong>Add python.exe to PATH</strong>
    </blockquote>
    <em>The PATH is the list of folders where Windows looks for programs. If you skip this step, the terminal will not find Python.</em>
  </li>
  <li>
    Click <strong>Install Now</strong> and wait for the process to finish.
  </li>
</ol>

### Verify Installation

Open a **new** Command Prompt or PowerShell window and type:

```bash

    python --version


```

You should see the installed version, for example `Python 3.13.1`.

---

## 2. macOS

macOS may include an old version of Python used by the system itself. It is better to install the latest version separately so you do not interfere with those system tools.

<ol>
  <li>
    Visit the
    <a href="https://www.python.org/downloads/macos/" 
       class="doc-link" 
       target="_blank" 
       rel="noopener noreferrer"
       title="Python downloads for macOS">
       Python downloads page for macOS
    </a>.
  </li>
  <li>
    Download the <strong>macOS 64-bit universal2 installer</strong> of the latest version.
  </li>
  <li>
    Open the downloaded <code>.pkg</code> file and follow the installation wizard.
  </li>
</ol>

Alternatively, if you use <a href="https://brew.sh/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Homebrew">Homebrew</a> (a tool for installing software from the terminal), you can run:

```bash

    brew install python


```

### Verify Installation

On macOS you usually need to type `python3` instead of `python`:

```bash

    python3 --version


```

---

## 3. Linux (Ubuntu/Debian)

Most Linux distributions come with Python already installed. Even so, you can use the terminal to make sure you have it, along with `pip` (the tool that downloads extra Python packages).

Update the list of available packages and install Python. `sudo` runs the command with administrator permissions, so it will ask for your password:

```bash

    sudo apt update
    sudo apt install python3 python3-pip


```

### Verify Installation

```bash

    python3 --version


```

---

## 4. Running Your First Program

Create a file called `hello.py` with this content:

```python

    print("Hello, Python!")


```

Open the terminal in the same folder and run it (use `python` on Windows and `python3` on macOS and Linux):

```bash

    python hello.py

    # Output:
    # Hello, Python!


```

**Common mistake:** typing terminal commands inside the Python interactive mode. If you type just `python`, a `>>>` prompt appears: that is Python waiting for Python code, not for terminal commands. Type `exit()` to leave it.

```bash

    # ❌ WRONG: running a terminal command inside the >>> prompt
    >>> python hello.py
    SyntaxError: invalid syntax

    # ✅ CORRECT: exit Python first and run the command in the normal terminal
    >>> exit()
    python hello.py


```

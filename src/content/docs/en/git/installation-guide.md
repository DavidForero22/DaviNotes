---
title: "Git Installation Guide"
---

# Git Installation Guide

Git is the **version control system** almost every professional project relies on: it tracks the history of your files and lets you go back to any previous state. Unlike a regular app, Git works mainly from the **terminal** (called *Command Prompt* or *PowerShell* on Windows and *Terminal* on macOS and Linux), although several graphical programs (called **GUI clients**) exist to run the same operations by clicking instead of typing.

Throughout this series of guides you will see both the terminal **commands** and their **GUI** equivalent, so pick whichever fits how you like to work.

---

## 1. Windows

<ol>
  <li>
    Go to the
    <a href="https://git-scm.com/downloads"
       class="doc-link"
       target="_blank"
       rel="noopener noreferrer"
       title="Official Git Website">
       official Git website
    </a>
    and download the Windows installer.
  </li>
  <li>
    Run the downloaded file. The default options work well for beginners; the only screen worth paying attention to is the one that lets you choose the default text editor and the one that asks how to handle line endings (you can safely keep the recommended option).
  </li>
  <li>
    The installer also adds <strong>Git Bash</strong>, a terminal that understands Unix-style commands and is commonly used to run Git on Windows.
  </li>
</ol>

### Verify Installation

Open a **new** Command Prompt, PowerShell or Git Bash window and type:

```bash

    git --version


```

You should see the installed version, for example `git version 2.46.0.windows.1`.

---

## 2. macOS

<ol>
  <li>
    Open the <strong>Terminal</strong> app and type <code>git --version</code>.
  </li>
  <li>
    If Git is not installed yet, macOS will offer to install the <strong>Xcode Command Line Tools</strong>, which include Git. Accept and wait for the download to finish.
  </li>
</ol>

Alternatively, if you use <a href="https://brew.sh/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Homebrew">Homebrew</a> (a tool for installing software from the terminal), you can run:

```bash

    brew install git


```

### Verify Installation

```bash

    git --version


```

---

## 3. Linux (Ubuntu/Debian)

Update the list of available packages and install Git. `sudo` runs the command with administrator permissions, so it will ask for your password:

```bash

    sudo apt update
    sudo apt install git


```

### Verify Installation

```bash

    git --version


```

---

## 4. First-Time Setup

Before making your first commit, Git needs to know who you are, so every change gets signed with your name and email. You only have to do this once per machine:

```bash

    git config --global user.name "Your Name"
    git config --global user.email "you@example.com"


```

*Section 1.2 of the next guide covers this configuration step in detail.*

**Common mistake:** skipping this step and only noticing the problem after making several commits. If you forget, Git will refuse to commit and print a reminder, or it will use a generic author name that you will need to fix later.

---

## 5. Optional: Graphical Clients

The terminal is not the only way to use Git. If you prefer a visual workflow, you can install a **GUI client** such as <a href="https://desktop.github.com/" class="doc-link" target="_blank" rel="noopener noreferrer" title="GitHub Desktop">GitHub Desktop</a>, <a href="https://www.gitkraken.com/" class="doc-link" target="_blank" rel="noopener noreferrer" title="GitKraken">GitKraken</a> or <a href="https://www.sourcetreeapp.com/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Sourcetree">Sourcetree</a>. Most code editors (VS Code, JetBrains IDEs, etc.) also ship with built-in Git integration. None of these tools replace Git itself — they still need the `git` command installed on your machine to work.

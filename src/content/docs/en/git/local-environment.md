---
title: "Git Fundamentals & Local Environment"
---

# Fundamentals & Local Environment

Before collaborating with anyone else, it is worth understanding how Git thinks and mastering the basic workflow entirely on your own machine. This section covers the mental model behind Git and the daily commands you will use constantly, whether from the terminal or from a graphical client.

---

## Table of Contents

<div id="content-table">

- [1.1. Core Concepts](#11-core-concepts "What is a distributed VCS and the 3 states of Git")
- [1.2. Initial Configuration](#12-initial-configuration "Set your identity for every commit")
- [1.3. Creating & Initializing Projects](#13-creating--initializing-projects "git init and git clone")
- [1.4. The Daily Work Cycle](#14-the-daily-work-cycle "status, add, commit and log")

</div>

---

## 1.1. Core Concepts

### What is a distributed version control system?

A **version control system (VCS)** keeps a history of every change made to a set of files, so you can review who changed what, compare versions, and go back if something breaks. Git is a **distributed** VCS: every developer has a full copy of the project's history on their own computer, not just the files.

| | Centralized VCS | Distributed VCS (Git) |
| :--- | :--- | :--- |
| **Where is the history?** | Only on a central server. | A full copy on every developer's machine. |
| **Working offline** | Limited — most actions need the server. | You can commit, branch and browse history offline. |
| **Single point of failure** | Yes, if the server goes down. | No, any clone can restore the project. |

### The 3 states of Git

Every file in a Git project moves through three areas. Understanding this flow is the key to understanding almost every Git command:

| State | Description |
| :--- | :--- |
| **Working Directory** | The actual files on disk, where you edit code. Changes here are not tracked by Git yet. |
| **Staging Area (Index)** | A "waiting room" for changes you have marked with `git add`, ready to be included in the next commit. |
| **Repository (HEAD)** | The permanent history: once you run `git commit`, the staged changes are saved here as a new snapshot. |

```bash

    Working Directory  --( git add )-->  Staging Area  --( git commit )-->  Repository


```

---

## 1.2. Initial Configuration

Git signs every commit with an author name and email, so it needs to know who you are before you start working. This is a one-time setup per machine (or per project, if you use a different identity for a specific repository):

```bash

    git config --global user.name "Your Name"
    git config --global user.email "you@example.com"


```

`--global` applies the setting to every repository on your machine. Running the same commands without `--global` inside a specific project overrides it just for that project.

**GUI:** graphical clients expose the same setting in a general **Settings** or **Preferences** menu, usually under a "Git" or "Profile" section, where you fill in your name and email once.

**Common mistake:** committing before configuring your identity, or configuring a work email globally and accidentally using it for personal projects. Check the current configuration at any time with `git config --list`.

---

## 1.3. Creating & Initializing Projects

There are two ways to get a Git project on your machine: starting a brand new one, or copying an existing one.

```bash

    # Turn the current folder into a new Git repository
    git init

    # Copy an existing repository (and its full history) from a URL
    git clone <url>


```

`git init` creates a hidden `.git` folder in the current directory — that folder *is* the repository; deleting it removes all Git history while leaving your files untouched. `git clone` does this automatically and also downloads every commit from the remote.

**GUI:** clients show this as a **"New Repository"** button (equivalent to `git init`) and a **"Clone"** button that asks for a URL (equivalent to `git clone`).

---

## 1.4. The Daily Work Cycle

This is the loop you will repeat constantly: check what changed, choose what to include, and save a snapshot.

```bash

    git status          # See which files changed, staged or not
    git add <file>       # Move a change to the Staging Area
    git commit -m "Message describing the change"
    git log --oneline    # Browse the project's history, one line per commit


```

**GUI:** the file panel lists modified files with a checkbox (or drag action) to stage them, a text box below for the commit message and a **"Commit"** button, and a history/tree view equivalent to `git log`.

**Common mistake:** running `git commit` without staging anything first (`git commit -m "..."` alone will error or commit nothing new if there are no staged changes), and writing vague commit messages like `"fix"` or `"update"` that give future-you no useful information.

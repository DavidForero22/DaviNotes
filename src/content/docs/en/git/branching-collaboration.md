---
title: "Git Branching & Remote Collaboration"
---

# Branching & Remote Collaboration

Once you are comfortable working solo, the next step is learning to work in parallel on isolated features and to sync your changes with remote platforms like GitHub, GitLab or Bitbucket.

---

## Table of Contents

<div id="content-table">

- [2.1. Branch Management](#21-branch-management "Why and how to create branches")
- [2.2. Integrating Changes (Merging)](#22-integrating-changes-merging "Fast-forward vs. three-way merge")
- [2.3. Resolving Conflicts](#23-resolving-conflicts "Understanding and fixing merge conflicts")
- [2.4. Remote Synchronization](#24-remote-synchronization "fetch, pull and push")

</div>

---

## 2.1. Branch Management

A **branch** is an independent line of development: it lets you work on a new feature or a fix without touching the stable code other people depend on. Under the hood, a branch is just a movable pointer to a specific commit, which is why creating one in Git is instant and cheap.

A common naming strategy prefixes the branch with the type of work, for example `feature/login-form`, `fix/navbar-overflow` or `docs/readme-update`, so anyone can tell at a glance what a branch is for.

```bash

    git branch                  # List local branches
    git branch new-feature       # Create a branch (stays on the current one)
    git checkout -b new-feature  # Create AND switch to the new branch
    git switch -c new-feature    # Same as above, using the newer "switch" command


```

**GUI:** a branch dropdown (usually in the top bar) lists existing branches and lets you switch between them, plus a **"New Branch"** option that creates one visually from the branch you currently have checked out.

---

## 2.2. Integrating Changes (Merging)

**Merging** brings the changes from one branch into another. Git resolves this in one of two ways:

| Type | When it happens | What it looks like |
| :--- | :--- | :--- |
| **Fast-forward** | The target branch has no new commits since the other branch was created. | Git simply moves the branch pointer forward — no new commit is created. |
| **Three-way merge** | Both branches have new commits since they diverged. | Git creates a new **merge commit** that combines both histories, using the two branch tips plus their common ancestor. |

```bash

    git checkout main    # Move to the branch that will receive the changes
    git merge new-feature # Bring the changes from "new-feature" into "main"


```

**GUI:** an option like **"Merge branch into current"**, triggered either by dragging one branch onto another in the graph, or by right-clicking a branch and selecting it from the tree view.

---

## 2.3. Resolving Conflicts

A **conflict** happens when Git cannot automatically decide how to combine two changes — usually because both branches edited the same lines of the same file. Git pauses the merge and marks the file with conflict markers for you to resolve by hand:

```bash

    <<<<<<< HEAD
    This is the version from your current branch.
    =======
    This is the version from the branch being merged.
    >>>>>>> new-feature


```

Everything between `<<<<<<< HEAD` and `=======` is your current branch's version; everything between `=======` and `>>>>>>> new-feature` is the incoming version. Edit the file to keep the content you want (removing the markers themselves), then stage it to tell Git the conflict is resolved:

```bash

    git add <file>
    git commit


```

**GUI:** clients provide a **side-by-side diff / merge tool** that shows both versions next to each other with buttons to accept one side, the other, or both, instead of editing the markers by hand.

**Common mistake:** committing a file that still contains the `<<<<<<<`, `=======` or `>>>>>>>` markers because they were missed while resolving — always search the file for these symbols before committing.

---

## 2.4. Remote Synchronization

A **remote** is a version of your repository hosted elsewhere (like GitHub). Connecting to one lets you exchange commits with your team.

```bash

    git remote add origin <url>  # Link a remote named "origin" to this repository
    git fetch                     # Download new commits from the remote, without merging them
    git pull                      # Download AND merge new commits into your current branch
    git push                      # Upload your local commits to the remote


```

`git fetch` is the safe way to see what changed remotely before deciding what to do with it; `git pull` is essentially `git fetch` followed by `git merge`.

**GUI:** direct **Fetch**, **Pull** and **Push** buttons, usually paired with indicators showing how many commits you are ahead or behind the remote.

**Common mistake:** running `git pull` on a branch with unstaged local changes, causing avoidable conflicts — commit or `stash` your work first (see section 3.1). Also, avoid force-pushing (`git push --force`) to a branch other people are working on, since it can overwrite their commits.

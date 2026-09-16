---
title: "Advanced Git Control & Fixing Mistakes"
---

# Advanced Control & Fixing Mistakes

Mistakes happen to everyone. This section gives you the tools to solve common problems, safely travel back in time, and keep a clean, readable history.

---

## Table of Contents

<div id="content-table">

- [3.1. Temporary Work & Discarding Changes](#31-temporary-work--discarding-changes "restore and stash")
- [3.2. Rewriting History & Fixing Mistakes](#32-rewriting-history--fixing-mistakes "amend, reset and revert")
- [3.3. Advanced Reorganization (Rebase & Cherry-pick)](#33-advanced-reorganization-rebase--cherry-pick "When to rebase and how to cherry-pick")

</div>

---

## 3.1. Temporary Work & Discarding Changes

Sometimes you want to throw away changes you have not committed yet, or set them aside without committing them at all.

```bash

    git restore <file>   # Discard uncommitted changes in a file, back to the last commit

    git stash             # Temporarily save all uncommitted changes and clean the working directory
    git stash pop          # Restore the most recently stashed changes


```

`git stash` is useful when you need to switch branches quickly but are not ready to commit your current work — for example, to fix an urgent bug on another branch.

**GUI:** a right-click **"Discard changes"** option on a modified file (equivalent to `git restore`), and a dedicated **Stashes** panel listing everything you have saved for later.

---

## 3.2. Rewriting History & Fixing Mistakes

| Command | What it does | Safe on shared/pushed commits? |
| :--- | :--- | :--- |
| `git commit --amend` | Replaces the last commit with a new one (new message and/or new staged changes). | Only if nobody else has pulled it yet. |
| `git reset --soft <commit>` | Moves the branch back to `<commit>`, keeping all changes staged. | No — rewrites history. |
| `git reset --hard <commit>` | Moves the branch back to `<commit>` and **discards** every change since then. | No — rewrites history and loses work. |
| `git revert <commit>` | Creates a **new** commit that undoes `<commit>`, keeping the original in history. | Yes — safe for shared branches. |

```bash

    git commit --amend -m "Corrected message"

    git reset --soft HEAD~1   # Undo the last commit, keep its changes staged
    git reset --hard HEAD~1   # Undo the last commit and its changes completely

    git revert HEAD            # Safely undo the last commit with a new commit


```

**GUI:** an **"Amend"** option to modify the last commit, a way to reset the branch to a specific commit selected from the graph, and a **"Revert commit"** action in the tree's context menu.

**Common mistake:** using `git reset --hard` or `git commit --amend` on commits that have already been pushed and pulled by others. Since these rewrite history, your teammates' local copies will diverge and cause confusing conflicts. On shared branches, prefer `git revert`.

---

## 3.3. Advanced Reorganization (Rebase & Cherry-pick)

**Rebase** replays your branch's commits on top of another branch, producing a linear history without a merge commit. It is powerful, but it also rewrites commit hashes — this is the **golden rule of rebasing**: never rebase a branch that other people have already pulled or are working on; only rebase your own local, unpushed work.

| | `git merge` | `git rebase` |
| :--- | :--- | :--- |
| **History** | Preserves the exact history, adds a merge commit. | Rewrites history into a straight line. |
| **Safety** | Always safe, even on shared branches. | Only safe on private, unpushed branches. |
| **Best for** | Integrating finished work into a shared branch. | Cleaning up your own branch before sharing it. |

```bash

    git rebase main          # Replay the current branch's commits on top of "main"

    git cherry-pick <hash>    # Apply a single commit from another branch onto the current one


```

`git cherry-pick` is handy when you only need one specific commit from another branch, rather than the entire branch.

**GUI:** drag-and-drop a commit onto another branch in the graph, or an explicit **"Rebase onto..."** option available on a branch or commit.

**Common mistake:** rebasing a public or shared branch. Since rebase creates new commits with new hashes, everyone who already has the old commits will see a rewritten history and run into conflicts the next time they sync.

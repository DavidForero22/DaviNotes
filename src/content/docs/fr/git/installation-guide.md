---
title: "Guide d'installation de Git"
---

# Guide d'installation de Git

Git est le **système de contrôle de version** sur lequel repose presque tout projet professionnel : il enregistre l'historique de vos fichiers et vous permet de revenir à n'importe quel état précédent. Contrairement à une application classique, Git fonctionne principalement depuis le **terminal** (appelé *Invite de commandes* ou *PowerShell* sous Windows et *Terminal* sous macOS et Linux), même si des programmes graphiques (appelés **clients GUI**) existent pour effectuer les mêmes opérations en cliquant plutôt qu'en tapant.

Tout au long de cette série de guides, vous verrez à la fois les **commandes** du terminal et leur équivalent en **GUI** : choisissez celui qui correspond le mieux à votre façon de travailler.

---

## 1. Windows

<ol>
  <li>
    Rendez-vous sur le
    <a href="https://git-scm.com/downloads"
       class="doc-link"
       target="_blank"
       rel="noopener noreferrer"
       title="Site officiel de Git">
       site officiel de Git
    </a>
    et téléchargez l'installateur pour Windows.
  </li>
  <li>
    Lancez le fichier téléchargé. Les options par défaut conviennent très bien pour débuter ; les seuls écrans qui méritent votre attention sont celui de l'éditeur de texte par défaut et celui qui demande comment gérer les fins de ligne (vous pouvez garder l'option recommandée sans problème).
  </li>
  <li>
    L'installateur ajoute aussi <strong>Git Bash</strong>, un terminal qui comprend les commandes de style Unix et qui est couramment utilisé pour travailler avec Git sous Windows.
  </li>
</ol>

### Vérifier l'installation

Ouvrez une **nouvelle** fenêtre d'invite de commandes, PowerShell ou Git Bash et tapez :

```bash

    git --version


```

Vous devriez voir la version installée, par exemple `git version 2.46.0.windows.1`.

---

## 2. macOS

<ol>
  <li>
    Ouvrez l'application <strong>Terminal</strong> et tapez <code>git --version</code>.
  </li>
  <li>
    Si Git n'est pas encore installé, macOS vous proposera d'installer les <strong>Xcode Command Line Tools</strong>, qui l'incluent. Acceptez et attendez la fin du téléchargement.
  </li>
</ol>

Autre solution, si vous utilisez <a href="https://brew.sh/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Homebrew">Homebrew</a> (un outil pour installer des logiciels depuis le terminal), vous pouvez exécuter :

```bash

    brew install git


```

### Vérifier l'installation

```bash

    git --version


```

---

## 3. Linux (Ubuntu/Debian)

Mettez à jour la liste des paquets disponibles puis installez Git. `sudo` exécute la commande avec les droits administrateur, il vous demandera donc votre mot de passe :

```bash

    sudo apt update
    sudo apt install git


```

### Vérifier l'installation

```bash

    git --version


```

---

## 4. Configuration initiale

Avant de faire votre premier commit, Git a besoin de savoir qui vous êtes, afin que chaque modification soit signée avec votre nom et votre e-mail. Cette étape ne se fait qu'une seule fois par machine :

```bash

    git config --global user.name "Votre Nom"
    git config --global user.email "vous@exemple.com"


```

*La section 1.2 du guide suivant détaille cette configuration.*

**Erreur courante :** sauter cette étape et ne s'en apercevoir qu'après plusieurs commits. Si vous l'oubliez, Git peut refuser de valider le commit et afficher un avertissement, ou utiliser un nom d'auteur générique qu'il faudra corriger plus tard.

---

## 5. Optionnel : clients graphiques

Le terminal n'est pas la seule façon d'utiliser Git. Si vous préférez un flux de travail visuel, vous pouvez installer un **client GUI** comme <a href="https://desktop.github.com/" class="doc-link" target="_blank" rel="noopener noreferrer" title="GitHub Desktop">GitHub Desktop</a>, <a href="https://www.gitkraken.com/" class="doc-link" target="_blank" rel="noopener noreferrer" title="GitKraken">GitKraken</a> ou <a href="https://www.sourcetreeapp.com/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Sourcetree">Sourcetree</a>. La plupart des éditeurs de code (VS Code, IDEs JetBrains, etc.) intègrent également Git. Aucun de ces outils ne remplace Git lui-même : ils ont toujours besoin de la commande `git` installée sur votre machine pour fonctionner.

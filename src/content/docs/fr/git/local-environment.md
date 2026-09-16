---
title: "Fondamentaux de Git et environnement local"
---

# Fondamentaux et environnement local

Avant de collaborer avec quelqu'un d'autre, il est utile de comprendre l'état d'esprit de Git et de maîtriser le flux de travail de base entièrement sur votre propre machine. Cette section couvre le modèle mental derrière Git ainsi que les commandes quotidiennes que vous utiliserez constamment, que ce soit depuis le terminal ou depuis un client graphique.

---

## Table des matières

<div id="content-table">

- [1.1. Concepts fondamentaux](#11-concepts-fondamentaux "Qu'est-ce qu'un VCS distribué et les 3 états de Git")
- [1.2. Configuration initiale](#12-configuration-initiale "Définir votre identité pour chaque commit")
- [1.3. Création et initialisation de projets](#13-création-et-initialisation-de-projets "git init et git clone")
- [1.4. Le cycle de travail quotidien](#14-le-cycle-de-travail-quotidien "status, add, commit et log")

</div>

---

## 1.1. Concepts fondamentaux

### Qu'est-ce qu'un système de contrôle de version distribué ?

Un **système de contrôle de version (VCS)** conserve un historique de chaque modification apportée à un ensemble de fichiers, afin que vous puissiez voir qui a changé quoi, comparer des versions et revenir en arrière si quelque chose casse. Git est un VCS **distribué** : chaque développeur possède une copie complète de l'historique du projet sur son propre ordinateur, pas seulement les fichiers.

| | VCS centralisé | VCS distribué (Git) |
| :--- | :--- | :--- |
| **Où est l'historique ?** | Uniquement sur un serveur central. | Une copie complète sur la machine de chaque développeur. |
| **Travail hors ligne** | Limité — la plupart des actions nécessitent le serveur. | Vous pouvez commiter, créer des branches et consulter l'historique hors ligne. |
| **Point unique de défaillance** | Oui, si le serveur tombe. | Non, n'importe quel clone peut restaurer le projet. |

### Les 3 états de Git

Chaque fichier d'un projet Git traverse trois zones. Comprendre ce flux est la clé pour comprendre presque toutes les commandes Git :

| État | Description |
| :--- | :--- |
| **Working Directory** (Répertoire de travail) | Les fichiers réels sur le disque, là où vous modifiez le code. Les changements ici ne sont pas encore suivis par Git. |
| **Staging Area (Index)** (Zone de préparation) | Une "salle d'attente" pour les changements que vous avez marqués avec `git add`, prêts à être inclus dans le prochain commit. |
| **Repository (HEAD)** (Dépôt) | L'historique permanent : une fois `git commit` exécuté, les changements préparés y sont enregistrés comme un nouvel instantané. |

```bash

    Répertoire de Travail  --( git add )-->  Staging Area  --( git commit )-->  Dépôt


```

---

## 1.2. Configuration initiale

Git signe chaque commit avec un nom d'auteur et un e-mail, il a donc besoin de savoir qui vous êtes avant que vous commenciez à travailler. Cette configuration se fait une seule fois par machine (ou par projet, si vous utilisez une identité différente pour un dépôt particulier) :

```bash

    git config --global user.name "Votre Nom"
    git config --global user.email "vous@exemple.com"


```

`--global` applique le réglage à tous les dépôts de votre machine. Exécuter les mêmes commandes sans `--global` dans un projet précis le remplace uniquement pour ce projet.

**GUI :** les clients graphiques exposent le même réglage dans un menu général **Paramètres** ou **Préférences**, généralement sous une section "Git" ou "Profil", où vous renseignez votre nom et votre e-mail une seule fois.

**Erreur courante :** commiter avant d'avoir configuré son identité, ou configurer un e-mail professionnel de façon globale et l'utiliser par erreur sur des projets personnels. Vérifiez la configuration actuelle à tout moment avec `git config --list`.

---

## 1.3. Création et initialisation de projets

Il existe deux façons d'obtenir un projet Git sur votre machine : en démarrer un tout nouveau, ou en copier un qui existe déjà.

```bash

    # Transformer le dossier actuel en un nouveau dépôt Git
    git init

    # Copier un dépôt existant (avec tout son historique) depuis une URL
    git clone <url>


```

`git init` crée un dossier caché `.git` dans le répertoire actuel — ce dossier *est* le dépôt ; le supprimer efface tout l'historique Git sans toucher à vos fichiers. `git clone` fait cela automatiquement et télécharge en plus tous les commits du dépôt distant.

**GUI :** les clients affichent cela sous la forme d'un bouton **"New Repository"** (équivalent à `git init`) et d'un bouton **"Clone"** qui demande une URL (équivalent à `git clone`).

---

## 1.4. Le cycle de travail quotidien

Voici la boucle que vous répéterez constamment : vérifier ce qui a changé, choisir quoi inclure, et enregistrer un instantané.

```bash

    git status            # Voir quels fichiers ont changé, préparés ou non
    git add <fichier>     # Déplacer un changement vers la Staging Area
    git commit -m "Message décrivant le changement"
    git log --oneline     # Parcourir l'historique du projet, une ligne par commit


```

**GUI :** le panneau de fichiers liste les fichiers modifiés avec une case à cocher (ou un glisser-déposer) pour les préparer, une zone de texte en dessous pour le message de commit et un bouton **"Commit"**, ainsi qu'une vue en arbre/historique équivalente à `git log`.

**Erreur courante :** exécuter `git commit` sans avoir rien préparé au préalable (`git commit -m "..."` seul renverra une erreur ou ne validera rien de nouveau s'il n'y a aucun changement dans la Staging Area), et écrire des messages de commit vagues comme `"fix"` ou `"update"` qui n'apportent aucune information utile plus tard.

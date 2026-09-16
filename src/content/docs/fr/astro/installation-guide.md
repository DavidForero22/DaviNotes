---
title: "Guide d'installation d'Astro"
---

# Guide d'installation d'Astro

Ce guide explique comment créer un nouveau projet Astro sur votre ordinateur.

Plusieurs étapes utilisent le **terminal** (aussi appelé *ligne de commande*, *Invite de commandes* ou *PowerShell* sous Windows) : une fenêtre où l'on tape des commandes au lieu de cliquer sur des boutons.

---

## 1. Prérequis

Astro a besoin de **Node.js**, un programme qui exécute du JavaScript en dehors du navigateur. Son installation installe aussi **npm** (Node Package Manager, « gestionnaire de paquets de Node »), l'outil qui télécharge les bibliothèques dont un projet a besoin.

- Téléchargez et installez la version **LTS** (celle recommandée) depuis le <a href="https://nodejs.org/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Site officiel de Node.js">site officiel de Node.js</a>.

Ouvrez ensuite un **nouveau** terminal et vérifiez que tout fonctionne :

```bash

    node -v


```

La commande doit afficher un numéro de version, comme `v22.12.0`.

---

## 2. Créer un nouveau projet

Ouvrez le terminal dans le dossier où vous voulez enregistrer le projet et lancez :

```bash

    # Lancer l'assistant d'installation d'Astro
    npm create astro@latest


```

Un assistant vous posera quelques questions, comme le nom du dossier du projet ou le modèle de départ. En cas de doute, les réponses par défaut sont un bon choix. Quand il vous demande s'il faut **installer les dépendances** (*install dependencies*), répondez oui.

---

## 3. Lancer le serveur de développement

Une fois le projet créé :

1. Entrez dans le dossier du nouveau projet avec `cd` (*change directory*, « changer de dossier »), en utilisant le nom choisi :

```bash

    cd my-project


```

2. Si vous n'avez pas installé les dépendances pendant l'assistant, téléchargez-les maintenant :

```bash

    npm install


```

3. Lancez le serveur de développement :

```bash

    npm run dev


```

Ouvrez `http://localhost:4321` dans votre navigateur pour voir votre site. La page se met à jour automatiquement à chaque enregistrement. Appuyez sur `Ctrl+C` dans le terminal pour arrêter le serveur.

**Erreur fréquente :** lancer le serveur avant d'installer les dépendances. Astro lui-même fait partie de ces dépendances : la commande est donc introuvable.

```bash

    # ❌ INCORRECT : le dossier node_modules n'existe pas encore
    npm run dev
    # 'astro' n'est pas reconnu en tant que commande interne ou externe

    # ✅ CORRECT : on installe d'abord les dépendances, puis on lance le serveur
    npm install
    npm run dev


```

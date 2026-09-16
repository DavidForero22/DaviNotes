---
title: "Guide d'installation de React"
---

# Guide d'installation de React

Ce guide vous accompagne pas à pas dans la création d'un projet React à partir de zéro.

Plusieurs étapes utilisent le **terminal** (aussi appelé *ligne de commande*, *Invite de commandes* ou *PowerShell* sous Windows) : une fenêtre où l'on tape des commandes au lieu de cliquer sur des boutons.

---

## 1. Prérequis

Les projets React se créent et s'exécutent avec **Node.js**, un programme qui exécute du JavaScript en dehors du navigateur. L'installation de Node.js installe aussi **npm** (Node Package Manager, « gestionnaire de paquets de Node »), l'outil qui télécharge les bibliothèques dont votre projet a besoin, React compris.

- Téléchargez et installez la version **LTS** (celle recommandée) depuis le <a href="https://nodejs.org/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Site officiel de Node.js">site officiel de Node.js</a>. La version 20 ou plus récente est nécessaire.

Ouvrez ensuite un **nouveau** terminal et vérifiez que les deux sont installés :

```bash

    node -v
    npm -v


```

Chaque commande doit afficher un numéro de version (par exemple `v22.12.0` et `10.9.0`).

---

## 2. Créer un projet React

La méthode recommandée pour démarrer un projet React est d'utiliser **Vite**, un outil qui prépare la structure du projet et l'exécute très rapidement.

```bash
    
    npm create vite@latest my-app -- --template react


```

Cela crée un dossier nommé `my-app` contenant tout le nécessaire pour commencer. Vous pouvez remplacer `my-app` par le nom de votre choix (en minuscules et sans espaces, c'est plus sûr). Si l'outil vous pose des questions, vous pouvez accepter les réponses par défaut.

*Remarque : de nombreux anciens tutoriels utilisent `npx create-react-app`. Cet outil est officiellement obsolète depuis 2025 et n'est plus recommandé pour les nouveaux projets.*

---

## 3. Installer les dépendances

Entrez dans le nouveau dossier et téléchargez les bibliothèques dont le projet a besoin :

```bash

    cd my-app
    npm install


```

`cd` (*change directory*, « changer de dossier ») déplace le terminal dans un dossier. `npm install` lit la liste des dépendances dans `package.json` et les télécharge dans un dossier `node_modules`.

---

## 4. Lancer le serveur de développement

```bash

    npm run dev


```

Ouvrez votre navigateur à l'adresse `http://localhost:5173` pour voir votre application React fonctionner. Chaque fois que vous enregistrez une modification dans le code, la page se met à jour automatiquement. Appuyez sur `Ctrl+C` dans le terminal pour arrêter le serveur.

**Erreur fréquente :** lancer les commandes depuis le mauvais dossier. `npm` cherche le fichier `package.json` dans le dossier actuel : il échoue donc si vous n'êtes pas dans le projet.

```bash

    # ❌ INCORRECT : on est encore dans le dossier parent, où il n'y a pas de package.json
    npm run dev
    # npm error enoent Could not read package.json

    # ✅ CORRECT : on entre d'abord dans le dossier du projet
    cd my-app
    npm run dev


```

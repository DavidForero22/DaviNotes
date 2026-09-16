---
title: "Fondamentaux et premiers pas avec Node.js"
---

# Fondamentaux et Premiers Pas

Avant de construire quoi que ce soit avec Node.js, il est utile de comprendre ce qu'il est réellement, comment il exécute votre code en coulisses, et comment utiliser les outils fournis avec lui. Cette section couvre le modèle mental derrière le moteur asynchrone de Node et les modules natifs que vous utiliserez constamment.

---

## Table des matières

<div id="content-table">

- [1.1. Introduction à Node.js et au moteur V8](#11-introduction-à-nodejs-et-au-moteur-v8 "Ce qu'est Node.js et comment il exécute JavaScript")
- [1.2. Installation et configuration de l'environnement](#12-installation-et-configuration-de-lenvironnement "npm et nvm, au-delà de l'installation initiale")
- [1.3. Architecture : Event Loop et modèle asynchrone](#13-architecture--event-loop-et-modèle-asynchrone "Le Non-blocking I/O expliqué")
- [1.4. Modules essentiels du système](#14-modules-essentiels-du-système "fs, path, os et events")
- [1.5. Gestion des paquets](#15-gestion-des-paquets "package.json et dépendances")

</div>

---

## 1.1. Introduction à Node.js et au moteur V8

**Node.js** n'est ni un langage ni un framework : c'est un **environnement d'exécution** qui permet d'exécuter du code JavaScript en dehors d'un navigateur web. Avant l'existence de Node.js (2009), JavaScript ne pouvait s'exécuter qu'à l'intérieur des navigateurs, ce qui empêchait de l'utiliser pour créer des serveurs, des outils en ligne de commande ou des scripts accédant au système de fichiers.

Node.js est construit sur **V8**, le même moteur JavaScript que Google Chrome utilise pour exécuter le JavaScript de chaque page web. V8 compile le JavaScript directement en code machine natif au lieu de l'interpréter ligne par ligne, ce qui explique en partie pourquoi les applications Node.js peuvent être très rapides. Node.js enveloppe V8 avec des API supplémentaires (fichiers, réseau, processus, etc.) qui ont du sens sur un serveur mais qui n'en auraient pas — ou représenteraient un risque de sécurité — dans un navigateur.

| | JavaScript dans le navigateur | Node.js |
| :--- | :--- | :--- |
| **Moteur** | V8 (Chrome), SpiderMonkey (Firefox)... | V8 |
| **Objet global** | `window` | `global` |
| **Accès au système de fichiers** | Non (isolé pour la sécurité) | Oui |
| **Accès au DOM** | Oui | Non |
| **Usage typique** | Pages web interactives | Serveurs, CLI, scripts, outillage |

**Erreur courante :** supposer que le code qui fonctionne dans le navigateur (comme manipuler le DOM avec `document.querySelector`) fonctionnera aussi dans Node.js, ou l'inverse. Les deux utilisent le langage JavaScript, mais chacun expose un ensemble différent d'API globales adaptées à son environnement.

---

## 1.2. Installation et configuration de l'environnement

*Si Node.js n'est pas encore installé sur votre machine, consultez d'abord le Guide d'installation, qui couvre l'installation directe et via nvm.*

Une fois installées, deux commandes fournies ensemble méritent d'être bien connues :

```bash

    node --version   # Affiche la version de Node.js installée
    npm --version     # Affiche la version de npm installée


```

**npm** (Node Package Manager) ne sert pas seulement à installer des librairies : il exécute aussi les scripts du projet et gère les versions. **nvm** (Node Version Manager), présenté dans le guide d'installation, résout un problème très courant en pratique : différents projets sur votre machine peuvent exiger différentes versions de Node.js.

```bash

    node app.js        # Exécute un fichier JavaScript avec Node.js
    node               # Ouvre le REPL interactif de Node.js (une console JavaScript en direct)


```

Le **REPL** (Read-Eval-Print Loop) est utile pour tester rapidement un extrait de JavaScript sans créer de fichier. Tapez `.exit` ou appuyez deux fois sur `Ctrl + C` pour le quitter.

**Erreur courante :** exécuter un projet cloné depuis quelqu'un d'autre sans vérifier quelle version de Node.js il attend (souvent indiquée dans un fichier `.nvmrc` ou le champ `"engines"` de `package.json`). Utiliser une version beaucoup plus récente ou plus ancienne peut causer des bugs subtils ou des échecs d'installation.

---

## 1.3. Architecture : Event Loop et modèle asynchrone

Node.js exécute JavaScript sur un **thread unique**, et pourtant il peut gérer des milliers de connexions simultanées sans ralentir. La clé est que Node.js est **non-blocking** (non bloquant) : au lieu d'attendre qu'une opération lente (lire un fichier, interroger une base de données, faire une requête réseau) se termine avant de passer à la ligne suivante, il délègue ce travail et continue d'exécuter le reste du code. Quand l'opération lente se termine, Node.js en est informé et exécute le callback correspondant.

Cette coordination est gérée par l'**Event Loop**, un cycle qui tourne en continu en vérifiant s'il y a du travail terminé à renvoyer à votre code.

```bash

    Votre Code --> Node.js délègue le travail lent (I/O, timers...) --> L'Event Loop continue de vérifier
                                                                               |
                       Votre Code <-- le callback/promise s'exécute  <--------+ (travail terminé)


```

**Bloquant vs. non bloquant**, avec la lecture d'un fichier comme exemple :

```js

    const fs = require("fs");

    // Bloquant (synchrone) : tout le programme se fige jusqu'à ce que le fichier soit entièrement lu
    const dataSync = fs.readFileSync("./data.txt", "utf-8");
    console.log("Ceci ne s'exécute qu'une fois le fichier entièrement lu");

    // Non bloquant (asynchrone) : Node.js continue d'exécuter du code pendant la lecture du fichier
    fs.readFile("./data.txt", "utf-8", (err, data) => {
        console.log("Ceci s'exécute plus tard, une fois la lecture terminée");
    });
    console.log("Ceci s'exécute immédiatement, avant la fin de la lecture");


```

Comme le code basé sur des callbacks peut vite devenir difficile à lire une fois imbriqué (familièrement appelé "callback hell"), le code Node.js moderne privilégie les **Promises** et la syntaxe `async`/`await`, qui expriment le même comportement non bloquant avec un code qui se lit de haut en bas.

```js

    const fs = require("fs/promises");

    async function lireDonnees() {
        const data = await fs.readFile("./data.txt", "utf-8");
        console.log(data);
    }


```

**Erreur courante :** utiliser une fonction `*Sync` (comme `readFileSync`) dans un serveur qui gère de nombreux utilisateurs à la fois. Comme Node.js s'exécute sur un thread unique, un appel bloquant fige **tout** le serveur pour tous les utilisateurs jusqu'à sa fin, pas seulement la requête en cours.

---

## 1.4. Modules essentiels du système

Node.js est fourni avec un ensemble de modules intégrés — sans installation requise — qui couvrent les besoins les plus courants d'un programme côté serveur. `require` (ou `import` en syntaxe ESM) les charge par leur nom.

| Module | Rôle |
| :--- | :--- |
| `fs` | Lire, écrire et gérer des fichiers et des dossiers (**f**ile **s**ystem). |
| `path` | Construire et manipuler des chemins de fichiers d'une manière qui fonctionne sur chaque système d'exploitation. |
| `os` | Obtenir des informations sur la machine sur laquelle Node.js s'exécute (CPU, mémoire, plateforme). |
| `events` | Créer et écouter des événements personnalisés avec la classe `EventEmitter`. |

```js

    const path = require("path");
    const os = require("os");
    const EventEmitter = require("events");

    // path : assemble des segments en utilisant le bon séparateur pour l'OS actuel ("/" ou "\")
    const filePath = path.join(__dirname, "data", "file.txt");

    // os : informations basiques sur la machine
    console.log(os.platform());   // p. ex. "win32", "linux", "darwin"
    console.log(os.totalmem());   // Mémoire totale en octets

    // events : définit et réagit à un événement personnalisé
    const emitter = new EventEmitter();
    emitter.on("userCreated", (name) => console.log(`Bienvenue, ${name} !`));
    emitter.emit("userCreated", "Alex");


```

**Erreur courante :** construire des chemins de fichiers en concaténant des chaînes de caractères manuellement (p. ex. `dir + "/" + file`). Cela casse sous Windows, qui utilise `\` au lieu de `/`. Utilisez toujours `path.join()` ou `path.resolve()` à la place.

---

## 1.5. Gestion des paquets

Chaque projet Node.js est décrit par un fichier `package.json` : il liste le nom du projet, sa version, ses scripts et, surtout, ses **dépendances** (les librairies externes dont il a besoin pour fonctionner).

```bash

    npm init -y                     # Crée un package.json avec des valeurs par défaut
    npm install express              # Installe une librairie et l'ajoute à "dependencies"
    npm install --save-dev jest      # Installe une librairie nécessaire seulement en développement, sous "devDependencies"
    npm install                      # Installe toutes les dépendances déjà listées dans package.json


```

Les librairies installées sont téléchargées dans un dossier `node_modules`, et la version exacte de chaque dépendance (y compris les dépendances des dépendances) est figée dans un fichier `package-lock.json`, afin que les mêmes versions soient installées sur chaque machine.

```json

    {
      "name": "mon-projet",
      "version": "1.0.0",
      "scripts": {
        "start": "node index.js",
        "dev": "node --watch index.js"
      },
      "dependencies": {
        "express": "^4.19.2"
      },
      "devDependencies": {
        "jest": "^29.7.0"
      }
    }


```

La section `scripts` définit des raccourcis que vous exécutez avec `npm run <nom>` (p. ex. `npm run dev`), c'est ainsi que la plupart des projets standardisent des commandes comme démarrer le serveur ou lancer les tests.

**Erreur courante :** versionner le dossier `node_modules`. Il peut contenir des dizaines de milliers de fichiers et est entièrement reproductible à partir de `package.json` et `package-lock.json` en exécutant `npm install`, il doit donc toujours être exclu via `.gitignore`.

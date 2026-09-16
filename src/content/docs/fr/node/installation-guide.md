---
title: "Guide d'installation de Node.js"
---

# Guide d'installation de Node.js

**Node.js** est un **environnement d'exécution** JavaScript qui permet d'exécuter du JavaScript en dehors du navigateur, directement sur votre machine ou sur un serveur. Son installation installe aussi **npm** (Node Package Manager), l'outil que vous utiliserez pour installer et gérer les librairies de vos projets.

Plutôt que d'installer Node.js directement, la plupart des développeurs utilisent un **gestionnaire de versions** comme **nvm**, qui permet d'installer plusieurs versions de Node.js sur la même machine et de basculer entre elles — utile puisque différents projets nécessitent souvent des versions différentes. Ce guide couvre à la fois l'installation directe et l'approche avec nvm.

---

## 1. Windows

<ol>
  <li>
    Rendez-vous sur le
    <a href="https://nodejs.org/"
       class="doc-link"
       target="_blank"
       rel="noopener noreferrer"
       title="Site officiel de Node.js">
       site officiel de Node.js
    </a>
    et téléchargez l'installeur <strong>LTS</strong> (support à long terme), la version recommandée pour la plupart des projets.
  </li>
  <li>
    Exécutez le fichier <code>.msi</code> téléchargé. Les options par défaut conviennent aux débutants ; assurez-vous que la case pour installer les <strong>outils nécessaires</strong> aux modules natifs reste cochée.
  </li>
  <li>
    Redémarrez toute fenêtre de terminal ouverte une fois l'installation terminée, pour qu'elle reconnaisse les nouvelles commandes.
  </li>
</ol>

### Vérifier l'installation

```bash

    node --version
    npm --version


```

Vous devriez voir deux numéros de version, par exemple `v20.11.1` et `10.2.4`. `npm` est installé automatiquement avec Node.js.

---

## 2. macOS

<ol>
  <li>
    Rendez-vous sur le <a href="https://nodejs.org/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Site officiel de Node.js">site officiel de Node.js</a> et téléchargez l'installeur <strong>LTS</strong> pour macOS.
  </li>
  <li>
    Autrement, si vous utilisez <a href="https://brew.sh/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Homebrew">Homebrew</a> (un outil pour installer des logiciels depuis le terminal), vous pouvez exécuter la commande ci-dessous à la place.
  </li>
</ol>

```bash

    brew install node


```

### Vérifier l'installation

```bash

    node --version
    npm --version


```

---

## 3. Linux (Ubuntu/Debian)

```bash

    sudo apt update
    sudo apt install nodejs npm


```

La version fournie par `apt` peut avoir plusieurs versions majeures de retard par rapport à la dernière disponible. Pour tout usage sérieux, préférez la méthode **nvm** décrite ci-dessous, qui donne toujours une version à jour et facilement remplaçable.

### Vérifier l'installation

```bash

    node --version
    npm --version


```

---

## 4. Recommandé : nvm (Node Version Manager)

**nvm** installe les versions de Node.js dans votre dossier utilisateur plutôt qu'au niveau du système, ce qui permet d'avoir plusieurs versions en parallèle et de basculer entre elles selon le projet, sans avoir besoin des droits administrateur.

```bash

    # macOS/Linux : téléchargez et exécutez le script d'installation
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

    # Redémarrez votre terminal, puis installez la dernière version LTS
    nvm install --lts

    # Basculez vers une version majeure spécifique
    nvm use 20


```

Sous Windows, le `nvm` officiel ne fonctionne pas ; utilisez plutôt l'outil distinct <a href="https://github.com/coreybutler/nvm-windows" class="doc-link" target="_blank" rel="noopener noreferrer" title="nvm-windows">nvm-windows</a>, qui propose des commandes équivalentes `nvm install` et `nvm use`.

**Erreur courante :** installer Node.js à la fois via l'installeur officiel et via nvm, puis se demander pourquoi un changement de version avec `nvm use` ne semble avoir aucun effet. Exécutez `which node` (macOS/Linux) ou `where node` (Windows) pour vérifier exactement quelle installation votre terminal utilise réellement.

---

## 5. Première configuration

Avant d'installer votre première librairie, familiarisez-vous avec la commande qui démarre tout projet Node.js : elle crée le fichier qui suivra les dépendances de votre projet.

```bash

    mkdir mon-projet
    cd mon-projet
    npm init -y


```

`npm init -y` crée un fichier `package.json` avec des valeurs par défaut (l'option `-y` saute le questionnaire interactif). À partir de là, chaque librairie installée avec `npm install <paquet>` sera automatiquement enregistrée dans ce fichier.

*La section 1.5 du guide suivant traite en détail de `package.json` et de la gestion des dépendances.*

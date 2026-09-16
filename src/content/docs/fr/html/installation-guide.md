---
title: "Guide d'installation de HTML"
---

# Guide d'installation de HTML

HTML est un **langage de balisage** : il n'y a donc rien à installer ni à *compiler* (traduire en un programme que l'ordinateur peut exécuter). Un fichier HTML est un simple fichier texte que n'importe quel navigateur peut ouvrir. Cela dit, quelques outils gratuits rendent l'écriture et la prévisualisation du HTML bien plus confortables.

---

## 1. Outils nécessaires

Pour commencer à créer et tester du HTML, il vous faut :

<ol>
    <li>
        <strong>Un éditeur de code</strong><br>
        Un éditeur de texte conçu pour écrire du code. Il colore les différentes parties du code (<em>coloration syntaxique</em>) pour le rendre plus lisible, et peut être enrichi de modules appelés <em>extensions</em>.
        <ul>
            <li><a href="https://code.visualstudio.com/" target="_blank" rel="noopener noreferrer" title="Site officiel de Visual Studio Code" class="doc-link">Visual Studio Code</a> (recommandé)</li>
            <li><a href="https://www.sublimetext.com/" target="_blank" rel="noopener noreferrer" title="Site officiel de Sublime Text" class="doc-link">Sublime Text</a></li>
            <li><a href="https://notepad-plus-plus.org/" target="_blank" rel="noopener noreferrer" title="Site officiel de Notepad++" class="doc-link">Notepad++</a> (Windows uniquement)</li>
        </ul>
    </li>
    <li>
        <strong>Un navigateur web</strong><br>
        Il vous servira à ouvrir vos fichiers <code>.html</code> et à voir le résultat. Vous en avez très probablement déjà un :
        <ul>
            <li><a href="https://www.google.com/chrome/" target="_blank" rel="noopener noreferrer" title="Site officiel de Google Chrome" class="doc-link">Chrome</a></li>
            <li><a href="https://www.firefox.com/" target="_blank" rel="noopener noreferrer" title="Site officiel de Mozilla Firefox" class="doc-link">Firefox</a></li>
            <li><a href="https://www.microsoft.com/edge" target="_blank" rel="noopener noreferrer" title="Site officiel de Microsoft Edge" class="doc-link">Edge</a></li>
            <li><a href="https://www.apple.com/safari/" target="_blank" rel="noopener noreferrer" title="Site officiel de Safari" class="doc-link">Safari</a></li>
        </ul>
    </li>
    <li>
        <strong>(Facultatif) Extension Live Server</strong><br>
        Si vous utilisez Visual Studio Code, vous pouvez installer l'extension <a href="https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer" target="_blank" rel="noopener noreferrer" title="Extension Live Server" class="doc-link">Live Server</a>. Elle recharge automatiquement la page dans le navigateur à chaque enregistrement du fichier, sans avoir à l'actualiser à la main.
    </li>
</ol>

---

## 2. Créer votre premier fichier HTML

1. Ouvrez votre éditeur de code.

2. Créez un nouveau fichier et enregistrez-le sous le nom `index.html`. La terminaison `.html` (l'*extension*) indique à l'ordinateur qu'il s'agit d'une page web.

3. Écrivez (ou collez) la structure HTML de base :

```html

    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ma première page HTML</title>
    </head>
    <body>
        <h1>Bonjour, HTML !</h1>
        <p>Bienvenue sur votre première page web.</p>
    </body>
    </html>


```

4. Enregistrez le fichier.

**Erreur fréquente :** enregistrer le fichier avec la mauvaise extension. Certains éditeurs basiques (comme le Bloc-notes de Windows) ajoutent `.txt` automatiquement, et le navigateur affichera le code comme du texte brut au lieu d'une page web.

```bash

    # ❌ INCORRECT : le navigateur le traite comme un document texte
    index.html.txt

    # ✅ CORRECT : le navigateur le traite comme une page web
    index.html


```

---

## 3. Afficher votre fichier HTML

- Ouvrez le fichier dans un navigateur de l'une de ces façons :

    - Double-cliquez sur le fichier `index.html`.

    - Faites un clic droit sur le fichier → *Ouvrir avec* → choisissez votre navigateur.

- Vous devriez voir votre titre et votre paragraphe affichés comme une page web. Le titre « Ma première page HTML » apparaît dans l'onglet du navigateur.

- Après avoir modifié le code, enregistrez le fichier et actualisez le navigateur (F5 ou Ctrl+R / Cmd+R) pour voir les changements.

---

## 4. Utiliser Live Server (facultatif)

Si vous avez installé l'extension Live Server dans Visual Studio Code :

1. Faites un clic droit sur `index.html` dans la liste des fichiers.

2. Sélectionnez **« Open with Live Server »**.

3. Le navigateur ouvrira la page et l'actualisera automatiquement à chaque enregistrement.

---
title: "Guide d'installation de PHP"
---

# Guide d'installation de PHP

Pour exécuter du code PHP, il vous faut l'**interpréteur PHP** : le programme qui lit vos fichiers `.php` et les exécute. Nous recommandons d'installer une version stable récente (PHP 8.3 ou plus récent).

Plusieurs étapes utilisent le **terminal** (aussi appelé *ligne de commande*, *Invite de commandes* ou *PowerShell* sous Windows) : une fenêtre où l'on tape des commandes au lieu de cliquer sur des boutons.

---

## 1. Téléchargement et installation

**Windows**

<ol>
  <li>
    Téléchargez <strong>XAMPP</strong> (l'option la plus simple) depuis le 
    <a href="https://www.apachefriends.org/" 
       class="doc-link" 
       target="_blank" 
       rel="noopener noreferrer"
       title="Télécharger XAMPP depuis Apache Friends">
       site d'Apache Friends
    </a>. XAMPP est un paquet gratuit qui installe PHP avec un serveur web (Apache) et une base de données (MariaDB).
  </li>
  <li>
    Lancez le fichier <code>.exe</code> téléchargé. Pendant l'installation, vous pouvez décocher les composants inutiles, comme « FileZilla » ou « Tomcat », pour alléger l'installation.
  </li>
  <li>
    <strong>Important :</strong> pour utiliser la commande <code>php</code> dans le terminal, ajoutez le dossier de PHP (généralement <code>C:\xampp\php</code>) au <strong>PATH</strong> de Windows : la liste des dossiers où Windows cherche les programmes. Cherchez « Modifier les variables d'environnement système » dans le menu Démarrer → <em>Variables d'environnement</em> → sélectionnez <em>Path</em> → <em>Modifier</em> → <em>Nouveau</em>, et collez le dossier.
  </li>
</ol>

**macOS (avec Homebrew)**

Si vous avez <a href="https://brew.sh/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Homebrew">Homebrew</a> (un outil pour installer des logiciels depuis le terminal), ouvrez le terminal et lancez :

```bash

    brew install php


```

**Linux (Debian/Ubuntu)**

Ouvrez le terminal et utilisez `apt` (l'installateur de paquets d'Ubuntu) pour installer PHP. `sudo` exécute la commande avec les droits d'administrateur, votre mot de passe vous sera donc demandé :

```bash

    sudo apt update
    sudo apt install php


```

---

## 2. Vérifier l'installation

Une fois l'installation terminée, **ouvrez un nouveau terminal** (ceux qui étaient déjà ouverts ne voient pas le changement) et lancez :

```bash

    php -v


```

Vous devriez voir quelque chose de ce genre (les numéros dépendent de votre version) :

```bash

    PHP 8.3.14 (cli) (built: Nov 19 2024 15:14:02) (NTS)
    Copyright (c) The PHP Group
    Zend Engine v4.3.14, Copyright (c) Zend Technologies


```

---

## 3. Votre premier programme

Créez un fichier nommé `hello.php` et collez-y le code suivant :

```php

    <?php
        echo "Bonjour, PHP !";
    ?>


```

Vous pouvez l'exécuter directement dans le terminal, depuis le même dossier que le fichier :

```bash

    php hello.php

    # Résultat :
    # Bonjour, PHP !


```

Pour le voir dans le navigateur comme une page web, lancez dans ce dossier le serveur de développement intégré à PHP :

```bash

    php -S localhost:8000


```

Ouvrez ensuite `http://localhost:8000/hello.php` dans votre navigateur. Appuyez sur `Ctrl+C` dans le terminal pour arrêter le serveur.

**Erreur fréquente :** ouvrir un fichier `.php` en double-cliquant dessus. Le navigateur ne sait pas exécuter PHP tout seul : il affiche le code comme du texte ou télécharge le fichier. Les fichiers PHP doivent toujours être ouverts via un serveur.

```bash

    # ❌ INCORRECT : le navigateur ouvre le fichier directement et n'exécute pas le code PHP
    file:///C:/projets/hello.php

    # ✅ CORRECT : le serveur exécute le code PHP et envoie la page obtenue
    http://localhost:8000/hello.php


```

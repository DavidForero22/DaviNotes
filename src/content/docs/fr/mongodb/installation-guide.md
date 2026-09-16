---
title: "Guide d'installation de MongoDB"
---

# Guide d'installation de MongoDB

**MongoDB** est un **serveur de base de données**, tout comme MySQL : un programme qui tourne en arrière-plan et qui est chargé de stocker et récupérer vos données de manière fiable. La différence réside dans la *façon* dont il stocke ces données — au lieu de lignes et de colonnes, MongoDB stocke des enregistrements flexibles, semblables à du JSON, appelés **documents**, détaillés dans le guide suivant.

Installer MongoDB vous donne le serveur de base de données lui-même (`mongod`) ainsi que **mongosh**, le client en ligne de commande utilisé pour communiquer avec lui.

---

## 1. Windows

<ol>
  <li>
    Rendez-vous sur la
    <a href="https://www.mongodb.com/try/download/community"
       class="doc-link"
       target="_blank"
       rel="noopener noreferrer"
       title="Téléchargement de MongoDB Community Server">
       page de téléchargement de MongoDB Community Server
    </a>
    et téléchargez l'installeur <code>.msi</code> pour Windows.
  </li>
  <li>
    Lancez l'installeur et choisissez l'installation <strong>"Complete"</strong>. Laissez l'option d'installer MongoDB en tant que <strong>service Windows</strong> activée, afin que le serveur démarre automatiquement en arrière-plan à chaque démarrage de votre ordinateur.
  </li>
  <li>
    Lorsque demandé, installez également <strong>MongoDB Compass</strong>, l'outil graphique officiel (voir la section 4).
  </li>
</ol>

### Vérifier l'installation

Ouvrez une **nouvelle** fenêtre d'invite de commandes ou PowerShell et tapez :

```bash

    mongod --version


```

Vous devriez voir un numéro de version, par exemple `db version v7.0.5`.

---

## 2. macOS

<ol>
  <li>
    Si vous utilisez <a href="https://brew.sh/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Homebrew">Homebrew</a> (un outil pour installer des logiciels depuis le terminal), exécutez les commandes ci-dessous.
  </li>
</ol>

```bash

    brew tap mongodb/brew
    brew install mongodb-community
    brew services start mongodb-community   # Démarre le serveur de base de données et le maintient actif


```

### Vérifier l'installation

```bash

    mongod --version


```

---

## 3. Linux (Ubuntu/Debian)

Installer MongoDB sous Linux nécessite d'abord d'ajouter le dépôt de paquets officiel de MongoDB, la plupart des distributions ne l'incluant pas par défaut :

```bash

    # Importe la clé GPG publique de MongoDB et ajoute son dépôt de paquets (les commandes varient légèrement selon la version ; voir la documentation officielle)
    curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

    sudo apt update
    sudo apt install mongodb-org

    sudo systemctl start mongod       # Démarre le serveur de base de données
    sudo systemctl enable mongod      # Le fait démarrer automatiquement à chaque redémarrage


```

### Vérifier l'installation

```bash

    mongod --version


```

---

## 4. Se connecter pour la première fois

Une fois le serveur lancé, connectez-vous via **mongosh** (le "Mongo Shell"), le client en ligne de commande de MongoDB :

```bash

    mongosh


```

L'invite passe à `test>`, ce qui signifie que vous êtes désormais "à l'intérieur" de MongoDB et pouvez taper des commandes directement. Tapez `exit` pour quitter.

```bash

    test> show dbs         // Liste toutes les bases de données actuellement sur le serveur
    test> exit


```

**Erreur courante :** s'attendre à ce qu'un point-virgule `;` soit obligatoire à la fin de chaque commande, comme c'est le cas avec MySQL. Les commandes mongosh sont du JavaScript pur, donc le point-virgule est facultatif et une commande s'exécute dès que vous appuyez sur Entrée.

---

## 5. Optionnel : MongoDB Compass

Taper chaque commande n'est pas la seule façon de travailler avec MongoDB. **MongoDB Compass** est l'outil graphique officiel : il permet de parcourir les documents, de construire des requêtes en cliquant via un constructeur visuel, et de voir des statistiques de performance, sans taper une seule commande. Il se connecte exactement au même serveur que mongosh — ce sont juste deux façons différentes de lui parler.

*La section 1.1 du guide suivant explique ce qu'est réellement un document et comment il se compare à une table de base de données traditionnelle.*

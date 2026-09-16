---
title: "Guide d'installation de MySQL"
---

# Guide d'installation de MySQL

**MySQL** est un **serveur de base de données** : un programme qui s'exécute discrètement en arrière-plan sur votre ordinateur (ou sur un serveur distant) et qui est chargé de stocker, organiser et récupérer des données — un peu comme un classeur range des papiers, sauf qu'une base de données peut chercher parmi des millions d'enregistrements en une fraction de seconde.

Contrairement à une application classique que l'on ouvre en cliquant sur une icône, un serveur de base de données n'a pas de fenêtre à lui. On interagit avec lui via un programme séparé appelé **client**, en ligne de commande ou graphique, qui lui envoie des instructions et vous affiche les résultats.

---

## 1. Windows

<ol>
  <li>
    Rendez-vous sur la
    <a href="https://dev.mysql.com/downloads/installer/"
       class="doc-link"
       target="_blank"
       rel="noopener noreferrer"
       title="Installeur officiel de MySQL">
       page officielle de l'installeur MySQL
    </a>
    et téléchargez <strong>MySQL Installer for Windows</strong> (choisissez la version "web", plus légère, sauf si vous serez hors ligne pendant l'installation).
  </li>
  <li>
    Lancez l'installeur et choisissez le type d'installation <strong>"Developer Default"</strong>, qui installe le serveur de base de données ainsi que quelques outils utiles.
  </li>
  <li>
    Lorsque demandé, définissez un <strong>mot de passe root</strong>. Le compte "root" est le compte administrateur de la base de données ; notez ce mot de passe quelque part en sécurité, vous en aurez besoin à chaque connexion.
  </li>
  <li>
    Laissez l'option d'exécuter MySQL en tant que <strong>service Windows</strong> activée, afin que le serveur démarre automatiquement à chaque démarrage de votre ordinateur.
  </li>
</ol>

### Vérifier l'installation

Ouvrez une **nouvelle** fenêtre d'invite de commandes ou PowerShell et tapez :

```bash

    mysql --version


```

Vous devriez voir un numéro de version, par exemple `mysql  Ver 8.0.36`.

---

## 2. macOS

<ol>
  <li>
    Rendez-vous sur la <a href="https://dev.mysql.com/downloads/mysql/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Téléchargements officiels de MySQL Community">page officielle de téléchargement de MySQL</a> et téléchargez l'installeur <code>.dmg</code> pour macOS.
  </li>
  <li>
    Autrement, si vous utilisez <a href="https://brew.sh/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Homebrew">Homebrew</a> (un outil pour installer des logiciels depuis le terminal), vous pouvez exécuter la commande ci-dessous à la place.
  </li>
</ol>

```bash

    brew install mysql
    brew services start mysql   # Démarre le serveur de base de données et le maintient actif


```

### Vérifier l'installation

```bash

    mysql --version


```

---

## 3. Linux (Ubuntu/Debian)

```bash

    sudo apt update
    sudo apt install mysql-server
    sudo mysql_secure_installation   # Assistant guidé pour définir le mot de passe root et retirer les réglages par défaut peu sûrs


```

`mysql_secure_installation` pose une courte série de questions oui/non — répondre "oui" à toutes est le choix le plus sûr pour un usage personnel ou d'apprentissage.

### Vérifier l'installation

```bash

    mysql --version


```

---

## 4. Se connecter pour la première fois

Une fois installé, connectez-vous au serveur via le client en ligne de commande, en indiquant le nom d'utilisateur administrateur (`-u root`) et en demandant à être invité à saisir le mot de passe (`-p`) :

```bash

    mysql -u root -p


```

Après avoir saisi votre mot de passe, l'invite passe à `mysql>`, ce qui signifie que vous êtes désormais "à l'intérieur" de MySQL et pouvez taper des commandes directement. Tapez `exit` pour quitter.

```bash

    mysql> SHOW DATABASES;   -- Liste toutes les bases de données actuellement sur le serveur
    mysql> exit


```

**Erreur courante :** oublier le point-virgule `;` à la fin d'une commande. MySQL considère toute commande comme inachevée tant qu'il n'en voit pas un, donc son absence laisse le terminal attendre silencieusement au lieu d'afficher une erreur.

---

## 5. Optionnel : clients graphiques

Taper chaque commande n'est pas la seule façon de travailler avec MySQL. **MySQL Workbench** (inclus dans l'installeur Windows, ou téléchargeable séparément pour macOS/Linux) offre une interface visuelle pour parcourir les tables, construire des requêtes en cliquant, et concevoir des diagrammes de base de données. D'autres options populaires incluent <a href="https://tableplus.com/" class="doc-link" target="_blank" rel="noopener noreferrer" title="TablePlus">TablePlus</a> et <a href="https://dbeaver.io/" class="doc-link" target="_blank" rel="noopener noreferrer" title="DBeaver">DBeaver</a>. Aucun de ces outils ne remplace le serveur MySQL lui-même — ce sont juste des façons plus conviviales de lui parler.

*La section 1.1 du guide suivant explique ce que fait exactement un serveur de base de données et comment il est organisé en interne.*

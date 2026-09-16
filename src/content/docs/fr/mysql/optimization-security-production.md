---
title: "Optimisation, sécurité et production en MySQL"
---

# Optimisation, Sécurité et Production

Une base de données qui fonctionne sur votre propre ordinateur avec des données de test a encore besoin de plusieurs choses avant de pouvoir contenir en toute sécurité des informations réelles et précieuses utilisées par de vraies personnes : des requêtes rapides, un accès contrôlé, un moyen de se remettre des erreurs, une résilience face aux pannes, et un moyen pour les applications de réellement communiquer avec elle. Cette section couvre ces cinq points.

---

## Table des matières

<div id="content-table">

- [3.1. Analyser et optimiser les requêtes lentes avec EXPLAIN](#31-analyser-et-optimiser-les-requêtes-lentes-avec-explain "Comprendre comment MySQL exécute une requête")
- [3.2. Utilisateurs, rôles, permissions et sécurité](#32-utilisateurs-rôles-permissions-et-sécurité "GRANT et REVOKE")
- [3.3. Stratégies de sauvegarde et restauration](#33-stratégies-de-sauvegarde-et-restauration "mysqldump et sauvegardes logiques vs. physiques")
- [3.4. Haute disponibilité : réplication et clustering](#34-haute-disponibilité--réplication-et-clustering "Les bases de la réplication Master-Slave")
- [3.5. Intégration avec Node.js](#35-intégration-avec-nodejs "mysql2 et les ORM comme Sequelize ou Prisma")

</div>

---

## 3.1. Analyser et optimiser les requêtes lentes avec EXPLAIN

Quand une requête semble lente, deviner la cause fonctionne rarement — MySQL peut à la place vous montrer exactement ce qu'il prévoit de faire. Placer `EXPLAIN` avant n'importe quel `SELECT` demande à MySQL de décrire son plan d'exécution plutôt que d'exécuter réellement la requête.

```sql

    EXPLAIN SELECT * FROM orders WHERE customer_id = 42;


```

Le résultat est une table décrivant comment MySQL compte trouver les lignes correspondantes. La colonne la plus importante à vérifier est `type` : une valeur comme `ALL` signifie un **balayage complet de la table** (vérifier chaque ligne une par une), tandis que `ref` ou `const` signifie que MySQL utilise un index (voir la section 2.4) pour sauter presque directement vers les lignes correspondantes.

| Valeur de `type` | Signification | Généralement... |
| :--- | :--- | :--- |
| `ALL` | Balayage complet, chaque ligne vérifiée | Lent sur les grandes tables |
| `range` | Balaye une plage limitée via un index | Raisonnablement rapide |
| `ref` | Recherche les lignes correspondantes via un index non unique | Rapide |
| `const` | Au plus une ligne correspondante, trouvée instantanément | Le plus rapide |

**Erreur courante :** ajouter un index et supposer qu'il est automatiquement utilisé. Une cause fréquente d'un index silencieusement ignoré est l'application d'une fonction sur la colonne indexée dans la clause `WHERE` (p. ex. `WHERE YEAR(order_date) = 2024`), ce qui force MySQL à calculer cette fonction pour chaque ligne au lieu d'utiliser directement l'index. `EXPLAIN` est le seul moyen fiable de confirmer qu'un index aide réellement.

---

## 3.2. Utilisateurs, rôles, permissions et sécurité

Chaque connexion à MySQL passe par un **compte utilisateur**, et chaque compte ne devrait avoir que les **permissions** dont il a réellement besoin — un site web qui a seulement besoin de lire et écrire des commandes n'a aucune raison de pouvoir supprimer toute la table `customers`.

```sql

    -- Crée un nouvel utilisateur, restreint aux connexions depuis la machine locale
    CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'un-mot-de-passe-fort';

    -- Accorde uniquement SELECT, INSERT et UPDATE sur une base de données spécifique
    GRANT SELECT, INSERT, UPDATE ON bookstore.* TO 'app_user'@'localhost';

    -- Retire une permission précédemment accordée
    REVOKE UPDATE ON bookstore.* FROM 'app_user'@'localhost';

    FLUSH PRIVILEGES;   -- Garantit que les changements prennent effet immédiatement


```

Ce principe — accorder à chaque compte le **minimum** d'accès nécessaire pour faire son travail, pas plus — s'appelle le **principe du moindre privilège**, et c'est l'habitude la plus efficace pour limiter les dégâts qu'une erreur ou une faille de sécurité peut causer.

Un **rôle** est un ensemble nommé et réutilisable de permissions, pouvant être accordé à plusieurs utilisateurs à la fois, au lieu de répéter la même liste d'instructions `GRANT` pour chaque nouveau compte.

```sql

    CREATE ROLE 'read_only';
    GRANT SELECT ON bookstore.* TO 'read_only';

    GRANT 'read_only' TO 'app_user'@'localhost';


```

**Erreur courante :** utiliser le compte administrateur `root` pour la connexion quotidienne d'un site web ou d'une application à la base de données. Si cette application est un jour compromise, un attaquant hérite d'un accès administrateur complet à toutes les bases de données du serveur, au lieu d'être limité aux permissions restreintes qu'un compte dédié aurait eues.

---

## 3.3. Stratégies de sauvegarde et restauration

Une **sauvegarde** est une copie enregistrée d'une base de données pouvant servir à la restaurer si des données sont accidentellement supprimées, corrompues, ou perdues entièrement (panne matérielle, mauvaise migration, erreur humaine). `mysqldump` est l'outil intégré de MySQL pour effectuer une **sauvegarde logique** : un fichier texte brut rempli des instructions SQL nécessaires pour recréer la base de données depuis zéro.

```bash

    # Crée un unique fichier .sql contenant toute la base de données
    mysqldump -u root -p bookstore > bookstore_backup.sql

    # La restaure plus tard dans une base de données (éventuellement nouvelle et vide)
    mysql -u root -p bookstore < bookstore_backup.sql


```

| | Sauvegarde logique (`mysqldump`) | Sauvegarde physique |
| :--- | :--- | :--- |
| **Ce qu'elle contient** | Des instructions SQL pour reconstruire les données | Une copie directe des fichiers de données internes de MySQL |
| **Portable entre versions** | Oui, généralement | Pas toujours |
| **Vitesse pour de très grandes bases** | Plus lente | Plus rapide |
| **Outil typique** | `mysqldump` | `MySQL Enterprise Backup`, instantanés du système de fichiers |

**Erreur courante :** faire des sauvegardes mais ne jamais réellement tester qu'elles peuvent être restaurées. Un fichier de sauvegarde qui s'avère incomplet ou corrompu n'est découvert inutile qu'au pire moment possible — juste quand on en avait réellement besoin.

---

## 3.4. Haute disponibilité : réplication et clustering

La **réplication** maintient une ou plusieurs copies d'une base de données (appelées **répliques**, historiquement "esclaves") automatiquement et continuellement synchronisées avec une copie principale (la **source**, historiquement le "maître"). Chaque changement effectué sur la source est transmis à chaque réplique et y est également appliqué, avec un léger décalage.

```bash

    -- Exécuté sur un serveur réplique, le pointant vers la source
    CHANGE REPLICATION SOURCE TO
        SOURCE_HOST='ip_serveur_source',
        SOURCE_USER='utilisateur_replication',
        SOURCE_PASSWORD='un-mot-de-passe-fort';

    START REPLICA;


```

La réplication répond à deux besoins courants : la **haute disponibilité** (si le serveur source tombe en panne, une réplique peut être promue pour prendre le relais, minimisant l'indisponibilité) et la **montée en charge en lecture** (les applications à forte lecture peuvent envoyer leurs requêtes `SELECT` aux répliques, répartissant la charge, tandis que toutes les écritures continuent d'aller vers la source unique).

Le **clustering** va plus loin avec des technologies comme **InnoDB Cluster**, où plusieurs serveurs MySQL se coordonnent activement pour survivre à la perte d'un ou plusieurs nœuds avec peu ou pas d'intervention manuelle, en élisant automatiquement une nouvelle source si l'actuelle tombe en panne.

| | Réplication basique | Clustering (p. ex. InnoDB Cluster) |
| :--- | :--- | :--- |
| **Basculement (failover)** | Généralement manuel | Souvent automatique |
| **Complexité** | Plus faible | Plus élevée |
| **Adapté pour** | Montée en charge en lecture, sauvegardes simples | Applications ne tolérant aucune interruption |

**Erreur courante :** traiter une réplique comme un substitut aux sauvegardes. La réplication copie les erreurs tout aussi fidèlement qu'elle copie les changements légitimes — si une ligne est accidentellement supprimée sur la source, cette suppression est répliquée aussi, presque instantanément. La réplication protège contre une panne serveur, pas contre l'erreur humaine ; seule une vraie sauvegarde (section 3.3) protège contre cela.

---

## 3.5. Intégration avec Node.js

Une application Node.js se connecte à MySQL via un **driver** : une librairie qui sait parler le protocole réseau de MySQL. `mysql2` est le plus utilisé, et prend en charge à la fois le style callback et `async`/`await`.

```js

    const mysql = require("mysql2/promise");

    async function getBooks() {
        const connection = await mysql.createConnection({
            host: "localhost",
            user: "app_user",
            password: "un-mot-de-passe-fort",
            database: "bookstore",
        });

        const [rows] = await connection.query("SELECT * FROM books WHERE price < ?", [40]);
        return rows;
    }


```

Remarquez le symbole `?` utilisé comme espace réservé, plutôt que d'écrire le prix directement dans le texte de la requête. Il s'agit d'une **requête préparée** : la valeur est envoyée à MySQL séparément de la requête elle-même, ce qui empêche l'**injection SQL** — une faille de sécurité grave où un attaquant glisse ses propres commandes SQL dans une requête construite en collant directement du texte et une saisie utilisateur.

```js

    // ❌ DANGEREUX : insère directement la saisie utilisateur dans le texte de la requête
    const price = req.query.price; // Imaginez que ceci vaut "0 OR 1=1" venant d'un utilisateur malveillant
    connection.query(`SELECT * FROM books WHERE price < ${price}`);

    // ✅ SÛR : la valeur est transmise séparément et MySQL la traite comme une pure donnée, jamais comme du SQL
    connection.query("SELECT * FROM books WHERE price < ?", [price]);


```

Pour de plus grandes applications, un **ORM** (Object-Relational Mapper) comme **Sequelize** ou **Prisma** permet de travailler avec les lignes de la base de données comme de simples objets JavaScript plutôt que d'écrire des chaînes SQL brutes, et gère automatiquement un **pool de connexions** : un petit ensemble de connexions à la base de données réutilisées entre les requêtes plutôt que d'en ouvrir une toute nouvelle, relativement coûteuse, à chaque fois.

```js

    // Exemple avec Prisma, après avoir défini un modèle Book dans son schéma
    const books = await prisma.book.findMany({
        where: { price: { lt: 40 } },
    });


```

**Erreur courante :** construire des requêtes en concaténant (collant) directement des chaînes de caractères avec des valeurs venant d'une saisie utilisateur, comme dans l'exemple "dangereux" ci-dessus. Utilisez toujours des espaces réservés (`?` avec `mysql2`, ou les propres méthodes de requête d'un ORM) à la place, sans exception.

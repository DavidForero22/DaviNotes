---
title: "Scalabilité, sécurité et production en MongoDB"
---

# Scalabilité, Sécurité et Production

Faire passer MongoDB d'un projet sur votre propre ordinateur à une base de données dont dépendent de vraies personnes demande quelques éléments supplémentaires : garder plusieurs changements liés en sécurité ensemble, survivre à une panne matérielle, contrôler qui peut accéder à quoi, et un moyen fiable de déployer une application et de la connecter à la base. Cette section couvre tout cela.

---

## Table des matières

<div id="content-table">

- [3.1. Transactions multi-documents](#31-transactions-multi-documents "Regrouper plusieurs changements en une unité sûre")
- [3.2. Replica Sets et Sharding](#32-replica-sets-et-sharding "Haute disponibilité et scalabilité horizontale")
- [3.3. Sécurité : authentification, RBAC et chiffrement](#33-sécurité--authentification-rbac-et-chiffrement "Contrôler qui peut accéder à quoi")
- [3.4. Déploiement cloud avec MongoDB Atlas](#34-déploiement-cloud-avec-mongodb-atlas "Hébergement managé et sauvegardes")
- [3.5. Intégration avec Node.js](#35-intégration-avec-nodejs "Le driver officiel Node.js et l'ODM Mongoose")

</div>

---

## 3.1. Transactions multi-documents

Comme MongoDB est souvent utilisé avec des documents embarqués (section 1.5), un simple `updateOne` sur un document est déjà **atomique** par défaut — il réussit entièrement ou échoue entièrement, sans état intermédiaire, même sans rien faire de spécial. Mais certaines opérations doivent tout de même modifier **plusieurs documents séparés** ensemble comme une seule unité tout-ou-rien, de la même façon qu'un virement bancaire nécessite que deux comptes soient mis à jour ensemble (voir la section 2.3 du guide MySQL pour la même idée en SQL).

```js

    const session = client.startSession();

    try {
        session.startTransaction();

        await accounts.updateOne({ _id: 1 }, { $inc: { balance: -100 } }, { session });
        await accounts.updateOne({ _id: 2 }, { $inc: { balance: 100 } }, { session });

        await session.commitTransaction(); // Rend les deux changements permanents en une fois
    } catch (error) {
        await session.abortTransaction();  // Annule les deux changements si quelque chose a mal tourné
    } finally {
        session.endSession();
    }


```

**Erreur courante :** se tourner vers une transaction multi-documents comme solution par défaut à chaque problème de conception. Comme un document unique est déjà mis à jour de façon atomique, un schéma qui embarque bien les données liées (section 1.5) évite souvent d'avoir besoin d'une transaction ; les transactions sont l'outil approprié spécifiquement quand la conception exige de toucher plusieurs documents à la fois.

---

## 3.2. Replica Sets et Sharding

Un **replica set** est un groupe de serveurs MongoDB qui détiennent tous les mêmes données : un nœud **primaire (primary)** reçoit toutes les écritures, et un ou plusieurs nœuds **secondaires** copient continuellement ces changements, prêts à prendre le relais automatiquement en cas de panne du primaire — cette promotion automatique s'appelle un **failover**, et prend généralement seulement quelques secondes.

```js

    // Se connecter à un replica set depuis une application liste tous les membres, afin que le driver
    // puisse trouver lequel est actuellement le primaire et se reconnecter automatiquement après un failover
    mongodb://host1:27017,host2:27017,host3:27017/?replicaSet=monReplicaSet


```

Le **sharding** résout un problème différent : une fois qu'un jeu de données devient trop volumineux (ou reçoit trop de trafic) pour qu'un seul serveur le gère confortablement, le sharding répartit les données elles-mêmes sur plusieurs serveurs, appelés **shards**, selon un champ choisi (la **clé de sharding**). Chaque shard ne contient qu'une portion du total des données, si bien que la base de données dans son ensemble peut gérer bien plus de données et de trafic qu'une seule machine ne le pourrait.

| | Replica Set | Sharding |
| :--- | :--- | :--- |
| **Résout** | Survivre à la panne d'un seul serveur | Gérer plus de données ou de trafic qu'un seul serveur ne peut en contenir |
| **Chaque nœud possède** | Une copie complète de toutes les données | Seulement une portion des données |
| **Utilisé typiquement** | Presque toujours, même pour de petits déploiements | Uniquement une fois que la capacité d'un seul serveur devient un véritable goulot d'étranglement |

**Erreur courante :** mettre en place le sharding avant qu'il ne soit réellement nécessaire. Le sharding ajoute une réelle complexité opérationnelle (choisir une bonne clé de sharding est une décision vraiment difficile et difficile à annuler), et un serveur unique bien dimensionné ou un simple replica set gère confortablement la grande majorité des applications sans en avoir besoin.

---

## 3.3. Sécurité : authentification, RBAC et chiffrement

Par défaut, lors de la configuration initiale, MongoDB peut autoriser les connexions locales sans aucun nom d'utilisateur ni mot de passe — acceptable pour une rapide expérimentation locale, mais jamais acceptable dès que des données réelles ou une connexion réseau entrent en jeu. L'**authentification** exige que chaque connexion prouve son identité avec un nom d'utilisateur et un mot de passe avant de pouvoir faire quoi que ce soit.

```js

    // Création d'un utilisateur applicatif avec un rôle spécifique et limité
    db.createUser({
        user: "app_user",
        pwd: "un-mot-de-passe-fort",
        roles: [{ role: "readWrite", db: "bookstore" }],
    });


```

Le **contrôle d'accès basé sur les rôles (RBAC)** est le même principe que celui vu pour MySQL à la section 3.2 de son guide : chaque utilisateur ne devrait se voir accorder que les rôles dont il a réellement besoin. MongoDB fournit plusieurs **rôles intégrés** couvrant les besoins courants, et des rôles personnalisés peuvent être définis pour tout besoin plus spécifique.

| Rôle intégré | Accorde |
| :--- | :--- |
| `read` | Accès en lecture seule à une base de données |
| `readWrite` | Accès en lecture et écriture à une base de données |
| `dbAdmin` | Tâches administratives (index, validation de schéma) mais pas la lecture/écriture des données |
| `root` | Accès complet à tout sur le serveur |

Le **chiffrement** protège les données dans deux situations différentes : le **chiffrement en transit** (TLS/SSL) brouille les données pendant leur trajet sur le réseau entre l'application et la base de données, les protégeant en cas d'interception ; le **chiffrement au repos** brouille les fichiers de données eux-mêmes stockés sur le disque, les protégeant si le stockage sous-jacent est un jour volé ou accédé sans autorisation.

**Erreur courante :** laisser une base de données accessible depuis internet avec l'authentification désactivée ou en utilisant des identifiants par défaut, même "temporairement" pendant le développement. Des outils de scan automatisés recherchent activement sur internet exactement ce type de base de données exposée et non protégée, 24 heures sur 24.

---

## 3.4. Déploiement cloud avec MongoDB Atlas

**MongoDB Atlas** est la version officielle et entièrement managée de MongoDB dans le cloud : au lieu d'installer et de maintenir vous-même `mongod` sur un serveur, Atlas s'en charge pour vous, et automatise en plus les replica sets, les sauvegardes, la supervision et les correctifs de sécurité.

<ol>
  <li>
    Créez un compte gratuit sur
    <a href="https://www.mongodb.com/cloud/atlas/register"
       class="doc-link"
       target="_blank"
       rel="noopener noreferrer"
       title="Inscription à MongoDB Atlas">
       MongoDB Atlas
    </a>
    et créez un nouveau cluster de niveau gratuit.
  </li>
  <li>
    Sous <strong>Network Access</strong>, autorisez les connexions depuis votre adresse IP actuelle (ou, uniquement en tout début de développement, temporairement depuis n'importe où).
  </li>
  <li>
    Sous <strong>Database Access</strong>, créez un utilisateur de base de données avec un mot de passe fort, généré automatiquement.
  </li>
  <li>
    Cliquez sur <strong>"Connect"</strong> sur votre cluster pour obtenir une chaîne de connexion prête à l'emploi pour mongosh, Compass, ou le driver Node.js d'une application.
  </li>
</ol>

Atlas effectue des sauvegardes automatiques et continues (appelées **continuous cloud backups**) et permet de restaurer un cluster à presque n'importe quel instant précis, ce qui supprime le besoin d'exécuter `mongodump` (l'équivalent MongoDB de `mysqldump` pour MySQL) manuellement selon un calendrier.

**Erreur courante :** laisser Network Access ouvert à n'importe quelle adresse IP (`0.0.0.0/0`) dans un vrai déploiement de production. Ce réglage est pensé uniquement pour le développement local rapide et devrait toujours être resserré à des adresses IP précises et connues (ou à une connexion réseau privée) avant que de vraies données précieuses n'entrent en jeu.

---

## 3.5. Intégration avec Node.js

Une application Node.js peut communiquer avec MongoDB de deux façons principales : le **driver officiel Node.js**, qui envoie des commandes d'une manière proche de mongosh, ou **Mongoose**, un **ODM** (Object-Document Mapper) qui ajoute des schémas, de la validation, et une façon plus structurée de travailler par-dessus le driver.

```js

    // Utilisation directe du driver officiel
    const { MongoClient } = require("mongodb");

    const client = new MongoClient("mongodb://localhost:27017");
    await client.connect();

    const books = client.db("bookstore").collection("books");
    const results = await books.find({ genre: "sci-fi" }).toArray();


```

```js

    // Utilisation de Mongoose : définit un schéma une fois, puis on travaille avec comme une classe normale
    const mongoose = require("mongoose");
    await mongoose.connect("mongodb://localhost:27017/bookstore");

    const bookSchema = new mongoose.Schema({
        title: String,
        price: { type: Number, min: 0 },
    });
    const Book = mongoose.model("Book", bookSchema);

    const results = await Book.find({ genre: "sci-fi" });


```

| | Driver officiel | Mongoose (ODM) |
| :--- | :--- | :--- |
| **Style** | Proche des commandes MongoDB brutes | Basé sur des schémas, plus structuré |
| **Validation** | Manuelle, ou via JSON Schema au niveau base de données (section 2.4) | Intégrée directement dans la définition du schéma |
| **Idéal pour** | Contrôle fin, surcharge minimale | Grandes applications bénéficiant d'une structure imposée |

**Erreur courante :** créer une toute nouvelle connexion `MongoClient` pour chaque requête entrante au lieu d'en créer une au démarrage de l'application et de la réutiliser pour chaque requête suivante. Le driver gère déjà efficacement un pool de connexions interne par lui-même ; se reconnecter à répétition ajoute un délai et une charge inutiles sur la base de données, sans aucun bénéfice.

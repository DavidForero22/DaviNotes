---
title: "Fondamentaux et modèle de documents en MongoDB"
---

# Fondamentaux et Modèle de Documents

MongoDB organise les données de façon très différente d'une base comme MySQL. Avant d'écrire la moindre requête, il est utile de comprendre ce qu'est réellement un "document", comment effectuer les opérations de base dessus, et comment décider où doivent vivre les informations liées entre elles. Cette section construit ces bases.

---

## Table des matières

<div id="content-table">

- [1.1. Introduction à NoSQL et aux documents JSON/BSON](#11-introduction-à-nosql-et-aux-documents-jsonbson "Ce qui rend MongoDB différent d'une base de données relationnelle")
- [1.2. Utiliser mongosh et MongoDB Compass](#12-utiliser-mongosh-et-mongodb-compass "Communiquer avec la base de données après l'installation")
- [1.3. Opérations CRUD sur les collections](#13-opérations-crud-sur-les-collections "insertOne, find, updateMany, deleteOne")
- [1.4. Opérateurs de requête et de mise à jour](#14-opérateurs-de-requête-et-de-mise-à-jour "$eq, $gt, $set, $push et plus")
- [1.5. Conception du schéma : embedding vs. referencing](#15-conception-du-schéma--embedding-vs-referencing "Décider où doivent vivre les données liées")

</div>

---

## 1.1. Introduction à NoSQL et aux documents JSON/BSON

**NoSQL** est une étiquette large pour les bases de données qui stockent les données différemment du modèle tables-et-lignes utilisé par MySQL (souvent appelées bases de données **SQL** ou **relationnelles**). MongoDB est la **base de données orientée documents** la plus populaire : au lieu de lignes rigides réparties sur des tables séparées et liées, elle stocke chaque enregistrement comme un seul **document** flexible — une structure qui ressemble presque exactement à un objet JSON, le même format utilisé partout sur le web pour échanger des données.

```json

    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Alex",
      "email": "alex@example.com",
      "age": 30,
      "hobbies": ["reading", "cycling"]
    }


```

Chaque document vit dans une **collection**, l'équivalent MongoDB d'une table — mais contrairement à une table SQL, une collection n'impose pas à tous les documents de partager exactement les mêmes colonnes. Un document `users` pourrait avoir une liste `hobbies` alors qu'un autre n'en a pas, sans aucune erreur de la base de données.

| SQL (MySQL) | MongoDB | Équivaut approximativement à |
| :--- | :--- | :--- |
| Base de données | Base de données | Un conteneur nommé pour le reste |
| Table | Collection | Un groupe d'enregistrements similaires |
| Ligne | Document | Un seul enregistrement |
| Colonne | Champ (field) | Une information à l'intérieur d'un enregistrement |

Les documents sont écrits et lus au format JSON, mais MongoDB les stocke en réalité sur disque en **BSON** (JSON Binaire) : un format binaire qui ajoute quelques types de données supplémentaires que JSON n'a pas nativement (comme de vraies dates et des données binaires) et que MongoDB peut lire et écrire bien plus vite que du JSON en texte brut.

**Erreur courante :** supposer que "pas de structure fixe" signifie "pas besoin de planification". MongoDB n'impose pas de schéma au niveau de la base de données, mais une application réelle s'attend tout de même à ce que chaque document suive une forme cohérente et prévisible — cette cohérence doit simplement être planifiée et imposée par les personnes qui construisent l'application (ou, plus tard, via les outils de la section 2.4) plutôt que par la base de données automatiquement.

---

## 1.2. Utiliser mongosh et MongoDB Compass

*Si MongoDB n'est pas encore installé sur votre machine, consultez d'abord le Guide d'installation, qui couvre l'installation du serveur et la première connexion via mongosh.*

**mongosh** est le client en ligne de commande de MongoDB. Au-delà de la connexion et du listage des bases de données, c'est un environnement JavaScript complet, ce qui explique pourquoi les commandes MongoDB ressemblent à des appels de fonctions JavaScript plutôt qu'à un langage de requête séparé comme SQL :

```bash

    use librairie          // Bascule vers (ou crée) une base de données appelée "librairie"
    db.books.insertOne({ title: "Dune", price: 15.99 })   // "db" fait toujours référence à la base de données courante


```

**MongoDB Compass** offre les mêmes capacités via une interface graphique : une barre latérale liste vos bases de données et collections, un visualiseur de documents permet de parcourir et modifier des enregistrements en cliquant, et une barre de requête visuelle construit les mêmes filtres que vous taperiez autrement dans mongosh.

| | mongosh | Compass |
| :--- | :--- | :--- |
| **Interface** | Ligne de commande, basée sur du texte | Graphique, cliquer-pointer |
| **Idéal pour** | Scripts, commandes rapides ponctuelles | Explorer les données visuellement, construire des requêtes de façon interactive |
| **Moteur sous-jacent** | Le même serveur MongoDB | Le même serveur MongoDB |

**Erreur courante :** taper `db.nomCollection` pour une collection qui n'existe pas encore et s'attendre à une erreur. MongoDB crée les collections (et même des bases de données entières) automatiquement dès la première insertion d'un document, sans étape préalable de type `CREATE TABLE`.

---

## 1.3. Opérations CRUD sur les collections

Tout comme avec MySQL, le travail quotidien dans MongoDB tourne autour du **CRUD** : Create, Read, Update et Delete (créer, lire, mettre à jour, supprimer). Les noms exacts des méthodes diffèrent, et la plupart existent en version singulière (`One`) et plurielle (`Many`), puisqu'une seule commande peut affecter un document ou tous les documents correspondant à un filtre.

```js

    // CREATE
    db.books.insertOne({ title: "Dune", price: 15.99, genre: "sci-fi" });
    db.books.insertMany([
        { title: "1984", price: 9.99, genre: "dystopian" },
        { title: "Neuromancer", price: 12.5, genre: "sci-fi" },
    ]);

    // READ
    db.books.find({ genre: "sci-fi" });          // Tous les livres de science-fiction
    db.books.findOne({ title: "Dune" });          // Seulement la première correspondance

    // UPDATE
    db.books.updateOne({ title: "Dune" }, { $set: { price: 17.99 } });
    db.books.updateMany({ genre: "sci-fi" }, { $set: { onSale: true } });

    // DELETE
    db.books.deleteOne({ title: "1984" });
    db.books.deleteMany({ genre: "dystopian" });


```

Chacune de ces méthodes prend un premier argument appelé **filtre** : un petit document décrivant quels enregistrements doivent correspondre. `{}` (un filtre vide) correspond à tous les documents, donc `db.books.find({})` lit la collection entière, de la même manière que `SELECT * FROM books` le ferait dans MySQL.

**Erreur courante :** appeler `updateOne` ou `deleteOne` alors que l'intention était en réalité d'affecter tous les documents correspondants. `updateOne`/`deleteOne` s'arrêtent après la toute première correspondance trouvée, laissant silencieusement intact tout autre document correspondant — utilisez la version `Many` dès que plus d'un enregistrement peut correspondre au filtre.

---

## 1.4. Opérateurs de requête et de mise à jour

Un champ simple comme `{ genre: "sci-fi" }` ne correspond qu'à une valeur exacte. Les **opérateurs de requête**, toujours écrits en commençant par un symbole dollar `$`, permettent aux filtres d'exprimer des comparaisons, des plages, et une logique plus complexe.

```js

    db.books.find({ price: { $gt: 10 } });              // Prix supérieur à 10
    db.books.find({ price: { $gte: 10, $lte: 20 } });    // Prix entre 10 et 20 (inclus)
    db.books.find({ genre: { $in: ["sci-fi", "fantasy"] } }); // genre vaut l'une de ces valeurs


```

| Opérateur | Signification |
| :--- | :--- |
| `$eq` | Égal à (la valeur par défaut quand on écrit simplement une valeur brute) |
| `$gt` / `$gte` | Supérieur à / supérieur ou égal à |
| `$lt` / `$lte` | Inférieur à / inférieur ou égal à |
| `$in` | Correspond à n'importe quelle valeur d'une liste donnée |

Les **opérateurs de mise à jour**, utilisés dans `updateOne`/`updateMany`, décrivent *comment* changer un document plutôt que de le remplacer entièrement :

```js

    db.books.updateOne({ title: "Dune" }, { $set: { price: 17.99 } });      // Définit (ou ajoute) un champ
    db.books.updateOne({ title: "Dune" }, { $inc: { price: 1 } });          // Augmente un champ numérique
    db.books.updateOne({ title: "Dune" }, { $push: { tags: "bestseller" } }); // Ajoute un élément à un champ de type tableau


```

**Erreur courante :** appeler `updateOne({ title: "Dune" }, { price: 17.99 })` **sans** `$set`. Sans opérateur de mise à jour, MongoDB traite le second argument comme le **contenu entier et nouveau** du document et remplace tout le reste — tous les autres champs du document sont silencieusement supprimés.

---

## 1.5. Conception du schéma : Embedding vs. Referencing

Comme MongoDB n'impose pas de répartir les données liées sur des collections séparées de la façon dont MySQL impose des tables séparées, chaque décision de conception se ramène à une question centrale : les informations liées doivent-elles être **embarquées (embedding)** dans le même document, ou **référencées (referencing)** dans une collection séparée (un peu comme une clé étrangère) ?

```js

    // Embedding : l'adresse vit directement à l'intérieur du document client
    {
      "_id": 1,
      "name": "Alex",
      "address": { "street": "123 Main St", "city": "Springfield" }
    }

    // Referencing : le document client stocke juste un ID pointant vers une collection séparée
    { "_id": 1, "name": "Alex", "addressId": 501 }
    // Dans une collection séparée "addresses" :
    { "_id": 501, "street": "123 Main St", "city": "Springfield" }


```

| | Embedding | Referencing |
| :--- | :--- | :--- |
| **Performance en lecture** | Rapide — une seule requête récupère tout | Plus lente — peut nécessiter une seconde requête ou un `$lookup` (vu à la section 2.3) |
| **Idéal pour** | Des données toujours lues ensemble et qui changent rarement indépendamment (une adresse, les lignes d'une commande) | Des données partagées entre de nombreux documents, ou qui croissent sans limite (les avis d'un produit, les commandes d'un utilisateur) |
| **Risque de duplication** | Plus élevé, si la même donnée est embarquée à plusieurs endroits | Plus faible, chaque fait étant stocké une seule fois |

Une règle générale courante : embarquer les données qui "appartiennent" à un document et sont toujours lues avec lui ; référencer les données partagées, réutilisées dans de nombreux documents, ou pouvant croître indéfiniment (embarquer des milliers d'avis directement dans un seul document produit, par exemple, rendrait ce document ingérable à cause de sa taille).

**Erreur courante :** toujours embarquer par habitude, même pour des données qui croissent sans limite — comme embarquer chaque commande jamais passée par un client directement dans son document client. Ce document ne cesse de grossir et finit par devenir lent à lire et à mettre à jour, alors qu'une collection `orders` séparée et référencée passerait bien mieux à l'échelle.

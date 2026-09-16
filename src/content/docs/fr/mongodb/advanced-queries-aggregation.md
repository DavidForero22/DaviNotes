---
title: "Requêtes avancées et agrégation en MongoDB"
---

# Requêtes Avancées et Agrégation

Les fondamentaux acquis, il est temps d'accélérer les recherches avec des index et de répondre à des questions plus complexes qu'un simple filtre — totaux, données croisées, formes transformées — grâce au pipeline d'agrégation de MongoDB. Cette section couvre aussi comment garder les documents cohérents et quelques façons éprouvées de structurer les collections pour des besoins courants et réels.

---

## Table des matières

<div id="content-table">

- [2.1. Indexation dans MongoDB](#21-indexation-dans-mongodb "Index simples, composites, textuels et géospatiaux")
- [2.2. Aggregation Pipeline I : étapes de base](#22-aggregation-pipeline-i--étapes-de-base "$match, $project, $group, $sort")
- [2.3. Aggregation Pipeline II : jointure et décomposition](#23-aggregation-pipeline-ii--jointure-et-décomposition "$lookup et $unwind")
- [2.4. Validation de schéma](#24-validation-de-schéma "Imposer une structure avec JSON Schema")
- [2.5. Design patterns NoSQL](#25-design-patterns-nosql "Bucket, Subset et Outlier pattern")

</div>

---

## 2.1. Indexation dans MongoDB

Tout comme MySQL (section 2.4 de son guide), MongoDB doit parcourir chaque document d'une collection pour satisfaire une requête, à moins de pouvoir utiliser un **index** — une structure séparée qui lui permet de sauter directement aux documents correspondants au lieu de tous les vérifier.

```js

    db.books.createIndex({ genre: 1 });                         // Index simple, ordre croissant
    db.books.createIndex({ genre: 1, price: -1 });               // Index composite (genre, puis price décroissant)
    db.books.createIndex({ title: "text", description: "text" }); // Index textuel, pour chercher des mots dans des champs texte
    db.stores.createIndex({ location: "2dsphere" });              // Index géospatial, pour les requêtes basées sur la localisation


```

| Type d'index | Accélère |
| :--- | :--- |
| Simple | Filtrer ou trier par un champ |
| Composite | Filtrer ou trier par plusieurs champs ensemble, dans cet ordre |
| Textuel | Rechercher des mots dans des champs de type chaîne (requêtes `$text`) |
| Géospatial | Les requêtes "près de moi" ou "dans cette zone" sur des coordonnées |

`db.books.find({ genre: "sci-fi" }).explain("executionStats")` montre si une requête a réellement utilisé un index (`IXSCAN`) ou si elle a fini par parcourir toute la collection (`COLLSCAN`) — le même rôle de diagnostic que joue `EXPLAIN` dans MySQL.

**Erreur courante :** créer un index composite avec le mauvais ordre de champs. Un index composite sur `{ genre: 1, price: -1 }` accélère efficacement les requêtes filtrant par `genre` seul, ou par `genre` et `price` ensemble, mais n'aide **pas** significativement une requête filtrant par `price` seul — l'ordre compte.

---

## 2.2. Aggregation Pipeline I : étapes de base

Le **pipeline d'agrégation** est l'outil de MongoDB pour tout ce qui dépasse un simple filtre : totaux, comptages groupés, remodelage de documents, et plus. Il fonctionne comme une séquence d'**étapes**, chacune prenant les documents produits par l'étape précédente et les transformant davantage — comme une chaîne de montage pour les données.

```js

    db.orders.aggregate([
        { $match: { status: "completed" } },              // 1. Ne garde que les commandes terminées
        { $group: { _id: "$customerId", total: { $sum: "$amount" } } }, // 2. Additionne les montants par client
        { $sort: { total: -1 } },                          // 3. Trie les clients par total dépensé, du plus élevé au plus bas
    ]);


```

| Étape | Rôle |
| :--- | :--- |
| `$match` | Filtre les documents, tout comme `find()` — généralement placée en premier pour réduire le travail des étapes suivantes |
| `$project` | Remodèle chaque document : choisit les champs à inclure, exclure, ou calcule de nouveaux champs |
| `$group` | Regroupe les documents selon une valeur choisie et calcule des totaux, comptages ou moyennes par groupe |
| `$sort` | Trie les documents résultants |

`$project` est particulièrement utile pour cacher des champs que vous ne voulez pas envoyer à une application (comme un champ à usage interne uniquement), ou pour calculer une nouvelle valeur à la volée :

```js

    db.books.aggregate([
        { $project: { title: 1, discountedPrice: { $multiply: ["$price", 0.9] } } },
    ]);


```

**Erreur courante :** placer `$match` à la fin du pipeline plutôt qu'aussi près que possible du début. `$match` réduit le nombre de documents que chaque étape suivante doit traiter, donc filtrer tôt rend tout le pipeline plus rapide ; filtrer tard signifie que les étapes précédentes gaspillent des efforts à traiter des documents qui seront de toute façon écartés.

---

## 2.3. Aggregation Pipeline II : jointure et décomposition

MongoDB privilégie l'embedding (section 1.5), mais lorsque les données sont référencées dans des collections séparées, `$lookup` effectue une jointure, très semblable au `JOIN` de SQL, en récupérant les documents correspondants d'une autre collection.

```js

    db.orders.aggregate([
        {
            $lookup: {
                from: "customers",        // La collection à joindre
                localField: "customerId", // Champ dans "orders"
                foreignField: "_id",      // Champ correspondant dans "customers"
                as: "customerInfo",       // Nom du nouveau champ tableau contenant les correspondances
            },
        },
    ]);


```

Comme un `$lookup` peut correspondre à plusieurs documents, son résultat est toujours placé dans un champ de type **tableau** (`customerInfo` ci-dessus), même quand — comme avec un seul client correspondant — ce tableau ne contient jamais qu'un seul élément.

`$unwind` prend un champ tableau et le retransforme en plusieurs documents séparés, un par élément du tableau — utile juste après un `$lookup`, ou chaque fois qu'une liste embarquée (comme les lignes d'une commande) doit être traitée élément par élément.

```js

    db.orders.aggregate([
        { $unwind: "$items" },   // Un document de sortie par élément du tableau "items"
        { $group: { _id: "$items.productId", totalSold: { $sum: "$items.quantity" } } },
    ]);


```

**Erreur courante :** oublier que `$lookup` renvoie un **tableau**, et essayer de lire les données jointes comme s'il s'agissait d'un seul objet (p. ex. `customerInfo.name` au lieu de `customerInfo[0].name`, ou enchaîner avec `$unwind` alors qu'une seule correspondance était attendue sans en avoir la garantie).

---

## 2.4. Validation de schéma

MongoDB n'impose pas à tous les documents d'une collection de partager la même forme, mais on peut tout de même donner à une collection des **règles de validation** optionnelles, écrites avec le standard **JSON Schema**, afin que la base de données elle-même rejette les documents ne respectant pas une structure minimale.

```js

    db.createCollection("books", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["title", "price"],
                properties: {
                    title: { bsonType: "string" },
                    price: { bsonType: "number", minimum: 0 },
                },
            },
        },
    });


```

Avec cette règle en place, `db.books.insertOne({ price: -5 })` est carrément rejeté : `title` manque, et un `price` négatif enfreint la règle `minimum`. Cela donne à une base de données orientée documents un filet de sécurité semblable aux contraintes `NOT NULL` et de type de données offertes gratuitement par une table SQL (section 1.2 du guide MySQL).

**Erreur courante :** s'appuyer uniquement sur le code de l'application pour vérifier la forme des données, sans validation au niveau de la base de données. Si plus d'une application (ou un futur collègue exécutant un script ponctuel) écrit un jour dans cette même collection, seule une règle imposée par la base de données elle-même est garantie d'être respectée par tous.

---

## 2.5. Design Patterns NoSQL

Au-delà du choix de base entre embedding et referencing (section 1.5), quelques patterns nommés résolvent des problèmes de modélisation récurrents et courants dans MongoDB :

| Pattern | Problème résolu | Comment |
| :--- | :--- | :--- |
| **Bucket pattern** | Stocker un très grand nombre de petites lectures individuelles (comme des données de capteur prises une fois par seconde) sous forme de documents séparés devient coûteux et lent | Regrouper de nombreuses lectures survenues proches dans le temps dans un seul document, sous forme de champ tableau |
| **Subset pattern** | Embarquer *tout* d'une chose (comme chaque avis d'un produit) rend le document principal trop volumineux à charger efficacement | Embarquer seulement un petit sous-ensemble utile (p. ex. les 5 avis les plus récents) et garder la liste complète dans une collection séparée et référencée |
| **Outlier pattern** | Une conception fonctionne bien pour le cas typique, mais un document rare (un compte de célébrité avec des millions d'abonnés) brise l'hypothèse qu'une liste peut être embarquée sans risque | Détecter le cas rare et surdimensionné et stocker ses données supplémentaires séparément, tandis que le cas courant garde la conception embarquée plus simple |

```js

    // Bucket pattern : un document par heure, contenant de nombreuses lectures individuelles
    {
      "sensorId": "temp-1",
      "hour": "2024-05-20T14:00:00Z",
      "readings": [
        { "time": "14:00:03", "value": 21.4 },
        { "time": "14:00:04", "value": 21.5 },
        // ... potentiellement des centaines d'autres dans cette même heure
      ]
    }


```

**Erreur courante :** choisir un pattern avant de vraiment savoir comment les données seront lues. La modélisation NoSQL (contrairement à la normalisation en SQL) est guidée par les **patterns d'accès** — les questions précises auxquelles l'application doit répondre rapidement — donc la bonne structure dépend entièrement de la façon dont les données seront interrogées, et non d'une idée abstraite de "correction".

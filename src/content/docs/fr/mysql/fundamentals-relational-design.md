---
title: "Fondamentaux et conception relationnelle en MySQL"
---

# Fondamentaux et Conception Relationnelle

Avant d'écrire la moindre requête, il est utile de comprendre ce qu'est réellement une base de données, comment MySQL organise l'information, et le vocabulaire de base que vous utiliserez dans tous les guides à partir de maintenant. Cette section construit le modèle mental des tables, lignes et colonnes, et introduit la poignée de commandes utilisées pour les créer et les manipuler.

---

## Table des matières

<div id="content-table">

- [1.1. Introduction à MySQL, architecture client-serveur et moteur InnoDB](#11-introduction-à-mysql-architecture-client-serveur-et-moteur-innodb "Ce qu'est un serveur de base de données et comment MySQL est organisé")
- [1.2. Types de données, bases de données et tables (DDL)](#12-types-de-données-bases-de-données-et-tables-ddl "Créer les structures qui contiendront vos données")
- [1.3. Opérations CRUD de base (DML)](#13-opérations-crud-de-base-dml "SELECT, INSERT, UPDATE, DELETE")
- [1.4. Clés primaires, clés étrangères et contraintes](#14-clés-primaires-clés-étrangères-et-contraintes "Relier les tables et protéger l'intégrité des données")
- [1.5. Normalisation et conception E/R](#15-normalisation-et-conception-er "1FN, 2FN, 3FN et diagrammes entité-relation")

</div>

---

## 1.1. Introduction à MySQL, architecture client-serveur et moteur InnoDB

Une **base de données** est une collection organisée d'informations, stockée de façon à pouvoir être recherchée, filtrée et mise à jour de manière fiable — imaginez une version bien plus intelligente et rapide d'une feuille de calcul. **MySQL** est un logiciel, appelé **système de gestion de base de données relationnelle (SGBDR)**, qui crée, stocke et gère des bases de données composées de **tables** : des grilles de lignes et de colonnes, très semblables à un onglet de feuille de calcul, où chaque table contient généralement un type de chose (clients, produits, commandes...).

MySQL fonctionne selon une **architecture client-serveur** : le **serveur** est le programme qui stocke réellement les données et tourne en arrière-plan (souvent sur une machine distincte, accessible par le réseau) ; un **client** est n'importe quel programme qui se connecte au serveur pour lui envoyer des commandes et lire les résultats — l'outil en ligne de commande du guide d'installation en est un, mais le code backend d'un site web, une application mobile, ou un outil graphique comme MySQL Workbench peuvent tous être clients du même serveur en même temps.

| | Serveur | Client |
| :--- | :--- | :--- |
| **Rôle** | Stocke et gère les données réelles | Envoie des requêtes et affiche les résultats |
| **Où il tourne** | En continu, en arrière-plan | Seulement pendant que vous l'utilisez activement |
| **Combien à la fois** | Généralement un par base de données | Plusieurs clients peuvent se connecter au même serveur |

En interne, MySQL délègue le travail réel de lecture et d'écriture des données à un composant appelé **moteur de stockage**. **InnoDB** est le moteur par défaut et le plus utilisé : il garde les données en sécurité même en cas de coupure de courant en pleine écriture, et prend en charge les relations entre tables abordées plus loin dans ce guide. Sauf raison spécifique de choisir un autre moteur, InnoDB est le bon choix par défaut.

**Erreur courante :** confondre MySQL (le logiciel) avec "une base de données". MySQL est le *serveur* qui peut contenir de nombreuses *bases de données* distinctes à la fois, de la même façon qu'un classeur peut contenir de nombreux dossiers distincts.

---

## 1.2. Types de données, bases de données et tables (DDL)

Les commandes qui créent ou modifient la *structure* de vos données (par opposition aux données elles-mêmes) sont appelées **DDL** (Data Definition Language). La première structure dont vous avez besoin est une **base de données**, un conteneur nommé pour des tables liées :

```sql

    CREATE DATABASE librairie;
    USE librairie;   -- Indique à MySQL que toutes les commandes suivantes s'appliquent à cette base de données


```

À l'intérieur d'une base de données, une **table** se crée en listant ses **colonnes** (les informations que possédera chaque ligne) et le **type de données** de chacune — cela indique à l'avance à MySQL quel type de valeur attendre, afin de le stocker efficacement et de rejeter tout ce qui ne correspond pas.

| Type de données | Stocke | Exemple |
| :--- | :--- | :--- |
| `INT` | Des nombres entiers | `42` |
| `DECIMAL(10,2)` | Des nombres décimaux précis (p. ex. de l'argent) | `19.99` |
| `VARCHAR(n)` | Du texte court, jusqu'à `n` caractères | `"Alex"` |
| `TEXT` | Du texte long, de longueur quasi illimitée | La description complète d'un livre |
| `DATE` | Une date du calendrier | `2024-05-20` |
| `BOOLEAN` | Vrai ou faux | `TRUE` |

```sql

    CREATE TABLE books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        price DECIMAL(10,2),
        published_date DATE
    );


```

`AUTO_INCREMENT` indique à MySQL de générer automatiquement un nouveau nombre, toujours croissant, pour cette colonne, afin que vous n'ayez jamais à inventer un identifiant à la main. `NOT NULL` signifie que cette colonne ne peut jamais rester vide — MySQL refusera d'enregistrer une ligne qui ne la fournit pas.

**Erreur courante :** choisir `VARCHAR(255)` pour n'importe quel texte par habitude. Un `price` devrait être un type numérique (pour que MySQL puisse faire des calculs avec, comme trier ou additionner), et une description très longue devrait être de type `TEXT` plutôt qu'un `VARCHAR` artificiellement large.

---

## 1.3. Opérations CRUD de base (DML)

Une fois les tables créées, le travail quotidien passe par le **DML** (Data Manipulation Language) : des commandes qui lisent et modifient les *données elles-mêmes*. Ces quatre commandes couvrent l'immense majorité des besoins courants, un acronyme souvent abrégé **CRUD** (Create, Read, Update, Delete) :

```sql

    -- CREATE : ajoute une nouvelle ligne
    INSERT INTO books (title, price, published_date)
    VALUES ('The Pragmatic Programmer', 39.99, '1999-10-30');

    -- READ : récupère des lignes
    SELECT title, price FROM books WHERE price < 40;

    -- UPDATE : modifie des lignes existantes
    UPDATE books SET price = 34.99 WHERE title = 'The Pragmatic Programmer';

    -- DELETE : supprime des lignes
    DELETE FROM books WHERE title = 'The Pragmatic Programmer';


```

`SELECT` est la commande que vous taperez le plus souvent : `SELECT * FROM books;` lit toutes les colonnes de toutes les lignes (`*` signifie "toutes les colonnes"), tandis que `SELECT title, price FROM books;` ne lit que les deux colonnes demandées — limiter les colonnes demandées garde les résultats lisibles et les requêtes plus rapides.

**Erreur courante :** exécuter `UPDATE` ou `DELETE` **sans** clause `WHERE`. `WHERE` est le filtre qui indique *quelles* lignes toucher ; sans lui, MySQL met à jour ou supprime **absolument toutes les lignes** de la table, sans confirmation et sans annulation facile.

```sql

    -- ❌ DANGEREUX : change le prix de tous les livres de la table
    UPDATE books SET price = 34.99;

    -- ✅ SÛR : change le prix uniquement du livre correspondant
    UPDATE books SET price = 34.99 WHERE title = 'The Pragmatic Programmer';


```

---

## 1.4. Clés primaires, clés étrangères et contraintes

Une **clé primaire (PK)** est une colonne (ou une combinaison de colonnes) qui identifie de façon unique chaque ligne d'une table — deux lignes ne peuvent jamais partager la même valeur, un peu comme deux personnes ne partagent jamais le même numéro de passeport. C'est ce que `id INT AUTO_INCREMENT PRIMARY KEY` a mis en place à la section 1.2.

Une **clé étrangère (FK)** est une colonne d'une table qui pointe vers la clé primaire d'une autre table, créant un lien entre elles. C'est la partie "relationnelle" de "base de données relationnelle" : au lieu de répéter tous les détails d'un client sur chaque commande, une table `orders` stocke simplement l'`id` de ce client.

```sql

    CREATE TABLE customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL
    );

    CREATE TABLE orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT,
        total DECIMAL(10,2),
        FOREIGN KEY (customer_id) REFERENCES customers(id)
    );


```

Avec cette clé étrangère en place, MySQL applique une **contrainte** : une règle que la base de données refuse d'enfreindre. Ici, elle refuse d'insérer une commande dont le `customer_id` ne correspond à aucun client existant, et par défaut elle refuse aussi de supprimer un client qui a encore des commandes pointant vers lui — vous protégeant de commandes "orphelines" faisant référence à quelqu'un qui n'existe plus.

| Contrainte | Ce qu'elle garantit |
| :--- | :--- |
| `PRIMARY KEY` | Chaque ligne est identifiable de façon unique |
| `FOREIGN KEY` | Une référence pointe toujours vers une ligne qui existe réellement |
| `NOT NULL` | Une colonne n'est jamais laissée vide |
| `UNIQUE` | Aucune ligne ne partage la même valeur dans cette colonne (p. ex. une adresse e-mail) |

**Erreur courante :** stocker des informations répétées (comme le nom complet et l'adresse d'un client) directement dans la table `orders` au lieu de les relier à la table `customers` via une clé étrangère. Si ce client déménage, chacune de ses anciennes commandes devrait être mise à jour individuellement, au lieu que le changement se fasse à un seul endroit.

---

## 1.5. Normalisation et conception E/R

La **normalisation** est le processus consistant à organiser les tables de sorte que chaque information soit stockée à un seul endroit exactement, évitant les doublons et les incohérences qu'ils provoquent. Elle s'explique généralement par une série de règles de plus en plus strictes, appelées **formes normales** :

| Forme normale | Règle (en termes simples) |
| :--- | :--- |
| **1FN** (Première) | Chaque colonne contient une seule valeur — pas de listes ni de valeurs séparées par des virgules entassées dans une seule cellule. |
| **2FN** (Deuxième) | Chaque colonne non-clé dépend de la *totalité* de la clé primaire, pas seulement d'une partie. |
| **3FN** (Troisième) | Chaque colonne non-clé dépend *uniquement* de la clé primaire, pas d'une autre colonne non-clé. |

Un rapide exemple avant/après pour corriger une violation de la 1FN :

```sql

    -- ❌ Viole la 1FN : plusieurs numéros de téléphone entassés dans une seule cellule
    -- | id | name  | phones                  |
    -- | 1  | Alex  | "555-1234, 555-5678"    |

    -- ✅ Corrigé : un numéro de téléphone par ligne, dans sa propre table reliée par une clé étrangère
    CREATE TABLE customer_phones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT,
        phone VARCHAR(20),
        FOREIGN KEY (customer_id) REFERENCES customers(id)
    );


```

Avant de créer la moindre table, la plupart des concepteurs de bases de données esquissent d'abord un **diagramme E/R** (diagramme entité-relation) : un dessin simple où des boîtes représentent les **entités** (les "choses" qui deviendront des tables, comme `Customer` ou `Order`) et des lignes représentent les **relations** entre elles (un client peut avoir *plusieurs* commandes). Planifier cela sur papier au préalable facilite grandement la détection de clés étrangères manquantes ou de données dupliquées avant d'écrire la moindre ligne de SQL.

**Erreur courante :** sur-normaliser un projet simple et de petite taille au point que presque chaque requête doive joindre cinq ou six tables juste pour afficher un seul écran. La normalisation réduit la duplication, mais chaque table supplémentaire ajoute aussi de la complexité — les conceptions du monde réel équilibrent les deux plutôt que de courir après la forme normale la plus stricte à tout prix.

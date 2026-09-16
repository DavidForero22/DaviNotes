---
title: "Requêtes avancées et exploitation en MySQL"
---

# Requêtes Avancées et Exploitation

Les bases acquises, il est temps de combiner des informations réparties sur plusieurs tables, de résumer de grandes quantités de données, et de garantir que les changements se produisent en toute sécurité même lorsque plusieurs personnes utilisent la base de données en même temps. Cette section couvre la jointure de tables, l'agrégation de données, les transactions, les index, et l'automatisation de la logique au sein même de MySQL.

---

## Table des matières

<div id="content-table">

- [2.1. Requêtes multi-tables : JOIN et sous-requêtes](#21-requêtes-multi-tables--join-et-sous-requêtes "Combiner des données de plusieurs tables")
- [2.2. Agrégation de données](#22-agrégation-de-données "GROUP BY, HAVING et fonctions d'agrégation")
- [2.3. Transactions et propriétés ACID](#23-transactions-et-propriétés-acid "COMMIT, ROLLBACK et isolation")
- [2.4. Index](#24-index "Accélérer les recherches avec les index B-Tree, composites et UNIQUE")
- [2.5. Vues, procédures stockées et triggers](#25-vues-procédures-stockées-et-triggers "Automatiser la logique au sein de la base de données")

</div>

---

## 2.1. Requêtes multi-tables : JOIN et sous-requêtes

Comme une base de données relationnelle répartit l'information sur plusieurs tables liées (voir la section 1.4 sur les clés étrangères), obtenir une vue complète — comme "chaque commande accompagnée du nom du client" — nécessite généralement de combiner, ou **joindre**, deux tables ou plus dans une seule requête.

```sql

    -- N'affiche que les commandes qui ONT un client correspondant
    SELECT orders.id, customers.name, orders.total
    FROM orders
    INNER JOIN customers ON orders.customer_id = customers.id;


```

`INNER JOIN` ne conserve que les lignes qui correspondent des deux côtés. `LEFT JOIN` conserve **toutes** les lignes de la première table (la gauche), en remplissant avec des valeurs vides (`NULL`) quand il n'y a pas de correspondance à droite — utile pour des questions comme "lister chaque client, y compris ceux qui n'ont jamais passé de commande."

```sql

    -- Inclut les clients même s'ils ont zéro commande (orders.id sera NULL pour eux)
    SELECT customers.name, orders.id
    FROM customers
    LEFT JOIN orders ON orders.customer_id = customers.id;


```

| | `INNER JOIN` | `LEFT JOIN` | `RIGHT JOIN` |
| :--- | :--- | :--- | :--- |
| **Conserve** | Seulement les lignes correspondant des deux côtés | Toutes les lignes de la table de gauche | Toutes les lignes de la table de droite |
| **Usage typique** | "Commandes ayant un client" | "Chaque client, avec ou sans commandes" | "Chaque commande, avec ou sans client" (rare) |

Une **sous-requête** est une requête imbriquée dans une autre, utile quand un filtre dépend d'une valeur qui doit elle-même d'abord être calculée :

```sql

    -- Trouve les clients dont les dépenses totales dépassent la moyenne
    SELECT name FROM customers
    WHERE id IN (
        SELECT customer_id FROM orders
        GROUP BY customer_id
        HAVING SUM(total) > (SELECT AVG(total) FROM orders)
    );


```

**Erreur courante :** utiliser `INNER JOIN` alors que l'objectif était en réalité d'inclure les lignes sans correspondance. Comme `INNER JOIN` élimine silencieusement tout ce qui n'a pas de correspondance, un rapport peut discrètement perdre des entrées (comme des clients sans commande pour l'instant) sans qu'aucune erreur ne s'affiche.

---

## 2.2. Agrégation de données

Les **fonctions d'agrégation** condensent de nombreuses lignes en une seule valeur de synthèse — un total, une moyenne, un compte. `GROUP BY` applique ce calcul séparément pour chaque valeur distincte d'une colonne, transformant "le total de toutes les commandes" en "le total des commandes, par client."

```sql

    SELECT customer_id, COUNT(*) AS order_count, SUM(total) AS total_spent
    FROM orders
    GROUP BY customer_id;


```

| Fonction | Retourne |
| :--- | :--- |
| `COUNT(*)` | Le nombre de lignes |
| `SUM(colonne)` | La somme d'une colonne numérique |
| `AVG(colonne)` | La moyenne d'une colonne numérique |
| `MIN(colonne)` / `MAX(colonne)` | La plus petite / grande valeur |

`WHERE` filtre les lignes individuelles **avant** le regroupement ; `HAVING` filtre les **groupes eux-mêmes**, après l'exécution de la fonction d'agrégation — c'est la différence clé entre les deux, et pourquoi `HAVING` est nécessaire.

```sql

    -- WHERE : ne considère que les commandes passées cette année, avant regroupement
    -- HAVING : après regroupement, ne garde que les clients ayant dépensé plus de 500€ au total
    SELECT customer_id, SUM(total) AS total_spent
    FROM orders
    WHERE YEAR(order_date) = 2024
    GROUP BY customer_id
    HAVING SUM(total) > 500;


```

**Erreur courante :** essayer de filtrer un résultat agrégé avec `WHERE` au lieu de `HAVING` (p. ex. `WHERE SUM(total) > 500`). MySQL rejette cela avec une erreur, car `WHERE` s'exécute avant même que les totaux n'existent — la somme n'est calculée qu'une fois les lignes regroupées.

---

## 2.3. Transactions et propriétés ACID

Une **transaction** regroupe plusieurs changements en une seule unité de travail tout-ou-rien — essentielle lorsqu'une action réelle nécessite que plusieurs modifications de la base de données réussissent ensemble. L'exemple classique est un virement bancaire : soustraire de l'argent d'un compte et l'ajouter à un autre doivent **tous deux** se produire, ou **aucun** des deux, sinon de l'argent disparaît ou apparaît de nulle part.

```sql

    START TRANSACTION;

    UPDATE accounts SET balance = balance - 100 WHERE id = 1;
    UPDATE accounts SET balance = balance + 100 WHERE id = 2;

    COMMIT;   -- Rend les deux changements permanents en une fois
    -- ROLLBACK;   -- Ou bien : annule tous les changements effectués depuis START TRANSACTION


```

Si quelque chose se passe mal en cours de route (une erreur, une connexion perdue), exécuter `ROLLBACK` au lieu de `COMMIT` annule tous les changements effectués depuis le début de la transaction, comme si elle n'avait jamais eu lieu.

Les transactions sont garanties par quatre propriétés connues sous l'acronyme **ACID** :

| Lettre | Propriété | Signification |
| :--- | :--- | :--- |
| **A** | Atomicité | Tous les changements d'une transaction se produisent, ou aucun. |
| **C** | Cohérence | Une transaction ne peut jamais laisser la base de données en violation de ses propres règles (comme les contraintes). |
| **I** | Isolation | Les transactions exécutées en même temps n'interfèrent pas avec les changements en cours des autres. |
| **D** | Durabilité | Une fois validée (commit), une transaction survit même à un plantage juste après. |

**Erreur courante :** enrober une longue série de changements dans une transaction et oublier de faire `COMMIT` (ou `ROLLBACK`) à la fin. Les changements restent "en attente" et invisibles pour les autres connexions, et peuvent finir par **verrouiller** les lignes concernées, bloquant les autres utilisateurs jusqu'à ce que la transaction soit enfin close.

---

## 2.4. Index

Sans aide, MySQL doit parcourir chaque ligne d'une table pour trouver celles correspondant à une condition `WHERE` — rapide pour une centaine de lignes, douloureusement lent pour dix millions. Un **index** est une structure supplémentaire et séparée que MySQL maintient, lui permettant de sauter presque directement vers les lignes correspondantes, un peu comme l'index d'un livre permet de trouver un sujet sans lire toutes les pages.

```sql

    CREATE INDEX idx_customer_email ON customers(email);

    -- Un index UNIQUE impose aussi qu'aucune ligne ne partage la même valeur
    CREATE UNIQUE INDEX idx_customer_email_unique ON customers(email);


```

Par défaut, MySQL (via InnoDB) construit les index avec un **B-Tree**, une structure organisée de sorte que trouver n'importe quelle valeur prenne à peu près le même petit nombre d'étapes, quelle que soit la taille de la table. Un **index composite** couvre plusieurs colonnes à la fois, et accélère les requêtes filtrant ou triant selon exactement cette combinaison de colonnes ensemble.

```sql

    -- Accélère les requêtes filtrant par last_name ET first_name ENSEMBLE
    CREATE INDEX idx_full_name ON customers(last_name, first_name);


```

Les index ne sont pas gratuits : chaque index doit aussi être mis à jour par MySQL à chaque insertion, mise à jour ou suppression de ligne, donc en ajouter un sur une colonne rarement recherchée mais fréquemment modifiée peut ralentir la base de données plutôt que l'accélérer. `EXPLAIN` (vu à la section 3.1) montre si une requête utilise réellement un index disponible.

**Erreur courante :** ajouter un index à chaque colonne "au cas où". Les index accélèrent les lectures mais ralentissent les écritures et occupent de l'espace disque supplémentaire, ils devraient donc être ajoutés de façon délibérée, en fonction des colonnes que les requêtes filtrent ou trient réellement.

---

## 2.5. Vues, procédures stockées et triggers

Une **vue** est une requête enregistrée qui se comporte comme une table virtuelle : elle ne stocke pas de données elle-même, mais réexécute sa requête sous-jacente à chaque utilisation, ce qui est pratique pour cacher un `JOIN` complexe derrière un nom simple.

```sql

    CREATE VIEW customer_orders_summary AS
    SELECT customers.name, COUNT(orders.id) AS order_count
    FROM customers
    LEFT JOIN orders ON orders.customer_id = customers.id
    GROUP BY customers.name;

    -- Désormais, cela se lit comme une table normale
    SELECT * FROM customer_orders_summary;


```

Une **procédure stockée** est un bloc de logique SQL enregistré et réutilisable — semblable à une fonction dans un langage de programmation — qui peut accepter des paramètres et être appelé par son nom au lieu de retaper le même ensemble d'instructions à chaque fois.

```sql

    DELIMITER //
    CREATE PROCEDURE AddOrder(IN cust_id INT, IN order_total DECIMAL(10,2))
    BEGIN
        INSERT INTO orders (customer_id, total) VALUES (cust_id, order_total);
    END //
    DELIMITER ;

    CALL AddOrder(1, 49.99);


```

Un **trigger** exécute un bloc SQL **automatiquement** chaque fois qu'un événement spécifique se produit sur une table (avant ou après un `INSERT`, `UPDATE` ou `DELETE`), sans que personne n'ait à se souvenir de l'appeler.

```sql

    CREATE TABLE order_audit (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT,
        changed_at DATETIME
    );

    CREATE TRIGGER after_order_update
    AFTER UPDATE ON orders
    FOR EACH ROW
    INSERT INTO order_audit (order_id, changed_at) VALUES (NEW.id, NOW());


```

**Erreur courante :** cacher une logique métier importante dans des triggers qui s'exécutent silencieusement en arrière-plan. Ils sont utiles pour des tâches petites et prévisibles (comme le journal d'audit ci-dessus), mais une logique difficile à voir peut rendre le débogage d'une application bien plus compliqué, puisqu'un développeur lisant le code de l'application ne saura pas forcément qu'un trigger s'exécute aussi.

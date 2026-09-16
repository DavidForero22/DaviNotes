---
title: "Fonctions et gestion des données en PHP"
---

# Fonctions et gestion des données

Une fois la syntaxe de base acquise, l'étape suivante consiste à organiser votre code et à manipuler des données. Ce guide explique comment créer des **fonctions** (des blocs de code réutilisables) et comment gérer les deux types de données les plus courants en développement web : les **strings** (textes) et les **arrays** (tableaux, c'est-à-dire des listes de valeurs).

---

## Table des matières

<div id="content-table">

- [1. Fonctions personnalisées](#1-fonctions-personnalisées "Créer vos propres fonctions")
- [2. Paramètres et valeurs de retour](#2-paramètres-et-valeurs-de-retour "Arguments et valeurs renvoyées")
- [3. Manipulation de texte](#3-manipulation-de-texte "Techniques pour travailler avec les strings")
- [4. Travailler avec des tableaux](#4-travailler-avec-des-tableaux "Les structures de tableaux en PHP")
    - [4.1. Tableaux indexés](#41-tableaux-indexés "Tableaux avec des indices numériques")
    - [4.2. Tableaux associatifs](#42-tableaux-associatifs "Tableaux qui utilisent des clés nommées")
    - [4.3. Tableaux multidimensionnels](#43-tableaux-multidimensionnels "Tableaux qui contiennent d'autres tableaux")
- [5. Fonctions de tableaux courantes](#5-fonctions-de-tableaux-courantes "Fonctions intégrées pour manipuler les tableaux")

</div>

---

## 1. Fonctions personnalisées

Une **fonction** est un bloc d'instructions nommé que l'on peut exécuter autant de fois qu'on le souhaite, simplement en écrivant son nom. C'est comme une recette : on l'écrit une fois et on la suit chaque fois qu'on en a besoin.

Une fonction ne s'exécute pas toute seule au chargement de la page ; elle ne s'exécute que lorsqu'elle est **appelée**. Pour en créer une, commencez par le mot `function`, suivi de son nom et de parenthèses.

```php

    <?php
    // Définir la fonction (écrire la recette)
    function writeMessage() {
        echo "Bonjour, bienvenue dans le développement PHP !";
    }

    // Appeler la fonction (suivre la recette)
    writeMessage();
    writeMessage(); // On peut l'appeler autant de fois que nécessaire
    ?>


```

---

## 2. Paramètres et valeurs de retour

Les fonctions deviennent beaucoup plus utiles quand elles peuvent recevoir des données et renvoyer un résultat.

Les **paramètres** sont des variables écrites entre les parenthèses de la fonction. Les valeurs transmises lors de l'appel s'appellent des **arguments**.

```php

    <?php
    function familyName($firstName) {
        echo "$firstName Jaeger.<br>";
    }

    familyName("Eren"); // Affiche : Eren Jaeger.
    familyName("Zeke"); // Affiche : Zeke Jaeger.
    ?>


```

Pour qu'une fonction renvoie une valeur, utilisez l'instruction `return`. Le résultat peut ensuite être stocké dans une variable ou utilisé dans une autre opération.

```php

    <?php
    function sum($x, $y) {
        $z = $x + $y;
        return $z;
    }

    echo "5 + 10 = " . sum(5, 10); // Affiche : 5 + 10 = 15
    ?>


```

**Erreur fréquente :** utiliser `echo` dans une fonction alors qu'on a besoin du résultat. `echo` affiche seulement la valeur sur la page ; le code qui a appelé la fonction ne reçoit rien.

```php

    <?php
    // ❌ INCORRECT : affiche 15, mais sum() ne renvoie rien (NULL), donc $total vaut 0
    function sum($x, $y) {
        echo $x + $y;
    }
    $total = sum(5, 10) * 2;

    // ✅ CORRECT : return renvoie la valeur, donc $total vaut 30
    function sum($x, $y) {
        return $x + $y;
    }
    $total = sum(5, 10) * 2;
    ?>


```

**Erreur fréquente :** utiliser une variable définie en dehors de la fonction. Chaque fonction a son propre espace séparé pour les variables (sa *portée*), elle ne voit donc pas les variables créées à l'extérieur. Transmettez-les en paramètres.

```php

    <?php
    $taxRate = 0.21;

    // ❌ INCORRECT : $taxRate n'existe pas dans la fonction (Warning: Undefined variable)
    function addTax($price) {
        return $price + $price * $taxRate;
    }

    // ✅ CORRECT : la valeur est reçue en paramètre
    function addTax($price, $taxRate) {
        return $price + $price * $taxRate;
    }

    echo addTax(100, $taxRate); // Affiche : 121
    ?>


```

---

## 3. Manipulation de texte

Un **string** est un texte. Comme créer des pages web consiste surtout à produire du texte (HTML), PHP propose de nombreuses fonctions intégrées pour manipuler les strings.

Voici quelques-unes des **fonctions de texte** les plus courantes :

* `strlen()` : Renvoie le nombre de caractères d'un texte.
* `str_word_count()` : Compte le nombre de mots d'un texte.
* `strtoupper()` / `strtolower()` : Met le texte en majuscules / minuscules.
* `strpos()` : Trouve la position d'un texte dans un autre texte.
* `str_replace()` : Remplace un texte par un autre.

Exemple :

```php

    <?php
    $text = "Hello World";

    // Obtenir la longueur
    echo strlen($text); // Affiche : 11

    // Remplacer du texte
    echo str_replace("World", "PHP", $text); // Affiche : Hello PHP

    // Mettre en majuscules
    echo strtoupper($text); // Affiche : HELLO WORLD
    ?>


```

*Remarque : `strlen()` compte des octets, donc les lettres accentuées (comme `é` ou `à`) comptent pour deux. Utilisez `mb_strlen()` quand votre texte peut en contenir.*

---

## 4. Travailler avec des tableaux

Un **tableau** (*array*) stocke plusieurs valeurs dans une seule variable, comme une liste. En PHP, les tableaux sont très souples et utilisés partout, des réglages de configuration aux résultats d'une requête en base de données.

### 4.1. Tableaux indexés
Des tableaux où chaque valeur a une position numérique (l'**indice**), attribuée automatiquement et commençant à `0`.

```php

    <?php
    $cars = ["Volvo", "BMW", "Toyota"];
    
    echo "J'aime " . $cars[0] . " et " . $cars[1]; // Affiche : J'aime Volvo et BMW
    ?>


```

La syntaxe courte `[...]` est la façon moderne de créer des tableaux. Vous verrez aussi l'ancienne forme `array("Volvo", "BMW", "Toyota")`, qui fait exactement la même chose.

### 4.2. Tableaux associatifs
Des tableaux où chaque valeur a une **clé** (un nom) de votre choix, au lieu d'un nombre. Ils ressemblent aux objets JSON ou aux dictionnaires Python.

```php

    <?php
    $ages = ["Pierre" => 35, "Ben" => 37, "Joe" => 43];

    // Accéder aux valeurs par clé
    echo "Pierre a " . $ages["Pierre"] . " ans.";
    ?>


```

### 4.3. Tableaux multidimensionnels
Des tableaux qui contiennent d'autres tableaux, comme un tableau avec des lignes et des colonnes. On les rencontre souvent avec des listes d'enregistrements, comme les utilisateurs d'un site.

```php

    <?php
    $contacts = [
        ["name" => "Pierre", "email" => "pierre@test.com"],
        ["name" => "Ben", "email" => "ben@test.com"],
    ];

    // Première ligne, colonne "email"
    echo $contacts[0]["email"]; // Affiche : pierre@test.com
    ?>


```

**Erreur fréquente :** essayer d'afficher un tableau entier avec `echo`. `echo` ne fonctionne qu'avec des valeurs simples : il affiche le mot `Array` et un avertissement. Utilisez `print_r()` (ou `var_dump()`) pour voir son contenu pendant vos tests.

```php

    <?php
    $cars = ["Volvo", "BMW"];

    // ❌ INCORRECT : affiche "Array" (Warning: Array to string conversion)
    echo $cars;

    // ✅ CORRECT : affiche chaque élément avec son indice
    print_r($cars); // Affiche : Array ( [0] => Volvo [1] => BMW )
    ?>


```

---

## 5. Fonctions de tableaux courantes

PHP propose une vaste bibliothèque de fonctions pour manipuler les tableaux.

* `count()` : Renvoie le nombre d'éléments.
* `sort()` / `rsort()` : Trie le tableau par ordre croissant / décroissant.
* `array_push()` : Ajoute un ou plusieurs éléments à la fin. La forme courte `$array[] = valeur;` fait la même chose pour un seul élément.
* `in_array()` : Vérifie si une valeur existe dans le tableau.

```php

    <?php
    $fruits = ["Pomme", "Banane"];

    // Ajouter un élément (les deux lignes font la même chose)
    array_push($fruits, "Orange");
    $fruits[] = "Mangue";

    echo count($fruits); // Affiche : 4

    // Vérifier si une valeur existe
    if (in_array("Pomme", $fruits)) {
        echo "Nous avons des pommes !";
    }
    ?>


```

**Erreur fréquente :** faire confiance à `in_array()` avec des valeurs de types différents. Par défaut, la comparaison est souple (comme `==`) : un texte comme `"1e1"` est considéré égal au nombre `10`. Passez `true` en troisième argument pour une comparaison stricte (comme `===`).

```php

    <?php
    $allowedIds = [10, 20, 30];

    // ❌ INCORRECT : "1e1" (notation scientifique de 10) est accepté comme id valide
    in_array("1e1", $allowedIds);       // true

    // ✅ CORRECT : le mode strict compare aussi le type
    in_array("1e1", $allowedIds, true); // false
    ?>


```

---
title: "Les bases de PHP"
---

# Les bases de PHP

Ce guide présente les briques de base de PHP. PHP est un langage **côté serveur** : son code s'exécute sur le **serveur** (l'ordinateur qui héberge le site), et non dans le navigateur du visiteur. Le serveur exécute le code PHP, produit une page HTML et n'envoie que ce HTML au navigateur. C'est pourquoi les visiteurs ne voient jamais votre code PHP.

C'est l'inverse de **JavaScript** dans le navigateur, qui est envoyé sur l'appareil du visiteur et s'y exécute.

---

## Table des matières

<div id="content-table">

- [1. Syntaxe de base](#1-syntaxe-de-base "Introduction à la syntaxe PHP")
    - [1.1. Intégrer PHP dans du HTML](#11-intégrer-php-dans-du-html "Comment insérer du code PHP dans un document HTML")
- [2. Variables et constantes](#2-variables-et-constantes "Définir et utiliser des variables et des constantes")
    - [2.1. Règles des variables](#21-règles-des-variables "Règles pour nommer et utiliser les variables")
    - [2.2. Constantes](#22-constantes "Créer et utiliser des constantes")
- [3. Types de données](#3-types-de-données "Les types de données de PHP")
- [4. Opérateurs](#4-opérateurs "Opérateurs arithmétiques, de comparaison et logiques")
- [5. Structures de contrôle](#5-structures-de-contrôle "Contrôler le déroulement avec des conditions et des boucles")
    - [5.1. Conditions](#51-conditions "Utiliser if, elseif et else")
    - [5.2. Boucles](#52-boucles "Répéter du code avec des boucles")

</div>

---

## 1. Syntaxe de base

Un fichier PHP (qui se termine par `.php`) mélange généralement du HTML classique et des morceaux de code PHP. Le code PHP se place entre les balises `<?php` et `?>` : tout ce qui est à l'intérieur s'exécute sur le serveur, et tout ce qui est à l'extérieur est envoyé tel quel au navigateur.

```php

    <?php
    // Le code PHP se place ici
    echo "Bonjour le monde !";
    ?>


```

`echo` écrit du texte dans la page qui sera envoyée au navigateur.

Chaque instruction PHP doit se terminer par un point-virgule (`;`), comme le point à la fin d'une phrase. L'oubli du point-virgule est l'erreur la plus fréquente chez les débutants.

```php

    <?php
    // ❌ INCORRECT : point-virgule manquant (Parse error: syntax error, unexpected token "echo")
    echo "Bonjour"
    echo "le monde";

    // ✅ CORRECT
    echo "Bonjour";
    echo "le monde";
    ?>


```

Les **commentaires** sont des notes pour la personne qui lit le code ; PHP les ignore. On peut les écrire de trois façons :

```php

    <?php
    // Ceci est un commentaire sur une ligne

    # Ceci est aussi un commentaire sur une ligne

    /*
    Ceci est un bloc de commentaire
    sur plusieurs lignes
    */
    ?>


```

### 1.1. Intégrer PHP dans du HTML

Le code PHP peut être placé directement dans un document HTML. Cela permet de combiner la structure fixe de la page (HTML) avec du contenu qui change (PHP).

```php

    <!DOCTYPE html>
    <html>
    <head>
        <title>Ma page PHP</title>
    </head>
    <body>
        <h1>Bienvenue sur mon site</h1>
        <p>
            <?php
            $name = "Alice";
            echo "Bonjour, " . $name . " !";
            ?>
        </p>
    </body>
    </html>


```

Dans cet exemple, le code PHP dans la balise `<p>` génère la salutation, tandis que le reste du HTML ne change pas. Le navigateur reçoit seulement `<p>Bonjour, Alice !</p>`. C'est l'une des utilisations les plus courantes de PHP.

Le point `.` assemble des morceaux de texte (on parle de *concaténation*).

---

## 2. Variables et constantes

Une **variable** est une boîte nommée qui stocke une valeur pour pouvoir l'utiliser plus tard. PHP est *faiblement typé* : inutile d'indiquer si une variable contiendra un nombre ou un texte, PHP le déduit de la valeur.

### 2.1. Règles des variables
* Une variable commence toujours par le signe `$`, suivi de son nom.
* Le nom doit commencer par une lettre ou un tiret bas (`_`), jamais par un chiffre.
* Les noms sont **sensibles à la casse** (`$age` et `$AGE` sont deux variables différentes).

```php

    <?php
    $txt = "Apprendre PHP";
    $x = 5;
    $y = 10.5;
    
    echo $txt;
    echo $x + $y; // Affiche : 15.5
    ?>


```

**Erreur fréquente :** oublier le signe `$`. Sans lui, PHP ne comprend pas qu'il s'agit d'une variable.

```php

    <?php
    $name = "Alice";

    // ❌ INCORRECT : "name" sans $ n'est pas une variable (Error: Undefined constant "name")
    echo name;

    // ✅ CORRECT
    echo $name;
    ?>


```

### 2.2. Constantes

Les **constantes** sont comme des variables, mais une fois définies, leur valeur ne peut plus jamais changer. On les utilise pour des réglages fixes, comme l'adresse du site. Elles n'utilisent pas le préfixe `$` et, par convention, s'écrivent en majuscules.

```php

    <?php
    // Avec define()
    define("SITE_URL", "https://mysite.com");

    // Avec le mot-clé const
    const MAX_USERS = 50;

    echo SITE_URL;
    ?>


```

---

## 3. Types de données

PHP propose plusieurs types de données pour stocker différentes sortes d'informations.

1. **String** : Un texte (`"Bonjour"`).
2. **Integer** : Un nombre entier (`10`, `-5`).
3. **Float** : Un nombre à virgule, écrit avec un point (`3.14`).
4. **Boolean** : Seulement deux valeurs possibles, `true` (vrai) ou `false` (faux).
5. **Array** : Une liste qui stocke plusieurs valeurs dans une seule variable.
6. **NULL** : L'absence de valeur.

```php

    <?php
    $string = "Bonjour le monde";
    $int = 5985;
    $float = 10.365;
    $is_active = true;
    $colors = ["Rouge", "Vert", "Bleu"];
    $empty = null;

    var_dump($float); // Affiche le type et la valeur : float(10.365)
    ?>


```

`var_dump()` est très utile pour apprendre : il affiche à la fois le type et la valeur d'une variable.

**Guillemets doubles ou apostrophes :** entre guillemets doubles, PHP remplace les variables par leur valeur. Entre apostrophes, le texte est affiché exactement tel qu'il est écrit.

```php

    <?php
    $name = "Alice";

    // ❌ INCORRECT (si vous voulez la valeur) : les apostrophes affichent le texte littéralement
    echo 'Bonjour, $name'; // Affiche : Bonjour, $name

    // ✅ CORRECT : les guillemets doubles insèrent la valeur de la variable
    echo "Bonjour, $name"; // Affiche : Bonjour, Alice
    ?>


```

---

## 4. Opérateurs

Les opérateurs sont des symboles qui effectuent des opérations sur des valeurs, comme additionner ou comparer des nombres.

### Opérateurs arithmétiques
Les opérations mathématiques habituelles : `+` (additionner), `-` (soustraire), `*` (multiplier), `/` (diviser) et `%` (reste d'une division).

### Opérateurs de comparaison
Ils comparent deux valeurs et renvoient `true` ou `false`. Faites particulièrement attention à la différence entre `==` et `===`.

* `==` : Égal (les valeurs sont égales, même si les types sont différents).
* `===` : Identique (les valeurs **et** les types sont égaux).
* `!=` : Différent.
* `>` / `<` : Supérieur à / Inférieur à.

```php

    <?php
    $x = 100;  
    $y = "100";

    var_dump($x == $y);  // bool(true) : les valeurs sont égales
    var_dump($x === $y); // bool(false) : les types sont différents (int et string)
    ?>


```

**Erreur fréquente :** utiliser `==` quand le type compte. Par exemple, `strpos()` renvoie la position où un texte est trouvé, qui peut être `0` (tout au début), ou `false` s'il n'est pas trouvé. Avec `==`, `0` et `false` sont considérés comme égaux.

```php

    <?php
    $text = "PHP est amusant";

    // ❌ INCORRECT : "PHP" est à la position 0, et 0 == false est vrai, donc il affiche « Introuvable »
    if (strpos($text, "PHP") == false) {
        echo "Introuvable";
    }

    // ✅ CORRECT : === ne correspond qu'à un vrai false
    if (strpos($text, "PHP") === false) {
        echo "Introuvable";
    }
    ?>


```

### Opérateurs logiques
Ils servent à combiner des conditions :
* `&&` (et) : les deux conditions doivent être vraies.
* `||` (ou) : au moins une condition doit être vraie.
* `!` (non) : inverse le résultat.

---

## 5. Structures de contrôle

Par défaut, un script exécute ses instructions les unes après les autres. Les **structures de contrôle** changent cet ordre : elles permettent au code de prendre des décisions ou de répéter des actions.

### 5.1. Conditions

Les conditions exécutent des blocs de code différents selon qu'une condition est vraie ou non. La forme la plus courante est `if...elseif...else` (« si... sinon si... sinon »).

```php

    <?php
    $hour = (int) date("H"); // Heure actuelle sous forme de nombre entier (0-23)

    if ($hour < 10) {
        echo "Bonne matinée !";
    } elseif ($hour < 20) {
        echo "Bonne journée !";
    } else {
        echo "Bonne nuit !";
    }
    ?>


```

PHP propose aussi une écriture courte pour un `if...else` simple, l'**opérateur ternaire** : `condition ? valeur_si_vrai : valeur_si_faux`.

```php

    <?php
    $age = 20;

    $message = $age >= 18 ? "Majeur" : "Mineur";

    echo $message; // Affiche : Majeur
    ?>


```

### 5.2. Boucles
Les **boucles** répètent un bloc de code tant qu'une condition est vraie.

**Boucle while :**

```php

    <?php
    $x = 1;

    while ($x <= 5) {
        echo "Le nombre est : $x <br>";
        $x++; // Ajoute 1 à $x
    }
    ?>


```

**Erreur fréquente :** oublier de mettre à jour la variable de la condition. La condition reste toujours vraie, la boucle ne s'arrête jamais et la page ne finit jamais de se charger.

```php

    <?php
    $x = 1;

    // ❌ INCORRECT : $x vaut toujours 1, boucle infinie
    while ($x <= 5) {
        echo $x;
    }

    // ✅ CORRECT : $x augmente jusqu'à ce que la condition soit fausse
    while ($x <= 5) {
        echo $x;
        $x++;
    }
    ?>


```

**Boucle foreach :**

La boucle `foreach` (« pour chaque ») parcourt un par un tous les éléments d'un tableau (array). C'est l'une des boucles les plus utilisées en PHP, par exemple pour afficher une liste de produits provenant d'une base de données.

```php

    <?php
    $colors = ["rouge", "vert", "bleu", "jaune"];

    foreach ($colors as $color) {
        echo "$color <br>";
    }
    ?>


```

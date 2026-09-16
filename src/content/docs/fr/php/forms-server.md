---
title: "Formulaires et interaction avec le serveur en PHP"
---

# Formulaires et interaction avec le serveur

La vraie force de PHP, c'est sa capacité à réagir aux actions des utilisateurs. Ce guide explique comment recevoir les données envoyées par des formulaires HTML, la différence entre les deux façons de les envoyer et, surtout, comment traiter ces données en toute **sécurité**.

*Si vous ne connaissez pas encore les formulaires HTML, lisez d'abord le guide Formulaires de HTML.*

---

## Table des matières

<div id="content-table">

- [1. Les superglobales](#1-les-superglobales "Les variables $_GET et $_POST")
- [2. Traiter l'envoi d'un formulaire](#2-traiter-lenvoi-dun-formulaire "Comment accéder aux données d'un formulaire")
- [3. Sécurité, nettoyage et validation](#3-sécurité-nettoyage-et-validation "Éviter les failles XSS et valider les données")
- [4. Exemple complet de formulaire](#4-exemple-complet-de-formulaire "Un exemple complet et fonctionnel")

</div>

---

## 1. Les superglobales

Quand un navigateur demande une page au serveur, il envoie une **requête** qui peut contenir des données. PHP range automatiquement ces données dans des variables spéciales appelées **superglobales**, accessibles partout dans le code. Les deux plus importantes pour les formulaires sont `$_GET` et `$_POST`.

Ce sont deux **tableaux associatifs** : chaque valeur est rangée sous une clé qui correspond à l'attribut `name` du champ du formulaire.

### La variable $_GET
Contient les données envoyées avec la méthode GET :
* Les données sont visibles dans l'URL, après un `?` (par exemple `process.php?name=Jean&age=25`).
* La longueur des URL est limitée, elle ne convient donc qu'à de petites quantités de données.
* **Idéale pour :** les recherches, les filtres, la pagination ou toute page que l'on voudrait ajouter aux favoris ou partager. Jamais pour des mots de passe.

```php

    <?php
    // URL visitée : process.php?name=Jean&age=25

    if (isset($_GET['name']) && isset($_GET['age'])) {
        echo "Nom : " . htmlspecialchars($_GET['name']) . "<br>";
        echo "Âge : " . htmlspecialchars($_GET['age']);
    }
    ?>


```

`isset()` vérifie qu'une valeur existe avant de l'utiliser. `htmlspecialchars()` rend la valeur sûre à afficher (voir la section 3).

### La variable $_POST
Contient les données envoyées avec la méthode POST :
* Les données **ne** sont **pas** visibles dans l'URL : elles voyagent dans le corps de la requête.
* Elle peut transporter beaucoup plus de données (la taille maximale est fixée dans la configuration du serveur).
* **Idéale pour :** les connexions, les inscriptions, la publication de contenu, l'envoi de fichiers ou tout ce qui modifie des données sur le serveur.

```php

    <?php
    // Données envoyées par un formulaire HTML avec method="post"

    if (isset($_POST['email'])) {
        echo "E-mail reçu : " . htmlspecialchars($_POST['email']);
    }
    ?>


```

**Erreur fréquente :** lire un champ sans vérifier qu'il existe. Au premier chargement de la page, le formulaire n'a pas encore été envoyé : la clé n'existe pas et PHP affiche un avertissement.

```php

    <?php
    // ❌ INCORRECT : Warning: Undefined array key "email" si le formulaire n'a pas été envoyé
    $email = $_POST['email'];

    // ✅ CORRECT : ?? utilise un texte vide quand la clé n'existe pas
    $email = $_POST['email'] ?? '';
    ?>


```

---

## 2. Traiter l'envoi d'un formulaire

Pour traiter un formulaire, on vérifie généralement la méthode utilisée pour demander la page, puis on lit les valeurs en utilisant comme clé le `name` de chaque champ.

### Le formulaire HTML
Remarquez les attributs `action` (le fichier qui reçoit les données) et `method` (la façon de les envoyer).

```html

    <form action="welcome.php" method="post">
        <label for="fname">Nom :</label>
        <input type="text" id="fname" name="fname">

        <label for="email">E-mail :</label>
        <input type="email" id="email" name="email">

        <button type="submit">Envoyer</button>
    </form>


```

### Traitement en PHP (welcome.php)
La valeur de chaque champ est disponible sous la forme `$_POST['nom_du_champ']`.

```php

    <?php
    // Vérifier que la page a été demandée par l'envoi du formulaire (POST)
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        
        // Lire la valeur du champ "fname"
        $name = trim($_POST['fname'] ?? ''); // trim() supprime les espaces au début et à la fin
        
        if (empty($name)) {
            echo "Le nom est vide";
        } else {
            echo "Bonjour, " . htmlspecialchars($name);
        }
    }
    ?>


```

`$_SERVER` est une autre superglobale contenant des informations sur la requête ; `REQUEST_METHOD` indique s'il s'agissait de `GET` ou de `POST`.

---

## 3. Sécurité, nettoyage et validation

**Ne faites jamais confiance aux données envoyées par l'utilisateur.** C'est la règle d'or du développement côté serveur. N'importe qui peut saisir n'importe quoi dans un formulaire, y compris du code malveillant. Si vous affichez ces données sur une page sans les préparer, un attaquant pourrait faire exécuter ses scripts par les navigateurs des autres visiteurs. Cette attaque s'appelle **XSS** (Cross-Site Scripting) et peut servir à voler des comptes ou des données personnelles.

### Nettoyage (sanitization)
**Nettoyer** consiste à transformer les données pour qu'elles ne puissent pas nuire. La fonction la plus importante pour afficher des données est `htmlspecialchars()` : elle convertit les caractères ayant un sens particulier en HTML (comme `<` et `>`) en codes inoffensifs, pour que le navigateur les affiche comme du texte au lieu de les exécuter.

```php

    <?php
    $raw_input = "<script>alert('Piraté');</script>";

    // ❌ INCORRECT : le navigateur reçoit une vraie balise <script> et l'exécute
    echo $raw_input;

    // ✅ CORRECT : < devient &lt; et > devient &gt;, le texte est seulement affiché
    echo htmlspecialchars($raw_input);
    ?>


```

### Validation (vérification)
**Valider** consiste à vérifier que les données ont le format attendu (est-ce un vrai e-mail ? l'âge est-il un nombre ?) et à les refuser sinon. La fonction `filter_var()` de PHP propose des vérifications toutes prêtes pour les cas les plus courants.

```php

    <?php
    $email = $_POST["email"] ?? "";

    // Supprimer les caractères interdits dans une adresse e-mail
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);

    // Vérifier que le résultat est une adresse e-mail valide
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Format d'e-mail invalide"; 
    } else {
        echo "L'e-mail est valide";
    }
    ?>


```

**À retenir :** les attributs de validation HTML (`required`, `type="email"`...) ne sont qu'un confort pour l'utilisateur. Ils se contournent facilement : PHP doit donc toujours valider à nouveau les données sur le serveur.

---

## 4. Exemple complet de formulaire

Cet exemple combine HTML et PHP dans un seul fichier qui affiche le formulaire et le traite aussi (on parle souvent de « formulaire auto-traité »).

```php

    <?php
    $name = "";
    $nameErr = "";

    // Traiter les données uniquement quand le formulaire a été envoyé
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        if (empty($_POST["name"])) {
            $nameErr = "Le nom est obligatoire";
        } else {
            // Nettoyer la donnée avant de l'enregistrer ou de l'afficher
            $name = htmlspecialchars(trim($_POST["name"]));
        }
    }
    ?>

    <!-- htmlspecialchars() protège aussi l'adresse de la page actuelle -->
    <form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>">
        <label for="name">Nom :</label>
        <!-- value conserve ce que l'utilisateur a saisi si la page se recharge -->
        <input type="text" id="name" name="name" value="<?php echo $name; ?>">
        
        <span class="error">* <?php echo $nameErr; ?></span>
        
        <button type="submit">Envoyer</button>
    </form>

    <?php
    if ($name) {
        echo "<h2>Vos données :</h2>";
        echo "Bon retour, " . $name;
    }
    ?>


```

`$_SERVER["PHP_SELF"]` contient l'adresse du fichier actuel : le formulaire envoie donc les données à la même page.

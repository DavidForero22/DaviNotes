---
title: "Formulaires en HTML"
---

# Formulaires

Les formulaires sont le principal moyen de recueillir des informations auprès des visiteurs d'un site web. Les écrans de connexion, les barres de recherche, les pages de contact et les pages de paiement sont tous des formulaires. Ils permettent au **client** (le navigateur sur l'appareil du visiteur) d'envoyer des données au **serveur** (l'ordinateur où se trouve le site et où ces données sont traitées).

Créer un formulaire implique deux choses : créer les contrôles avec lesquels les gens interagissent (zones de texte, cases à cocher, boutons...) et définir comment et où les données sont envoyées lors de la soumission.

---

## Table des matières

<div id="content-table">

- [1. L'élément form](#1-lélément-form "Les attributs action et method")
- [2. Types de champs](#2-types-de-champs "Champs courants comme texte, mot de passe et e-mail")
  - [2.1 Types de boutons](#21-types-de-boutons "Différence entre submit, button et reset")
- [3. Étiquettes et accessibilité](#3-étiquettes-et-accessibilité "Associer des étiquettes aux champs pour les lecteurs d'écran")
- [4. Validation de base](#4-validation-de-base "Utiliser les attributs HTML pour imposer des règles")

</div>

---

## 1. L'élément form

L'élément `<form>` est un conteneur pour tous les contrôles d'un formulaire. Il définit **où** vont les données et **comment** elles sont envoyées.

```html

    <form action="/submit-data" method="POST">
        <!-- Les contrôles du formulaire se placent ici -->
    </form>


```

**Attributs principaux :**

- `action` : L'adresse (URL) à laquelle les données seront envoyées pour être traitées.

- `method` : La manière d'envoyer les données. Les deux options sont des méthodes HTTP, les « verbes » que les navigateurs utilisent pour parler aux serveurs :

    - `GET` : Ajoute les données à la fin de l'URL (par exemple `/search?q=chaussures`). C'est pratique pour les recherches, car le résultat peut être ajouté aux favoris ou partagé, mais ne l'utilisez jamais pour des mots de passe ou des données privées : ils seraient visibles dans la barre d'adresse et dans l'historique.

    - `POST` : Envoie les données dans le corps de la requête, elles n'apparaissent donc pas dans l'URL. Utilisez-le pour les connexions, les inscriptions et toute donnée qui modifie quelque chose sur le serveur. Attention : POST seul ne chiffre rien, le site doit aussi utiliser HTTPS pour protéger les données.

```html

    <!-- ❌ INCORRECT : le mot de passe apparaîtrait dans l'URL : /login?password=1234 -->
    <form action="/login" method="GET">
        <input type="password" name="password">
    </form>

    <!-- ✅ CORRECT : le mot de passe voyage dans le corps de la requête -->
    <form action="/login" method="POST">
        <input type="password" name="password">
    </form>


```

---

## 2. Types de champs

L'élément `<input>` est le contrôle le plus polyvalent : il change complètement selon son attribut `type`.

**Types de champs courants :**

<table>
    <thead>
        <tr>
            <th>Type</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>text</td>
            <td>Un champ de texte classique sur une seule ligne.</td>
        </tr>
        <tr>
            <td>password</td>
            <td>Masque les caractères pendant la saisie (affiche des points ou des astérisques).</td>
        </tr>
        <tr>
            <td>email</td>
            <td>Vérifie que le texte ressemble à une adresse e-mail. Sur mobile, il affiche aussi un clavier avec le symbole @.</td>
        </tr>
        <tr>
            <td>number</td>
            <td>N'accepte que des nombres.</td>
        </tr>
        <tr>
            <td>checkbox</td>
            <td>Une case à cocher. Plusieurs cases peuvent être cochées en même temps.</td>
        </tr>
        <tr>
            <td>radio</td>
            <td>Un bouton d'option rond. Une seule option peut être choisie dans un groupe partageant le même <code>name</code>.</td>
        </tr>
        <tr>
            <td>submit</td>
            <td>Un bouton qui envoie le formulaire.</td>
        </tr>
    </tbody>
</table>

**Autres contrôles de formulaire :**

En plus de `<input>`, il existe d'autres balises pour des types de données précis :

- `<textarea>` : Une zone de texte sur plusieurs lignes (commentaires, biographies...).

- `<select>` et `<option>` : Un menu déroulant et chacune de ses options.

- `<button>` : Un bouton cliquable (il peut envoyer le formulaire ou exécuter du code JavaScript).

```html

    <form>
        <input type="text" name="username" placeholder="Nom d'utilisateur">

        <input type="password" name="password" placeholder="Mot de passe">

        <select name="role">
            <option value="user">Utilisateur</option>
            <option value="admin">Administrateur</option>
        </select>

        <button type="submit">Se connecter</button>
    </form>


```

L'attribut `placeholder` affiche une indication grisée dans le champ vide.

**Remarque :** L'attribut `name` est indispensable. C'est l'étiquette que le serveur reçoit avec chaque valeur. Sans lui, les données de ce champ ne sont pas envoyées.

```html

    <!-- ❌ INCORRECT : sans name, le serveur ne reçoit jamais l'e-mail -->
    <input type="email">

    <!-- ✅ CORRECT : le serveur reçoit email=la-valeur-saisie -->
    <input type="email" name="email">


```

### 2.1 Types de boutons

L'élément `<button>` peut avoir différentes valeurs de `type` qui définissent son rôle :

<table>
  <thead>
    <tr>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>submit</td>
      <td>Envoie les données du formulaire au serveur. C'est le comportement par défaut d'un bouton placé dans un formulaire sans <code>type</code>.</td>
    </tr>
    <tr>
      <td>button</td>
      <td>Un bouton générique qui ne fait rien tout seul. Il est généralement associé à JavaScript.</td>
    </tr>
    <tr>
      <td>reset</td>
      <td>Remet tous les champs du formulaire à leur valeur initiale.</td>
    </tr>
  </tbody>
</table>

**Exemple :**

```html

    <form id="myForm">
        <input type="text" name="username" placeholder="Utilisateur">

        <!-- Bouton d'envoi : envoie le nom d'utilisateur -->
        <button type="submit">Envoyer</button>

        <!-- Bouton de réinitialisation : vide le champ utilisateur -->
        <button type="reset">Effacer</button>

        <!-- Bouton générique : exécute du JavaScript sans envoyer -->
        <button type="button" onclick="alert('Cliqué !')">Cliquez-moi</button>
    </form>


```

**Astuce :** Écrivez toujours `type="button"` sur les boutons qui ne doivent pas envoyer le formulaire. Un `<button>` sans type dans un formulaire se comporte comme `submit` et peut l'envoyer par accident.

```html

    <form action="/checkout" method="POST">
        <!-- ❌ INCORRECT : sans type, cliquer sur « Voir le détail » envoie aussi le formulaire -->
        <button onclick="showDetails()">Voir le détail</button>

        <!-- ✅ CORRECT : ce bouton exécute seulement la fonction JavaScript -->
        <button type="button" onclick="showDetails()">Voir le détail</button>
    </form>


```

---

## 3. Étiquettes et accessibilité

Chaque champ de formulaire devrait avoir un `<label>` : le texte visible qui explique quoi saisir. C'est important pour deux raisons :

- **Accessibilité :** les lecteurs d'écran lisent l'étiquette à voix haute quand le champ est sélectionné.
- **Facilité d'utilisation :** cliquer sur l'étiquette place le curseur dans le champ, ce qui rend les petits contrôles comme les cases à cocher beaucoup plus faciles à utiliser.

On les relie en donnant un `id` au champ et en écrivant la même valeur dans l'attribut `for` de l'étiquette.

```html

    <!-- ❌ INCORRECT : le texte n'est pas relié au champ -->
    <p>Adresse e-mail :</p>
    <input type="email" name="email">

    <!-- ✅ CORRECT : for="user-email" pointe vers id="user-email" -->
    <label for="user-email">Adresse e-mail :</label>
    <input type="email" id="user-email" name="email">


```

---

## 4. Validation de base

HTML propose des attributs de validation qui permettent au navigateur de repérer les erreurs avant même d'envoyer les données au serveur :

- `required` : Le champ ne peut pas rester vide.

- `minlength` / `maxlength` : Le nombre minimum et maximum de caractères autorisés.

- `min` / `max` : Le plus petit et le plus grand nombre autorisés.

- `pattern` : Une règle personnalisée écrite sous forme d'*expression régulière* (un code court qui décrit un format de texte, comme « exactement 5 chiffres » : `[0-9]{5}`).

```html

    <form action="/signup" method="POST">
        <label for="age">Âge (18+) :</label>
        <input 
            type="number" 
            id="age" 
            name="age" 
            min="18" 
            max="99" 
            required
        >

        <label for="zip">Code postal :</label>
        <input type="text" id="zip" name="zip" pattern="[0-9]{5}">
        
        <button type="submit">Vérifier</button>
    </form>


```

Si l'utilisateur saisit `15` ou laisse l'âge vide, le navigateur bloque l'envoi et affiche un message d'erreur.

**Important :** La validation HTML est un confort pour l'utilisateur, pas une mesure de sécurité. N'importe qui avec quelques connaissances techniques peut la contourner : le serveur doit donc toujours vérifier à nouveau les données.

---
title: "Structure en HTML"
---

# Structure

HTML (HyperText Markup Language, « langage de balisage hypertexte ») est le langage standard pour construire la structure des pages web. Ce n'est pas un langage de programmation comme **Java** ou **Python**, qui prennent des décisions et font des calculs. HTML est un langage de **balisage** : il étiquette chaque partie du contenu (« ceci est un titre », « ceci est une image », « ceci est un lien ») pour que le **navigateur** (Chrome, Firefox, Safari...) sache comment l'afficher.

Imaginez une page web comme un document organisé à la manière d'un arbre généalogique : la page contient des sections, les sections contiennent des paragraphes et les paragraphes contiennent des mots. Le navigateur garde cet arbre en mémoire et l'appelle le **DOM** (Document Object Model, « modèle objet du document »).

---

## Table des matières

<div id="content-table">

- [1. Balises et éléments](#1-balises-et-éléments "Différence entre balises ouvrantes, fermantes et éléments")
- [2. Attributs](#2-attributs "Ajouter des informations supplémentaires aux éléments")
- [3. Imbrication](#3-imbrication "Relations parent-enfant entre éléments")
- [4. Le squelette de base](#4-le-squelette-de-base "La structure obligatoire de tout document HTML5")

</div>

---

## 1. Balises et éléments

HTML s'écrit avec des **balises**. Une balise est un mot-clé placé entre les symboles `<` et `>`, comme `<p>` (pour *paragraph*, « paragraphe »). La plupart vont par paire : une **balise ouvrante**, qui indique où quelque chose commence, et une **balise fermante** (avec une barre oblique `/`), qui indique où il se termine.

Un **élément** est le bloc complet : la balise ouvrante, le contenu et la balise fermante.

```html

    <!-- Ouvrante : <p> | Contenu : Ceci est un paragraphe. | Fermante : </p> -->
    <p>Ceci est un paragraphe.</p>


```

Tout ce qui est écrit entre `<!--` et `-->` est un **commentaire** : une note pour la personne qui lit le code. Le navigateur l'ignore et ne l'affiche pas sur la page.

**Éléments vides (sans fermeture)**

Certains éléments n'ont pas de contenu, ils n'ont donc pas besoin de balise fermante. On les appelle des éléments **vides**.

```html

    <!-- Saut de ligne -->
    <br>

    <!-- Image : les informations nécessaires sont dans la balise elle-même -->
    <img src="logo.png" alt="Logo de l'entreprise">

    <!-- Ligne horizontale de séparation -->
    <hr>


```

**Erreur fréquente :** oublier de fermer une balise. Le navigateur essaie de deviner où elle devrait se terminer, et le reste de la page peut hériter d'une mise en forme incorrecte.

```html

    <!-- ❌ INCORRECT : le paragraphe n'est jamais fermé -->
    <p>Premier paragraphe
    <p>Deuxième paragraphe

    <!-- ✅ CORRECT : chaque balise ouvrante a sa balise fermante -->
    <p>Premier paragraphe</p>
    <p>Deuxième paragraphe</p>


```

---

## 2. Attributs

Les attributs apportent des **informations supplémentaires** sur un élément, comme l'adresse vers laquelle pointe un lien ou le fichier qu'une image doit afficher. Ils s'écrivent toujours dans la **balise ouvrante** et suivent généralement le format `nom="valeur"`.

```html

    <!-- href indique au lien où aller -->
    <a href="https://google.com">Aller sur Google</a>

    <!-- class et id donnent à l'élément des noms utilisables par CSS et JavaScript -->
    <h1 class="title" id="main-heading">Bienvenue sur DaviNotes</h1>


```

| Attribut | Description | Exemple |
|-----------|-------------|---------|
| class     | Donne à l'élément un ou plusieurs noms de groupe, pour le styliser avec CSS ou le retrouver avec JavaScript. Plusieurs éléments peuvent partager la même classe. | `<div class="container">` |
| id        | Donne à l'élément un nom unique. Deux éléments d'une même page ne doivent pas le partager. | `<div id="header">` |
| style     | Applique des styles CSS directement à cet élément. | `<p style="color:red;">` |
| src       | L'adresse d'un fichier à charger, comme une image ou un script. | `<img src="photo.jpg">` |
| href      | L'adresse vers laquelle pointe un lien. | `<a href="page.html">` |
| alt       | Texte alternatif qui décrit une image. Il est lu à voix haute par les lecteurs d'écran et s'affiche si l'image ne se charge pas. | `<img src="chien.jpg" alt="Un chien marron">` |

**Erreur fréquente :** oublier l'attribut `alt` sur les images. Les personnes qui utilisent un lecteur d'écran ne sauront pas ce que montre l'image.

```html

    <!-- ❌ INCORRECT : l'image n'a pas de description -->
    <img src="equipe.jpg">

    <!-- ✅ CORRECT : la description explique ce que montre l'image -->
    <img src="equipe.jpg" alt="L'équipe de DaviNotes souriante au bureau">


```

---

## 3. Imbrication

Les éléments HTML peuvent être placés à l'intérieur d'autres éléments. C'est ce qu'on appelle l'**imbrication**, et cela crée une **hiérarchie** : l'élément extérieur est le *parent* et l'élément intérieur est l'*enfant*.

**Règle pratique :** la dernière balise ouverte doit être la première fermée, comme des boîtes rangées les unes dans les autres.

```html

    <div class="card">
        <h2>Titre de la carte</h2>
        <p>Voici un mot en <strong>gras</strong> dans un paragraphe.</p>
    </div>


```

Si l'imbrication est incorrecte, le navigateur essaiera de la corriger, mais la mise en page finit souvent cassée.

```html

    <!-- ❌ INCORRECT : <strong> a été ouvert en dernier, mais </p> est fermé avant -->
    <p>Ceci est <strong>faux.</p></strong>

    <!-- ✅ CORRECT : on ferme la balise intérieure avant l'extérieure -->
    <p>Ceci est <strong>juste.</strong></p>


```

---

## 4. Le squelette de base

Tout document HTML a besoin d'une structure de départ standard (souvent appelée *boilerplate*, ou « modèle ») pour que les navigateurs l'affichent correctement.

Cette structure est la racine de l'**arbre DOM** : tous les autres éléments en dépendent.

```html

    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Titre de la page</title>
    </head>
    <body>

        <h1>Mon premier titre</h1>
        <p>Mon premier paragraphe.</p>

    </body>
    </html>


```

**Éléments clés :**

- `<!DOCTYPE html>` : Indique au navigateur qu'il s'agit d'un document HTML moderne (HTML5).

- `<html>` : L'élément racine. Tout le reste se place à l'intérieur. L'attribut `lang` indique la langue de la page.

- `<head>` : Contient des informations **sur** la page qui **ne s'affichent pas** dans la page : le titre de l'onglet du navigateur, l'encodage des caractères (`charset`), les liens vers les fichiers de style et les données pour les moteurs de recherche.

- `<meta name="viewport">` : Adapte la page à la largeur de l'écran, ce qui est indispensable sur mobile.

- `<body>` : Contient le contenu **visible** de la page (titres, paragraphes, images, listes, etc.).

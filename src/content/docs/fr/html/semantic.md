---
title: "Balises sémantiques en HTML"
---

# HTML sémantique

Le HTML sémantique consiste à choisir des balises qui décrivent **ce qu'est le contenu** (son sens), et pas seulement son apparence. Le mot *sémantique* signifie simplement « qui concerne le sens ».

Par exemple, la balise `<b>` indique seulement au navigateur de mettre le texte en gras (apparence), tandis que `<strong>` lui indique que le texte est important (sens). Les deux s'affichent en gras, mais une seule explique *pourquoi*.

Les balises sémantiques sont essentielles pour :

- **L'accessibilité :** les lecteurs d'écran (logiciels qui lisent les pages web à voix haute pour les personnes malvoyantes) s'appuient sur ces balises pour permettre de passer d'une section à l'autre.
- **Le SEO** (Search Engine Optimization, « référencement naturel ») : les moteurs de recherche comme Google les utilisent pour comprendre le sujet de chaque partie de la page, ce qui l'aide à apparaître dans les résultats.

---

## Table des matières

<div id="content-table">

- [1. Pourquoi la sémantique compte](#1-pourquoi-la-sémantique-compte "En finir avec la soupe de div")
- [2. Éléments structurels](#2-éléments-structurels "Header, Nav, Main et Footer")
- [3. Conteneurs de contenu](#3-conteneurs-de-contenu "Article, Section et Aside")
- [4. Sémantique du texte](#4-sémantique-du-texte "Strong, emphase et titres")

</div>

---

## 1. Pourquoi la sémantique compte

Autrefois, les développeurs utilisaient la balise `<div>` (une boîte générique sans signification) pour tout, créant ce qu'on appelle une « soupe de div ». Le rendu peut être correct une fois les styles CSS appliqués, mais les machines n'apprennent rien sur le contenu.

Comparez les deux versions de la même structure de page :

```html

    <!-- ❌ INCORRECT : des boîtes génériques qui ne disent rien de leur contenu -->
    <div id="header">
        <div class="nav">...</div>
    </div>
    <div class="main-content">
        <div class="article">...</div>
    </div>
    <div id="footer">...</div>

    <!-- ✅ CORRECT : chaque balise décrit le rôle de son contenu -->
    <header>
        <nav>...</nav>
    </header>
    <main>
        <article>...</article>
    </main>
    <footer>...</footer>


```

Les deux versions peuvent sembler identiques, mais la seconde permet à un lecteur d'écran d'annoncer « navigation » ou « contenu principal », et à un moteur de recherche de savoir quelle partie est l'article.

---

## 2. Éléments structurels

Ces éléments définissent les grandes zones d'une page web. Ils servent de repères pour aider les technologies d'assistance (comme les lecteurs d'écran) à se déplacer dans le document.

- `<header>`

Contenu d'introduction en haut de la page ou d'une section. Il contient généralement le logo, le nom du site, un champ de recherche ou le menu de navigation.

- `<nav>`

Un groupe de liens de navigation, vers d'autres pages ou vers d'autres parties de la même page.

- `<main>`

Le contenu principal de la page. Il ne doit inclure que le contenu propre à cette page, pas les éléments répétés sur toutes les pages (comme les barres latérales ou le pied de page général). Il ne doit y avoir qu'un seul `<main>` par page.

- `<footer>`

Contenu de clôture en bas de la page ou d'une section : auteur, informations de copyright, liens vers les conditions d'utilisation, coordonnées, etc.

Exemple de structure complète :

```html

    <body>
        <header>
            <p class="logo">DaviNotes</p>
            <nav>
                <a href="/">Accueil</a>
                <a href="/about">À propos</a>
            </nav>
        </header>

        <main>
            <h1>Comprendre la sémantique</h1>
            <p>Voici le contenu principal de la page.</p>
        </main>

        <footer>
            <p>&copy; 2025 DaviNotes</p>
        </footer>
    </body>


```

---

## 3. Conteneurs de contenu

Pour organiser le contenu dans `<main>`, choisissez la balise qui décrit le mieux le lien entre ce contenu et le reste de la page.

**`<article>`, `<section>` et `<aside>`**

- `<article>` : Un contenu autonome qui garderait son sens s'il était déplacé sur une autre page (par exemple un billet de blog, un article d'actualité ou une fiche produit). Il peut contenir des éléments `<section>` ou `<aside>`.
- `<section>` : Un groupe de contenu sur un même thème, généralement avec son propre titre (`<h2>`, `<h3>`...). Contrairement à `<article>`, il n'est pas autonome : il n'a de sens qu'avec le contenu qui l'entoure.
- `<aside>` : Un contenu lié au contenu principal mais pas indispensable, comme une astuce, une note ou une barre latérale.

**Exemple :**

```html

    <article>
        <h2>L'histoire de HTML</h2>
        <p>HTML a été créé par Tim Berners-Lee...</p>

        <section>
            <h3>Les débuts</h3>
            <p>En 1991, la première version...</p>
        </section>

        <aside>
            <p>Le saviez-vous ? HTML signifie HyperText Markup Language.</p>
        </aside>
    </article>


```

---

## 4. Sémantique du texte

Utiliser les bonnes balises pour le texte garantit que la hiérarchie et l'emphase sont transmises à tous les utilisateurs, y compris ceux qui ne voient pas la page.

<table>
    <thead>
        <tr>
            <th>Balise</th>
            <th>Nom</th>
            <th>Sens sémantique</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>&lt;h1&gt; - &lt;h6&gt;</td>
            <td>Titres</td>
            <td>Définissent le plan de la page, comme les chapitres d'un livre. &lt;h1&gt; est le plus important et &lt;h6&gt; le moins important.</td>
        </tr>
        <tr>
            <td>&lt;strong&gt;</td>
            <td>Importance</td>
            <td>Le contenu est important, grave ou urgent.</td>
        </tr>
        <tr>
            <td>&lt;em&gt;</td>
            <td>Emphase</td>
            <td>Le contenu est accentué, ce qui change le ton de la phrase (comme prononcer un mot plus fort).</td>
        </tr>
        <tr>
            <td>&lt;blockquote&gt;</td>
            <td>Citation</td>
            <td>Le contenu est une longue citation provenant d'une autre source.</td>
        </tr>
        <tr>
            <td>&lt;time&gt;</td>
            <td>Temps</td>
            <td>Une date ou une heure écrite dans un format que les machines peuvent aussi lire.</td>
        </tr>
    </tbody>
</table>

**Apparence ou sens :**

N'utilisez pas `<b>` ou `<i>` uniquement pour changer l'apparence du texte : c'est le rôle du CSS. Utilisez `<strong>` ou `<em>` quand le texte est vraiment important ou accentué.

```html

    <!-- ❌ INCORRECT : change seulement l'apparence, le sens est perdu -->
    <b>Attention : ne pas débrancher.</b>
    <i>Je suis sérieux.</i>

    <!-- ✅ CORRECT : lecteurs d'écran et moteurs de recherche comprennent l'importance -->
    <strong>Attention : ne pas débrancher.</strong>
    <em>Je suis sérieux.</em>

    <!-- Dates : les personnes lisent « 15 mars », les machines lisent 2025-03-15 -->
    <p>Publié le <time datetime="2025-03-15">15 mars</time></p>


```

**Erreur fréquente :** choisir le niveau d'un titre en fonction de sa taille. Les titres doivent suivre l'ordre du contenu, et leur taille peut toujours être modifiée avec CSS.

```html

    <!-- ❌ INCORRECT : passe de h1 à h4 parce que h4 « paraît plus petit » -->
    <h1>Recettes</h1>
    <h4>Desserts</h4>

    <!-- ✅ CORRECT : les niveaux suivent la structure du contenu -->
    <h1>Recettes</h1>
    <h2>Desserts</h2>


```

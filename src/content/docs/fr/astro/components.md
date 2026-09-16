---
title: "Les composants dans Astro"
---

# Composants

Les **composants** sont les briques de base d'un projet Astro : des morceaux de page réutilisables, comme un en-tête, une carte ou un bouton, que l'on écrit une fois et que l'on utilise autant de fois que nécessaire.

Les composants Astro produisent du HTML classique. Par défaut, ils n'envoient aucun JavaScript au navigateur du visiteur, ce qui rend les pages très rapides à charger. C'est la principale différence avec des bibliothèques comme **React** ou **Vue**, dont les composants exécutent du JavaScript dans le navigateur.

Les composants Astro sont enregistrés dans des fichiers avec l'extension `.astro` et comportent deux parties : un **script du composant** (du code JavaScript ou TypeScript) et un **template du composant** (le balisage proche du HTML qui sera affiché).

---

## Table des matières

<div id="content-table">

- [1. Structure d'un composant](#1-structure-dun-composant "Anatomie d'un fichier .astro")
- [2. Props](#2-props "Transmettre des données aux composants")
- [3. Layouts et slots](#3-layouts-et-slots "Insérer du contenu dans les composants")
  - [3.1 Créer un layout](#31-créer-un-layout "Créer des modèles de page réutilisables")
  - [3.2 Slots nommés](#32-slots-nommés "Insérer du contenu dans des zones précises d'un layout")
- [4. Frameworks d'interface](#4-frameworks-dinterface "Utiliser React, Vue ou Svelte dans Astro")
  - [4.1 Importer des composants](#41-importer-des-composants "Utiliser des composants d'autres frameworks")
  - [4.2 Directives d'hydratation](#42-directives-dhydratation "Rendre les composants interactifs")

</div>

---

## 1. Structure d'un composant

Un composant Astro est divisé en deux parties par une **clôture de code** (*code fence*) : deux lignes de trois tirets (`---`).

```astro

    ---
    // Script du composant : s'exécute sur le serveur (ou lors de la construction du site)
    import SomeComponent from './SomeComponent.astro';
    const name = "Astro";
    ---
    
    <!-- Template du composant : le HTML qui sera affiché -->
    <div class="container">
        <SomeComponent />
        <h1>Bonjour {name} !</h1>
    </div>


```

**Éléments clés** :

- **Le script du composant (entre les `---`)** : Ce code s'exécute sur le serveur ou lors de la construction du site, jamais dans le navigateur du visiteur. On peut y importer d'autres composants, charger des données ou créer des variables.

- **Le template (sous la clôture)** : Le HTML du composant. Tout ce qui se trouve entre accolades `{}` est remplacé par la valeur d'une expression JavaScript, un peu comme JSX dans React, mais le résultat final est du HTML classique.

**Erreur fréquente :** utiliser des fonctionnalités du navigateur (comme `document` ou `window`) dans le script du composant. Ce code s'exécute sur le serveur, où il n'y a pas de page de navigateur : il échoue donc. Le code qui doit s'exécuter dans le navigateur se place dans une balise `<script>` du template.

```astro

    ---
    // ❌ INCORRECT : "document" n'existe pas sur le serveur (ReferenceError: document is not defined)
    document.title = "Ma page";
    ---

    <!-- ✅ CORRECT : les balises <script> du template s'exécutent dans le navigateur du visiteur -->
    <script>
        document.title = "Ma page";
    </script>


```

---

## 2. Props

Les **props** (abréviation de *properties*, « propriétés ») permettent à un composant parent de transmettre des données à un composant enfant, comme les attributs d'une balise HTML. Dans l'enfant, les valeurs se lisent dans l'objet `Astro.props`.

Vous pouvez aussi décrire les props avec une `interface` TypeScript, pour que votre éditeur de code vous prévienne si une prop manque ou a un type incorrect.

```astro

    ---
    // Card.astro
    interface Props {
        title: string;
        description?: string; // Le ? indique que cette prop est facultative
    }
    
    // Lire les props ; "Description par défaut" est utilisée si aucune n'est fournie
    const { title, description = "Description par défaut" } = Astro.props;
    ---
    
    <div class="card">
        <h2>{title}</h2>
        <p>{description}</p>
    </div>


```

**Utilisation** :

```astro

    <Card title="Mon projet" description="Créé avec Astro" />


```

**Erreur fréquente :** écrire le nom d'un composant en minuscules. Les balises en minuscules sont traitées comme des éléments HTML classiques : Astro ignore donc votre composant.

```astro

    ---
    import card from '../components/Card.astro';
    ---

    <!-- ❌ INCORRECT : <card> est généré comme une balise HTML inconnue -->
    <card title="Mon projet" />

    <!-- ✅ CORRECT : les noms de composants commencent par une majuscule -->
    <Card title="Mon projet" />


```

---

## 3. Layouts et slots

Les **layouts** (« gabarits de page ») sont des composants Astro qui fournissent une structure commune aux pages, comme l'en-tête, le menu de navigation et le pied de page. On en enveloppe les pages pour que tout le site ait une apparence cohérente.

Layouts et slots fonctionnent ensemble : le **layout** définit le cadre, et le **slot** (« emplacement ») indique où s'insère le contenu propre à chaque page.

### 3.1 Créer un layout

Un layout est un composant Astro ordinaire, généralement enregistré dans `src/layouts/`. Il contient habituellement les balises `<html>`, `<head>` et `<body>`.

L'élément spécial `<slot />` est un emplacement réservé : quand une page utilise le layout, son contenu est inséré exactement à l'endroit de `<slot />`.

```astro

    ---
    // src/layouts/MainLayout.astro
    const { title } = Astro.props;
    ---
    
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>{title}</title>
      </head>
      <body>
        <nav>
            <a href="/">Accueil</a>
            <a href="/about">À propos</a>
        </nav>
    
        <main>
            <!-- Le contenu de chaque page apparaît ici -->
            <slot />
        </main>
    
        <footer>
            <p>© 2025 Mon site</p>
        </footer>
      </body>
    </html>


```

Pour utiliser un layout, importez-le dans votre page et placez votre contenu entre ses balises ouvrante et fermante. Tout ce qui s'y trouve est envoyé au `<slot />`.

```astro

    ---
    // src/pages/index.astro
    import MainLayout from '../layouts/MainLayout.astro';
    ---
    
    <MainLayout title="Bienvenue sur Astro">
        <h1>Bonjour le monde !</h1>
        <p>Ce paragraphe apparaîtra dans la balise 'main' du layout.</p>
    </MainLayout>


```

### 3.2 Slots nommés

Parfois, un layout doit recevoir du contenu à plusieurs endroits, et pas à un seul. Par exemple, une page peut vouloir ajouter sa propre balise `<meta>` dans le `<head>`.

Donnez un `name` à chaque slot pour créer des zones distinctes, et utilisez l'attribut `slot` dans la page pour choisir où va chaque élément.

**Dans le layout :**

```astro

    <head>
        <!-- Zone nommée "head" -->
        <slot name="head" />
    </head>
    <body>
        <!-- Zone par défaut : tout ce qui n'a pas d'attribut slot -->
        <slot />
    </body>


```

**Dans la page :**

```astro

    <MainLayout title="Page spéciale">
        
        <!-- Va dans <slot name="head" /> -->
        <meta slot="head" name="description" content="Description de ma page" />
        
        <!-- Va dans le <slot /> par défaut -->
        <h1>Voici le contenu du corps de la page</h1>
        
    </MainLayout>


```

---

## 4. Frameworks d'interface

Astro permet d'utiliser des composants écrits avec d'autres bibliothèques populaires, comme **React**, **Vue**, **Svelte** ou **Solid**, directement dans vos pages Astro. Vous pouvez même en mélanger plusieurs dans un même projet.

### 4.1 Importer des composants

Ajoutez d'abord l'intégration officielle de la bibliothèque. Pour React, lancez `npx astro add react` dans le terminal. Importez ensuite le composant dans votre fichier `.astro` comme n'importe quel autre composant.

```astro

    ---
    import Button from '../components/Button.jsx';
    ---
    
    <Button />


```

### 4.2 Directives d'hydratation

Par défaut, même les composants React ou Vue sont transformés en HTML statique sans JavaScript : ils s'affichent, mais les clics et autres interactions ne font rien. Pour rendre un composant interactif, il faut demander à Astro d'envoyer son JavaScript au navigateur avec une **directive client**. Ce processus s'appelle l'**hydratation** : le HTML statique « prend vie ».

| Directive | Quand le JavaScript se charge | Exemple |
| :--- | :--- | :--- |
| `client:load` | Immédiatement, dès le chargement de la page. | `<Nav client:load />` |
| `client:idle` | Quand le navigateur a terminé ses tâches les plus importantes. | `<Chat client:idle />` |
| `client:visible` | Seulement quand le composant apparaît à l'écran lors du défilement. | `<Carousel client:visible />` |

```astro

    ---
    import Counter from '../components/Counter.jsx';
    ---
    
    <!-- ❌ INCORRECT : le compteur s'affiche, mais ses boutons ne font rien -->
    <Counter />

    <!-- ✅ CORRECT : la directive envoie le JavaScript, les boutons fonctionnent -->
    <Counter client:load />


```

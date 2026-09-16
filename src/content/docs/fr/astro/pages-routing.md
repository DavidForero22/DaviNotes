---
title: "Pages et routage dans Astro"
---

# Pages et routage

Le **routage** (*routing*) est la façon dont un site décide quelle page afficher pour chaque adresse (URL). Astro utilise un **routage basé sur les fichiers** : les fichiers du dossier `src/pages/` deviennent automatiquement les pages de votre site, et leur emplacement dans ce dossier détermine leur URL.

D'autres outils exigent souvent un fichier de configuration séparé qui liste toutes les routes. Avec Astro, il n'y a rien à configurer : vous créez un fichier et la page existe. Les pages peuvent être écrites en `.astro`, `.md` (Markdown), `.mdx` ou `.html`, et les fichiers `.js`/`.ts` peuvent créer des *endpoints* qui renvoient des données au lieu de pages.

---

## Table des matières

<div id="content-table">

- [1. Routage basé sur les fichiers](#1-routage-basé-sur-les-fichiers "Comment les fichiers deviennent des URL")
- [2. Routes statiques](#2-routes-statiques "Créer des pages classiques")
- [3. Routes dynamiques](#3-routes-dynamiques "Générer des pages à partir de données")
  - [3.1 La syntaxe [param]](#31-la-syntaxe-param "Utiliser des crochets pour les parties variables")
  - [3.2 getStaticPaths()](#32-getstaticpaths "Définir les routes à générer")
- [4. Page d'erreur 404](#4-page-derreur-404 "Gérer les pages introuvables")

</div>

---

## 1. Routage basé sur les fichiers

Astro cherche les fichiers compatibles dans `src/pages/`. Chacun devient automatiquement une page de votre site.

**Exemples de correspondance** :

- `src/pages/index.astro`  →  `monsite.com/`
- `src/pages/about.astro`  →  `monsite.com/about`
- `src/pages/blog/post.md` →  `monsite.com/blog/post`

Un fichier nommé `index` représente la page principale de son dossier : il n'ajoute donc rien à l'URL.

Les fichiers et dossiers dont le nom commence par un tiret bas (par exemple `_Hidden.astro`) sont ignorés par le routeur. C'est pratique pour ranger des fichiers auxiliaires à côté des pages sans les transformer en pages.

**Erreur fréquente :** placer une page en dehors de `src/pages/`. Seuls les fichiers de ce dossier deviennent des routes.

```plaintext

    ❌ INCORRECT : src/components/about.astro  →  aucune page n'est créée
    ✅ CORRECT :   src/pages/about.astro       →  monsite.com/about


```

---

## 2. Routes statiques

Une **route statique** est un fichier qui correspond à une seule page à l'adresse fixe. Il peut s'agir d'un composant Astro, de Markdown ou de HTML classique.

```astro

    ---
    // src/pages/contact.astro  →  monsite.com/contact
    const pageTitle = "Contact";
    ---
    
    <html>
      <head><title>{pageTitle}</title></head>
      <body>
        <h1>Nous contacter</h1>
        <p>Écrivez-nous à bonjour@example.com</p>
      </body>
    </html>


```

Pour regrouper des pages dans une même section, créez un dossier. Le fichier `index.astro` qu'il contient devient la page principale de cette section :

```plaintext

    # Cette structure :
    src/pages/
      └── services/
          ├── index.astro
          └── design.astro
      
    # Produit ces URL :
    monsite.com/services
    monsite.com/services/design


```

---

## 3. Routes dynamiques

Les **routes dynamiques** permettent à un seul fichier de générer de nombreuses pages qui partagent le même design mais affichent des données différentes, comme des articles de blog, des fiches produits ou des profils d'utilisateurs.

### 3.1 La syntaxe [param]

Pour créer une route dynamique, placez une partie du nom du fichier entre crochets `[]`. Cette partie devient un **paramètre** : une variable dont la valeur provient de l'URL.

Par exemple, un fichier nommé `src/pages/dogs/[dog].astro` correspond à des adresses comme `/dogs/clifford` ou `/dogs/rover`, et dans la page le paramètre `dog` vaudra `"clifford"` ou `"rover"`.

### 3.2 getStaticPaths()

Par défaut, Astro construit toutes les pages à l'avance, lors de la génération du site, au lieu de les créer à l'arrivée d'un visiteur. Il doit donc savoir **exactement** quelles pages une route dynamique doit produire. Vous le lui indiquez en exportant une fonction nommée `getStaticPaths()` qui renvoie la liste de toutes les valeurs possibles.

```astro

    ---
    // src/pages/dogs/[dog].astro
    
    export function getStaticPaths() {
      // Un objet par page à générer
      return [
        { params: { dog: 'clifford' } },
        { params: { dog: 'rover' } },
        { params: { dog: 'spot' } },
      ];
    }
    
    // Lire le paramètre de la page en cours de génération
    const { dog } = Astro.params;
    ---
    
    <h1>Bon chien, {dog} !</h1>


```

Ce fichier génère trois pages : `/dogs/clifford`, `/dogs/rover` et `/dogs/spot`.

**Concepts clés** :

- `params` : Les valeurs des crochets du nom de fichier. La clé doit porter le même nom que le paramètre (`{ dog: ... }` pour `[dog].astro`).
- `props` : Des données supplémentaires facultatives transmises à chaque page générée, lisibles avec `Astro.props`.

**Erreur fréquente :** utiliser dans `params` une clé qui ne correspond pas au nom entre crochets.

```astro

    ---
    // Fichier : src/pages/dogs/[dog].astro

    // ❌ INCORRECT : le fichier utilise [dog], mais la clé est "name"
    export function getStaticPaths() {
      return [{ params: { name: 'clifford' } }];
    }

    // ✅ CORRECT : la clé correspond au nom entre crochets
    export function getStaticPaths() {
      return [{ params: { dog: 'clifford' } }];
    }
    ---


```

---

## 4. Page d'erreur 404

Une **page 404** est ce que voient les visiteurs quand ils ouvrent une adresse qui n'existe pas. Pour la personnaliser, créez un fichier nommé `404.astro` (ou `404.md`) directement dans `src/pages/`.

La plupart des services d'hébergement (comme Netlify, Vercel ou GitHub Pages) détectent automatiquement ce fichier et l'affichent quand une page est introuvable.

```astro

    ---
    // src/pages/404.astro
    import Layout from '../layouts/MainLayout.astro';
    ---
    
    <Layout title="Page introuvable">
        <div class="error-container">
            <h1>404</h1>
            <p>Oups ! La page que vous cherchez n'existe pas.</p>
            <a href="/">Retour à l'accueil</a>
        </div>
    </Layout>


```

---
title: "Contenu Markdown dans Astro"
---

# Contenu Markdown

**Markdown** (`.md`) est une façon simple d'écrire du texte mis en forme à l'aide de symboles basiques : `#` pour les titres, `**gras**` pour le texte en gras, `-` pour les listes, etc. Il est beaucoup plus facile à écrire que le HTML, ce qui le rend idéal pour les articles et la documentation.

Astro prend très bien en charge Markdown. Vous pouvez transformer directement des fichiers Markdown en pages, ou organiser de grandes quantités de contenu avec les **collections de contenu** (*Content Collections*). Astro est ainsi un excellent choix pour les blogs, les sites de documentation et les portfolios, sans base de données ni système de gestion de contenu (CMS). D'ailleurs, les guides de ce site sont écrits en Markdown et gérés avec une collection de contenu.

---

## Table des matières

<div id="content-table">

- [1. Pages Markdown](#1-pages-markdown "Créer des routes à partir de fichiers .md")
- [2. Frontmatter et layouts](#2-frontmatter-et-layouts "Ajouter des métadonnées et une mise en page")
- [3. Collections de contenu](#3-collections-de-contenu "Gestion de contenu typée")
  - [3.1 Configuration](#31-configuration "Définir des collections dans content.config.ts")
  - [3.2 Interroger le contenu](#32-interroger-le-contenu "Récupérer des données avec getCollection")

</div>

---

## 1. Pages Markdown

Le moyen le plus simple de créer une page est d'ajouter un fichier `.md` dans le dossier `src/pages/`. Comme pour les fichiers `.astro`, son emplacement détermine son URL.

```markdown

    <!-- Fichier : src/pages/welcome.md -->
    
    # Bonjour le monde
    
    Voici ma première page **Markdown** avec Astro.
    Elle sera disponible à l'adresse `monsite.com/welcome`.


```

Astro prend en charge GitHub Flavored Markdown, une version populaire de Markdown qui inclut aussi les tableaux, les listes de tâches et les blocs de code.

---

## 2. Frontmatter et layouts

Les fichiers Markdown peuvent commencer par un bloc de **frontmatter** : une section entre deux lignes de `---` tout en haut du fichier, écrite au format YAML (`clé: valeur`). Il contient des informations *sur* la page, comme son titre, sa date ou son auteur.

La propriété spéciale `layout` indique à Astro quel composant de layout doit envelopper le contenu Markdown (en-têtes, menus, styles...).

```markdown

    ---
    layout: ../layouts/BlogPostLayout.astro
    title: "Mon premier article"
    author: "Apprenti Astro"
    date: "2025-01-01"
    ---
    
    # Introduction
    
    Ce contenu sera inséré dans le <slot /> de BlogPostLayout.


```

**Accéder au frontmatter dans un layout** :

Le layout reçoit les données du frontmatter via `Astro.props.frontmatter`.

```astro

    ---
    // src/layouts/BlogPostLayout.astro
    const { frontmatter } = Astro.props;
    ---
    
    <html>
      <head><title>{frontmatter.title}</title></head>
      <body>
        <h1>{frontmatter.title}</h1>
        <p>Écrit par : {frontmatter.author}</p>
        <slot />
      </body>
    </html>


```

**Erreur fréquente :** écrire le chemin du layout depuis la racine du projet au lieu de depuis le fichier Markdown. Le chemin est *relatif* : il part du dossier où se trouve le fichier `.md`, et `../` signifie « remonter d'un dossier ».

```markdown

    <!-- Fichier : src/pages/blog/post.md -->

    <!-- ❌ INCORRECT : le chemin ne part pas du fichier Markdown, Astro ne trouve donc pas le layout -->
    ---
    layout: src/layouts/BlogPostLayout.astro
    ---

    <!-- ✅ CORRECT : depuis src/pages/blog/, on remonte de deux dossiers jusqu'à src/, puis on entre dans layouts/ -->
    ---
    layout: ../../layouts/BlogPostLayout.astro
    ---


```

---

## 3. Collections de contenu

Dans les grands projets, garder tous les fichiers Markdown dans `src/pages/` devient vite désordonné. Les **collections de contenu** permettent de ranger vos fichiers Markdown dans un dossier séparé (par exemple `src/content/`) et de les lire depuis le code comme une petite base de données.

### 3.1 Configuration

Les collections se définissent dans un fichier nommé `src/content.config.ts`. Pour chaque collection, on indique où se trouvent ses fichiers et, en option, un **schéma** : un ensemble de règles, écrites avec la bibliothèque **Zod**, qui vérifie le frontmatter de chaque fichier. S'il manque un titre à un article ou si sa date est invalide, Astro affiche une erreur claire lors de la construction du site.

```ts

    // src/content.config.ts
    import { defineCollection, z } from 'astro:content';
    import { glob } from 'astro/loaders';
    
    const blog = defineCollection({
      // Charger tous les fichiers .md de src/content/blog
      loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
      // Règles que chaque frontmatter doit respecter
      schema: z.object({
        title: z.string(),
        pubDate: z.coerce.date(),
        draft: z.boolean().optional(),
      }),
    });
    
    export const collections = { blog };


```

### 3.2 Interroger le contenu

Pour lire les entrées d'une collection, on utilise la fonction `getCollection()`. On la combine généralement avec une route dynamique (comme `src/pages/blog/[id].astro`) pour générer une page par entrée.

```astro

    ---
    // src/pages/blog/[id].astro
    import { getCollection, render } from 'astro:content';
    
    // 1. Créer une page pour chaque entrée de la collection
    export async function getStaticPaths() {
      const posts = await getCollection('blog');
      return posts.map((post) => ({
        params: { id: post.id },
        props: { post },
      }));
    }
    
    // 2. Transformer en HTML le Markdown de cette entrée
    const { post } = Astro.props;
    const { Content } = await render(post);
    ---
    
    <h1>{post.data.title}</h1>
    <Content />


```

`post.data` contient les valeurs du frontmatter, déjà vérifiées par le schéma, et `<Content />` affiche le corps du fichier Markdown.

**Erreur fréquente :** suivre d'anciens tutoriels. Avant Astro 5, le fichier de configuration était `src/content/config.ts`, les entrées utilisaient `post.slug` et le contenu était généré avec `post.render()`. Dans les versions actuelles, on utilise `src/content.config.ts`, `post.id` et `render(post)`.

```astro

    ---
    // ❌ INCORRECT (ancienne API) : slug et entry.render() n'existent plus dans les collections avec loaders
    const { Content } = await post.render();
    const url = `/blog/${post.slug}`;

    // ✅ CORRECT (Astro 5+)
    import { render } from 'astro:content';
    const { Content } = await render(post);
    const url = `/blog/${post.id}`;
    ---


```

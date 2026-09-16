---
title: "L'API Context en React"
---

# API Context

En React, les données circulent normalement du parent vers l'enfant grâce aux props. Cela fonctionne bien la plupart du temps, mais certaines données sont utilisées par de nombreux composants répartis dans toute l'application : la langue choisie par l'utilisateur, le thème de couleur (clair ou sombre) ou les informations de l'utilisateur connecté. Les transmettre à chaque niveau devient vite fastidieux.

Le **Context** (« contexte ») permet de partager ce type de valeurs avec n'importe quel composant qui en a besoin, sans passer de props à chaque niveau intermédiaire. Voyez-le comme une station de radio : un composant diffuse les données, et tout composant situé en dessous peut s'y brancher.

---

## Table des matières

<div id="content-table">

- [1. Le problème du prop drilling](#1-le-problème-du-prop-drilling "Pourquoi avons-nous besoin de Context ?")
- [2. Fonctionnement](#2-fonctionnement "Les trois parties de Context")
- [3. Créer un contexte](#3-créer-un-contexte "Initialiser l'objet Context")
- [4. Fournir le contexte](#4-fournir-le-contexte "Envelopper l'arbre de composants")
- [5. Consommer le contexte](#5-consommer-le-contexte "Lire les données avec useContext")

</div>

---

## 1. Le problème du prop drilling

Le **prop drilling** (« forage de props ») se produit quand il faut envoyer des données d'un composant situé en haut de l'application vers un composant très profond. Les données doivent passer en prop par tous les composants intermédiaires, même si ceux-ci **ne les utilisent pas**.

* **Sans Context** : `App` → `Layout` → `Header` → `UserInfo` (Layout et Header ne s'intéressent pas à l'utilisateur, mais doivent le transmettre).
* **Avec Context** : `App` → `UserInfo` (UserInfo lit les données directement).

```jsx

    // ❌ INCORRECT (prop drilling) : Layout et Header reçoivent "user" uniquement pour le transmettre
    function App() {
        const user = { name: "Alex" };
        return <Layout user={user} />;
    }
    function Layout({ user }) {
        return <Header user={user} />;
    }
    function Header({ user }) {
        return <UserInfo user={user} />;
    }

    // ✅ CORRECT (context) : les composants intermédiaires n'ont pas besoin de connaître "user"
    function App() {
        const user = { name: "Alex" };
        return (
            <UserContext.Provider value={user}>
                <Layout />
            </UserContext.Provider>
        );
    }
    function UserInfo() {
        const user = useContext(UserContext);
        return <p>{user.name}</p>;
    }


```

---

## 2. Fonctionnement

L'API Context comporte trois parties :

1.  **L'objet Context** : La boîte où sont rangées les données partagées.
2.  **Le Provider** (« fournisseur ») : Un composant qui enveloppe votre application (ou une partie) et « diffuse » les données à tout ce qu'il contient.
3.  **Le consommateur (`useContext`)** : Le hook qu'un composant utilise pour lire les données.

---

## 3. Créer un contexte

On commence par créer un objet Context avec `createContext`. On le fait généralement dans un fichier dédié, pour que n'importe quel composant puisse l'importer.

```javascript

    // ThemeContext.js
    import { createContext } from 'react';

    // 1. Créer le Context
    // La valeur entre parenthèses ('light') est la valeur par défaut, utilisée seulement s'il n'y a pas de Provider au-dessus
    export const ThemeContext = createContext('light');


```

**Erreur fréquente :** créer le contexte à l'intérieur d'un composant. Chaque rendu créerait un nouveau contexte différent, et les composants qui le lisent ne recevraient jamais les données.

```jsx

    // ❌ INCORRECT : un nouveau contexte est créé à chaque rendu d'App
    function App() {
        const ThemeContext = createContext('light');
        ...
    }

    // ✅ CORRECT : créé une seule fois, en dehors de tout composant, puis exporté
    export const ThemeContext = createContext('light');


```

---

## 4. Fournir le contexte

Chaque objet Context inclut un composant **Provider**. Il accepte une prop `value` contenant les données à partager. N'importe quel composant situé dans le Provider, aussi profond soit-il, peut lire cette valeur.

```jsx

    import { useState } from 'react';
    import { ThemeContext } from './ThemeContext';

    export default function App() {
        const [theme, setTheme] = useState('dark');

        return (
            // 2. Envelopper les composants avec le Provider
            // L'état actuel est transmis comme valeur
            <ThemeContext.Provider value={theme}>
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    Changer de thème
                </button>
                <Toolbar />
                <Footer />
            </ThemeContext.Provider>
        );
    }


```

*Remarque : dans cet exemple, `Toolbar` et `Footer` ne reçoivent pas `theme` en prop. Il est disponible « dans l'air » pour tout composant situé dans le Provider. Comme la valeur provient de l'état, tous les composants qui la lisent se mettent à jour automatiquement quand le thème change.*

*Depuis React 19, vous pouvez aussi écrire directement `<ThemeContext value={theme}>`, sans `.Provider`. Les deux formes fonctionnent.*

---

## 5. Consommer le contexte

Pour lire les données dans un composant, utilisez le hook `useContext` en lui passant l'objet Context.

```jsx

    import { useContext } from 'react';
    import { ThemeContext } from './ThemeContext';

    export default function Footer() {
        // 3. Lire la valeur du Provider le plus proche au-dessus
        const currentTheme = useContext(ThemeContext);

        return (
            <footer className={currentTheme}>
                <p>Thème actuel : {currentTheme}</p>
            </footer>
        );
    }


```

**Erreur fréquente :** utiliser un composant qui lit le contexte en dehors de son Provider. React n'affiche aucune erreur : `useContext` renvoie simplement la valeur par défaut, et le composant semble « ignorer » les changements.

```jsx

    // ❌ INCORRECT : Footer est en dehors du Provider, il reçoit donc toujours 'light'
    <>
        <ThemeContext.Provider value={theme}>
            <Toolbar />
        </ThemeContext.Provider>
        <Footer />
    </>

    // ✅ CORRECT : Footer est dans le Provider et reçoit le thème actuel
    <ThemeContext.Provider value={theme}>
        <Toolbar />
        <Footer />
    </ThemeContext.Provider>


```

**Quand utiliser Context ?** Context est puissant, mais à utiliser avec modération : les composants qui dépendent d'un contexte sont plus difficiles à réutiliser ailleurs, car ils ne fonctionnent qu'à l'intérieur de ce Provider.

- **Utilisez les props** pour des données simples transmises d'un parent à ses enfants.

- **Utilisez Context** pour des données « globales » (utilisateur, thème, langue) nécessaires à de nombreux composants à différents niveaux.

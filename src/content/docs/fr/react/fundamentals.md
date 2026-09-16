---
title: "Les bases de React"
---

# Les bases

React est une bibliothèque JavaScript pour construire des interfaces utilisateur à partir de **composants** : des morceaux d'écran indépendants et réutilisables, comme un bouton, une fiche produit ou un menu complet. On crée de petits composants et on les assemble comme des briques pour construire des pages entières.

Pour rendre les composants dynamiques et interactifs, React utilise deux types de données : les **props** et l'**état** (*state*).

- Les **props** sont des données qu'un composant *reçoit* du composant qui le contient, comme les arguments d'une fonction.
- L'**état** est constitué de données qu'un composant *crée et gère lui-même*, comme sa propre mémoire. Quand l'état change, React met automatiquement à jour ce qui s'affiche à l'écran.

Comprendre la différence entre les deux est essentiel, car elle détermine la façon dont les données circulent dans votre application.

---

## Table des matières

<div id="content-table">

- [1. Les bases de JSX](#1-les-bases-de-jsx "Structure, listes et événements")
- [2. Props](#2-props "Transmettre des données du parent à l'enfant")
- [3. L'état (state)](#3-létat-state "Gérer des données qui changent dans un composant")
- [4. Flux de données à sens unique](#4-flux-de-données-à-sens-unique "La direction dans laquelle circulent les données")

</div>

---

## 1. Les bases de JSX

**JSX** (JavaScript XML) est la syntaxe utilisée pour décrire ce qu'affiche chaque composant. Elle permet d'écrire quelque chose qui ressemble à du HTML directement dans du code JavaScript. Elle paraît familière, mais elle a quelques règles propres.

En React, un composant est simplement une fonction JavaScript qui renvoie du JSX.

### A) Règles de structure
1.  **Un seul parent :** Un composant doit renvoyer un seul élément qui englobe tout le reste. Si vous ne voulez pas de `<div>` supplémentaire, utilisez un **Fragment** (`<>...</>`), une enveloppe invisible.
2.  **Attributs en camelCase :** Comme `class` est un mot réservé en JavaScript, on utilise `className`. Les événements s'écrivent aussi en camelCase (`onClick` au lieu de `onclick`).
3.  **Balises fermées :** Toutes les balises doivent être fermées, y compris celles sans contenu (`<img />`, `<br />`).
4.  **Accolades :** Tout ce qui se trouve entre `{}` est évalué comme du JavaScript : on peut donc insérer des variables ou des calculs dans le balisage.

```jsx

    // Un composant simple qui affiche des données dynamiques
    export default function UserCard() {
        const username = "Alex";
        const isActive = true;

        return (
            <div className="card">
                {/* Les accolades {} insèrent la valeur d'une variable JavaScript */}
                <h2>Bienvenue, {username}</h2>
                
                {/* Choisir un texte avec l'opérateur ternaire : condition ? siVrai : siFaux */}
                <p>Statut : {isActive ? "En ligne" : "Hors ligne"}</p>
            </div>
        );
    }


```

```jsx

    // ❌ INCORRECT : deux éléments côte à côte sans enveloppe, et "class" au lieu de "className"
    return (
        <h1 class="title">Bonjour</h1>
        <p>Bienvenue</p>
    );

    // ✅ CORRECT : un Fragment englobe les deux éléments et className est utilisé
    return (
        <>
            <h1 className="title">Bonjour</h1>
            <p>Bienvenue</p>
        </>
    );


```

### B) Afficher des listes
Pour afficher une liste, React utilise la méthode de tableau `.map()`, qui transforme chaque donnée en élément. Chaque élément doit avoir une prop `key` avec une valeur unique, pour que React puisse les distinguer quand la liste change.

```jsx

    const fruits = [
        { id: 1, name: "Pomme" },
        { id: 2, name: "Banane" },
        { id: 3, name: "Orange" },
    ];

    return (
        <ul>
            {fruits.map((fruit) => (
                <li key={fruit.id}>{fruit.name}</li>
            ))}
        </ul>
    );


```

**Erreur fréquente :** utiliser la position dans la liste (`index`) comme `key` quand des éléments peuvent être ajoutés, supprimés ou réordonnés. React peut alors confondre les éléments et, par exemple, laisser une case cochée sur la mauvaise ligne.

```jsx

    // ❌ INCORRECT : l'indice change quand un élément est supprimé ou réordonné
    {fruits.map((fruit, index) => (
        <li key={index}>{fruit.name}</li>
    ))}

    // ✅ CORRECT : un identifiant unique et stable provenant des données
    {fruits.map((fruit) => (
        <li key={fruit.id}>{fruit.name}</li>
    ))}


```

### C) Gérer les événements
En HTML, le code à exécuter s'écrit sous forme de texte (`onclick="faireQuelqueChose()"`). En React, on transmet **la fonction elle-même** entre accolades.

```jsx

    function Button() {
        const handleClick = () => alert("Cliqué !");

        return (
            <button onClick={handleClick}>Cliquez-moi</button>
        );
    }


```

```jsx

    // ❌ INCORRECT : les parenthèses exécutent handleClick immédiatement, pendant l'affichage de la page
    <button onClick={handleClick()}>Cliquez-moi</button>

    // ✅ CORRECT : on transmet la fonction ; React l'exécutera au clic sur le bouton
    <button onClick={handleClick}>Cliquez-moi</button>

    // ✅ CORRECT : pour passer des arguments, on l'enveloppe dans une fonction fléchée
    <button onClick={() => deleteItem(3)}>Supprimer</button>


```

---

## 2. Props

Abréviation de *properties* (« propriétés »), les **props** permettent à un composant parent de transmettre des données à un composant enfant. Elles rendent les composants réutilisables : le même composant peut afficher un contenu différent selon les props reçues, comme une fonction renvoie des résultats différents selon ses arguments.

**Règle clé :** Un composant ne doit jamais modifier ses propres props. Elles sont en *lecture seule*.

Dans cet exemple, le composant `Welcome` reçoit les props `name` et `role` pour afficher une carte personnalisée.

```jsx

    // 1. Composant enfant
    // { name, role } extrait ces deux valeurs de l'objet props
    function Welcome({ name, role }) {
        return (
            <div className="card">
                <h2>Bonjour, {name} !</h2>
                <p>Rôle : {role}</p>
            </div>
        );
    }

    // 2. Composant parent
    export default function App() {
        return (
            <main>
                {/* Le même composant, configuré avec des données différentes */}
                <Welcome name="Alice" role="Développeuse front-end" />
                <Welcome name="Bruno" role="Designer" />
            </main>
        );
    }


```

```jsx

    // ❌ INCORRECT : un composant ne doit pas modifier les props qu'il reçoit
    function Welcome(props) {
        props.name = props.name.toUpperCase();
        return <h2>Bonjour, {props.name} !</h2>;
    }

    // ✅ CORRECT : on crée une nouvelle valeur à partir de la prop
    function Welcome({ name }) {
        const upperName = name.toUpperCase();
        return <h2>Bonjour, {upperName} !</h2>;
    }


```

---

## 3. L'état (state)

L'**état** est la mémoire interne d'un composant. Contrairement aux props, l'état **peut changer**. Quand il change, React *ré-affiche* (re-render) automatiquement le composant : il exécute à nouveau la fonction et met l'écran à jour avec les nouvelles données.

Pour créer un état dans un composant, on utilise `useState`. C'est un **hook** : une fonction spéciale de React dont le nom commence par `use`.

*Remarque : les Hooks sont détaillés dans le guide suivant, mais `useState` est nécessaire ici pour illustrer le concept.*

```jsx

    import { useState } from 'react';

    export default function Counter() {
        // [valeur actuelle, fonction pour la modifier] = useState(valeur initiale)
        const [count, setCount] = useState(0);

        return (
            <div>
                <p>Compteur actuel : {count}</p>

                {/* Le clic appelle setCount avec la nouvelle valeur */}
                <button onClick={() => setCount(count + 1)}>
                    Incrémenter
                </button>
            </div>
        );
    }


```

**Que se passe-t-il ici ?**

1. Le composant démarre avec `count` à `0`.

2. L'utilisateur clique sur le bouton.

3. `setCount` enregistre la nouvelle valeur.

4. React détecte le changement et redessine le composant avec le nouveau nombre.

**Erreur fréquente :** modifier directement la variable d'état. React ne détecte pas le changement, et l'écran ne se met pas à jour.

```jsx

    // ❌ INCORRECT : count change en mémoire, mais React ne ré-affiche pas
    <button onClick={() => { count = count + 1; }}>Incrémenter</button>

    // ✅ CORRECT : utilisez toujours la fonction renvoyée par useState
    <button onClick={() => setCount(count + 1)}>Incrémenter</button>


```

---

## 4. Flux de données à sens unique

React suit un **flux de données à sens unique** : les données ne circulent que dans une direction, **vers le bas**, des composants parents vers leurs enfants.

- **Du parent à l'enfant :** Les données sont envoyées via les **props**.

- **De l'enfant au parent :** Les données ne peuvent pas remonter directement. Le parent transmet plutôt une **fonction** à l'enfant sous forme de prop, et l'enfant appelle cette fonction quand quelque chose se produit.

On sait ainsi clairement d'où vient chaque donnée et quel composant a le droit de la modifier, ce qui rend les erreurs beaucoup plus faciles à trouver.

```jsx

    import { useState } from 'react';

    // Composant ENFANT
    function ButtonChild({ onButtonClick }) {
        // L'enfant ne sait pas ce que fait la fonction ; il se contente de l'appeler
        return (
            <button onClick={onButtonClick}>
                Cliquez pour prévenir le parent !
            </button>
        );
    }

    // Composant PARENT
    export default function Parent() {
        const [message, setMessage] = useState("En attente...");

        // Cette fonction vit dans le parent, à côté de l'état qu'elle modifie
        const handleUpdate = () => {
            setMessage("L'enfant a cliqué sur le bouton !");
        };

        return (
            <div>
                <h1>Le parent dit : {message}</h1>
                
                {/* On transmet la FONCTION comme prop */}
                <ButtonChild onButtonClick={handleUpdate} />
            </div>
        );
    }


```

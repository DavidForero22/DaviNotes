---
title: "Les Hooks en React"
---

# Hooks

Les **Hooks** sont des fonctions spéciales qui donnent aux composants des capacités supplémentaires, comme se souvenir de données entre deux affichages ou exécuter du code une fois le composant affiché à l'écran. Ils sont arrivés avec React 16.8 et sont aujourd'hui la façon standard d'écrire des composants. Leur nom commence toujours par `use` (par exemple `useState`, `useEffect`).

Avant les Hooks, ces capacités n'existaient que dans les *composants de classe*, une façon plus ancienne et plus verbeuse d'écrire des composants. On les trouve encore dans d'anciens projets, mais le nouveau code utilise des fonctions et des Hooks.

---

## Table des matières

<div id="content-table">

- [1. Présentation des Hooks](#1-présentation-des-hooks "Les super-pouvoirs des composants fonctionnels")
- [2. useState](#2-usestate "Gérer l'état local d'un composant")
- [3. useEffect](#3-useeffect "Effets de bord comme le chargement de données")
- [4. useMemo](#4-usememo "Mémoriser le résultat de calculs coûteux")
- [5. useCallback](#5-usecallback "Mémoriser des fonctions pour éviter des affichages inutiles")
- [6. Règles des Hooks](#6-règles-des-hooks "Règles obligatoires pour utiliser les Hooks")

</div>

---

## 1. Présentation des Hooks

Un composant React est une fonction exécutée chaque fois qu'il faut le dessiner à l'écran (chaque exécution s'appelle un **rendu**, ou *render*). Les variables normales d'une fonction disparaissent quand elle se termine : un composant n'a donc pas de mémoire propre. Les Hooks règlent ce problème : ils relient la fonction à des fonctionnalités gérées par React, comme l'état (la mémoire), les effets de bord ou les données partagées.

**Caractéristiques clés** :

- **Réutilisables :** Vous pouvez combiner plusieurs Hooks dans vos propres *Hooks personnalisés* (des fonctions dont le nom commence par `use`) pour partager de la logique entre composants.
- **Progressifs :** Vous pouvez utiliser les Hooks dans de nouveaux composants sans réécrire les anciens.
- **Fonctions uniquement :** Les Hooks fonctionnent dans les composants fonctionnels, pas dans les composants de classe.

---

## 2. useState

`useState` donne à un composant un **état** : une valeur dont React se souvient entre les rendus. Quand vous la modifiez, React redessine le composant avec la nouvelle valeur.

**Syntaxe** : `const [state, setState] = useState(valeurInitiale);`

Il renvoie une paire : la **valeur actuelle** et une **fonction** pour la mettre à jour. Par convention, la fonction s'appelle `set` + le nom de la valeur.

```jsx

    import { useState } from "react";

    export default function TextInput() {
        // Déclarer une variable d'état nommée "text", qui commence par "Bonjour"
        const [text, setText] = useState("Bonjour");

        return (
            <div>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)} // Enregistrer chaque modification dans l'état
                />
                <p>Vous avez saisi : {text}</p>
            </div>
        );
    }


```

**Erreur fréquente :** modifier directement un objet ou une liste stockés dans l'état. React compare l'ancienne et la nouvelle valeur ; si vous modifiez le même objet, ils semblent identiques et l'écran ne se met pas à jour. Créez toujours un **nouvel** objet ou une **nouvelle** liste.

```jsx

    const [user, setUser] = useState({ name: "Alex", age: 30 });

    // ❌ INCORRECT : le même objet est modifié, React ne le détecte pas
    user.age = 31;
    setUser(user);

    // ✅ CORRECT : un nouvel objet est créé en copiant l'ancien (...user) et en changeant age
    setUser({ ...user, age: 31 });


```

---

## 3. useEffect

`useEffect` permet d'exécuter du code **après** l'affichage du composant à l'écran. On l'utilise pour les **effets de bord** : des actions qui sortent du composant, comme charger des données depuis un serveur, lancer un minuteur ou changer le titre de l'onglet du navigateur.

Par défaut, l'effet s'exécute après le **premier rendu** et après **chaque** mise à jour.

```jsx

    import { useState, useEffect } from "react";

    function PageTitle() {
        const [count, setCount] = useState(0);

        useEffect(() => {
            // Mettre à jour le texte de l'onglet du navigateur
            document.title = `Vous avez cliqué ${count} fois`;
        });

        return <button onClick={() => setCount(count + 1)}>Cliquez-moi</button>;
    }


```

Vous pouvez demander à React d'exécuter l'effet uniquement quand certaines valeurs changent, en passant un tableau en second argument. Ce tableau s'appelle le **tableau de dépendances**.

```jsx

    useEffect(() => {
        document.title = `Vous avez cliqué ${count} fois`;
    }, [count]); // Ne s'exécute à nouveau que si 'count' change


```

**Cas courants :**

- `[a, b]` : S'exécute après le premier rendu ET chaque fois que `a` ou `b` changent.

- `[]` (tableau vide) : S'exécute **une seule fois**, après le premier rendu.

- Pas de tableau : S'exécute après **chaque** rendu.

**Erreur fréquente :** mettre à jour l'état dans un effet sans tableau de dépendances. Le changement d'état provoque un nouveau rendu, le nouveau rendu relance l'effet, et ainsi de suite indéfiniment (une *boucle infinie*).

```jsx

    // ❌ INCORRECT : effet -> setUsers -> rendu -> effet -> setUsers -> ...
    useEffect(() => {
        fetch("/api/users")
            .then((response) => response.json())
            .then((data) => setUsers(data));
    });

    // ✅ CORRECT : le tableau vide ne l'exécute qu'une fois, à l'apparition du composant
    useEffect(() => {
        fetch("/api/users")
            .then((response) => response.json())
            .then((data) => setUsers(data));
    }, []);


```

Certains effets doivent être **nettoyés** quand le composant disparaît de l'écran, comme arrêter un minuteur ou fermer une connexion. Sinon, ils continuent de tourner en arrière-plan et gaspillent de la mémoire. Pour cela, renvoyez une fonction depuis l'effet : React l'exécutera quand le composant sera retiré.

```jsx

    useEffect(() => {
        const timer = setInterval(() => {
            console.log("Tic...");
        }, 1000);

        // Fonction de nettoyage : s'exécute quand le composant est retiré
        return () => {
            clearInterval(timer);
            console.log("Minuteur arrêté");
        };
    }, []);


```

```jsx

    // ❌ INCORRECT : le minuteur continue de tourner après la disparition du composant
    useEffect(() => {
        setInterval(() => console.log("Tic..."), 1000);
    }, []);

    // ✅ CORRECT : la fonction de nettoyage arrête le minuteur
    useEffect(() => {
        const timer = setInterval(() => console.log("Tic..."), 1000);
        return () => clearInterval(timer);
    }, []);


```

---

## 4. useMemo

`useMemo` **mémorise le résultat d'un calcul** pour ne pas le refaire à chaque rendu. Cette technique s'appelle la *mémoïsation*. Elle est utile pour les opérations lentes, comme filtrer une énorme liste ou effectuer des calculs mathématiques complexes.

**Le problème :** Sans `useMemo`, chaque calcul du composant est refait à **chaque** rendu, même si ses données n'ont pas changé.

**La solution :** `useMemo` vérifie si les dépendances ont changé. Si ce n'est pas le cas, il renvoie immédiatement le résultat mémorisé.

**Syntaxe :** `const cachedValue = useMemo(calculerValeur, [dépendances]);`

```jsx

    import { useState, useMemo } from "react";

    export default function ExpensiveComponent() {
        const [count, setCount] = useState(0);
        const [darkTheme, setDarkTheme] = useState(false);

        // 1. Une fonction volontairement lente
        const expensiveCalculation = (num) => {
            console.log("Calcul en cours...");
            for (let i = 0; i < 1000000000; i++) {} // Délai artificiel
            return num * 2;
        };

        // 2. Utilisation de useMemo
        // Le calcul n'est refait QUE si 'count' change.
        // Changer de thème ré-affiche le composant, mais réutilise le résultat mémorisé.
        const calculatedValue = useMemo(() => {
            return expensiveCalculation(count);
        }, [count]);

        return (
            <div style={{ background: darkTheme ? "#333" : "#FFF" }}>
                <h2>Résultat : {calculatedValue}</h2>
                <button onClick={() => setCount(count + 1)}>Incrémenter</button>
                <button onClick={() => setDarkTheme(!darkTheme)}>Changer de thème</button>
            </div>
        );
    }


```

**Erreur fréquente :** oublier dans le tableau de dépendances une valeur utilisée par le calcul. `useMemo` continue de renvoyer l'ancien résultat alors que les données ont changé.

```jsx

    // ❌ INCORRECT : le résultat utilise 'filter', qui n'est pas une dépendance : la liste ne se met jamais à jour
    const visibleItems = useMemo(() => {
        return items.filter((item) => item.includes(filter));
    }, [items]);

    // ✅ CORRECT : toutes les valeurs utilisées à l'intérieur sont listées
    const visibleItems = useMemo(() => {
        return items.filter((item) => item.includes(filter));
    }, [items, filter]);


```

*Astuce : `useMemo` est une optimisation. Ne l'utilisez que pour des calculs réellement lents ; pour les calculs simples, il ajoute de la complexité sans aucun bénéfice.*

---

## 5. useCallback

`useCallback` fonctionne comme `useMemo`, mais au lieu de mémoriser une valeur, il **mémorise une fonction**.

En JavaScript, à chaque rendu d'un composant, toutes les fonctions qu'il définit sont recréées comme de nouvelles fonctions. En général, ce n'est pas grave, mais cela pose problème quand :

1. Vous transmettez la fonction en prop à un composant enfant optimisé avec `memo` (un enfant qui ne se ré-affiche que si ses props changent). Une nouvelle fonction compte comme une prop modifiée, et l'optimisation ne fonctionne plus.

2. La fonction figure dans le tableau de dépendances d'un `useEffect`, qui s'exécuterait alors à chaque rendu.

**Syntaxe :** `const cachedFn = useCallback(fn, [dépendances]);`

Dans cet exemple, `ChildButton` ne se ré-affiche que si ses props changent. Sans `useCallback`, `handleClick` serait une nouvelle fonction à chaque rendu du parent, forçant l'enfant à se ré-afficher sans raison.

```jsx

    import { useState, useCallback, memo } from "react";

    // Un composant enfant qui ne se ré-affiche que si ses props changent
    const ChildButton = memo(({ onClick }) => {
        console.log("Enfant affiché");
        return <button onClick={onClick}>Bouton de l'enfant</button>;
    });

    export default function Parent() {
        const [count, setCount] = useState(0);

        // ❌ SANS useCallback : une nouvelle fonction à chaque rendu, donc ChildButton se ré-affiche toujours
        // const handleClick = () => console.log("Cliqué");

        // ✅ AVEC useCallback : React conserve la même fonction entre les rendus
        const handleClick = useCallback(() => {
            console.log("Cliqué");
        }, []); // Tableau de dépendances vide = la fonction n'a jamais besoin de changer

        return (
            <div>
                <p>Compteur : {count}</p>
                <button onClick={() => setCount(count + 1)}>Ré-afficher le parent</button>

                {/* Le parent se ré-affiche, mais pas ChildButton */}
                <ChildButton onClick={handleClick} />
            </div>
        );
    }


```

---

## 6. Règles des Hooks

Les Hooks sont des fonctions JavaScript, mais ils doivent respecter deux règles :

1. **N'appelez les Hooks qu'au niveau supérieur :** Ne les appelez pas dans des boucles, des conditions ou des fonctions imbriquées. React identifie chaque Hook par l'ordre dans lequel il est appelé : cet ordre doit donc être exactement le même à chaque rendu.

2. **N'appelez les Hooks que depuis des fonctions React :** Appelez-les depuis des composants fonctionnels ou vos propres Hooks personnalisés, jamais depuis des fonctions JavaScript ordinaires.

```jsx

    // ❌ INCORRECT
    if (userName !== '') {
        useEffect(() => { ... }); // Erreur ! L'ordre des hooks pourrait changer
    }

    // ✅ CORRECT
    useEffect(() => {
        if (userName !== '') { ... } // La logique à l'intérieur du hook ne pose pas de problème
    });


```

```jsx

    // ❌ INCORRECT : le hook est appelé dans une fonction ordinaire exécutée au clic
    function handleClick() {
        const [clicked, setClicked] = useState(false);
    }

    // ✅ CORRECT : le hook est déclaré en haut du composant et utilisé dans la fonction
    function LikeButton() {
        const [clicked, setClicked] = useState(false);

        function handleClick() {
            setClicked(true);
        }

        return <button onClick={handleClick}>{clicked ? "Aimé" : "J'aime"}</button>;
    }


```

```jsx

    // ❌ INCORRECT : un return anticipé avant un hook le fait sauter lors de certains rendus
    function Profile({ user }) {
        if (!user) return <p>Chargement...</p>;
        const [tab, setTab] = useState("posts");
    }

    // ✅ CORRECT : on appelle d'abord tous les hooks, puis on décide quoi renvoyer
    function Profile({ user }) {
        const [tab, setTab] = useState("posts");
        if (!user) return <p>Chargement...</p>;
    }


```

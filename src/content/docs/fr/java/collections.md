---
title: "Collections en Java"
---

# Les collections en Java

Les programmes travaillent rarement avec une seule donnée : une boutique a de nombreux produits, une école a de nombreux élèves. Une **collection** est une structure qui stocke un groupe de valeurs sous un même nom.

Java propose le **Collections Framework**, un ensemble de classes toutes prêtes pour stocker des groupes de données qui peuvent grandir et rétrécir. Avant de l'utiliser, il est utile de comprendre la structure la plus simple (le tableau) et deux façons classiques d'organiser les données (piles et files), afin de choisir le bon outil pour chaque besoin.

---

## Table des matières

<div id="content-table">

- [1. Structures de base](#1-structures-de-base "Les structures de données fondamentales de Java")
  - [A) Tableaux (arrays)](#a-tableaux-arrays "Tableaux de taille fixe : avantages et inconvénients")
  - [B) Piles et files](#b-piles-et-files "Traitement LIFO et FIFO avec les piles et les files")
- [2. ArrayList](#2-arraylist "Listes dynamiques avec ArrayList")
- [3. HashMap](#3-hashmap "Paires clé-valeur et recherches rapides avec HashMap")
- [4. API Stream](#4-api-stream "Traiter les collections de façon déclarative avec les Streams")
- [5. Autres collections](#5-autres-collections "Découvrir les autres collections de Java")

</div>

---

## 1. Structures de base

Avant d'aborder le Collections Framework, voyons les structures les plus simples et ce qui distingue Java des autres langages.

### A) Tableaux (arrays)

Un **tableau** (*array*) est une rangée de cases du même type, créée avec un nombre fixe de positions. Chaque position a un numéro appelé **indice**, qui commence à `0`.

- **Avantages :** Très rapide et léger, car toutes les valeurs sont stockées côte à côte en mémoire.
- **Inconvénients :** Sa taille est fixe : une fois créé, on ne peut pas lui ajouter de positions.

En Python (`list`) ou en JavaScript (`[]`), les listes s'agrandissent toutes seules. En Java, un tableau comme `int[]` ne le peut pas ; si vous avez besoin d'une liste qui grandit, utilisez `ArrayList` (voir la section 2).

```java

    public class Main {
        public static void main(String[] args) {
            // Un tableau de 5 nombres entiers : positions 0, 1, 2, 3 et 4
            int[] numbers = new int[5];
            numbers[0] = 10; // Stocke 10 dans la première position
        }
    }


```

**Erreur fréquente :** utiliser une position qui n'existe pas. Un tableau de 5 éléments va de l'indice `0` à `4` : l'indice `5` fait planter le programme avec une `ArrayIndexOutOfBoundsException`.

```java

    int[] numbers = new int[5];

    // ❌ INCORRECT : la dernière position est 4, pas 5
    numbers[5] = 50;

    // ✅ CORRECT : la dernière position est toujours length - 1
    numbers[numbers.length - 1] = 50;


```

### B) Piles et files

Les piles et les files définissent l'**ordre** dans lequel les éléments sont ajoutés et retirés.

- **Pile (Last-In, First-Out ou LIFO, « dernier entré, premier sorti ») :** Comme une pile d'assiettes. La dernière assiette posée sur le dessus est la première qu'on reprend. Un usage typique est le bouton « précédent » du navigateur : la dernière page visitée est la première où l'on revient.

```java

    import java.util.ArrayDeque;
    import java.util.Deque;

    public class Main {
        public static void main(String[] args) {
            Deque<String> history = new ArrayDeque<>();

            // 1. Ajouter des éléments sur le dessus (push)
            history.push("Page d'accueil");
            history.push("Paramètres");
            history.push("Profil"); // Celui-ci est tout en haut

            // 2. Regarder l'élément du dessus sans le retirer (peek)
            System.out.println("Actuelle : " + history.peek()); // Affiche : Profil

            // 3. Retirer l'élément du dessus (pop)
            String lastVisited = history.pop(); // Retire "Profil"

            System.out.println("Retour à : " + history.peek()); // Affiche : Paramètres
        }
    }


```

*Remarque : Java possède aussi une classe `Stack` plus ancienne qui fonctionne de la même manière, mais la documentation officielle recommande `ArrayDeque` pour le nouveau code.*

- **File (First-In, First-Out ou FIFO, « premier entré, premier sorti ») :** Comme la file d'attente au supermarché. La première personne arrivée est la première servie. Un usage typique est la file d'attente d'une imprimante.

```java

    import java.util.LinkedList; 
    import java.util.Queue;

    public class Main {
        public static void main(String[] args) {
            // LinkedList est l'une des classes qui peuvent servir de file (Queue)
            Queue<String> printerQueue = new LinkedList<>();

            // 1. Ajouter des éléments en fin de file (offer)
            printerQueue.offer("Document_A.pdf");
            printerQueue.offer("Photo_B.jpg");

            // 2. Retirer le premier élément de la file (poll)
            // "Document_A.pdf" a été ajouté en premier, il sort donc en premier
            System.out.println("Impression : " + printerQueue.poll());

            // 3. Voir qui est le suivant sans le retirer (peek)
            System.out.println("Suivant : " + printerQueue.peek()); // Affiche : Photo_B.jpg
        }
    }


```

La partie `<String>` entre les symboles `<` et `>` indique le type des éléments stockés dans la collection. On parle de **génériques**.

---

## 2. ArrayList

`ArrayList` fait partie du Collections Framework. Elle fonctionne comme un tableau qui se redimensionne automatiquement quand on ajoute ou retire des éléments, comme les listes de Python et de JavaScript.

- **Avantages :** Lire un élément par sa position (`get(i)`) est instantané.
- **Inconvénients :** Insérer ou supprimer des éléments au milieu est plus lent, car tous les éléments suivants doivent se décaler d'une position.

```java

    import java.util.ArrayList;

    public class Main {
        public static void main(String[] args) {
            // Créer une liste de textes vide
            ArrayList<String> languages = new ArrayList<>();

            // Elle grandit automatiquement
            languages.add("Java");
            languages.add("Python");
            languages.add("C++");

            System.out.println(languages.get(0)); // Affiche : Java
            System.out.println(languages.size()); // Affiche : 3
        }
    }


```

**Erreur fréquente :** utiliser un type primitif entre les symboles `< >`. Les collections ne peuvent stocker que des objets : chaque primitif a donc sa version objet, `Integer` pour `int`, `Double` pour `double`, `Boolean` pour `boolean`, etc.

```java

    // ❌ INCORRECT : int est un type primitif et ne compile pas ici
    ArrayList<int> numbers = new ArrayList<>();

    // ✅ CORRECT : Integer est la version objet de int
    ArrayList<Integer> numbers = new ArrayList<>();
    numbers.add(42); // Java convertit 42 en Integer automatiquement


```

---

## 3. HashMap

Une `HashMap` stocke des données sous forme de **paires clé-valeur**, comme un dictionnaire où l'on cherche un mot (la clé) pour trouver sa définition (la valeur). En interne, elle utilise une fonction mathématique (un *hash*) pour décider où ranger chaque clé, ce qui rend la recherche de valeurs extrêmement rapide.

- **Avantages :** Trouver une valeur par sa clé est rapide, quelle que soit la quantité de données.
- **Inconvénients :** Elle ne garde pas les éléments dans un ordre particulier, et chaque clé ne peut apparaître qu'une fois.

```java

    import java.util.HashMap;

    public class Main {
        public static void main(String[] args) {
            // Map : Clé (String) -> Valeur (Integer)
            HashMap<String, Integer> scores = new HashMap<>();

            scores.put("Joueur1", 1500);
            scores.put("Joueur2", 3000);

            // Recherche instantanée par clé
            System.out.println(scores.get("Joueur1")); // Affiche : 1500
        }
    }


```

**Erreur fréquente :** supposer qu'une clé existe toujours. Si elle n'existe pas, `get()` renvoie `null` (aucune valeur), et utiliser ce `null` comme un nombre fait planter le programme. `getOrDefault()` permet d'indiquer une valeur de secours.

```java

    // ❌ INCORRECT : "Joueur3" n'existe pas, get() renvoie null et le programme plante
    int score = scores.get("Joueur3");

    // ✅ CORRECT : renvoie 0 quand la clé n'existe pas
    int score = scores.getOrDefault("Joueur3", 0);


```

---

## 4. API Stream

Introduits avec Java 8, les **Streams** (« flux ») permettent de traiter une collection étape par étape, comme une chaîne de montage : vous décrivez *ce que* vous voulez (filtrer ceci, transformer cela) au lieu d'écrire *comment* le faire avec des boucles.

- **Avantages :** Un code plus court et plus lisible pour filtrer, transformer et résumer des données.
- **Inconvénients :** Pour des tâches très simples, cela peut être un peu plus lent qu'une boucle, et les erreurs sont plus difficiles à localiser.

```java

    import java.util.List;

    public class Main {
        public static void main(String[] args) {
            List<String> names = List.of("Alice", "Bob", "Charlie", "David");

            names.stream()
                .filter(name -> name.startsWith("A")) // 1. Garder les noms qui commencent par "A"
                .map(String::toUpperCase)             // 2. Les passer en majuscules
                .forEach(System.out::println);        // 3. Afficher chacun d'eux

            // Résultat : ALICE
        }
    }


```

`name -> name.startsWith("A")` est une **lambda** : une toute petite fonction écrite directement dans le code. Lisez-la comme « pour chaque `name`, vérifie s'il commence par A ».

**Erreur fréquente :** s'attendre à ce qu'un stream modifie la liste d'origine. Les streams créent de nouveaux résultats ; la collection d'origine ne change pas.

```java

    List<String> names = List.of("alice", "bob");

    // ❌ INCORRECT : le résultat est perdu, names reste en minuscules
    names.stream().map(String::toUpperCase);

    // ✅ CORRECT : on récupère le résultat dans une nouvelle liste
    List<String> upperNames = names.stream()
        .map(String::toUpperCase)
        .toList();


```

---

## 5. Autres collections

Java propose bien plus de structures de données que celles présentées ici. L'image ci-dessous montre l'arbre complet du Collections Framework et les liens entre ses principales interfaces (Set, List, Queue, Map).

<div class="doc-img">

![Hiérarchie des collections Java](/images/java-collections.webp "Crédit image : akcoding.com")

</div>

Nous n'avons vu que les structures **les plus courantes**.

<p>Pour aller plus loin, nous vous recommandons vivement la <a href="https://docs.oracle.com/en/java/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Consulter la documentation officielle de Java">documentation officielle de Java</a> (en anglais).</p>

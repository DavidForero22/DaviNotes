---
title: "Syntaxe de base en Java"
---

# Syntaxe de base

Java est un langage **fortement typé** : chaque donnée a un *type* fixe (nombre, texte, vrai/faux...) qui doit être écrit explicitement et ne peut pas changer ensuite. Il est aussi **sensible à la casse** : `name` et `Name` sont deux choses différentes. Des langages comme **Python** ou **JavaScript** sont plus souples sur ces deux points.

Java s'organise autour des **classes**. Une classe est un bloc de code nommé qui regroupe des données et des actions liées. Tout le code que vous écrivez doit se trouver dans une classe ; il ne peut pas y avoir d'instructions « isolées » en dehors.

---

## Table des matières

<div id="content-table">

- [1. Structure](#1-structure "La structure de base d'un programme Java")
- [2. Variables](#2-variables "Types primitifs et types référence en Java")
- [3. Structures de contrôle](#3-structures-de-contrôle "Contrôler le déroulement d'un programme Java")
  - [3.1 Conditions](#31-conditions "Utiliser if et else")
  - [3.2 L'instruction switch](#32-linstruction-switch "Choisir un bloc de code selon une variable")
  - [3.3 Boucles](#33-boucles "Répéter du code avec for ou while")
    - [A) Boucle for](#a-boucle-for "Boucle quand on connaît le nombre de répétitions")
    - [B) Boucle while](#b-boucle-while "Boucle tant qu'une condition est vraie")
- [4. Opérateurs logiques](#4-opérateurs-logiques "Combiner ou inverser des conditions")

</div>

---

## 1. Structure

Toute application Java a un point de départ appelé méthode `main` (une *méthode* est un bloc d'instructions nommé). Quand on lance le programme, Java cherche cette méthode et exécute les instructions qu'elle contient, de haut en bas. Cet exemple montre le squelette de n'importe quel programme Java :

```java

    public class Main {
        // Le point d'entrée de l'application
        public static void main(String[] args) {
            System.out.println("Bonjour le monde !");
        }
    }


```

**Éléments clés** :

- `class Main` : Définit une classe nommée `Main`. Le fichier doit porter exactement le même nom que la classe (`Main.java`).

- `public static void main(String[] args)` : La ligne exacte que Java cherche pour démarrer le programme. Pour l'instant, vous pouvez la considérer comme une formule toute faite.

- `System.out.println` : Affiche une ligne de texte dans la *console* (la fenêtre de texte où le programme affiche ses résultats).

- `// ...` : Un **commentaire**. Java ignore tout ce qui suit `//` sur la ligne ; c'est une note pour la personne qui lit le code.

- `;` : Chaque instruction se termine par un point-virgule, comme le point à la fin d'une phrase.

- `{ }` : Les accolades marquent le début et la fin d'un bloc de code.

---

## 2. Variables

Une **variable** est une boîte nommée qui stocke une valeur pour pouvoir l'utiliser plus tard. En Java, quand on crée une variable, il faut indiquer le type de valeur qu'elle contiendra. Java a deux familles de types : les **types primitifs**, qui stockent directement des valeurs simples, et les **types référence**, qui pointent vers des objets plus complexes.

**Types primitifs**

Ce sont les briques de base des données en Java.

- `int` : Nombres entiers (par exemple `10`, `-5`).

- `double` : Nombres à virgule (par exemple `5.99`). Dans le code, la virgule s'écrit avec un point.

- `boolean` : Seulement deux valeurs possibles, `true` (vrai) ou `false` (faux). Sert pour les questions de type oui/non.

- `char` : Un seul caractère, écrit entre apostrophes (par exemple `'A'`).

**Types référence**

- `String` : Un texte, écrit entre guillemets doubles. Contrairement aux primitifs, les String sont des *objets* : ils disposent d'actions intégrées (méthodes) comme `.length()` (compter les caractères) ou `.toUpperCase()` (passer en majuscules).

- N'importe quelle classe, y compris celles que vous créez.

Exemple :

```java

    // Primitifs
    int age = 25;
    double price = 19.99;
    boolean isDeveloper = true;
    char grade = 'A';

    // Type référence
    String name = "David";


```

**Erreur fréquente :** essayer de stocker une valeur d'un autre type. Comme Java est fortement typé, le programme ne démarre même pas.

```java

    // ❌ INCORRECT : un int ne peut contenir que des nombres entiers, pas du texte
    int age = "25";

    // ✅ CORRECT : la valeur correspond au type déclaré
    int age = 25;


```

Vous pouvez créer des **textes sur plusieurs lignes** avec les **blocs de texte** (disponibles depuis Java 15), en utilisant trois guillemets (`"""`). C'est pratique pour les textes longs.

```java

    String text = """
        Ceci est un
        texte très long,
        il peut donc s'écrire sur plusieurs lignes.
        """;


```

---

## 3. Structures de contrôle

Par défaut, un programme exécute ses instructions les unes après les autres. Les **structures de contrôle** changent cet ordre : elles permettent au programme de prendre des décisions (exécuter du code seulement si quelque chose est vrai) ou de répéter du code plusieurs fois.

### 3.1 Conditions

Les conditions exécutent des blocs de code différents selon qu'une condition est `true` ou `false`. Elles se lisent presque comme de l'anglais : *if* (si) ceci, fais cela ; *else if* (sinon, si) ceci, fais autre chose ; *else* (sinon), fais ceci.

```java

    int age = 21;

    if (age > 80) {
        System.out.println("Vous êtes trop âgé pour monter dans les montagnes russes");

    } else if (age < 14) {
        System.out.println("Vous êtes trop jeune pour monter dans les montagnes russes");
    
    } else {
        System.out.println("Tout est en ordre, amusez-vous bien !");
    }


```

Java propose aussi une écriture courte pour une condition simple : l'**opérateur ternaire** `condition ? valeurSiVrai : valeurSiFaux`. Il permet de choisir entre deux valeurs sur une seule ligne.

```java

    boolean admin = true;

    String message = admin ? "Bienvenue, administrateur !" : "Accès refusé";

    System.out.println(message); // Résultat : Bienvenue, administrateur !


```

**Erreur fréquente :** comparer des textes avec `==`. Pour des objets comme `String`, `==` vérifie si les deux variables pointent vers le *même objet en mémoire*, pas si elles contiennent le même texte. Utilisez `.equals()`.

```java

    String password = new String("secret");

    // ❌ INCORRECT : compare des emplacements mémoire, peut renvoyer false même si le texte est identique
    if (password == "secret") { ... }

    // ✅ CORRECT : compare les caractères
    if (password.equals("secret")) { ... }


```

### 3.2 L'instruction switch

L'instruction `switch` choisit un bloc de code parmi plusieurs selon la valeur d'une variable. Elle est souvent plus lisible qu'une longue suite de `else if`.

```java

    int day = 3;

    switch (day) {
        case 1:
            System.out.println("Lundi");
            break;

        case 2:
            System.out.println("Mardi");
            break;

        default:
            System.out.println("Un autre jour");
    }


```

`default` s'exécute quand aucun `case` ne correspond (comme le `else` final), et `break` signifie « arrête-toi ici et sors du switch ».

**Erreur fréquente :** oublier le `break`. Sans lui, Java continue d'exécuter aussi les cas suivants.

```java

    int day = 1;

    // ❌ INCORRECT : affiche "Lundi" ET "Mardi"
    switch (day) {
        case 1:
            System.out.println("Lundi");
        case 2:
            System.out.println("Mardi");
    }

    // ✅ CORRECT : affiche seulement "Lundi"
    switch (day) {
        case 1:
            System.out.println("Lundi");
            break;
        case 2:
            System.out.println("Mardi");
            break;
    }


```

### 3.3 Boucles

Les **boucles** répètent un bloc de code tant qu'une condition est remplie. Chaque répétition s'appelle une *itération*.

#### A) Boucle for

La boucle `for` s'utilise quand on sait à l'avance combien de fois le code doit se répéter.

```java

    // Syntaxe : for (point de départ ; condition pour continuer ; pas après chaque répétition)
    for (int i = 0; i < 5; i++) {
        System.out.println("Itération : " + i);
    }

    // Résultat : Itération : 0, 1, 2, 3 et 4 (5 répétitions)


```

`i++` est un raccourci pour « ajoute 1 à `i` ». En programmation, on commence généralement à compter à partir de 0.

#### B) Boucle while

La boucle `while` (« tant que ») répète un bloc de code tant qu'une condition est `true`. Utilisez-la quand vous ne savez pas à l'avance combien de répétitions seront nécessaires.

```java

    int i = 0;

    while (i < 5) {
        System.out.println(i);
        i++;
    }


```

**Erreur fréquente :** oublier de mettre à jour la variable de la condition. La condition ne devient jamais `false`, la boucle ne s'arrête jamais (une *boucle infinie*) et le programme se bloque.

```java

    int i = 0;

    // ❌ INCORRECT : i vaut toujours 0, donc i < 5 est toujours vrai
    while (i < 5) {
        System.out.println(i);
    }

    // ✅ CORRECT : i augmente à chaque tour jusqu'à ce que la condition soit fausse
    while (i < 5) {
        System.out.println(i);
        i++;
    }


```

---

## 4. Opérateurs logiques

Les opérateurs logiques combinent ou inversent des conditions (valeurs `true`/`false`, aussi appelées *expressions booléennes*). On les utilise souvent dans `if`, `while` ou `for` pour décider en fonction de plusieurs conditions à la fois.

| Opérateur | Description | Exemple |
| :--- | :--- | :--- |
| `&&` (ET) | Renvoie `true` seulement si **les deux** conditions sont vraies. | `x > 5 && x < 10` |
| `\|\|` (OU) | Renvoie `true` si **au moins une** des conditions est vraie. | `x < 5 \|\| x > 10` |
| `!` (NON) | Inverse le résultat : `true` devient `false` et inversement. | `!(x > 5)` |

```java

    int age = 20;
    boolean hasTicket = true;

    // Les deux conditions doivent être vraies pour entrer
    if (age >= 18 && hasTicket) {
        System.out.println("Accès autorisé");
    }


```

**Erreur fréquente :** écrire un seul `&` ou `|`. Les versions doublées s'arrêtent dès que la réponse est connue : si la partie gauche de `&&` est `false`, la partie droite n'est même pas vérifiée. Les versions simples vérifient toujours les deux côtés, ce qui peut faire planter le programme.

```java

    String name = null; // null signifie « aucune valeur »

    // ❌ INCORRECT : & exécute aussi name.length(), qui plante car name est null
    if (name != null & name.length() > 0) { ... }

    // ✅ CORRECT : && s'arrête car name != null est false, name.length() ne s'exécute jamais
    if (name != null && name.length() > 0) { ... }


```

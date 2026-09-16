---
title: "Structures de données en Python"
---

# Structures de données

Une **structure de données** est une façon de stocker plusieurs valeurs ensemble, comme une liste de courses ou un carnet d'adresses. Python propose quatre structures intégrées pour cela. Contrairement à **Java**, où il faut généralement importer des classes comme `ArrayList` ou `HashMap`, ces quatre structures font partie du langage lui-même et sont prêtes à l'emploi.

Pour choisir la bonne, posez-vous trois questions sur vos données :

- **Ordonnées ?** Les éléments gardent-ils la position dans laquelle vous les avez ajoutés ?
- **Modifiables ?** Peut-on changer, ajouter ou supprimer des éléments après avoir créé la structure ?
- **Doublons ?** La même valeur peut-elle apparaître plusieurs fois ?

| Structure | Ordonnée | Modifiable | Doublons | Syntaxe |
| :--- | :--- | :--- | :--- | :--- |
| Liste | Oui | Oui | Oui | `[1, 2, 3]` |
| Tuple | Oui | Non | Oui | `(1, 2, 3)` |
| Dictionnaire | Oui | Oui | Clés : non | `{"a": 1}` |
| Ensemble | Non | Oui | Non | `{1, 2, 3}` |

---

## Table des matières

<div id="content-table">

- [1. Listes](#1-listes "Collections ordonnées et modifiables")
- [2. Tuples](#2-tuples "Collections ordonnées et immuables")
- [3. Dictionnaires](#3-dictionnaires "Paires clé-valeur")
- [4. Ensembles (sets)](#4-ensembles-sets "Collections non ordonnées d'éléments uniques")

</div>

---

## 1. Listes

Les listes sont la structure la plus polyvalente de Python. Elles sont **ordonnées**, **modifiables** (*mutables*) et acceptent les doublons. Elles ressemblent à `ArrayList` en Java, mais une même liste peut mélanger différents types de données.

Chaque élément a une position appelée **indice**, qui commence à `0`.

**Syntaxe** : Crochets `[]`.

```python

    # Créer une liste
    fruits = ["pomme", "banane", "cerise"]
    
    # Accéder aux éléments par indice (le premier est 0)
    print(fruits[0])   # Résultat : pomme
    print(fruits[-1])  # Les indices négatifs comptent depuis la fin. Résultat : cerise
    
    # Modifier la liste
    fruits.append("orange")  # Ajoute à la fin
    fruits[1] = "myrtille"   # Remplace le deuxième élément
    
    # Découpage (slicing) : obtenir une partie de la liste, de l'indice 1 jusqu'à 3 (non inclus)
    print(fruits[1:3]) # Résultat : ['myrtille', 'cerise']


```

**Erreur fréquente :** utiliser un indice qui n'existe pas. Une liste de 3 éléments a les indices `0`, `1` et `2` : `fruits[3]` arrête donc le programme avec une `IndexError`.

```python

    fruits = ["pomme", "banane", "cerise"]

    # ❌ INCORRECT : il n'y a pas de quatrième élément
    print(fruits[3])

    # ✅ CORRECT : le dernier élément est à len(liste) - 1, ou simplement à -1
    print(fruits[len(fruits) - 1])
    print(fruits[-1])


```

---

## 2. Tuples

Les tuples sont comme des listes, mais **immuables** : une fois le tuple créé, on ne peut ni modifier, ni ajouter, ni supprimer ses éléments. On les utilise pour des données qui doivent rester fixes, comme des coordonnées sur une carte ou les valeurs RVB d'une couleur. Comme ils ne changent pas, ils sont aussi un peu plus légers que les listes.

**Syntaxe** : Parenthèses `()`.

```python

    # Créer un tuple
    coordinates = (10, 20)
    
    # On accède aux éléments comme avec les listes
    print(coordinates[0])  # Résultat : 10
    
    # Ceci arrêterait le programme avec une erreur :
    # coordinates[0] = 15  <-- TypeError: 'tuple' object does not support item assignment
    
    # Déballage (unpacking) : ranger chaque valeur dans sa propre variable
    x, y = coordinates
    print(x)  # Résultat : 10


```

**Erreur fréquente :** créer un tuple d'un seul élément en oubliant la virgule. Sans elle, Python ne voit qu'une valeur entre parenthèses.

```python

    # ❌ INCORRECT : c'est le nombre 5, pas un tuple
    single = (5)

    # ✅ CORRECT : la virgule finale en fait un tuple
    single = (5,)


```

---

## 3. Dictionnaires

Les dictionnaires stockent des données sous forme de paires `clé: valeur`, comme un vrai dictionnaire où l'on cherche un mot (la clé) pour trouver sa définition (la valeur). Ils sont **ordonnés** (ils conservent l'ordre d'insertion depuis Python 3.7), **modifiables**, et chaque clé ne peut apparaître qu'une fois. C'est l'équivalent en Python de `HashMap` en Java ou des objets JavaScript.

**Syntaxe** : Accolades `{}` avec deux-points `:` entre chaque clé et sa valeur.

```python

    # Créer un dictionnaire
    student = {
        "name": "Jean",
        "age": 25,
        "courses": ["Mathématiques", "Informatique"]
    }
    
    # Accéder aux valeurs par clé
    print(student["name"])      # Résultat : Jean
    print(student.get("age"))   # Résultat : 25
    
    # Ajouter ou mettre à jour des paires
    student["grade"] = "A"   # Nouvelle clé : une paire est ajoutée
    student["age"] = 26      # Clé existante : sa valeur est remplacée


```

**Erreur fréquente :** lire avec des crochets une clé qui n'existe pas. Le programme s'arrête avec une `KeyError`. La méthode `.get()` renvoie `None` (aucune valeur) ou une valeur par défaut de votre choix.

```python

    # ❌ INCORRECT : "phone" n'existe pas, KeyError
    print(student["phone"])

    # ✅ CORRECT : renvoie "Non disponible" quand la clé n'existe pas
    print(student.get("phone", "Non disponible"))


```

---

## 4. Ensembles (sets)

Les ensembles sont des collections **non ordonnées**, **sans indices** et **sans doublons** : chaque valeur n'apparaît qu'une fois. Ils servent à supprimer les valeurs répétées, à vérifier très rapidement si un élément est présent et à réaliser des opérations mathématiques comme l'union (réunir) et l'intersection (éléments communs).

**Syntaxe** : Accolades `{}`, mais sans deux-points.

```python

    # Créer un ensemble
    unique_ids = {101, 102, 103, 102} 
    
    # Les doublons sont supprimés automatiquement
    print(unique_ids)  # Résultat : {101, 102, 103}
    
    # Vérifier si une valeur est présente (très rapide)
    if 101 in unique_ids:
        print("ID trouvé !")
        
    # Ajouter des éléments
    unique_ids.add(104)

    # Éléments communs entre deux ensembles
    print({1, 2, 3} & {2, 3, 4})  # Résultat : {2, 3}


```

**Erreur fréquente :** créer un ensemble vide avec `{}`. Des accolades vides créent un *dictionnaire* vide, pas un ensemble.

```python

    # ❌ INCORRECT : ceci est un dictionnaire vide
    tags = {}
    tags.add("python")  # AttributeError: 'dict' object has no attribute 'add'

    # ✅ CORRECT : set() crée un ensemble vide
    tags = set()
    tags.add("python")


```

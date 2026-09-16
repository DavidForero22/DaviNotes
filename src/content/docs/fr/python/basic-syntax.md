---
title: "Syntaxe de base en Python"
---

# Syntaxe de base

Python est un langage de programmation réputé pour sa lisibilité, souvent proche de l'anglais courant. Trois termes que vous entendrez à son sujet :

- **Interprété :** pas besoin d'une étape préalable pour traduire (compiler) le code avant de l'exécuter ; Python le lit et l'exécute ligne par ligne.
- **De haut niveau :** il masque de nombreux détails techniques de l'ordinateur, pour que vous puissiez vous concentrer sur le problème à résoudre.
- **Typé dynamiquement :** inutile d'indiquer à l'avance si une variable contient un nombre ou un texte ; Python le déduit tout seul.

Contrairement à **Java** ou **C++**, Python n'utilise pas d'accolades `{}` pour regrouper le code et n'a pas besoin d'un point-virgule `;` à la fin de chaque ligne. Il utilise à la place l'**indentation** (les espaces en début de ligne) pour indiquer quelles lignes vont ensemble.

---

## Table des matières
<div id="content-table">

- [1. Structure](#1-structure "L'indentation et la structure du code Python")
- [2. Variables](#2-variables "Les variables en Python")
- [3. Opérateurs](#3-opérateurs "Opérateurs arithmétiques, de comparaison et logiques")
- [4. Structures de contrôle](#4-structures-de-contrôle "Contrôler le déroulement avec des conditions et des boucles")
  - [4.1 Conditions](#41-conditions "Utiliser if, elif et else")
  - [4.2 Boucles](#42-boucles "Répéter du code avec for ou while")
    - [A) Boucles for](#a-boucles-for "Parcourir des séquences ou des plages de nombres")
    - [B) Boucles while](#b-boucles-while "Répéter tant qu'une condition est vraie")

</div>

---

## 1. Structure

En Python, l'indentation n'est pas qu'une question d'esthétique : c'est une règle du langage. Les lignes qui appartiennent à un bloc (par exemple celles qui ne doivent s'exécuter que *si* une condition est vraie) doivent avoir le même nombre d'espaces, généralement 4.

Les **commentaires** commencent par un dièse (`#`). Python ignore le reste de la ligne ; ce sont des notes pour la personne qui lit le code.

```python

    # Ceci est un commentaire
    # Python utilise l'indentation pour définir les blocs
    if 5 > 2:
        print("Cinq est plus grand que deux !")  # Cette ligne est dans le bloc if
        
    print("Ceci est en dehors du bloc")


```

`print()` affiche un message à l'écran (dans la *console*, la fenêtre de texte où les programmes affichent leurs résultats).

**Règles clés** :
- **Cohérence** : Toutes les lignes d'un même bloc doivent avoir la même indentation.
- **Deux-points** (`:`) : Les lignes qui ouvrent un bloc (comme `if`, `for`, `def`) se terminent toujours par deux-points, qui signifient « un bloc indenté suit ».
- **Pas de point-virgule** : Inutile de terminer les lignes par `;`.

**Erreur fréquente :** mélanger des indentations différentes dans un même bloc. Python s'arrête avec une `IndentationError`.

```python

    # ❌ INCORRECT : la deuxième ligne a 2 espaces au lieu de 4
    if 5 > 2:
        print("Cinq est plus grand que deux !")
      print("Cette ligne casse le programme")

    # ✅ CORRECT : les deux lignes ont la même indentation
    if 5 > 2:
        print("Cinq est plus grand que deux !")
        print("Les deux lignes sont dans le bloc")


```

---

## 2. Variables

Une **variable** est une boîte nommée qui stocke une valeur pour pouvoir l'utiliser plus tard. On la crée simplement en lui donnant un nom et une valeur avec `=`. Python est **typé dynamiquement** : on ne déclare pas le type, il est déterminé automatiquement à partir de la valeur et peut même changer ensuite.

Les noms de variables sont sensibles à la casse (`age` et `Age` sont différents) et suivent généralement le style `snake_case` : des mots en minuscules séparés par des tirets bas.

- **Nombres** : `int` (entiers), `float` (nombres à virgule, écrits avec un point), `complex` (nombres complexes, utilisés en mathématiques)
- **Chaînes de caractères** (`str`) : Du texte écrit entre apostrophes `'` ou guillemets `"`
- **Booléens** (`bool`) : `True` (vrai) ou `False` (faux), toujours avec une majuscule

Exemple :

```python

    # Nombres
    x = 5           # int
    y = 3.14        # float
    z = 1j          # complex

    # Chaîne de caractères
    name = "Python"

    # Booléen
    is_active = True

    # Typage dynamique : la même variable contient maintenant un texte
    x = "Maintenant je suis un texte"


```

Vous pouvez créer des **textes sur plusieurs lignes** avec trois guillemets (`"""` ou `'''`). C'est pratique pour les textes longs.

```python

    x = """Ceci est un
    texte très long,
    il peut donc s'écrire sur plusieurs lignes."""


```

**Erreur fréquente :** assembler du texte et des nombres avec `+`. Python ne convertit pas automatiquement le nombre en texte et s'arrête avec une `TypeError`. La solution la plus simple est une **f-string** : placez un `f` avant les guillemets et écrivez les variables entre `{}`.

```python

    age = 25

    # ❌ INCORRECT : impossible d'additionner un str et un int
    print("J'ai " + age + " ans")

    # ✅ CORRECT : la f-string insère la valeur dans le texte
    print(f"J'ai {age} ans")


```

---

## 3. Opérateurs

Les opérateurs sont des symboles qui effectuent des opérations sur des valeurs, comme additionner ou comparer des nombres. Python utilise des mots anglais pour les opérations logiques : les conditions se lisent presque comme une phrase.

**Opérateurs arithmétiques**

```python

    x = 10
    y = 3

    print(x + y)   # Addition : 13
    print(x / y)   # Division : 3.3333333333333335
    print(x // y)  # Division entière, supprime les décimales : 3
    print(x % y)   # Reste de la division : 1
    print(x ** y)  # Puissance (10 puissance 3) : 1000


```

**Opérateurs de comparaison**

Ils comparent deux valeurs et renvoient `True` ou `False` : `==` (égal), `!=` (différent), `>` (supérieur), `<` (inférieur), `>=` (supérieur ou égal) et `<=` (inférieur ou égal).

**Erreur fréquente :** confondre `=` et `==`. Un seul `=` *stocke* une valeur ; le double `==` *compare* deux valeurs.

```python

    age = 18

    # ❌ INCORRECT : = essaie de stocker une valeur dans la condition (SyntaxError)
    if age = 18:
        print("Vient d'atteindre la majorité")

    # ✅ CORRECT : == demande « age est-il égal à 18 ? »
    if age == 18:
        print("Vient d'atteindre la majorité")


```

**Opérateurs logiques**

Là où Java utilise les symboles `&&`, `||` et `!`, Python utilise les mots `and` (et), `or` (ou) et `not` (non).

| Opérateur | Description | Exemple |
| :--- | :--- | :--- |
| `and` | Renvoie `True` seulement si **les deux** conditions sont vraies. | `x > 5 and x < 10` |
| `or` | Renvoie `True` si **au moins une** des conditions est vraie. | `x < 5 or x > 10` |
| `not` | Inverse le résultat : `True` devient `False` et inversement. | `not x > 5` |


```python

    age = 25
    has_license = True

    if age >= 18 and has_license:
        print("Vous pouvez conduire.")
        
    if not has_license:
        print("Vous ne pouvez pas conduire.")


```

```python

    # ❌ INCORRECT : && n'est pas valide en Python (SyntaxError)
    if age >= 18 && has_license:
        print("Vous pouvez conduire.")

    # ✅ CORRECT
    if age >= 18 and has_license:
        print("Vous pouvez conduire.")


```

---

## 4. Structures de contrôle

Par défaut, un programme exécute ses instructions les unes après les autres. Les **structures de contrôle** changent cet ordre : elles permettent de prendre des décisions ou de répéter du code. En Python, elles reposent sur l'*indentation et les deux-points* (`:`) plutôt que sur les accolades `{}` de Java ou C++.

Les parenthèses `()` autour des conditions sont facultatives et généralement omises.

### 4.1 Conditions

Python utilise les mots-clés `if` (si), `elif` (abréviation de « else if », « sinon si ») et `else` (sinon). Seul le premier bloc dont la condition est vraie s'exécute.

```python

    temperature = 28

    if temperature > 30:
        print("Il fait chaud")
    elif temperature > 20:
        print("Il fait beau")
    else:
        print("Il fait froid")


```

Python permet aussi d'écrire une condition simple sur une seule ligne, avec une **expression conditionnelle** (ou *ternaire*) : `valeur_si_vrai if condition else valeur_si_faux`.

```python

    admin = True

    message = "Bienvenue, administrateur !" if admin else "Accès refusé"

    print(message)  # Résultat : Bienvenue, administrateur !


```

### 4.2 Boucles

Les **boucles** répètent un bloc de code. Python en propose deux types principaux.

#### A) Boucles for

Contrairement au `for (int i = 0; i < 10; i++)` de Java, la boucle `for` de Python parcourt un par un les éléments d'une séquence : les éléments d'une liste, les lettres d'un texte ou une plage de nombres.

```python

    # range(5) génère les nombres 0, 1, 2, 3, 4
    for i in range(5):
        print(i)

    # Parcourir une liste
    colors = ["rouge", "vert", "bleu"]
    for color in colors:
        print("Couleur actuelle : " + color)


```

**Erreur fréquente :** s'attendre à ce que `range(5)` inclue le nombre 5. La plage s'arrête juste *avant* la valeur de fin.

```python

    # ❌ INCORRECT : on attend 1, 2, 3, 4, 5 mais on obtient 0, 1, 2, 3, 4
    for i in range(5):
        print(i)

    # ✅ CORRECT : range(début, fin) affiche 1, 2, 3, 4, 5
    for i in range(1, 6):
        print(i)


```

#### B) Boucles while

La boucle `while` (« tant que ») répète un bloc de code tant qu'une condition est vraie.

```python

    count = 0

    while count < 3:
        print("Le compteur vaut :", count)
        count += 1  # Ajoute 1 à count


```

**Erreur fréquente :** utiliser `++` pour ajouter un, comme en Java ou en JavaScript. Python ne possède pas cet opérateur.

```python

    # ❌ INCORRECT : count++ est une SyntaxError en Python
    count++

    # ✅ CORRECT
    count += 1


```

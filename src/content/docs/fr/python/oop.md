---
title: "Programmation orientée objet en Python"
---

# Programmation orientée objet

La **programmation orientée objet (POO)** est une façon d'organiser le code autour d'**objets** : des éléments qui réunissent des données (ce qu'ils *possèdent*) et un comportement (ce qu'ils *peuvent faire*). Une personne, par exemple, a un nom et un âge, et peut saluer d'autres personnes.

Python accepte plusieurs styles de programmation, et la POO en fait partie. En réalité, en Python tout est objet en coulisses, des nombres aux fonctions.

Contrairement à **Java**, où tout le code doit se trouver dans une classe, Python permet de mélanger de simples scripts et des classes. Les idées principales (classes, objets, héritage et polymorphisme) restent néanmoins les mêmes.

---

## Table des matières

<div id="content-table">

- [1. Classes](#1-classes "Définir des plans et des instances")
- [2. La méthode `__init__`](#2-la-méthode-__init__ "Les constructeurs en Python")
- [3. Méthodes et self](#3-méthodes-et-self "La référence à l'objet lui-même")
- [4. Héritage](#4-héritage "Étendre des classes")
- [5. Polymorphisme](#5-polymorphisme "Utiliser la même interface avec des classes différentes")

</div>

---

## 1. Classes

Une **classe** est un plan pour créer des objets. Elle décrit les données (**attributs**) et les actions (**méthodes**) que possédera chaque objet de ce type. Un **objet** (ou *instance*) est un élément concret construit à partir de ce plan, de la même manière qu'on peut construire plusieurs maisons à partir du même plan.

**Syntaxe** : Utilisez le mot-clé `class`. Les noms de classe s'écrivent en `PascalCase` (chaque mot commence par une majuscule).

```python 

    class Car:
        brand = "Toyota"  # Attribut de classe : partagé par toutes les Car
    
    # Créer un objet (instanciation)
    # Contrairement à Java, pas besoin du mot-clé 'new'
    my_car = Car()
    
    print(my_car.brand)  # Résultat : Toyota


```

---

## 2. La méthode `__init__`

`__init__` (avec deux tirets bas de chaque côté) est une méthode spéciale que Python exécute automatiquement à chaque création d'un nouvel objet. C'est l'équivalent du **constructeur** en Java, et elle sert à donner à chaque objet ses propres valeurs de départ.

```python 

    class Person:
        # Le constructeur : s'exécute quand on appelle Person(...)
        def __init__(self, name, age):
            self.name = name  # Attribut d'instance : chaque personne a son propre nom
            self.age = age
    
    # Créer des objets avec des arguments
    p1 = Person("Alice", 30)
    p2 = Person("Bruno", 25)
    
    print(p1.name)  # Résultat : Alice
    print(p2.name)  # Résultat : Bruno


```

`def` est le mot-clé utilisé pour définir une fonction ou une méthode en Python.

**Erreur fréquente :** écrire `init` avec un seul tiret bas, ou sans aucun. Python ne le reconnaît pas comme constructeur, et les attributs ne sont jamais créés.

```python

    # ❌ INCORRECT : _init_ n'est qu'une méthode ordinaire au nom étrange
    class Person:
        def _init_(self, name):
            self.name = name

    p1 = Person("Alice")  # TypeError: Person() takes no arguments

    # ✅ CORRECT : deux tirets bas avant et après
    class Person:
        def __init__(self, name):
            self.name = name


```

---

## 3. Méthodes et self

Les **méthodes** sont des fonctions définies dans une classe. Elles décrivent ce qu'un objet peut faire.

### Le paramètre `self`

`self` signifie « cet objet précis ». Quand une méthode doit utiliser les données de l'objet, elle les lit via `self` (par exemple `self.name`). En Java, cette référence (`this`) est implicite ; en Python, elle est **explicite** : le premier paramètre de chaque méthode doit être `self`.

Vous n'avez pas à passer `self` vous-même. Quand vous appelez `p1.greet()`, Python envoie automatiquement `p1` comme `self`.

```python 

    class Person:
        def __init__(self, name):
            self.name = name
    
        # Méthode d'instance
        def greet(self):
            print("Bonjour, je m'appelle " + self.name)
    
    p1 = Person("David")
    p1.greet()  # Résultat : Bonjour, je m'appelle David


```

**Erreur fréquente :** oublier `self`, que ce soit comme premier paramètre ou pour utiliser les attributs de l'objet.

```python

    class Person:
        def __init__(self, name):
            self.name = name

        # ❌ INCORRECT : il manque le paramètre self
        # p1.greet() échoue : greet() takes 0 positional arguments but 1 was given
        def greet():
            print("Bonjour, je m'appelle " + self.name)

        # ❌ INCORRECT : "name" seul n'existe pas dans cette méthode (NameError)
        def greet(self):
            print("Bonjour, je m'appelle " + name)

        # ✅ CORRECT : self est le premier paramètre et sert à lire l'attribut
        def greet(self):
            print("Bonjour, je m'appelle " + self.name)


```

---

## 4. Héritage

L'**héritage** permet à une classe de recevoir tous les attributs et méthodes d'une autre classe, puis d'ajouter ou de modifier ce dont elle a besoin.

* **Classe parent** (classe de base) : la classe dont on hérite.
* **Classe enfant** (classe dérivée) : la classe qui hérite.

**Syntaxe** : Écrivez la classe parent entre parenthèses après le nom de la classe enfant.

```python 

    # Classe parent
    class Animal:
        def speak(self):
            print("L'animal fait un bruit")
    
    # Classe enfant : hérite d'Animal
    # Équivalent Java : class Dog extends Animal
    class Dog(Animal):
        def speak(self):
            print("Ouaf")
            
    d = Dog()
    d.speak()  # Résultat : Ouaf


```

### La fonction `super()`

`super()` donne accès à la classe parent. On l'utilise souvent dans le `__init__` de l'enfant pour laisser le parent préparer ses propres attributs avant d'en ajouter de nouveaux.

```python

    class Person:
        def __init__(self, name):
            self.name = name

    class Student(Person):
        def __init__(self, name, graduation_year):
            super().__init__(name)                  # Le parent enregistre le nom
            self.graduation_year = graduation_year  # L'enfant ajoute son propre attribut

    s = Student("Laura", 2026)
    print(s.name, s.graduation_year)  # Résultat : Laura 2026


```

**Erreur fréquente :** écrire un nouveau `__init__` dans l'enfant en oubliant d'appeler celui du parent. Les attributs du parent ne sont jamais créés.

```python

    # ❌ INCORRECT : Person.__init__ ne s'exécute pas, self.name n'existe donc pas
    class Student(Person):
        def __init__(self, name, graduation_year):
            self.graduation_year = graduation_year

    print(Student("Laura", 2026).name)  # AttributeError

    # ✅ CORRECT
    class Student(Person):
        def __init__(self, name, graduation_year):
            super().__init__(name)
            self.graduation_year = graduation_year


```

---

## 5. Polymorphisme

Le **polymorphisme** (« plusieurs formes ») signifie que des objets de types différents peuvent être utilisés de la même manière. En Python, c'est très souple : si un objet possède la méthode dont vous avez besoin, vous pouvez l'utiliser, quelle que soit sa classe.

Java exige généralement que les objets partagent une classe parent ou une interface. Python utilise plutôt le **duck typing** (« typage canard »), d'après l'adage « si ça marche comme un canard et que ça cancane comme un canard, c'est un canard » : ce qui compte, c'est ce que l'objet *sait faire*, pas ce qu'il *est*.

```python

    class Cat:
        def speak(self):
            print("Miaou")

    class Dog:
        def speak(self):
            print("Ouaf")

    def make_speak(animal):
        animal.speak()  # Fonctionne avec tout objet qui possède la méthode 'speak'

    make_speak(Cat())  # Résultat : Miaou
    make_speak(Dog())  # Résultat : Ouaf


```

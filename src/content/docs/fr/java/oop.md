---
title: "Programmation orientée objet en Java"
---

# Programmation orientée objet (POO)

La programmation orientée objet est une façon d'organiser le code autour d'**objets** : des éléments qui réunissent des **données** (ce qu'ils *sont* ou *possèdent*) et un **comportement** (ce qu'ils *peuvent faire*). Une voiture, par exemple, a une marque et une vitesse (données) et peut accélérer ou freiner (comportement).

Au lieu d'écrire une longue liste d'instructions, on modélise le programme comme un ensemble d'objets qui collaborent, un peu comme dans le monde réel. La POO est au cœur de Java : presque tout ce que vous écrivez en Java fait partie d'une classe ou d'un objet.

---

## Table des matières

<div id="content-table">

- [1. Classes et objets](#1-classes-et-objets "Les classes et les objets en Java")
- [2. Héritage](#2-héritage "Comment fonctionne l'héritage en Java")
- [3. Polymorphisme](#3-polymorphisme "Le polymorphisme et son utilisation")
- [4. Interfaces](#4-interfaces "Définir et implémenter des interfaces")

</div>

---

## 1. Classes et objets

Une **classe** est un plan ou un modèle : elle décrit les données et le comportement qu'aura un type d'objet, mais ce n'est pas un objet en soi. Un **objet** est un élément concret construit à partir de ce plan, avec ses propres valeurs. Une classe peut produire autant d'objets que nécessaire, comme une recette de gâteau permet de faire de nombreux gâteaux.

| Concept | Description |
| :--- | :--- |
| **Classe** | Le modèle (par exemple « Voiture »). Elle définit la structure. |
| **Objet** | Un élément concret créé à partir de la classe (par exemple « cette Toyota rouge »). On parle aussi d'*instance*. |
| **Attribut** | Une variable dans une classe qui stocke des données sur l'objet (par exemple couleur, vitesse). |
| **Méthode** | Une fonction dans une classe qui définit ce que l'objet peut faire (par exemple `startEngine`). |
| **Constructeur** | Une méthode spéciale exécutée à la création d'un objet, qui sert à donner des valeurs initiales à ses attributs. |

### Exemple

```java

    // 1. La classe (Car.java)
    public class Car {
        // Attributs
        String brand;
        String model;
        int year;

        // Constructeur : porte le même nom que la classe et remplit les attributs
        public Car(String brand, String model, int year) {
            this.brand = brand; // "this.brand" est l'attribut, "brand" est la valeur reçue
            this.model = model;
            this.year = year;
        }

        // Méthode (comportement)
        public void startEngine() {
            System.out.println("Le moteur de la " + brand + " " + model + " démarre...");
        }
    }

    // 2. Utilisation (Main.java)
    public class Main {
        public static void main(String[] args) {
            // "new" crée un objet à partir de la classe (instanciation)
            Car myCar = new Car("Toyota", "Corolla", 2022);
            
            myCar.startEngine(); // Résultat : Le moteur de la Toyota Corolla démarre...
        }
    }


```

*Remarque : en Java, chaque classe `public` doit être enregistrée dans son propre fichier portant le nom de la classe (`Car.java`, `Main.java`). Les exemples de cette page regroupent plusieurs classes uniquement pour faciliter la lecture.*

**Erreur fréquente :** essayer d'utiliser la classe directement au lieu de créer d'abord un objet. La classe n'est que le plan : il faut `new` pour construire un véritable objet.

```java

    // ❌ INCORRECT : "Car" est le plan, pas une voiture concrète
    Car.startEngine();

    // ✅ CORRECT : on crée un objet avec new, puis on l'utilise
    Car myCar = new Car("Toyota", "Corolla", 2022);
    myCar.startEngine();


```

---

## 2. Héritage

L'**héritage** permet à une nouvelle classe de recevoir les attributs et les méthodes d'une classe existante, puis d'ajouter les siens. La classe qui hérite est la **sous-classe** (enfant), et la classe dont elle hérite est la **superclasse** (parent). En Java, on utilise le mot-clé `extends`.

- **Réutilisation :** Inutile de réécrire le code qui existe déjà dans le parent.

- **Hiérarchie :** Elle exprime une relation « est un » : une voiture de sport *est un* véhicule.

**Exemple**

```java

    // Classe parent (superclasse)
    public class Vehicle {
        protected String brand = "Marque générique"; // protected : visible par les classes enfants

        public void honk() {
            System.out.println("Pouet, pouet !");
        }
    }

    // Classe enfant (sous-classe)
    public class SportsCar extends Vehicle {
        private String modelName = "Mustang";

        public void showDetails() {
            // Peut utiliser 'brand' car elle en hérite depuis Vehicle
            System.out.println("Marque : " + brand + ", Modèle : " + modelName);
        }
    }

    public class Main {
        public static void main(String[] args) {
            SportsCar myFastCar = new SportsCar();
            
            myFastCar.honk();        // Méthode héritée
            myFastCar.showDetails(); // Méthode propre
        }
    }


```

Les mots `public`, `protected` et `private` sont des **modificateurs d'accès** : ils contrôlent qui peut voir un attribut ou une méthode. `public` signifie tout le monde, `protected` la classe et ses enfants, et `private` uniquement la classe elle-même.

**Erreur fréquente :** essayer d'hériter de deux classes à la fois. En Java, une classe ne peut avoir qu'un seul parent (utilisez les interfaces, section 4, pour combiner plusieurs comportements).

```java

    // ❌ INCORRECT : Java n'autorise pas l'extension de plusieurs classes
    public class FlyingCar extends Car, Plane { }

    // ✅ CORRECT : on étend une classe et on implémente autant d'interfaces que nécessaire
    public class FlyingCar extends Car implements Flyable { }


```

---

## 3. Polymorphisme

**Polymorphisme** signifie « plusieurs formes ». Il permet à une même action de se comporter différemment selon l'objet qui l'exécute. En Java, cela passe surtout par la **redéfinition de méthodes** : une classe enfant écrit sa propre version d'une méthode héritée de son parent. L'annotation `@Override` marque cette méthode pour que Java vérifie qu'elle existe bien dans le parent.

**Exemple**

Remarquez que `animalSound()` donne un résultat différent pour chaque objet, alors que les trois variables sont déclarées comme `Animal`.

```java

    class Animal {
        public void animalSound() {
            System.out.println("L'animal fait un bruit");
        }
    }

    class Pig extends Animal {
        @Override
        public void animalSound() {
            System.out.println("Le cochon dit : groin groin");
        }
    }

    class Dog extends Animal {
        @Override
        public void animalSound() {
            System.out.println("Le chien dit : ouaf ouaf");
        }
    }

    public class Main {
        public static void main(String[] args) {
            Animal myAnimal = new Animal();
            Animal myPig = new Pig();
            Animal myDog = new Dog();

            myAnimal.animalSound(); // Résultat : L'animal fait un bruit
            myPig.animalSound();    // Résultat : Le cochon dit : groin groin
            myDog.animalSound();    // Résultat : Le chien dit : ouaf ouaf
        }
    }


```

**Erreur fréquente :** mal écrire le nom de la méthode à redéfinir et oublier `@Override`. Java crée silencieusement une *nouvelle* méthode, et c'est toujours la version du parent qui s'exécute.

```java

    class Cat extends Animal {
        // ❌ INCORRECT : "animalsound" (s minuscule) est une autre méthode, rien n'est redéfini
        public void animalsound() {
            System.out.println("Miaou");
        }
    }

    class Cat extends Animal {
        // ✅ CORRECT : avec @Override, Java signale une erreur si le nom ne correspond pas
        @Override
        public void animalSound() {
            System.out.println("Miaou");
        }
    }


```

---

## 4. Interfaces

Une **interface** est une liste de méthodes qu'une classe s'engage à posséder, sans dire comment elles fonctionnent. Elle agit comme un **contrat** : si une classe *implémente* une interface, elle doit écrire le code de toutes les méthodes déclarées.

- Utilisez `interface` pour la définir.

- Utilisez `implements` pour signer le contrat dans une classe.

Une classe ne peut étendre qu'une seule classe parent, mais elle peut implémenter **autant d'interfaces que nécessaire**.

**Exemple**

```java

    // Définir l'interface (le contrat)
    interface ElectricVehicle {
        void chargeBattery(); // Pas de corps : seulement le nom et ce qu'elle renvoie
        int getBatteryLevel();
    }

    // Implémenter l'interface
    class Tesla implements ElectricVehicle {
        private int batteryLevel;

        public Tesla(int level) {
            this.batteryLevel = level;
        }

        // Obligatoire selon le contrat
        @Override
        public void chargeBattery() {
            this.batteryLevel = 100;
            System.out.println("Batterie entièrement chargée.");
        }

        // Obligatoire selon le contrat
        @Override
        public int getBatteryLevel() {
            return this.batteryLevel;
        }
    }

    public class Main {
        public static void main(String[] args) {
            Tesla myTesla = new Tesla(50);
            System.out.println("Niveau : " + myTesla.getBatteryLevel() + "%");
            
            myTesla.chargeBattery();
        }
    }


```

**Erreur fréquente :** implémenter une interface en oubliant l'une de ses méthodes. Le contrat est incomplet, le code ne compile donc pas.

```java

    // ❌ INCORRECT : getBatteryLevel() est manquante
    class Scooter implements ElectricVehicle {
        @Override
        public void chargeBattery() { ... }
    }

    // ✅ CORRECT : toutes les méthodes de l'interface sont implémentées
    class Scooter implements ElectricVehicle {
        @Override
        public void chargeBattery() { ... }

        @Override
        public int getBatteryLevel() { ... }
    }


```

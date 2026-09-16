---
title: "Object-Oriented Programming in Java"
---

# Object-Oriented Programming (OOP)

Object-Oriented Programming is a way of organizing code around **objects**: things that combine **data** (what they *are* or *have*) and **behavior** (what they *can do*). A car, for example, has a brand and a speed (data) and can accelerate or brake (behavior).

Instead of writing a long list of instructions, you model the program as a set of objects that work together, much like the real world. OOP is at the heart of Java: almost everything you write in Java is part of a class or an object.

---

## Table of Contents

<div id="content-table">

- [1. Classes and Objects](#1-classes-and-objects "Learn about Java classes and objects")
- [2. Inheritance](#2-inheritance "Understand how inheritance works in Java")
- [3. Polymorphism](#3-polymorphism "Explore polymorphism concepts and usage")
- [4. Interfaces](#4-interfaces "Discover how to define and implement interfaces")

</div>

---

## 1. Classes and Objects

A **class** is a blueprint or template: it describes what data and behavior a type of object will have, but it is not an object itself. An **object** is a specific thing built from that blueprint, with its own actual values. One class can produce as many objects as you need, just as one cake recipe can produce many cakes.

| Concept | Description |
| :--- | :--- |
| **Class** | The template (e.g., "Car"). It defines the structure. |
| **Object** | A specific item created from the class (e.g., "that red Toyota"). Also called an *instance*. |
| **Attribute** | A variable inside a class that stores data about the object (e.g., color, speed). |
| **Method** | A function inside a class that defines what the object can do (e.g., `startEngine`). |
| **Constructor** | A special method that runs when an object is created, used to give its attributes their initial values. |

### Example

```java

    // 1. The Class (Car.java)
    public class Car {
        // Attributes
        String brand;
        String model;
        int year;

        // Constructor: has the same name as the class and fills in the attributes
        public Car(String brand, String model, int year) {
            this.brand = brand; // "this.brand" is the attribute, "brand" is the value received
            this.model = model;
            this.year = year;
        }

        // Method (Behavior)
        public void startEngine() {
            System.out.println("The " + brand + " " + model + " engine is starting...");
        }
    }

    // 2. Usage (Main.java)
    public class Main {
        public static void main(String[] args) {
            // "new" creates an object from the class (instantiation)
            Car myCar = new Car("Toyota", "Corolla", 2022);
            
            myCar.startEngine(); // Output: The Toyota Corolla engine is starting...
        }
    }


```

*Note: in Java, each `public` class must be saved in its own file named after the class (`Car.java`, `Main.java`). The examples on this page show several classes together only to make them easier to read.*

**Common mistake:** trying to use a class directly instead of creating an object first. The class is only the blueprint; you need `new` to build an actual object.

```java

    // ❌ WRONG: "Car" is the blueprint, not a specific car
    Car.startEngine();

    // ✅ CORRECT: create an object with new, then use it
    Car myCar = new Car("Toyota", "Corolla", 2022);
    myCar.startEngine();


```

---

## 2. Inheritance

**Inheritance** lets a new class receive the attributes and methods of an existing class, and then add its own. The class that inherits is the **subclass** (child), and the class it inherits from is the **superclass** (parent). In Java, you use the `extends` keyword.

- **Reusability:** You don't have to rewrite code that already exists in the parent.

- **Hierarchy:** It expresses an "is a" relationship: a sports car *is a* vehicle.

**Example**

```java

    // Parent Class (Superclass)
    public class Vehicle {
        protected String brand = "Generic Brand"; // protected: visible to child classes

        public void honk() {
            System.out.println("Tuut, tuut!");
        }
    }

    // Child Class (Subclass)
    public class SportsCar extends Vehicle {
        private String modelName = "Mustang";

        public void showDetails() {
            // Can use 'brand' because it inherits it from Vehicle
            System.out.println("Brand: " + brand + ", Model: " + modelName);
        }
    }

    public class Main {
        public static void main(String[] args) {
            SportsCar myFastCar = new SportsCar();
            
            myFastCar.honk();        // Inherited method
            myFastCar.showDetails(); // Its own method
        }
    }


```

The words `public`, `protected` and `private` are **access modifiers**: they control who can see an attribute or method. `public` means everyone, `protected` means the class and its children, and `private` means only the class itself.

**Common mistake:** trying to inherit from two classes at once. In Java, a class can only have one parent (use interfaces, section 4, to combine several behaviors).

```java

    // ❌ WRONG: Java does not allow extending more than one class
    public class FlyingCar extends Car, Plane { }

    // ✅ CORRECT: extend one class and implement as many interfaces as needed
    public class FlyingCar extends Car implements Flyable { }


```

---

## 3. Polymorphism

**Polymorphism** means "many forms". It allows the same action to behave differently depending on the object that performs it. In Java, this mainly happens through **method overriding**: a child class writes its own version of a method it inherited from its parent. The `@Override` annotation marks that method so Java can check it really exists in the parent.

**Example**

Notice how `animalSound()` gives a different result for each object, even though all three variables are declared as `Animal`.

```java

    class Animal {
        public void animalSound() {
            System.out.println("The animal makes a sound");
        }
    }

    class Pig extends Animal {
        @Override
        public void animalSound() {
            System.out.println("The pig says: Wee Wee");
        }
    }

    class Dog extends Animal {
        @Override
        public void animalSound() {
            System.out.println("The dog says: Bow Wow");
        }
    }

    public class Main {
        public static void main(String[] args) {
            Animal myAnimal = new Animal();
            Animal myPig = new Pig();
            Animal myDog = new Dog();

            myAnimal.animalSound(); // Output: The animal makes a sound
            myPig.animalSound();    // Output: The pig says: Wee Wee
            myDog.animalSound();    // Output: The dog says: Bow Wow
        }
    }


```

**Common mistake:** misspelling the method you want to override and leaving out `@Override`. Java silently creates a *new* method, and the parent's version keeps running.

```java

    class Cat extends Animal {
        // ❌ WRONG: "animalsound" (lowercase s) is a different method, nothing is overridden
        public void animalsound() {
            System.out.println("Meow");
        }
    }

    class Cat extends Animal {
        // ✅ CORRECT: with @Override, Java reports an error if the name does not match
        @Override
        public void animalSound() {
            System.out.println("Meow");
        }
    }


```

---

## 4. Interfaces

An **interface** is a list of methods that a class promises to have, without saying how they work. It acts as a **contract**: if a class *implements* an interface, it must write the code for every method the interface declares.

- Use `interface` to define it.

- Use `implements` to sign the contract in a class.

A class can only extend one parent class, but it can implement **as many interfaces as it needs**.

**Example**

```java

    // Define the interface (The Contract)
    interface ElectricVehicle {
        void chargeBattery(); // No body: only the name and what it returns
        int getBatteryLevel();
    }

    // Implement the interface
    class Tesla implements ElectricVehicle {
        private int batteryLevel;

        public Tesla(int level) {
            this.batteryLevel = level;
        }

        // Required by the contract
        @Override
        public void chargeBattery() {
            this.batteryLevel = 100;
            System.out.println("Battery fully charged.");
        }

        // Required by the contract
        @Override
        public int getBatteryLevel() {
            return this.batteryLevel;
        }
    }

    public class Main {
        public static void main(String[] args) {
            Tesla myTesla = new Tesla(50);
            System.out.println("Level: " + myTesla.getBatteryLevel() + "%");
            
            myTesla.chargeBattery();
        }
    }


```

**Common mistake:** implementing an interface but forgetting one of its methods. The contract is incomplete, so the code does not compile.

```java

    // ❌ WRONG: getBatteryLevel() is missing
    class Scooter implements ElectricVehicle {
        @Override
        public void chargeBattery() { ... }
    }

    // ✅ CORRECT: every method of the interface is implemented
    class Scooter implements ElectricVehicle {
        @Override
        public void chargeBattery() { ... }

        @Override
        public int getBatteryLevel() { ... }
    }


```

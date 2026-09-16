---
title: "Object-Oriented Programming in Python"
---

# Object-Oriented Programming

**Object-Oriented Programming (OOP)** is a way of organizing code around **objects**: things that combine data (what they *have*) and behavior (what they *can do*). A person, for example, has a name and an age, and can greet other people.

Python supports several styles of programming, and OOP is one of them. In fact, everything in Python is an object behind the scenes, from numbers to functions.

Unlike **Java**, where all code must live inside a class, Python lets you mix simple scripts with classes. Even so, the core ideas (classes, objects, inheritance and polymorphism) are the same.

---

## Table of Contents

<div id="content-table">

- [1. Classes](#1-classes "Defining blueprints and instances")
- [2. The `__init__` Method](#2-the-__init__-method "Constructors in Python")
- [3. Methods and Self](#3-methods-and-self "Understanding the instance reference")
- [4. Inheritance](#4-inheritance "Extending classes")
- [5. Polymorphism](#5-polymorphism "Using the same interface with different classes")

</div>

---

## 1. Classes

A **class** is a blueprint for creating objects. It describes the data (**attributes**) and actions (**methods**) that every object of that type will have. An **object** (or *instance*) is a specific item built from that blueprint, just as many houses can be built from the same plan.

**Syntax**: Use the `class` keyword. Class names are written in `PascalCase` (each word starts with a capital letter).

```python 

    class Car:
        brand = "Toyota"  # Class attribute: shared by every Car
    
    # Creating an object (instantiation)
    # Unlike Java, no 'new' keyword is needed
    my_car = Car()
    
    print(my_car.brand)  # Output: Toyota


```

---

## 2. The `__init__` Method

`__init__` (with two underscores on each side) is a special method that Python runs automatically every time a new object is created. It is the equivalent of a **constructor** in Java, and it is used to give each object its own starting values.

```python 

    class Person:
        # The constructor: runs when Person(...) is called
        def __init__(self, name, age):
            self.name = name  # Instance attribute: each person has their own name
            self.age = age
    
    # Creating objects with arguments
    p1 = Person("Alice", 30)
    p2 = Person("Bob", 25)
    
    print(p1.name)  # Output: Alice
    print(p2.name)  # Output: Bob


```

`def` is the keyword used to define a function or method in Python.

**Common mistake:** writing `init` with only one underscore, or none. Python does not recognize it as the constructor, so the attributes are never created.

```python

    # ❌ WRONG: _init_ is just an ordinary method with a strange name
    class Person:
        def _init_(self, name):
            self.name = name

    p1 = Person("Alice")  # TypeError: Person() takes no arguments

    # ✅ CORRECT: two underscores before and after
    class Person:
        def __init__(self, name):
            self.name = name


```

---

## 3. Methods and Self

**Methods** are functions defined inside a class. They describe what an object can do.

### The `self` Parameter

`self` means "this specific object". When a method needs to use the object's own data, it reads it through `self` (for example, `self.name`). In Java this reference (`this`) is implicit; in Python it is **explicit**: the first parameter of every method must be `self`.

You do not pass `self` yourself. When you call `p1.greet()`, Python automatically sends `p1` as `self`.

```python 

    class Person:
        def __init__(self, name):
            self.name = name
    
        # Instance method
        def greet(self):
            print("Hello, my name is " + self.name)
    
    p1 = Person("David")
    p1.greet()  # Output: Hello, my name is David


```

**Common mistake:** forgetting `self`, either as the first parameter or when using the object's attributes.

```python

    class Person:
        def __init__(self, name):
            self.name = name

        # ❌ WRONG: no self parameter
        # p1.greet() fails: greet() takes 0 positional arguments but 1 was given
        def greet():
            print("Hello, my name is " + self.name)

        # ❌ WRONG: "name" alone does not exist inside this method (NameError)
        def greet(self):
            print("Hello, my name is " + name)

        # ✅ CORRECT: self is the first parameter and is used to read the attribute
        def greet(self):
            print("Hello, my name is " + self.name)


```

---

## 4. Inheritance

**Inheritance** lets a class receive all the attributes and methods of another class, and then add or change what it needs.

* **Parent class** (base class): the class being inherited from.
* **Child class** (derived class): the class that inherits.

**Syntax**: Write the parent class in parentheses after the child class name.

```python 

    # Parent class
    class Animal:
        def speak(self):
            print("Animal makes a sound")
    
    # Child class: inherits from Animal
    # Java equivalent: class Dog extends Animal
    class Dog(Animal):
        def speak(self):
            print("Bark")
            
    d = Dog()
    d.speak()  # Output: Bark


```

### The `super()` Function

`super()` gives access to the parent class. It is often used inside the child's `__init__` to let the parent set up its own attributes before adding new ones.

```python

    class Person:
        def __init__(self, name):
            self.name = name

    class Student(Person):
        def __init__(self, name, graduation_year):
            super().__init__(name)                  # The parent stores the name
            self.graduation_year = graduation_year  # The child adds its own attribute

    s = Student("Laura", 2026)
    print(s.name, s.graduation_year)  # Output: Laura 2026


```

**Common mistake:** writing a new `__init__` in the child and forgetting to call the parent's. The parent's attributes are never created.

```python

    # ❌ WRONG: Person.__init__ never runs, so self.name does not exist
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

## 5. Polymorphism

**Polymorphism** ("many forms") means that different kinds of objects can be used in the same way. In Python this is very flexible: if an object has the method you need, you can use it, no matter what class it comes from.

Java usually requires objects to share a parent class or an interface. Python instead uses **duck typing**, named after the saying "if it walks like a duck and quacks like a duck, it's a duck": what matters is what the object *can do*, not what it *is*.

```python

    class Cat:
        def speak(self):
            print("Meow")

    class Dog:
        def speak(self):
            print("Bark")

    def make_speak(animal):
        animal.speak()  # Works for any object that has a 'speak' method

    make_speak(Cat())  # Output: Meow
    make_speak(Dog())  # Output: Bark


```

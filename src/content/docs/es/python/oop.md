---
title: "Programación orientada a objetos en Python"
---

# Programación orientada a objetos

La **programación orientada a objetos (POO)** es una forma de organizar el código alrededor de **objetos**: cosas que combinan datos (lo que *tienen*) y comportamiento (lo que *pueden hacer*). Una persona, por ejemplo, tiene un nombre y una edad, y puede saludar a otras personas.

Python admite varios estilos de programación, y la POO es uno de ellos. De hecho, en Python todo es un objeto internamente, desde los números hasta las funciones.

A diferencia de **Java**, donde todo el código debe estar dentro de una clase, Python permite mezclar scripts sencillos con clases. Aun así, las ideas principales (clases, objetos, herencia y polimorfismo) son las mismas.

---

## Índice

<div id="content-table">

- [1. Clases](#1-clases "Definir planos e instancias")
- [2. El método `__init__`](#2-el-método-__init__ "Constructores en Python")
- [3. Métodos y self](#3-métodos-y-self "La referencia al propio objeto")
- [4. Herencia](#4-herencia "Extender clases")
- [5. Polimorfismo](#5-polimorfismo "Usar la misma interfaz con clases distintas")

</div>

---

## 1. Clases

Una **clase** es un plano para crear objetos. Describe los datos (**atributos**) y las acciones (**métodos**) que tendrá cada objeto de ese tipo. Un **objeto** (o *instancia*) es un elemento concreto construido a partir de ese plano, igual que con el mismo plano se pueden construir muchas casas.

**Sintaxis**: Usa la palabra clave `class`. Los nombres de clase se escriben en `PascalCase` (cada palabra empieza por mayúscula).

```python 

    class Car:
        brand = "Toyota"  # Atributo de clase: lo comparten todos los Car
    
    # Crear un objeto (instanciación)
    # A diferencia de Java, no hace falta la palabra 'new'
    my_car = Car()
    
    print(my_car.brand)  # Resultado: Toyota


```

---

## 2. El método `__init__`

`__init__` (con dos guiones bajos a cada lado) es un método especial que Python ejecuta automáticamente cada vez que se crea un objeto nuevo. Equivale al **constructor** de Java y sirve para dar a cada objeto sus propios valores iniciales.

```python 

    class Person:
        # El constructor: se ejecuta al llamar a Person(...)
        def __init__(self, name, age):
            self.name = name  # Atributo de instancia: cada persona tiene su propio nombre
            self.age = age
    
    # Crear objetos con argumentos
    p1 = Person("Alicia", 30)
    p2 = Person("Bruno", 25)
    
    print(p1.name)  # Resultado: Alicia
    print(p2.name)  # Resultado: Bruno


```

`def` es la palabra clave que se usa para definir una función o un método en Python.

**Error habitual:** escribir `init` con un solo guion bajo, o sin ninguno. Python no lo reconoce como constructor, así que los atributos nunca se crean.

```python

    # ❌ INCORRECTO: _init_ es solo un método normal con un nombre raro
    class Person:
        def _init_(self, name):
            self.name = name

    p1 = Person("Alicia")  # TypeError: Person() takes no arguments

    # ✅ CORRECTO: dos guiones bajos antes y después
    class Person:
        def __init__(self, name):
            self.name = name


```

---

## 3. Métodos y self

Los **métodos** son funciones definidas dentro de una clase. Describen lo que puede hacer un objeto.

### El parámetro `self`

`self` significa «este objeto concreto». Cuando un método necesita usar los datos del propio objeto, los lee a través de `self` (por ejemplo, `self.name`). En Java esta referencia (`this`) es implícita; en Python es **explícita**: el primer parámetro de todo método debe ser `self`.

No tienes que pasar `self` tú mismo. Cuando llamas a `p1.greet()`, Python envía automáticamente `p1` como `self`.

```python 

    class Person:
        def __init__(self, name):
            self.name = name
    
        # Método de instancia
        def greet(self):
            print("Hola, me llamo " + self.name)
    
    p1 = Person("David")
    p1.greet()  # Resultado: Hola, me llamo David


```

**Error habitual:** olvidar `self`, ya sea como primer parámetro o al usar los atributos del objeto.

```python

    class Person:
        def __init__(self, name):
            self.name = name

        # ❌ INCORRECTO: falta el parámetro self
        # p1.greet() falla: greet() takes 0 positional arguments but 1 was given
        def greet():
            print("Hola, me llamo " + self.name)

        # ❌ INCORRECTO: "name" a secas no existe dentro de este método (NameError)
        def greet(self):
            print("Hola, me llamo " + name)

        # ✅ CORRECTO: self es el primer parámetro y se usa para leer el atributo
        def greet(self):
            print("Hola, me llamo " + self.name)


```

---

## 4. Herencia

La **herencia** permite que una clase reciba todos los atributos y métodos de otra clase, y después añada o cambie lo que necesite.

* **Clase padre** (clase base): la clase de la que se hereda.
* **Clase hija** (clase derivada): la clase que hereda.

**Sintaxis**: Escribe la clase padre entre paréntesis después del nombre de la clase hija.

```python 

    # Clase padre
    class Animal:
        def speak(self):
            print("El animal hace un sonido")
    
    # Clase hija: hereda de Animal
    # Equivalente en Java: class Dog extends Animal
    class Dog(Animal):
        def speak(self):
            print("Guau")
            
    d = Dog()
    d.speak()  # Resultado: Guau


```

### La función `super()`

`super()` da acceso a la clase padre. Se usa a menudo dentro del `__init__` de la hija para que el padre prepare sus propios atributos antes de añadir otros nuevos.

```python

    class Person:
        def __init__(self, name):
            self.name = name

    class Student(Person):
        def __init__(self, name, graduation_year):
            super().__init__(name)                  # El padre guarda el nombre
            self.graduation_year = graduation_year  # La hija añade su propio atributo

    s = Student("Laura", 2026)
    print(s.name, s.graduation_year)  # Resultado: Laura 2026


```

**Error habitual:** escribir un `__init__` nuevo en la hija y olvidar llamar al del padre. Los atributos del padre nunca se crean.

```python

    # ❌ INCORRECTO: Person.__init__ no se ejecuta, así que self.name no existe
    class Student(Person):
        def __init__(self, name, graduation_year):
            self.graduation_year = graduation_year

    print(Student("Laura", 2026).name)  # AttributeError

    # ✅ CORRECTO
    class Student(Person):
        def __init__(self, name, graduation_year):
            super().__init__(name)
            self.graduation_year = graduation_year


```

---

## 5. Polimorfismo

El **polimorfismo** («muchas formas») significa que objetos de distinto tipo se pueden usar de la misma manera. En Python es muy flexible: si un objeto tiene el método que necesitas, puedes usarlo, venga de la clase que venga.

Java normalmente exige que los objetos compartan una clase padre o una interfaz. Python, en cambio, usa el **duck typing** («tipado de pato»), por el dicho «si camina como un pato y grazna como un pato, es un pato»: lo que importa es lo que el objeto *puede hacer*, no lo que *es*.

```python

    class Cat:
        def speak(self):
            print("Miau")

    class Dog:
        def speak(self):
            print("Guau")

    def make_speak(animal):
        animal.speak()  # Funciona con cualquier objeto que tenga el método 'speak'

    make_speak(Cat())  # Resultado: Miau
    make_speak(Dog())  # Resultado: Guau


```

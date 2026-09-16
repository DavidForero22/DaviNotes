---
title: "Programación orientada a objetos en Java"
---

# Programación orientada a objetos (POO)

La programación orientada a objetos es una forma de organizar el código alrededor de **objetos**: cosas que combinan **datos** (lo que *son* o *tienen*) y **comportamiento** (lo que *pueden hacer*). Un coche, por ejemplo, tiene una marca y una velocidad (datos) y puede acelerar o frenar (comportamiento).

En lugar de escribir una larga lista de instrucciones, modelas el programa como un conjunto de objetos que colaboran entre sí, igual que en el mundo real. La POO es el corazón de Java: casi todo lo que escribes en Java forma parte de una clase o de un objeto.

---

## Índice

<div id="content-table">

- [1. Clases y objetos](#1-clases-y-objetos "Clases y objetos en Java")
- [2. Herencia](#2-herencia "Cómo funciona la herencia en Java")
- [3. Polimorfismo](#3-polimorfismo "Qué es el polimorfismo y cómo se usa")
- [4. Interfaces](#4-interfaces "Cómo definir e implementar interfaces")

</div>

---

## 1. Clases y objetos

Una **clase** es un plano o una plantilla: describe qué datos y qué comportamiento tendrá un tipo de objeto, pero no es un objeto en sí. Un **objeto** es una cosa concreta construida a partir de ese plano, con sus propios valores. Una clase puede producir tantos objetos como necesites, igual que una receta de tarta sirve para hacer muchas tartas.

| Concepto | Descripción |
| :--- | :--- |
| **Clase** | La plantilla (por ejemplo, «Coche»). Define la estructura. |
| **Objeto** | Un elemento concreto creado a partir de la clase (por ejemplo, «ese Toyota rojo»). También se llama *instancia*. |
| **Atributo** | Una variable dentro de una clase que guarda datos del objeto (por ejemplo, color, velocidad). |
| **Método** | Una función dentro de una clase que define lo que puede hacer el objeto (por ejemplo, `startEngine`). |
| **Constructor** | Un método especial que se ejecuta al crear un objeto y sirve para dar valores iniciales a sus atributos. |

### Ejemplo

```java

    // 1. La clase (Car.java)
    public class Car {
        // Atributos
        String brand;
        String model;
        int year;

        // Constructor: se llama igual que la clase y rellena los atributos
        public Car(String brand, String model, int year) {
            this.brand = brand; // "this.brand" es el atributo, "brand" es el valor recibido
            this.model = model;
            this.year = year;
        }

        // Método (comportamiento)
        public void startEngine() {
            System.out.println("El motor del " + brand + " " + model + " está arrancando...");
        }
    }

    // 2. Uso (Main.java)
    public class Main {
        public static void main(String[] args) {
            // "new" crea un objeto a partir de la clase (instanciación)
            Car myCar = new Car("Toyota", "Corolla", 2022);
            
            myCar.startEngine(); // Resultado: El motor del Toyota Corolla está arrancando...
        }
    }


```

*Nota: en Java, cada clase `public` debe guardarse en su propio archivo con el mismo nombre que la clase (`Car.java`, `Main.java`). Los ejemplos de esta página muestran varias clases juntas solo para que sean más fáciles de leer.*

**Error habitual:** intentar usar la clase directamente en lugar de crear antes un objeto. La clase es solo el plano; necesitas `new` para construir un objeto real.

```java

    // ❌ INCORRECTO: "Car" es el plano, no un coche concreto
    Car.startEngine();

    // ✅ CORRECTO: se crea un objeto con new y después se usa
    Car myCar = new Car("Toyota", "Corolla", 2022);
    myCar.startEngine();


```

---

## 2. Herencia

La **herencia** permite que una clase nueva reciba los atributos y métodos de una clase existente, y después añada los suyos. La clase que hereda es la **subclase** (hija), y la clase de la que hereda es la **superclase** (padre). En Java se usa la palabra clave `extends`.

- **Reutilización:** No hace falta reescribir el código que ya existe en el padre.

- **Jerarquía:** Expresa una relación «es un»: un deportivo *es un* vehículo.

**Ejemplo**

```java

    // Clase padre (superclase)
    public class Vehicle {
        protected String brand = "Marca genérica"; // protected: visible para las clases hijas

        public void honk() {
            System.out.println("¡Mec, mec!");
        }
    }

    // Clase hija (subclase)
    public class SportsCar extends Vehicle {
        private String modelName = "Mustang";

        public void showDetails() {
            // Puede usar 'brand' porque lo hereda de Vehicle
            System.out.println("Marca: " + brand + ", Modelo: " + modelName);
        }
    }

    public class Main {
        public static void main(String[] args) {
            SportsCar myFastCar = new SportsCar();
            
            myFastCar.honk();        // Método heredado
            myFastCar.showDetails(); // Método propio
        }
    }


```

Las palabras `public`, `protected` y `private` son **modificadores de acceso**: controlan quién puede ver un atributo o un método. `public` significa todo el mundo, `protected` la clase y sus hijas, y `private` solo la propia clase.

**Error habitual:** intentar heredar de dos clases a la vez. En Java, una clase solo puede tener un padre (usa interfaces, sección 4, para combinar varios comportamientos).

```java

    // ❌ INCORRECTO: Java no permite extender más de una clase
    public class FlyingCar extends Car, Plane { }

    // ✅ CORRECTO: se extiende una clase y se implementan las interfaces necesarias
    public class FlyingCar extends Car implements Flyable { }


```

---

## 3. Polimorfismo

**Polimorfismo** significa «muchas formas». Permite que una misma acción se comporte de manera distinta según el objeto que la realiza. En Java ocurre sobre todo mediante la **sobrescritura de métodos**: una clase hija escribe su propia versión de un método que ha heredado de su padre. La anotación `@Override` marca ese método para que Java compruebe que de verdad existe en el padre.

**Ejemplo**

Fíjate en que `animalSound()` da un resultado diferente para cada objeto, aunque las tres variables se declaran como `Animal`.

```java

    class Animal {
        public void animalSound() {
            System.out.println("El animal hace un sonido");
        }
    }

    class Pig extends Animal {
        @Override
        public void animalSound() {
            System.out.println("El cerdo dice: oinc oinc");
        }
    }

    class Dog extends Animal {
        @Override
        public void animalSound() {
            System.out.println("El perro dice: guau guau");
        }
    }

    public class Main {
        public static void main(String[] args) {
            Animal myAnimal = new Animal();
            Animal myPig = new Pig();
            Animal myDog = new Dog();

            myAnimal.animalSound(); // Resultado: El animal hace un sonido
            myPig.animalSound();    // Resultado: El cerdo dice: oinc oinc
            myDog.animalSound();    // Resultado: El perro dice: guau guau
        }
    }


```

**Error habitual:** escribir mal el nombre del método que quieres sobrescribir y no poner `@Override`. Java crea en silencio un método *nuevo*, y se sigue ejecutando la versión del padre.

```java

    class Cat extends Animal {
        // ❌ INCORRECTO: "animalsound" (con s minúscula) es otro método, no se sobrescribe nada
        public void animalsound() {
            System.out.println("Miau");
        }
    }

    class Cat extends Animal {
        // ✅ CORRECTO: con @Override, Java avisa con un error si el nombre no coincide
        @Override
        public void animalSound() {
            System.out.println("Miau");
        }
    }


```

---

## 4. Interfaces

Una **interfaz** es una lista de métodos que una clase se compromete a tener, sin decir cómo funcionan. Actúa como un **contrato**: si una clase *implementa* una interfaz, debe escribir el código de todos los métodos que declara.

- Usa `interface` para definirla.

- Usa `implements` para firmar el contrato en una clase.

Una clase solo puede extender una clase padre, pero puede implementar **tantas interfaces como necesite**.

**Ejemplo**

```java

    // Definir la interfaz (el contrato)
    interface ElectricVehicle {
        void chargeBattery(); // Sin cuerpo: solo el nombre y lo que devuelve
        int getBatteryLevel();
    }

    // Implementar la interfaz
    class Tesla implements ElectricVehicle {
        private int batteryLevel;

        public Tesla(int level) {
            this.batteryLevel = level;
        }

        // Obligatorio según el contrato
        @Override
        public void chargeBattery() {
            this.batteryLevel = 100;
            System.out.println("Batería cargada al completo.");
        }

        // Obligatorio según el contrato
        @Override
        public int getBatteryLevel() {
            return this.batteryLevel;
        }
    }

    public class Main {
        public static void main(String[] args) {
            Tesla myTesla = new Tesla(50);
            System.out.println("Nivel: " + myTesla.getBatteryLevel() + "%");
            
            myTesla.chargeBattery();
        }
    }


```

**Error habitual:** implementar una interfaz y olvidar uno de sus métodos. El contrato queda incompleto, así que el código no compila.

```java

    // ❌ INCORRECTO: falta getBatteryLevel()
    class Scooter implements ElectricVehicle {
        @Override
        public void chargeBattery() { ... }
    }

    // ✅ CORRECTO: están implementados todos los métodos de la interfaz
    class Scooter implements ElectricVehicle {
        @Override
        public void chargeBattery() { ... }

        @Override
        public int getBatteryLevel() { ... }
    }


```

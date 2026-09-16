---
title: "Sintaxis básica en Java"
---

# Sintaxis básica

Java es un lenguaje **fuertemente tipado**: cada dato tiene un *tipo* fijo (número, texto, verdadero/falso...) que hay que escribir de forma explícita y que no puede cambiar después. También **distingue mayúsculas de minúsculas**, así que `name` y `Name` son dos cosas distintas. Lenguajes como **Python** o **JavaScript** son más flexibles en ambos aspectos.

Java se organiza en **clases**. Una clase es un bloque de código con nombre que agrupa datos y acciones relacionados. Todo el código que escribas debe estar dentro de una clase; no puede haber instrucciones «sueltas» fuera de ellas.

---

## Índice

<div id="content-table">

- [1. Estructura](#1-estructura "La estructura básica de un programa en Java")
- [2. Variables](#2-variables "Tipos primitivos y tipos por referencia en Java")
- [3. Estructuras de control](#3-estructuras-de-control "Controlar el flujo de un programa en Java")
  - [3.1 Condicionales](#31-condicionales "Uso de if y else")
  - [3.2 La sentencia switch](#32-la-sentencia-switch "Elegir un bloque de código según una variable")
  - [3.3 Bucles](#33-bucles "Repetir código con for o while")
    - [A) Bucle for](#a-bucle-for "Bucle cuando se sabe cuántas repeticiones habrá")
    - [B) Bucle while](#b-bucle-while "Bucle mientras una condición sea verdadera")
- [4. Operadores lógicos](#4-operadores-lógicos "Combinar o negar condiciones")

</div>

---

## 1. Estructura

Toda aplicación Java tiene un punto de partida llamado método `main` (un *método* es un bloque de instrucciones con nombre). Al ejecutar el programa, Java busca este método y ejecuta las instrucciones que contiene, de arriba abajo. Este ejemplo muestra el esqueleto de cualquier programa Java:

```java

    public class Main {
        // El punto de entrada de la aplicación
        public static void main(String[] args) {
            System.out.println("¡Hola, mundo!");
        }
    }


```

**Partes principales**:

- `class Main`: Define una clase llamada `Main`. El archivo debe llamarse exactamente igual que la clase (`Main.java`).

- `public static void main(String[] args)`: La línea exacta que Java busca para arrancar el programa. De momento puedes tratarla como una fórmula fija.

- `System.out.println`: Muestra una línea de texto en la *consola* (la ventana de texto donde el programa muestra sus resultados).

- `// ...`: Un **comentario**. Java ignora todo lo que va después de `//` en esa línea; es una nota para quien lee el código.

- `;`: Cada instrucción termina con punto y coma, como el punto al final de una frase.

- `{ }`: Las llaves marcan dónde empieza y dónde termina un bloque de código.

---

## 2. Variables

Una **variable** es una caja con nombre que guarda un valor para usarlo más tarde. En Java, al crear una variable hay que indicar qué tipo de valor guardará. Java tiene dos familias de tipos: los **tipos primitivos**, que guardan valores simples directamente, y los **tipos por referencia**, que apuntan a objetos más complejos.

**Tipos primitivos**

Son las piezas básicas de datos en Java.

- `int`: Números enteros (por ejemplo, `10`, `-5`).

- `double`: Números con decimales (por ejemplo, `5.99`). En el código, los decimales se escriben con punto.

- `boolean`: Solo dos valores posibles, `true` (verdadero) o `false` (falso). Sirve para preguntas de sí o no.

- `char`: Un único carácter, escrito entre comillas simples (por ejemplo, `'A'`).

**Tipos por referencia**

- `String`: Un texto, escrito entre comillas dobles. A diferencia de los primitivos, los String son *objetos*: traen acciones incorporadas (métodos) como `.length()` (contar los caracteres) o `.toUpperCase()` (pasar a mayúsculas).

- Cualquier clase, incluidas las que crees tú.

Ejemplo:

```java

    // Primitivos
    int age = 25;
    double price = 19.99;
    boolean isDeveloper = true;
    char grade = 'A';

    // Tipo por referencia
    String name = "David";


```

**Error habitual:** intentar guardar un valor de otro tipo. Como Java es fuertemente tipado, el programa ni siquiera llega a arrancar.

```java

    // ❌ INCORRECTO: un int solo puede guardar números enteros, no texto
    int age = "25";

    // ✅ CORRECTO: el valor coincide con el tipo declarado
    int age = 25;


```

Puedes crear **textos de varias líneas** con los **bloques de texto** (disponibles desde Java 15), usando triples comillas (`"""`). Es útil para textos largos.

```java

    String text = """
        Este es un
        texto muy largo,
        así que puede escribirse en varias líneas.
        """;


```

---

## 3. Estructuras de control

Por defecto, un programa ejecuta sus instrucciones una detrás de otra. Las **estructuras de control** cambian ese orden: permiten que el programa tome decisiones (ejecutar un código solo si algo es cierto) o repita código varias veces.

### 3.1 Condicionales

Los condicionales ejecutan bloques de código distintos según si una condición es `true` o `false`. Se leen casi como en inglés: *if* (si) pasa esto, haz aquello; *else if* (si no, si) pasa esto otro, haz otra cosa; *else* (si no), haz esto.

```java

    int age = 21;

    if (age > 80) {
        System.out.println("Eres demasiado mayor para subir a la montaña rusa");

    } else if (age < 14) {
        System.out.println("Eres demasiado joven para subir a la montaña rusa");
    
    } else {
        System.out.println("Todo en orden, ¡que te diviertas!");
    }


```

Java también tiene una forma corta de escribir una condición sencilla: el **operador ternario** `condición ? valorSiVerdadero : valorSiFalso`. Es útil para elegir entre dos valores en una sola línea.

```java

    boolean admin = true;

    String message = admin ? "¡Bienvenido, administrador!" : "No tienes acceso";

    System.out.println(message); // Resultado: ¡Bienvenido, administrador!


```

**Error habitual:** comparar textos con `==`. En objetos como `String`, `==` comprueba si las dos variables apuntan al *mismo objeto en memoria*, no si contienen el mismo texto. Usa `.equals()`.

```java

    String password = new String("secreto");

    // ❌ INCORRECTO: compara posiciones de memoria, puede dar false aunque el texto coincida
    if (password == "secreto") { ... }

    // ✅ CORRECTO: compara los caracteres
    if (password.equals("secreto")) { ... }


```

### 3.2 La sentencia switch

La sentencia `switch` elige uno de varios bloques de código según el valor de una variable. Suele ser más limpia que encadenar muchos `else if`.

```java

    int day = 3;

    switch (day) {
        case 1:
            System.out.println("Lunes");
            break;

        case 2:
            System.out.println("Martes");
            break;

        default:
            System.out.println("Otro día");
    }


```

`default` se ejecuta cuando ningún `case` coincide (como el `else` final), y `break` significa «para aquí y sal del switch».

**Error habitual:** olvidar el `break`. Sin él, Java sigue ejecutando también los casos siguientes.

```java

    int day = 1;

    // ❌ INCORRECTO: muestra "Lunes" Y "Martes"
    switch (day) {
        case 1:
            System.out.println("Lunes");
        case 2:
            System.out.println("Martes");
    }

    // ✅ CORRECTO: muestra solo "Lunes"
    switch (day) {
        case 1:
            System.out.println("Lunes");
            break;
        case 2:
            System.out.println("Martes");
            break;
    }


```

### 3.3 Bucles

Los **bucles** repiten un bloque de código mientras se cumpla una condición. Cada repetición se llama *iteración*.

#### A) Bucle for

El bucle `for` se usa cuando sabes de antemano cuántas veces debe repetirse el código.

```java

    // Sintaxis: for (punto de partida; condición para continuar; paso tras cada repetición)
    for (int i = 0; i < 5; i++) {
        System.out.println("Iteración: " + i);
    }

    // Resultado: Iteración: 0, 1, 2, 3 y 4 (5 repeticiones)


```

`i++` es un atajo para «suma 1 a `i`». En programación se suele empezar a contar desde 0.

#### B) Bucle while

El bucle `while` («mientras») repite un bloque de código mientras una condición sea `true`. Úsalo cuando no sepas de antemano cuántas repeticiones harán falta.

```java

    int i = 0;

    while (i < 5) {
        System.out.println(i);
        i++;
    }


```

**Error habitual:** olvidar actualizar la variable de la condición. La condición nunca pasa a ser `false`, así que el bucle no termina nunca (un *bucle infinito*) y el programa se queda bloqueado.

```java

    int i = 0;

    // ❌ INCORRECTO: i siempre vale 0, así que i < 5 siempre es verdadero
    while (i < 5) {
        System.out.println(i);
    }

    // ✅ CORRECTO: i aumenta en cada vuelta hasta que la condición es falsa
    while (i < 5) {
        System.out.println(i);
        i++;
    }


```

---

## 4. Operadores lógicos

Los operadores lógicos combinan o invierten condiciones (valores `true`/`false`, también llamados *expresiones booleanas*). Se usan a menudo dentro de `if`, `while` o `for` para decidir según varias condiciones a la vez.

| Operador | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `&&` (Y) | Devuelve `true` solo si **ambas** condiciones son verdaderas. | `x > 5 && x < 10` |
| `\|\|` (O) | Devuelve `true` si **al menos una** de las condiciones es verdadera. | `x < 5 \|\| x > 10` |
| `!` (NO) | Invierte el resultado: `true` pasa a ser `false` y viceversa. | `!(x > 5)` |

```java

    int age = 20;
    boolean hasTicket = true;

    // Las dos condiciones deben ser verdaderas para entrar
    if (age >= 18 && hasTicket) {
        System.out.println("Acceso permitido");
    }


```

**Error habitual:** escribir un solo `&` o `|`. Las versiones dobles se detienen en cuanto conocen la respuesta: si la parte izquierda de `&&` es `false`, la derecha ni se comprueba. Las versiones simples comprueban siempre los dos lados, y eso puede hacer fallar el programa.

```java

    String name = null; // null significa «ningún valor»

    // ❌ INCORRECTO: & también ejecuta name.length(), que falla porque name es null
    if (name != null & name.length() > 0) { ... }

    // ✅ CORRECTO: && se detiene porque name != null es false, y name.length() no llega a ejecutarse
    if (name != null && name.length() > 0) { ... }


```

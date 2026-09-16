---
title: "Basic Syntax in Java"
---

# Basic Syntax

Java is a **strongly typed** language: every piece of data has a fixed *type* (number, text, true/false...) that must be written explicitly and cannot change later. It is also **case-sensitive**, so `name` and `Name` are two different things. Languages like **Python** or **JavaScript** are more flexible in both respects.

Java is built around **classes**. A class is a named block of code that groups related data and actions. All the code you write must live inside a class; there are no "free-floating" instructions outside of one.

---

## Table of Contents

<div id="content-table">

- [1. Structure](#1-structure "Learn the basic Java program structure")
- [2. Variables](#2-variables "Overview of Java primitive and reference types")
- [3. Control Structures](#3-control-structures "Learn how to control program flow in Java")
  - [3.1 Conditional Statements](#31-conditional-statements "Using if and else statements")
  - [3.2 Switch Statement](#32-switch-statement "Selecting code blocks based on a variable")
  - [3.3 Loops](#33-loops "Repeating code blocks with for or while loops")
    - [A) For Loop](#a-for-loop "Loop when number of iterations is known")
    - [B) While Loop](#b-while-loop "Loop while a condition is true")
- [4. Logical Operators](#4-logical-operators "Combining or negating boolean expressions")

</div>

---

## 1. Structure

Every Java application has a starting point called the `main` method (a *method* is a named block of instructions). When you run the program, Java looks for this method and executes the instructions inside it, from top to bottom. This example shows the skeleton of any Java program:

```java

    public class Main {
        // The entry point of the application
        public static void main(String[] args) {
            System.out.println("Hello World!");
        }
    }


```

**Key Components**:

- `class Main`: Defines a class called `Main`. The file must have exactly the same name as the class (`Main.java`).

- `public static void main(String[] args)`: The exact line Java looks for to start the program. For now, you can treat it as a fixed formula.

- `System.out.println`: Prints a line of text to the *console* (the text window where the program shows its output).

- `// ...`: A **comment**. Java ignores everything after `//` on that line; it is a note for people reading the code.

- `;`: Every instruction ends with a semicolon, like the full stop at the end of a sentence.

- `{ }`: Curly braces mark where a block of code begins and ends.

---

## 2. Variables

A **variable** is a named box that stores a value so you can use it later. In Java, when you create a variable you must say what type of value it will hold. Java has two families of types: **primitive types**, which store simple values directly, and **reference types**, which point to more complex objects.

**Primitive Types**

These are the basic building blocks of data in Java.

- `int`: Whole numbers (e.g., `10`, `-5`).

- `double`: Decimal numbers (e.g., `5.99`).

- `boolean`: Only two possible values, `true` or `false`. Used for yes/no questions.

- `char`: A single character, written between single quotes (e.g., `'A'`).

**Reference Types**

- `String`: A piece of text, written between double quotes. Unlike primitives, Strings are *objects*: they come with built-in actions (methods) such as `.length()` (count the characters) or `.toUpperCase()` (convert to capital letters).

- Any class, including the ones you create yourself.

Example:

```java

    // Primitives
    int age = 25;
    double price = 19.99;
    boolean isDeveloper = true;
    char grade = 'A';

    // Reference Type
    String name = "David";


```

**Common mistake:** trying to store a value of a different type. Because Java is strongly typed, the program will not even start.

```java

    // ❌ WRONG: an int can only hold whole numbers, not text
    int age = "25";

    // ✅ CORRECT: the value matches the declared type
    int age = 25;


```

You can create **multiline strings** using **Text Blocks** (available since Java 15) with triple quotes (`"""`). This is useful for long texts that span several lines.

```java

    String text = """
        This is a
        very long text,
        so it can be written across multiple lines.
        """;


```

---

## 3. Control Structures

By default, a program runs its instructions one after another. **Control structures** change that order: they let the program make decisions (run some code only if something is true) or repeat code several times.

### 3.1 Conditional Statements

Conditional statements run different blocks of code depending on whether a condition is `true` or `false`. They read almost like English: *if* this, do that; *else if* this other thing, do something else; *else*, do this.

```java

    int age = 21;

    if (age > 80) {
        System.out.println("You're too old to ride the roller coaster");

    } else if (age < 14) {
        System.out.println("You're too young to ride the roller coaster");
    
    } else {
        System.out.println("Everything is fine, have fun!");
    }


```

Java also has a short way to write a simple condition: the **ternary operator** `condition ? valueIfTrue : valueIfFalse`. It is useful to choose between two values in a single line.

```java

    boolean admin = true;

    String message = admin ? "Welcome, admin!" : "You can't access";

    System.out.println(message); // Output: Welcome, admin!


```

**Common mistake:** comparing texts with `==`. For objects such as `String`, `==` checks whether both variables point to the *same object in memory*, not whether they contain the same text. Use `.equals()` instead.

```java

    String password = new String("secret");

    // ❌ WRONG: compares memory locations, so this can be false even if the text matches
    if (password == "secret") { ... }

    // ✅ CORRECT: compares the actual characters
    if (password.equals("secret")) { ... }


```

### 3.2 Switch Statement

The `switch` statement chooses one of many blocks of code based on the value of a variable. It is often cleaner than writing many `else if` statements in a row.

```java

    int day = 3;

    switch (day) {
        case 1:
            System.out.println("Monday");
            break;

        case 2:
            System.out.println("Tuesday");
            break;

        default:
            System.out.println("Another day");
    }


```

`default` runs when no `case` matches (like the final `else`), and `break` means "stop here and exit the switch".

**Common mistake:** forgetting `break`. Without it, Java keeps running the next cases too.

```java

    int day = 1;

    // ❌ WRONG: prints "Monday" AND "Tuesday"
    switch (day) {
        case 1:
            System.out.println("Monday");
        case 2:
            System.out.println("Tuesday");
    }

    // ✅ CORRECT: prints only "Monday"
    switch (day) {
        case 1:
            System.out.println("Monday");
            break;
        case 2:
            System.out.println("Tuesday");
            break;
    }


```

### 3.3 Loops

**Loops** repeat a block of code while a condition is met. Each repetition is called an *iteration*.

#### A) For Loop

The `for` loop is used when you know in advance how many times the code should repeat.

```java

    // Syntax: for (starting point; condition to keep going; step after each repetition)
    for (int i = 0; i < 5; i++) {
        System.out.println("Iteration: " + i);
    }

    // Output: Iteration: 0, 1, 2, 3 and 4 (5 repetitions)


```

`i++` is a shortcut for "add 1 to `i`". Counting in programming usually starts at 0.

#### B) While Loop

The `while` loop repeats a block of code as long as a condition is `true`. Use it when you do not know in advance how many repetitions will be needed.

```java

    int i = 0;

    while (i < 5) {
        System.out.println(i);
        i++;
    }


```

**Common mistake:** forgetting to update the variable in the condition. The condition never becomes `false`, so the loop never ends (an *infinite loop*) and the program freezes.

```java

    int i = 0;

    // ❌ WRONG: i is always 0, so i < 5 is always true
    while (i < 5) {
        System.out.println(i);
    }

    // ✅ CORRECT: i increases each time until the condition is false
    while (i < 5) {
        System.out.println(i);
        i++;
    }


```

---

## 4. Logical Operators

Logical operators combine or reverse conditions (`true`/`false` values, also called *boolean expressions*). They are commonly used inside `if`, `while` or `for` to decide based on several conditions at once.

| Operator | Description | Example |
| :--- | :--- | :--- |
| `&&` (AND) | Returns `true` only if **both** conditions are true. | `x > 5 && x < 10` |
| `\|\|` (OR) | Returns `true` if **at least one** of the conditions is true. | `x < 5 \|\| x > 10` |
| `!` (NOT) | Reverses the result: `true` becomes `false` and vice versa. | `!(x > 5)` |

```java

    int age = 20;
    boolean hasTicket = true;

    // Both conditions must be true to enter
    if (age >= 18 && hasTicket) {
        System.out.println("Access granted");
    }


```

**Common mistake:** writing a single `&` or `|`. The doubled versions stop as soon as the answer is known: if the left side of `&&` is `false`, the right side is never checked. The single versions always check both sides, which can crash the program.

```java

    String name = null; // null means "no value at all"

    // ❌ WRONG: & also runs name.length(), which crashes because name is null
    if (name != null & name.length() > 0) { ... }

    // ✅ CORRECT: && stops after name != null is false, so name.length() never runs
    if (name != null && name.length() > 0) { ... }


```

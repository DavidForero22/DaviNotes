---
title: "Collections in Java"
---

# Java Collections Framework

Programs rarely work with a single piece of data: a shop has many products, a school has many students. A **collection** is a structure that stores a group of values under one name.

Java offers the **Collections Framework**, a set of ready-made classes for storing groups of data that can grow and shrink. Before using it, it helps to understand the most basic structure (the array) and two classic ways of organizing data (stacks and queues), so you can choose the right tool for each job.

---

## Table of Contents

<div id="content-table">

- [1. Basic Structures](#1-basic-structures "Learn the fundamental data structures in Java")
  - [A) Arrays](#a-arrays "Understand fixed-size arrays and their pros/cons")
  - [B) Stacks and Queues](#b-stacks-and-queues "Explore LIFO and FIFO processing with stacks and queues")
- [2. ArrayList](#2-arraylist "Learn about dynamic lists and ArrayList usage")
- [3. HashMap](#3-hashmap "Understand key-value mapping and fast lookups with HashMap")
- [4. Stream API](#4-stream-api "Discover how to process collections declaratively with Streams")
- [5. Other Collections](#5-other-collections "Research the different Java collections.")

</div>

---

## 1. Basic Structures

Before diving into the Collections Framework, let's look at the simplest structures and how Java differs from other languages.

### A) Arrays

An **array** is a row of boxes of the same type, created with a fixed number of positions. Each position has a number called an **index**, starting at `0`.

- **Pros:** Very fast and light, because all the values are stored side by side in memory.
- **Cons:** Its size is fixed: once created, you cannot add more positions.

In Python (`list`) or JavaScript (`[]`), lists grow automatically. In Java, an array like `int[]` cannot; if you need a list that grows, use `ArrayList` (see section 2).

```java

    public class Main {
        public static void main(String[] args) {
            // An array of 5 whole numbers: positions 0, 1, 2, 3 and 4
            int[] numbers = new int[5];
            numbers[0] = 10; // Stores 10 in the first position
        }
    }


```

**Common mistake:** using a position that does not exist. An array of 5 elements goes from index `0` to `4`, so index `5` crashes the program with an `ArrayIndexOutOfBoundsException`.

```java

    int[] numbers = new int[5];

    // ❌ WRONG: the last position is 4, not 5
    numbers[5] = 50;

    // ✅ CORRECT: the last position is always length - 1
    numbers[numbers.length - 1] = 50;


```

### B) Stacks and Queues

Stacks and queues define the **order** in which elements are added and removed.

- **Stack (Last-In, First-Out, or LIFO):** Like a stack of plates. The last plate you put on top is the first one you take off. A typical use is the "back" button of a browser: the last page you visited is the first one you return to.

```java

    import java.util.ArrayDeque;
    import java.util.Deque;

    public class Main {
        public static void main(String[] args) {
            Deque<String> history = new ArrayDeque<>();

            // 1. Add elements on top (push)
            history.push("Home Page");
            history.push("Settings");
            history.push("Profile"); // This is at the top

            // 2. Look at the top element without removing it (peek)
            System.out.println("Current: " + history.peek()); // Prints: Profile

            // 3. Remove the top element (pop)
            String lastVisited = history.pop(); // Removes "Profile"

            System.out.println("Going back to: " + history.peek()); // Prints: Settings
        }
    }


```

*Note: Java also has an older `Stack` class that works the same way, but the official documentation recommends `ArrayDeque` for new code.*

- **Queue (First-In, First-Out, or FIFO):** Like the line at a supermarket. The first person to arrive is the first one to be served. A typical use is a printer queue.

```java

    import java.util.LinkedList; 
    import java.util.Queue;

    public class Main {
        public static void main(String[] args) {
            // LinkedList is one of the classes that can act as a Queue
            Queue<String> printerQueue = new LinkedList<>();

            // 1. Add elements to the end of the line (offer)
            printerQueue.offer("Document_A.pdf");
            printerQueue.offer("Photo_B.jpg");

            // 2. Take the first element out of the line (poll)
            // "Document_A.pdf" was added first, so it comes out first
            System.out.println("Printing: " + printerQueue.poll());

            // 3. Check who is next without removing it (peek)
            System.out.println("Next in line: " + printerQueue.peek()); // Prints: Photo_B.jpg
        }
    }


```

The `<String>` part between angle brackets says what type of elements the collection holds. These are called **generics**.

---

## 2. ArrayList

`ArrayList` is part of the Collections Framework. It works like an array that resizes itself automatically when you add or remove elements, similar to lists in Python and JavaScript.

- **Pros:** Reading an element by its position (`get(i)`) is instant.
- **Cons:** Inserting or removing elements in the middle is slower, because every element after it has to shift one position.

```java

    import java.util.ArrayList;

    public class Main {
        public static void main(String[] args) {
            // Create an empty list of texts
            ArrayList<String> languages = new ArrayList<>();

            // It grows automatically
            languages.add("Java");
            languages.add("Python");
            languages.add("C++");

            System.out.println(languages.get(0)); // Prints: Java
            System.out.println(languages.size()); // Prints: 3
        }
    }


```

**Common mistake:** using a primitive type inside the angle brackets. Collections can only store objects, so each primitive has an object version: `Integer` for `int`, `Double` for `double`, `Boolean` for `boolean`, and so on.

```java

    // ❌ WRONG: int is a primitive type and does not compile here
    ArrayList<int> numbers = new ArrayList<>();

    // ✅ CORRECT: Integer is the object version of int
    ArrayList<Integer> numbers = new ArrayList<>();
    numbers.add(42); // Java converts 42 to Integer automatically


```

---

## 3. HashMap

A `HashMap` stores data in **key-value pairs**, like a dictionary where you look up a word (the key) to find its definition (the value). Internally, it uses a mathematical function (a *hash*) to decide where each key is stored, which makes finding values extremely fast.

- **Pros:** Finding a value by its key is fast, no matter how much data there is.
- **Cons:** It does not keep elements in any particular order, and each key can appear only once.

```java

    import java.util.HashMap;

    public class Main {
        public static void main(String[] args) {
            // Map: Key (String) -> Value (Integer)
            HashMap<String, Integer> scores = new HashMap<>();

            scores.put("Player1", 1500);
            scores.put("Player2", 3000);

            // Instant lookup by key
            System.out.println(scores.get("Player1")); // Prints: 1500
        }
    }


```

**Common mistake:** assuming a key always exists. If it does not, `get()` returns `null` (no value), and using that `null` as a number crashes the program. `getOrDefault()` lets you provide a fallback value.

```java

    // ❌ WRONG: "Player3" does not exist, get() returns null and the program crashes
    int score = scores.get("Player3");

    // ✅ CORRECT: returns 0 when the key does not exist
    int score = scores.getOrDefault("Player3", 0);


```

---

## 4. Stream API

Introduced in Java 8, **Streams** let you process a collection step by step, like an assembly line: you describe *what* you want (filter these, transform those) instead of writing *how* to do it with loops.

- **Pros:** Shorter and more readable code for filtering, transforming and summarizing data.
- **Cons:** For very simple tasks it can be slightly slower than a loop, and errors are harder to trace.

```java

    import java.util.List;

    public class Main {
        public static void main(String[] args) {
            List<String> names = List.of("Alice", "Bob", "Charlie", "David");

            names.stream()
                .filter(name -> name.startsWith("A")) // 1. Keep names starting with "A"
                .map(String::toUpperCase)             // 2. Convert them to capital letters
                .forEach(System.out::println);        // 3. Print each one

            // Output: ALICE
        }
    }


```

`name -> name.startsWith("A")` is a **lambda**: a tiny function written inline. Read it as "for each `name`, check whether it starts with A".

**Common mistake:** expecting a stream to change the original list. Streams create new results; the original collection stays the same.

```java

    List<String> names = List.of("alice", "bob");

    // ❌ WRONG: the result is thrown away, names is still in lowercase
    names.stream().map(String::toUpperCase);

    // ✅ CORRECT: collect the result into a new list
    List<String> upperNames = names.stream()
        .map(String::toUpperCase)
        .toList();


```

---

## 5. Other Collections

Java offers many more data structures than the ones covered here. The image below shows the full family tree of the Java Collections Framework and how its main interfaces (Set, List, Queue, Map) relate to each other.

<div class="doc-img">

![Java Collections Hierarchy](/images/java-collections.webp "Image credit: akcoding.com")

</div>

We have only explored the **most common** structures.

<p>If you want to go further, we highly recommend exploring the <a href="https://docs.oracle.com/en/java/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Visit the official Java documentation for in-depth information">Official Java Documentation</a>.</p>

---
title: "Data Structures in Python"
---

# Data Structures

A **data structure** is a way of storing several values together, like a shopping list or an address book. Python comes with four built-in structures for this. Unlike **Java**, where you usually have to import classes such as `ArrayList` or `HashMap`, these four are part of the language itself and ready to use.

To choose the right one, ask yourself three questions about your data:

- **Ordered?** Do the elements keep the position in which you added them?
- **Mutable?** Can the elements be changed, added or removed after creating the structure?
- **Duplicates?** Can the same value appear more than once?

| Structure | Ordered | Mutable | Duplicates | Syntax |
| :--- | :--- | :--- | :--- | :--- |
| List | Yes | Yes | Yes | `[1, 2, 3]` |
| Tuple | Yes | No | Yes | `(1, 2, 3)` |
| Dictionary | Yes | Yes | Keys: no | `{"a": 1}` |
| Set | No | Yes | No | `{1, 2, 3}` |

---

## Table of Contents

<div id="content-table">

- [1. Lists](#1-lists "Ordered and mutable collections")
- [2. Tuples](#2-tuples "Ordered and immutable collections")
- [3. Dictionaries](#3-dictionaries "Key-Value pairs (HashMaps)")
- [4. Sets](#4-sets "Unordered collections of unique elements")

</div>

---

## 1. Lists

Lists are the most versatile structure in Python. They are **ordered**, **mutable** (changeable) and allow duplicate values. They are similar to `ArrayList` in Java, but a single list can mix different types of data.

Each element has a position called an **index**, starting at `0`.

**Syntax**: Square brackets `[]`.

```python

    # Creating a list
    fruits = ["apple", "banana", "cherry"]
    
    # Accessing items by index (the first one is 0)
    print(fruits[0])   # Output: apple
    print(fruits[-1])  # Negative indexes count from the end. Output: cherry
    
    # Modifying the list
    fruits.append("orange")  # Adds to the end
    fruits[1] = "blueberry"  # Changes the second item
    
    # Slicing: getting a part of the list, from index 1 up to (not including) 3
    print(fruits[1:3]) # Output: ['blueberry', 'cherry']


```

**Common mistake:** using an index that does not exist. A list of 3 elements has indexes `0`, `1` and `2`, so `fruits[3]` stops the program with an `IndexError`.

```python

    fruits = ["apple", "banana", "cherry"]

    # ❌ WRONG: there is no fourth element
    print(fruits[3])

    # ✅ CORRECT: the last element is at len(list) - 1, or simply at -1
    print(fruits[len(fruits) - 1])
    print(fruits[-1])


```

---

## 2. Tuples

Tuples are like lists, but **immutable**: once a tuple is created, you cannot change, add or remove its elements. They are used for data that should stay fixed, such as map coordinates or the RGB values of a color. Because they cannot change, they are also slightly lighter than lists.

**Syntax**: Round brackets `()`.

```python

    # Creating a tuple
    coordinates = (10, 20)
    
    # Accessing items works the same as with lists
    print(coordinates[0])  # Output: 10
    
    # This would stop the program with an error:
    # coordinates[0] = 15  <-- TypeError: 'tuple' object does not support item assignment
    
    # Unpacking: storing each value in its own variable
    x, y = coordinates
    print(x)  # Output: 10


```

**Common mistake:** creating a tuple with a single element and forgetting the comma. Without it, Python sees just a value between parentheses.

```python

    # ❌ WRONG: this is the number 5, not a tuple
    single = (5)

    # ✅ CORRECT: the trailing comma makes it a tuple
    single = (5,)


```

---

## 3. Dictionaries

Dictionaries store data in `key: value` pairs, like a real dictionary where you look up a word (the key) to find its definition (the value). They are **ordered** (they keep insertion order since Python 3.7), **mutable**, and each key can only appear once. They are Python's equivalent of Java's `HashMap` or JavaScript objects.

**Syntax**: Curly braces `{}` with a colon `:` between each key and its value.

```python

    # Creating a dictionary
    student = {
        "name": "John",
        "age": 25,
        "courses": ["Math", "CompSci"]
    }
    
    # Accessing values by key
    print(student["name"])      # Output: John
    print(student.get("age"))   # Output: 25
    
    # Adding/Updating pairs
    student["grade"] = "A"   # New key, so a new pair is added
    student["age"] = 26      # Existing key, so its value is replaced


```

**Common mistake:** reading a key that does not exist with square brackets. The program stops with a `KeyError`. The `.get()` method returns `None` (no value) or a default value you choose instead.

```python

    # ❌ WRONG: "phone" does not exist, KeyError
    print(student["phone"])

    # ✅ CORRECT: returns "Not available" when the key does not exist
    print(student.get("phone", "Not available"))


```

---

## 4. Sets

Sets are collections that are **unordered**, have **no indexes** and **do not allow duplicates**: each value appears only once. They are useful to remove repeated values, to check very quickly whether something is included, and for mathematical operations such as unions (combining) and intersections (common elements).

**Syntax**: Curly braces `{}`, but without colons.

```python

    # Creating a set
    unique_ids = {101, 102, 103, 102} 
    
    # Duplicates are removed automatically
    print(unique_ids)  # Output: {101, 102, 103}
    
    # Checking whether a value is included (very fast)
    if 101 in unique_ids:
        print("ID found!")
        
    # Adding items
    unique_ids.add(104)

    # Common elements between two sets
    print({1, 2, 3} & {2, 3, 4})  # Output: {2, 3}


```

**Common mistake:** creating an empty set with `{}`. Empty curly braces create an empty *dictionary*, not a set.

```python

    # ❌ WRONG: this is an empty dictionary
    tags = {}
    tags.add("python")  # AttributeError: 'dict' object has no attribute 'add'

    # ✅ CORRECT: set() creates an empty set
    tags = set()
    tags.add("python")


```

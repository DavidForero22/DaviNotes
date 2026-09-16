---
title: "Functions & Data Handling in PHP"
---

# Functions & Data Handling

Once you know the basic syntax, the next step is to organize your code and work with data. This guide explains how to create **functions** (reusable blocks of code) and how to handle the two most common types of data in web development: **strings** (text) and **arrays** (lists of values).

---

## Table of Contents

<div id="content-table">

- [1. User-defined Functions](#1-user-defined-functions "Jump to user-defined functions section")
- [2. Parameters and Return Values](#2-parameters-and-return-values "Learn about arguments and return values")
- [3. String Manipulation](#3-string-manipulation "See string manipulation techniques")
- [4. Working with Arrays](#4-working-with-arrays "Explore PHP array structures")
    - [4.1. Indexed Arrays](#41-indexed-arrays "Arrays with numeric indexes for ordered data")
    - [4.2. Associative Arrays](#42-associative-arrays "Arrays that use named keys to store values")
    - [4.3. Multidimensional Arrays](#43-multidimensional-arrays "Arrays containing other arrays for complex data structures")
- [5. Common Array Functions](#5-common-array-functions "View built-in array helper functions")

</div>

---

## 1. User-defined Functions

A **function** is a named block of instructions that you can run as many times as you want, just by writing its name. It is like a recipe: you write it once and follow it whenever you need it.

A function does not run on its own when the page loads; it only runs when it is **called**. To create one, start with the word `function`, followed by its name and parentheses.

```php

    <?php
    // Defining the function (writing the recipe)
    function writeMessage() {
        echo "Hello, welcome to PHP development!";
    }

    // Calling the function (following the recipe)
    writeMessage();
    writeMessage(); // It can be called as many times as needed
    ?>


```

---

## 2. Parameters and Return Values

Functions become much more useful when they can receive data and give back a result.

**Parameters** are variables listed in the parentheses of the function. The values you pass when calling it are called **arguments**.

```php

    <?php
    function familyName($firstName) {
        echo "$firstName Jaeger.<br>";
    }

    familyName("Eren"); // Outputs: Eren Jaeger.
    familyName("Zeke"); // Outputs: Zeke Jaeger.
    ?>


```

To make a function give back a value, use the `return` statement. The result can then be stored in a variable or used in another operation.

```php

    <?php
    function sum($x, $y) {
        $z = $x + $y;
        return $z;
    }

    echo "5 + 10 = " . sum(5, 10); // Outputs: 5 + 10 = 15
    ?>


```

**Common mistake:** using `echo` inside a function when you need the result. `echo` only prints the value on the page; the code that called the function receives nothing.

```php

    <?php
    // ❌ WRONG: prints 15, but sum() gives back nothing (NULL), so $total ends up as 0
    function sum($x, $y) {
        echo $x + $y;
    }
    $total = sum(5, 10) * 2;

    // ✅ CORRECT: return gives the value back, so $total is 30
    function sum($x, $y) {
        return $x + $y;
    }
    $total = sum(5, 10) * 2;
    ?>


```

**Common mistake:** using a variable from outside the function. Each function has its own separate space for variables (its *scope*), so it cannot see variables created outside. Pass them as parameters instead.

```php

    <?php
    $taxRate = 0.21;

    // ❌ WRONG: $taxRate does not exist inside the function (Warning: Undefined variable)
    function addTax($price) {
        return $price + $price * $taxRate;
    }

    // ✅ CORRECT: the value is received as a parameter
    function addTax($price, $taxRate) {
        return $price + $price * $taxRate;
    }

    echo addTax(100, $taxRate); // Outputs: 121
    ?>


```

---

## 3. String Manipulation

A **string** is a piece of text. Since building web pages is mostly about producing text (HTML), PHP includes many built-in functions to work with strings.

These are some of the most common **string functions**:

* `strlen()`: Returns the number of characters in a string.
* `str_word_count()`: Counts the number of words in a string.
* `strtoupper()` / `strtolower()`: Converts the text to capital / lowercase letters.
* `strpos()`: Finds the position of a text inside another text.
* `str_replace()`: Replaces some text with another text.

Example:

```php

    <?php
    $text = "Hello World";

    // Get the length
    echo strlen($text); // Outputs: 11

    // Replace text
    echo str_replace("World", "PHP", $text); // Outputs: Hello PHP

    // Convert to capital letters
    echo strtoupper($text); // Outputs: HELLO WORLD
    ?>


```

*Note: `strlen()` counts bytes, so letters with accents (like `é` or `ñ`) count as two. Use `mb_strlen()` when your text may contain them.*

---

## 4. Working with Arrays

An **array** stores several values in a single variable, like a list. In PHP, arrays are extremely flexible and are used everywhere, from configuration settings to the results of a database query.

### 4.1. Indexed Arrays
Arrays where each value has a numeric position (the **index**), assigned automatically and starting at `0`.

```php

    <?php
    $cars = ["Volvo", "BMW", "Toyota"];
    
    echo "I like " . $cars[0] . " and " . $cars[1]; // Outputs: I like Volvo and BMW
    ?>


```

The short syntax `[...]` is the modern way to create arrays. You will also see the older form `array("Volvo", "BMW", "Toyota")`, which does exactly the same.

### 4.2. Associative Arrays
Arrays where each value has a **key** (a name) that you choose, instead of a number. They are similar to JSON objects or Python dictionaries.

```php

    <?php
    $ages = ["Peter" => 35, "Ben" => 37, "Joe" => 43];

    // Accessing values by key
    echo "Peter is " . $ages["Peter"] . " years old.";
    ?>


```

### 4.3. Multidimensional Arrays
Arrays that contain other arrays, like a table with rows and columns. They are typical when working with lists of records, such as the users of a website.

```php

    <?php
    $contacts = [
        ["name" => "Peter", "email" => "peter@test.com"],
        ["name" => "Ben", "email" => "ben@test.com"],
    ];

    // First row, "email" column
    echo $contacts[0]["email"]; // Outputs: peter@test.com
    ?>


```

**Common mistake:** trying to print a whole array with `echo`. `echo` only works with simple values, so it shows the word `Array` and a warning. Use `print_r()` (or `var_dump()`) to see its content while testing.

```php

    <?php
    $cars = ["Volvo", "BMW"];

    // ❌ WRONG: prints "Array" (Warning: Array to string conversion)
    echo $cars;

    // ✅ CORRECT: shows every element with its index
    print_r($cars); // Outputs: Array ( [0] => Volvo [1] => BMW )
    ?>


```

---

## 5. Common Array Functions

PHP includes a large library of functions to work with arrays.

* `count()`: Returns the number of elements.
* `sort()` / `rsort()`: Sorts the array in ascending / descending order.
* `array_push()`: Adds one or more elements to the end. The short form `$array[] = value;` does the same for a single element.
* `in_array()`: Checks whether a value exists in the array.

```php

    <?php
    $fruits = ["Apple", "Banana"];

    // Add a new item (both lines do the same)
    array_push($fruits, "Orange");
    $fruits[] = "Mango";

    echo count($fruits); // Outputs: 4

    // Check whether a value exists
    if (in_array("Apple", $fruits)) {
        echo "We have apples!";
    }
    ?>


```

**Common mistake:** trusting `in_array()` with values of different types. By default it compares loosely (like `==`), so a text like `"1e1"` is considered equal to the number `10`. Pass `true` as the third argument for a strict comparison (like `===`).

```php

    <?php
    $allowedIds = [10, 20, 30];

    // ❌ WRONG: "1e1" (scientific notation for 10) is accepted as a valid id
    in_array("1e1", $allowedIds);       // true

    // ✅ CORRECT: strict mode also compares the type
    in_array("1e1", $allowedIds, true); // false
    ?>


```

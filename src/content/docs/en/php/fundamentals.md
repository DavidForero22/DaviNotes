---
title: "PHP Fundamentals"
---

# PHP Fundamentals

This guide introduces the core building blocks of PHP. PHP is a **server-side** language: its code runs on the **server** (the computer that hosts the website), not in the visitor's browser. The server executes the PHP code, produces an HTML page as a result and sends only that HTML to the browser. That is why visitors never see your PHP code.

This is the opposite of **JavaScript** in the browser, which is sent to the visitor's device and runs there.

---

## Table of Contents

<div id="content-table">

- [1. Basic Syntax](#1-basic-syntax "Introduction to PHP syntax")
    - [1.1. Embedding PHP in HTML](#11-embedding-php-in-html "How to insert PHP code within HTML documents")
- [2. Variables and Constants](#2-variables-and-constants "Defining and using variables and constants in PHP")
    - [2.1. Variable Rules](#21-variable-rules "Rules for naming and using PHP variables")
    - [2.2. Constants](#22-constants "How to create and use constants in PHP")
- [3. Data Types](#3-data-types "Overview of PHP data types")
- [4. Operators](#4-operators "Using arithmetic, comparison, and logical operators in PHP")
- [5. Control Structures](#5-control-structures "Managing the flow of code with conditions and loops")
    - [5.1. Conditional Statements](#51-conditional-statements "Using if, elseif, else to control execution")
    - [5.2. Loops](#52-loops "Repeating code blocks using loops")

</div>

---

## 1. Basic Syntax

A PHP file (ending in `.php`) usually mixes normal HTML with pieces of PHP code. The PHP code goes between the tags `<?php` and `?>`: everything inside is executed on the server, and everything outside is sent to the browser as it is.

```php

    <?php
    // PHP code goes here
    echo "Hello, World!";
    ?>


```

`echo` writes text into the page that will be sent to the browser.

Every PHP instruction must end with a semicolon (`;`), like the full stop at the end of a sentence. A missing semicolon is the most common error for beginners.

```php

    <?php
    // ❌ WRONG: missing semicolon (Parse error: syntax error, unexpected token "echo")
    echo "Hello"
    echo "World";

    // ✅ CORRECT
    echo "Hello";
    echo "World";
    ?>


```

**Comments** are notes for people reading the code; PHP ignores them. They can be written in three ways:

```php

    <?php
    // This is a single-line comment

    # This is also a single-line comment

    /*
    This is a comment block
    that spans several lines
    */
    ?>


```

### 1.1. Embedding PHP in HTML

PHP code can be placed directly inside an HTML document. This lets you combine the fixed structure of the page (HTML) with content that changes (PHP).

```php

    <!DOCTYPE html>
    <html>
    <head>
        <title>My PHP Page</title>
    </head>
    <body>
        <h1>Welcome to my website</h1>
        <p>
            <?php
            $name = "Alice";
            echo "Hello, " . $name . "!";
            ?>
        </p>
    </body>
    </html>


```

In this example, the PHP code inside the `<p>` tag generates the greeting, while the rest of the HTML stays the same. The browser only receives `<p>Hello, Alice!</p>`. This is one of the most common ways PHP is used.

The dot `.` joins pieces of text together (this is called *concatenation*).

---

## 2. Variables and Constants

A **variable** is a named box that stores a value so you can use it later. PHP is *loosely typed*: you do not have to say whether a variable will hold a number or a text; PHP works it out from the value.

### 2.1. Variable Rules
* A variable always starts with the `$` sign, followed by its name.
* The name must start with a letter or an underscore (`_`), never with a number.
* Variable names are **case-sensitive** (`$age` and `$AGE` are two different variables).

```php

    <?php
    $txt = "Learning PHP";
    $x = 5;
    $y = 10.5;
    
    echo $txt;
    echo $x + $y; // Outputs: 15.5
    ?>


```

**Common mistake:** forgetting the `$` sign. Without it, PHP does not understand that you mean a variable.

```php

    <?php
    $name = "Alice";

    // ❌ WRONG: "name" without $ is not a variable (Error: Undefined constant "name")
    echo name;

    // ✅ CORRECT
    echo $name;
    ?>


```

### 2.2. Constants

**Constants** are like variables, but once they are defined their value can never change. They are used for fixed settings, such as the website address. They do not use the `$` prefix and, by convention, are written in capital letters.

```php

    <?php
    // Using define()
    define("SITE_URL", "https://mysite.com");

    // Using the const keyword
    const MAX_USERS = 50;

    echo SITE_URL;
    ?>


```

---

## 3. Data Types

PHP supports several data types to store different kinds of information.

1. **String**: A piece of text (`"Hello"`).
2. **Integer**: A whole number (`10`, `-5`).
3. **Float**: A number with decimals (`3.14`).
4. **Boolean**: Only two possible values, `true` or `false`.
5. **Array**: A list that stores several values in a single variable.
6. **NULL**: The absence of a value.

```php

    <?php
    $string = "Hello world";
    $int = 5985;
    $float = 10.365;
    $is_active = true;
    $colors = ["Red", "Green", "Blue"];
    $empty = null;

    var_dump($float); // Shows the type and value: float(10.365)
    ?>


```

`var_dump()` is very useful while learning: it shows both the type and the value of a variable.

**Double quotes vs single quotes:** inside double quotes, PHP replaces variables with their value. Inside single quotes, the text is shown exactly as written.

```php

    <?php
    $name = "Alice";

    // ❌ WRONG (if you want the value): single quotes print the text literally
    echo 'Hello, $name'; // Outputs: Hello, $name

    // ✅ CORRECT: double quotes insert the value of the variable
    echo "Hello, $name"; // Outputs: Hello, Alice
    ?>


```

---

## 4. Operators

Operators are symbols that perform operations on values, such as adding numbers or comparing them.

### Arithmetic Operators
Standard math operations: `+` (add), `-` (subtract), `*` (multiply), `/` (divide) and `%` (remainder of a division).

### Comparison Operators
They compare two values and return `true` or `false`. Pay special attention to the difference between `==` and `===`.

* `==`: Equal (the values are equal, even if their types are different).
* `===`: Identical (the values **and** the types are equal).
* `!=`: Not equal.
* `>` / `<`: Greater than / Less than.

```php

    <?php
    $x = 100;  
    $y = "100";

    var_dump($x == $y);  // bool(true): the values are equal
    var_dump($x === $y); // bool(false): the types are different (int vs string)
    ?>


```

**Common mistake:** using `==` when the type matters. For example, `strpos()` returns the position where a text is found, which can be `0` (the very beginning), or `false` if it is not found. With `==`, `0` and `false` are considered equal.

```php

    <?php
    $text = "PHP is fun";

    // ❌ WRONG: "PHP" is at position 0, and 0 == false is true, so it says "not found"
    if (strpos($text, "PHP") == false) {
        echo "Not found";
    }

    // ✅ CORRECT: === only matches a real false
    if (strpos($text, "PHP") === false) {
        echo "Not found";
    }
    ?>


```

### Logical Operators
Used to combine conditions:
* `&&` (and): both conditions must be true.
* `||` (or): at least one condition must be true.
* `!` (not): reverses the result.

---

## 5. Control Structures

By default, a script runs its instructions one after another. **Control structures** change that order: they let the code make decisions or repeat actions.

### 5.1. Conditional Statements

Conditional statements run different blocks of code depending on whether a condition is true. The most common form is `if...elseif...else` ("if... otherwise if... otherwise").

```php

    <?php
    $hour = (int) date("H"); // Current hour as a whole number (0-23)

    if ($hour < 10) {
        echo "Have a good morning!";
    } elseif ($hour < 20) {
        echo "Have a good day!";
    } else {
        echo "Have a good night!";
    }
    ?>


```

PHP also offers a short way to write a simple `if...else`, called the **ternary operator**: `condition ? value_if_true : value_if_false`.

```php

    <?php
    $age = 20;

    $message = $age >= 18 ? "Adult" : "Minor";

    echo $message; // Outputs: Adult
    ?>


```

### 5.2. Loops
**Loops** repeat a block of code as long as a condition is true.

**While Loop:**

```php

    <?php
    $x = 1;

    while ($x <= 5) {
        echo "The number is: $x <br>";
        $x++; // Adds 1 to $x
    }
    ?>


```

**Common mistake:** forgetting to update the variable of the condition. The condition is always true, so the loop never ends and the page never finishes loading.

```php

    <?php
    $x = 1;

    // ❌ WRONG: $x is always 1, infinite loop
    while ($x <= 5) {
        echo $x;
    }

    // ✅ CORRECT: $x increases until the condition is false
    while ($x <= 5) {
        echo $x;
        $x++;
    }
    ?>


```

**Foreach Loop:**

The `foreach` loop goes through every element of an array, one by one. It is one of the most used loops in PHP, for example to display a list of products coming from a database.

```php

    <?php
    $colors = ["red", "green", "blue", "yellow"];

    foreach ($colors as $color) {
        echo "$color <br>";
    }
    ?>


```

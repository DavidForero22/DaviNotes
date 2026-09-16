---
title: "Basic Syntax in Python"
---

# Basic Syntax

Python is a programming language known for being easy to read, often close to plain English. Three terms you will hear about it:

- **Interpreted:** you do not need a separate step to translate (compile) your code before running it; Python reads and runs it line by line.
- **High-level:** it hides many technical details of the computer, so you can focus on the problem you are solving.
- **Dynamically typed:** you do not have to say in advance whether a variable holds a number or a text; Python works it out on its own.

Unlike **Java** or **C++**, Python does not use curly braces `{}` to group code, and it does not need a semicolon `;` at the end of each line. Instead, it uses **indentation** (the spaces at the beginning of a line) to show which lines belong together.

---

## Table of Contents
<div id="content-table">

- [1. Structure](#1-structure "Learn about indentation and Python code structure")
- [2. Variables](#2-variables "Overview of Python variables")
- [3. Operators](#3-operators "Arithmetic, logical and comparison operators in Python")
- [4. Control Structures](#4-control-structures "Manage program flow using conditions and loops")
  - [4.1 Conditional Statements](#41-conditional-statements "Using if, elif and else statements")
  - [4.2 Loops](#42-loops "Repeating code blocks using for or while loops")
    - [A) For Loops](#a-for-loops "Iterate over sequences or ranges of numbers")
    - [B) While Loops](#b-while-loops "Loop while a condition is true")

</div>

---

## 1. Structure

In Python, indentation is not just for looks: it is a rule of the language. The lines that belong to a block (for example, the lines that should run only *if* a condition is true) must be indented with the same number of spaces, usually 4.

**Comments** start with a hash symbol (`#`). Python ignores the rest of the line after it; comments are notes for people reading the code.

```python

    # This is a comment
    # Python uses indentation to define blocks
    if 5 > 2:
        print("Five is greater than two!")  # This line is inside the if block
        
    print("This is outside the block")


```

`print()` shows a message on the screen (in the *console*, the text window where programs display their output).

**Key Rules**:
- **Consistency**: All lines in the same block must have the same indentation.
- **Colon** (`:`): Lines that open a block (like `if`, `for`, `def`) always end with a colon, which means "an indented block follows".
- **No Semicolons**: You do not need to end lines with `;`.

**Common mistake:** mixing different indentations in the same block. Python stops with an `IndentationError`.

```python

    # ❌ WRONG: the second line has 2 spaces instead of 4
    if 5 > 2:
        print("Five is greater than two!")
      print("This line breaks the program")

    # ✅ CORRECT: both lines use the same indentation
    if 5 > 2:
        print("Five is greater than two!")
        print("Both lines are inside the block")


```

---

## 2. Variables

A **variable** is a named box that stores a value so you can use it later. You create one simply by giving it a name and a value with `=`. Python is **dynamically typed**, so you do not declare the type: it is decided automatically from the value, and it can even change later.

Variable names are case-sensitive (`age` and `Age` are different) and usually follow the `snake_case` style: lowercase words separated by underscores.

- **Numbers**: `int` (whole numbers), `float` (decimal numbers), `complex` (complex numbers, used in mathematics)
- **Strings** (`str`): Text written between single `'` or double `"` quotes
- **Booleans** (`bool`): `True` or `False`, always with a capital first letter

Example:

```python

    # Numbers
    x = 5           # int
    y = 3.14        # float
    z = 1j          # complex

    # String
    name = "Python"

    # Boolean
    is_active = True

    # Dynamic typing: the same variable now holds a text
    x = "Now I'm a string"


```

You can create **multiline strings** using triple quotes (`"""` or `'''`). This is useful for long texts that span several lines.

```python

    x = """This is a
    very long text,
    so it can be written across multiple lines."""


```

**Common mistake:** joining text and numbers with `+`. Python does not convert the number to text automatically and stops with a `TypeError`. The easiest solution is an **f-string**: put an `f` before the quotes and write variables between `{}`.

```python

    age = 25

    # ❌ WRONG: cannot add a str and an int
    print("I am " + age + " years old")

    # ✅ CORRECT: the f-string inserts the value inside the text
    print(f"I am {age} years old")


```

---

## 3. Operators

Operators are symbols that perform operations on values, such as adding numbers or comparing them. Python uses English words for logical operations, so conditions read almost like a sentence.

**Arithmetic Operators**

```python

    x = 10
    y = 3

    print(x + y)   # Addition: 13
    print(x / y)   # Division: 3.3333333333333335
    print(x // y)  # Floor division, drops the decimals: 3
    print(x % y)   # Remainder of the division: 1
    print(x ** y)  # Power (10 to the power of 3): 1000


```

**Comparison Operators**

They compare two values and return `True` or `False`: `==` (equal), `!=` (not equal), `>` (greater than), `<` (less than), `>=` (greater or equal) and `<=` (less or equal).

**Common mistake:** confusing `=` with `==`. A single `=` *stores* a value; a double `==` *compares* two values.

```python

    age = 18

    # ❌ WRONG: = tries to store a value inside the condition (SyntaxError)
    if age = 18:
        print("Just turned adult")

    # ✅ CORRECT: == asks "is age equal to 18?"
    if age == 18:
        print("Just turned adult")


```

**Logical Operators**

Where Java uses the symbols `&&`, `||` and `!`, Python uses the words `and`, `or` and `not`.

| Operator | Description | Example |
| :--- | :--- | :--- |
| `and` | Returns `True` only if **both** conditions are true. | `x > 5 and x < 10` |
| `or` | Returns `True` if **at least one** of the conditions is true. | `x < 5 or x > 10` |
| `not` | Reverses the result: `True` becomes `False` and vice versa. | `not x > 5` |


```python

    age = 25
    has_license = True

    if age >= 18 and has_license:
        print("You can drive.")
        
    if not has_license:
        print("You cannot drive.")


```

```python

    # ❌ WRONG: && is not valid in Python (SyntaxError)
    if age >= 18 && has_license:
        print("You can drive.")

    # ✅ CORRECT
    if age >= 18 and has_license:
        print("You can drive.")


```

---

## 4. Control Structures

By default, a program runs its instructions one after another. **Control structures** change that order: they let the program make decisions or repeat code. In Python they rely on *indentation and colons* (`:`) instead of the curly braces `{}` used in Java or C++.

Parentheses `()` around conditions are optional and are usually left out.

### 4.1 Conditional Statements

Python uses the keywords `if` (if), `elif` (short for "else if") and `else` (otherwise). Only the first block whose condition is true runs.

```python

    temperature = 28

    if temperature > 30:
        print("It's hot outside")
    elif temperature > 20:
        print("It's a nice day")
    else:
        print("It's cold")


```

Python also has a short way to write a simple condition in a single line, called a **conditional expression** (or *ternary*): `value_if_true if condition else value_if_false`.

```python

    admin = True

    message = "Welcome, admin!" if admin else "Access denied"

    print(message)  # Output: Welcome, admin!


```

### 4.2 Loops

**Loops** repeat a block of code. Python has two main kinds.

#### A) For Loops

Unlike Java's `for (int i = 0; i < 10; i++)`, Python's `for` loop goes through the items of a sequence one by one: the elements of a list, the letters of a text, or a range of numbers.

```python

    # range(5) generates the numbers 0, 1, 2, 3, 4
    for i in range(5):
        print(i)

    # Going through a list
    colors = ["red", "green", "blue"]
    for color in colors:
        print("Current color: " + color)


```

**Common mistake:** expecting `range(5)` to include the number 5. The range stops just *before* the end value.

```python

    # ❌ WRONG: expects 1, 2, 3, 4, 5 but prints 0, 1, 2, 3, 4
    for i in range(5):
        print(i)

    # ✅ CORRECT: range(start, stop) prints 1, 2, 3, 4, 5
    for i in range(1, 6):
        print(i)


```

#### B) While Loops

The `while` loop repeats a block of code as long as a condition is true.

```python

    count = 0

    while count < 3:
        print("Count is:", count)
        count += 1  # Adds 1 to count


```

**Common mistake:** using `++` to add one, as in Java or JavaScript. Python does not have that operator.

```python

    # ❌ WRONG: count++ is a SyntaxError in Python
    count++

    # ✅ CORRECT
    count += 1


```

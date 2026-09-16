---
title: "Forms & Server Interaction in PHP"
---

# Forms & Server Interaction

The real power of PHP is its ability to react to what users do. This guide covers how to receive the data that people send through HTML forms, the difference between the two ways of sending it, and, most importantly, how to handle that data **safely**.

*If you are not familiar with HTML forms yet, read the HTML Forms guide first.*

---

## Table of Contents

<div id="content-table">

- [1. The Superglobals](#1-the-superglobals "Understand $_GET and $_POST variables")
- [2. Handling Form Submissions](#2-handling-form-submissions "How to access form data")
- [3. Security: Sanitization & Validation](#3-security-sanitization--validation "Prevent XSS and validate inputs")
- [4. Complete Form Example](#4-complete-form-example "A full working example")

</div>

---

## 1. The Superglobals

When a browser asks the server for a page, it sends a **request** that can include data. PHP automatically stores that data in special variables called **superglobals**, which are available anywhere in your code. The two most important ones for forms are `$_GET` and `$_POST`.

Both are **associative arrays**: each value is stored under a key that matches the `name` attribute of the form field.

### The $_GET Variable
Contains the data sent with the GET method:
* The data is visible in the URL, after a `?` (e.g., `process.php?name=John&age=25`).
* URLs have a limited length, so it is only suitable for small amounts of data.
* **Best for:** search forms, filters, pagination, or any page you might want to bookmark or share. Never for passwords.

```php

    <?php
    // URL visited: process.php?name=John&age=25

    if (isset($_GET['name']) && isset($_GET['age'])) {
        echo "Name: " . htmlspecialchars($_GET['name']) . "<br>";
        echo "Age: " . htmlspecialchars($_GET['age']);
    }
    ?>


```

`isset()` checks that a value exists before using it. `htmlspecialchars()` makes the value safe to display (see section 3).

### The $_POST Variable
Contains the data sent with the POST method:
* The data is **not** visible in the URL: it travels inside the body of the request.
* It can carry much more data (the maximum size is set in the server configuration).
* **Best for:** login forms, sign-ups, publishing content, uploading files, or anything that changes data on the server.

```php

    <?php
    // Data sent by an HTML form with method="post"

    if (isset($_POST['email'])) {
        echo "Email received: " . htmlspecialchars($_POST['email']);
    }
    ?>


```

**Common mistake:** reading a field without checking that it exists. The first time the page loads, the form has not been sent yet, so the key does not exist and PHP shows a warning.

```php

    <?php
    // ❌ WRONG: Warning: Undefined array key "email" when the form was not sent
    $email = $_POST['email'];

    // ✅ CORRECT: ?? uses an empty text when the key does not exist
    $email = $_POST['email'] ?? '';
    ?>


```

---

## 2. Handling Form Submissions

To process a form, you usually check which method was used to request the page and then read the values using the `name` of each field as the key.

### HTML Form Setup
Notice the `action` (which file receives the data) and `method` (how it is sent) attributes.

```html

    <form action="welcome.php" method="post">
        <label for="fname">Name:</label>
        <input type="text" id="fname" name="fname">

        <label for="email">E-mail:</label>
        <input type="email" id="email" name="email">

        <button type="submit">Send</button>
    </form>


```

### PHP Processing (welcome.php)
The value of each field is available as `$_POST['name_of_the_field']`.

```php

    <?php
    // Check that the page was requested by submitting the form (POST)
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        
        // Read the value of the "fname" field
        $name = trim($_POST['fname'] ?? ''); // trim() removes spaces at the start and end
        
        if (empty($name)) {
            echo "Name is empty";
        } else {
            echo "Hello, " . htmlspecialchars($name);
        }
    }
    ?>


```

`$_SERVER` is another superglobal with information about the request; `REQUEST_METHOD` tells whether it was `GET` or `POST`.

---

## 3. Security: Sanitization & Validation

**Never trust user input.** This is the golden rule of server-side development. Anyone can type anything into a form, including malicious code. If you show that data on a page without preparing it first, an attacker could make the browsers of other visitors run their scripts. This attack is called **XSS** (Cross-Site Scripting), and it can be used to steal accounts or personal data.

### Sanitization (Cleaning)
**Sanitizing** means transforming the data so it cannot cause harm. The most important function for displaying data is `htmlspecialchars()`: it converts characters with a special meaning in HTML (such as `<` and `>`) into harmless codes, so the browser shows them as text instead of running them.

```php

    <?php
    $raw_input = "<script>alert('Hacked');</script>";

    // ❌ WRONG: the browser receives a real <script> tag and runs it
    echo $raw_input;

    // ✅ CORRECT: < becomes &lt; and > becomes &gt;, so the text is only displayed
    echo htmlspecialchars($raw_input);
    ?>


```

### Validation (Checking)
**Validating** means checking that the data has the expected format (is it a real email? is the age a number?) and rejecting it if not. PHP's `filter_var()` function includes ready-made checks for the most common cases.

```php

    <?php
    $email = $_POST["email"] ?? "";

    // Remove characters that are not allowed in an email address
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);

    // Check that the result is a valid email address
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Invalid email format"; 
    } else {
        echo "Email is valid";
    }
    ?>


```

**Remember:** the validation attributes of HTML (`required`, `type="email"`...) are only a convenience for the user. They can be bypassed easily, so PHP must always validate the data again on the server.

---

## 4. Complete Form Example

This example combines HTML and PHP in a single file that shows the form and also processes it (often called a "self-processing form").

```php

    <?php
    $name = "";
    $nameErr = "";

    // Only process the data when the form has been submitted
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        if (empty($_POST["name"])) {
            $nameErr = "Name is required";
        } else {
            // Sanitize the input before storing or displaying it
            $name = htmlspecialchars(trim($_POST["name"]));
        }
    }
    ?>

    <!-- htmlspecialchars() also protects the URL of the current page -->
    <form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>">
        <label for="name">Name:</label>
        <!-- value keeps what the user typed if the page reloads -->
        <input type="text" id="name" name="name" value="<?php echo $name; ?>">
        
        <span class="error">* <?php echo $nameErr; ?></span>
        
        <button type="submit">Submit</button>
    </form>

    <?php
    if ($name) {
        echo "<h2>Your Input:</h2>";
        echo "Welcome back, " . $name;
    }
    ?>


```

`$_SERVER["PHP_SELF"]` contains the address of the current file, so the form sends the data to the same page.

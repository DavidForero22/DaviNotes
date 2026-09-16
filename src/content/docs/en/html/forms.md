---
title: "Forms in HTML"
---

# Forms

Forms are the main way to collect information from the people who visit a website. Login screens, search bars, contact pages and checkout pages are all forms. They let the **client** (the browser on the visitor's device) send data to the **server** (the computer where the website lives and where that data is processed).

Building a form involves two things: creating the controls people interact with (text boxes, checkboxes, buttons...) and defining how and where the data should be sent when the form is submitted.

---

## Table of Contents

<div id="content-table">

- [1. The Form Element](#1-the-form-element "Understanding action and method attributes")
- [2. Input Types](#2-input-types "Common input fields like text, password, and email")
  - [2.1 Button Types](#21-button-types "Difference between submit, button, and reset")
- [3. Labels & Accessibility](#3-labels--accessibility "Linking labels to inputs for screen readers")
- [4. Basic Validation](#4-basic-validation "Using built-in HTML attributes to enforce rules")

</div>

---

## 1. The Form Element

The `<form>` element is a container for all the controls of a form. It defines **where** the data goes and **how** it is sent.

```html

    <form action="/submit-data" method="POST">
        <!-- The form controls go here -->
    </form>


```

**Key Attributes:**

- `action`: The address (URL) where the form data will be sent to be processed.

- `method`: The way the data is sent. The two options are HTTP methods, the "verbs" browsers use to talk to servers:

    - `GET`: Adds the data to the end of the URL (e.g., `/search?q=shoes`). Useful for searches because the result can be bookmarked or shared, but never use it for passwords or private data, since they would be visible in the address bar and in the browser history.

    - `POST`: Sends the data inside the body of the request, so it does not appear in the URL. Use it for logins, sign-ups and any data that changes something on the server. Keep in mind that POST alone does not encrypt anything: the site must also use HTTPS to protect the data.

```html

    <!-- ❌ WRONG: the password would appear in the URL: /login?password=1234 -->
    <form action="/login" method="GET">
        <input type="password" name="password">
    </form>

    <!-- ✅ CORRECT: the password travels in the body of the request -->
    <form action="/login" method="POST">
        <input type="password" name="password">
    </form>


```

---

## 2. Input Types

The `<input>` element is the most versatile form control: it changes completely depending on its `type` attribute.

**Common Input Types:**

<table>
    <thead>
        <tr>
            <th>Type</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>text</td>
            <td>A standard single-line text field.</td>
        </tr>
        <tr>
            <td>password</td>
            <td>Hides the characters as they are typed (shows dots or asterisks).</td>
        </tr>
        <tr>
            <td>email</td>
            <td>Checks that the text looks like an email address. On phones, it also shows a keyboard with the @ symbol.</td>
        </tr>
        <tr>
            <td>number</td>
            <td>Only accepts numbers.</td>
        </tr>
        <tr>
            <td>checkbox</td>
            <td>A box that can be ticked. Several checkboxes can be selected at the same time.</td>
        </tr>
        <tr>
            <td>radio</td>
            <td>A round option button. Only one option can be selected within a group that shares the same <code>name</code>.</td>
        </tr>
        <tr>
            <td>submit</td>
            <td>A button that sends the form.</td>
        </tr>
    </tbody>
</table>

**Other Form Controls:**

Besides `<input>`, there are other tags for specific kinds of data:

- `<textarea>`: A text box for multiple lines (comments, biographies...).

- `<select>` and `<option>`: A dropdown menu and each of its options.

- `<button>`: A clickable button (it can submit the form or run JavaScript code).

```html

    <form>
        <input type="text" name="username" placeholder="Enter Username">

        <input type="password" name="password" placeholder="Secret">

        <select name="role">
            <option value="user">User</option>
            <option value="admin">Admin</option>
        </select>

        <button type="submit">Login</button>
    </form>


```

The `placeholder` attribute shows a hint in grey inside the empty field.

**Note:** The `name` attribute is essential. It is the label the server receives next to each value. Without it, the data of that field is not sent at all.

```html

    <!-- ❌ WRONG: no name, so the server never receives the email -->
    <input type="email">

    <!-- ✅ CORRECT: the server receives email=the-value-typed -->
    <input type="email" name="email">


```

### 2.1 Button Types

The `<button>` element can have different `type` values that define what it does:

<table>
  <thead>
    <tr>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>submit</td>
      <td>Sends the form data to the server. This is the default behavior when a button inside a form has no <code>type</code>.</td>
    </tr>
    <tr>
      <td>button</td>
      <td>A generic button that does nothing on its own. It is usually combined with JavaScript.</td>
    </tr>
    <tr>
      <td>reset</td>
      <td>Restores every field of the form to its initial value.</td>
    </tr>
  </tbody>
</table>

**Example:**

```html

    <form id="myForm">
        <input type="text" name="username" placeholder="Username">

        <!-- Submit button: sends the username -->
        <button type="submit">Submit</button>

        <!-- Reset button: empties the username field -->
        <button type="reset">Clear</button>

        <!-- Generic button: runs JavaScript and does not submit -->
        <button type="button" onclick="alert('Clicked!')">Click Me</button>
    </form>


```

**Tip:** Always write `type="button"` on buttons that should not submit the form. A `<button>` without a type inside a form acts as `submit`, which can send the form by accident.

```html

    <form action="/checkout" method="POST">
        <!-- ❌ WRONG: no type, so clicking "Show details" also sends the form -->
        <button onclick="showDetails()">Show details</button>

        <!-- ✅ CORRECT: this button only runs the JavaScript function -->
        <button type="button" onclick="showDetails()">Show details</button>
    </form>


```

---

## 3. Labels & Accessibility

Every form field should have a `<label>`: the visible text that explains what to type. It matters for two reasons:

- **Accessibility:** screen readers read the label aloud when the field is selected.
- **Usability:** clicking the label places the cursor in the field, which makes small controls like checkboxes much easier to use.

You connect them by giving the field an `id` and writing that same value in the label's `for` attribute.

```html

    <!-- ❌ WRONG: the text is not connected to the field -->
    <p>Email Address:</p>
    <input type="email" name="email">

    <!-- ✅ CORRECT: for="user-email" points to id="user-email" -->
    <label for="user-email">Email Address:</label>
    <input type="email" id="user-email" name="email">


```

---

## 4. Basic Validation

HTML includes validation attributes that let the browser catch mistakes before the data is even sent to the server:

- `required`: The field cannot be left empty.

- `minlength` / `maxlength`: The minimum and maximum number of characters allowed.

- `min` / `max`: The smallest and largest number allowed.

- `pattern`: A custom rule written as a *regular expression* (a short code that describes a text format, such as "exactly 5 digits": `[0-9]{5}`).

```html

    <form action="/signup" method="POST">
        <label for="age">Age (18+):</label>
        <input 
            type="number" 
            id="age" 
            name="age" 
            min="18" 
            max="99" 
            required
        >

        <label for="zip">Postal code:</label>
        <input type="text" id="zip" name="zip" pattern="[0-9]{5}">
        
        <button type="submit">Verify</button>
    </form>


```

If the user types `15` or leaves the age empty, the browser blocks the submission and shows an error message.

**Important:** HTML validation is a convenience for the user, not a security measure. Anyone with a little technical knowledge can skip it, so the server must always check the data again.

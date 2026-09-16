---
title: "HTML Installation Guide"
---

# HTML Installation Guide

HTML is a **markup language**, so there is nothing to install or *compile* (translate into a program the computer can run). An HTML file is just a text file that any web browser can open. Even so, a few free tools make writing and previewing HTML much more comfortable.

---

## 1. Required Tools

To start creating and testing HTML, you need:

<ol>
    <li>
        <strong>A Code Editor</strong><br>
        A text editor designed for code. It colors the different parts of the code (<em>syntax highlighting</em>) so it is easier to read, and it can be extended with add-ons called <em>extensions</em>.
        <ul>
            <li><a href="https://code.visualstudio.com/" target="_blank" rel="noopener noreferrer" title="Visual Studio Code Official Site" class="doc-link">Visual Studio Code</a> (recommended)</li>
            <li><a href="https://www.sublimetext.com/" target="_blank" rel="noopener noreferrer" title="Sublime Text Official Site" class="doc-link">Sublime Text</a></li>
            <li><a href="https://notepad-plus-plus.org/" target="_blank" rel="noopener noreferrer" title="Notepad++ Official Site" class="doc-link">Notepad++</a> (Windows only)</li>
        </ul>
    </li>
    <li>
        <strong>A Web Browser</strong><br>
        You will use it to open your <code>.html</code> files and see the result. You almost certainly have one already:
        <ul>
            <li><a href="https://www.google.com/chrome/" target="_blank" rel="noopener noreferrer" title="Google Chrome Official Site" class="doc-link">Chrome</a></li>
            <li><a href="https://www.firefox.com/" target="_blank" rel="noopener noreferrer" title="Mozilla Firefox Official Site" class="doc-link">Firefox</a></li>
            <li><a href="https://www.microsoft.com/edge" target="_blank" rel="noopener noreferrer" title="Microsoft Edge Official Site" class="doc-link">Edge</a></li>
            <li><a href="https://www.apple.com/safari/" target="_blank" rel="noopener noreferrer" title="Safari Official Site" class="doc-link">Safari</a></li>
        </ul>
    </li>
    <li>
        <strong>(Optional) Live Server Extension</strong><br>
        If you use Visual Studio Code, you can install the <a href="https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer" target="_blank" rel="noopener noreferrer" title="Live Server Extension" class="doc-link">Live Server</a> extension. It reloads the page in the browser automatically every time you save the file, so you do not have to refresh it by hand.
    </li>
</ol>

---

## 2. Creating Your First HTML File

1. Open your code editor.

2. Create a new file and save it as `index.html`. The `.html` ending (the *extension*) tells the computer that it is a web page.

3. Write (or paste) the basic HTML structure:

```html

    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My First HTML Page</title>
    </head>
    <body>
        <h1>Hello, HTML!</h1>
        <p>Welcome to your first webpage.</p>
    </body>
    </html>


```

4. Save the file.

**Common mistake:** saving the file with the wrong extension. Some basic editors (like Windows Notepad) add `.txt` automatically, and the browser will show the code as plain text instead of a web page.

```bash

    # ❌ WRONG: the browser treats it as a text document
    index.html.txt

    # ✅ CORRECT: the browser treats it as a web page
    index.html


```

---

## 3. Viewing Your HTML File

- Open the file in a web browser in either of these ways:

    - Double-click the `index.html` file.

    - Right-click the file → *Open with* → choose your browser.

- You should see your heading and paragraph displayed as a web page. The title "My First HTML Page" appears on the browser tab.

- After changing the code, save the file and refresh the browser (F5 or Ctrl+R / Cmd+R) to see the changes.

---

## 4. Using a Live Server (Optional)

If you installed the Live Server extension in Visual Studio Code:

1. Right-click `index.html` in the file list.

2. Select **"Open with Live Server"**.

3. Your browser will open the page and refresh it automatically every time you save.

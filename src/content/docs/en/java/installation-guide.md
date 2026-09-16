---
title: "Java Installation Guide"
---

# Java Installation Guide

To write and run Java programs you need the **JDK** (Java Development Kit): a free package that includes the *compiler* (the tool that translates your code into something the computer can run) and everything needed to execute it.

We recommend an **LTS (Long Term Support)** version, which receives updates and security fixes for several years, such as Java 21 or Java 25.

Several steps below use the **terminal** (also called *command line*, *Command Prompt* or *PowerShell* on Windows): a window where you type commands instead of clicking buttons.

---

## 1. Download & Install

**Windows**

<ol>
  <li>
    Download the installer (x64 Installer) from the 
    <a href="https://adoptium.net/" 
       class="doc-link" 
       target="_blank" 
       rel="noopener noreferrer"
       title="Download Java from Eclipse Adoptium">
       Eclipse Adoptium
    </a> 
    website (free) or from the
    <a href="https://www.oracle.com/java/technologies/downloads/" 
       class="doc-link" 
       target="_blank" 
       rel="noopener noreferrer"
       title="Download Java from Oracle Website">
       Oracle website
    </a>.
  </li>
  <li>
    Run the downloaded <code>.msi</code> or <code>.exe</code> file and follow the on-screen instructions.
  </li>
  <li>
    <strong>Important:</strong> if the installer offers the options <strong>"Add to PATH"</strong> or <strong>"Set JAVA_HOME variable"</strong>, enable them. The PATH is the list of folders where the computer looks for programs, so this is what lets you type <code>java</code> in any terminal.
  </li>
</ol>

**macOS (via Homebrew)**

<a href="https://brew.sh/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Homebrew">Homebrew</a> is a popular tool for installing software on macOS from the terminal. If you have it, open the terminal and run:

```bash

    brew install --cask temurin


```

**Linux (Debian/Ubuntu)**

Open your terminal and use `apt` (the Ubuntu package installer) to install the default JDK. `sudo` runs the command with administrator permissions, so it will ask for your password:

```bash

    sudo apt update
    sudo apt install default-jdk


```

---

## 2. Verify Installation

Once installed, **open a new terminal** (terminals that were already open do not see the new installation) and run:

```bash

    java --version


```

You should see something similar to this (the numbers depend on the version you installed):

```bash

    openjdk 21.0.1 2023-10-17 LTS
    OpenJDK Runtime Environment Temurin-21.0.1+12 (build 21.0.1+12-LTS)
    OpenJDK 64-Bit Server VM Temurin-21.0.1+12 (build 21.0.1+12-LTS, mixed mode)


```

If you get a message like *"java is not recognized as an internal or external command"*, Java was not added to the PATH. Reinstall it with that option enabled, or restart your computer.

---

## 3. Your First Program

Create a file named `Main.java` and paste the following code:

```java

    public class Main {
        public static void main(String[] args) {
            System.out.println("Hello, Java!");
        }
    }


```

To run it, open the terminal in the same folder as the file and type:

```bash

    # 1. Compile: translates Main.java into Main.class
    javac Main.java

    # 2. Run the compiled program (without the .class ending)
    java Main

    # Output:
    # Hello, Java!


```

**Common mistake:** giving the file a different name from the class. A `public` class must live in a file with exactly the same name, including capital letters.

```bash

    # ❌ WRONG: the class is called Main, but the file is main.java
    javac main.java
    # error: class Main is public, should be declared in a file named Main.java

    # ✅ CORRECT: file name and class name match exactly
    javac Main.java


```

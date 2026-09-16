---
title: "MySQL Fundamentals & Relational Design"
---

# Fundamentals & Relational Design

Before writing a single query, it helps to understand what a database actually is, how MySQL organizes information, and the basic vocabulary you will use in every guide from here on. This section builds the mental model of tables, rows, and columns, and introduces the handful of commands you use to create and manipulate them.

---

## Table of Contents

<div id="content-table">

- [1.1. Introduction to MySQL, Client-Server Architecture & InnoDB](#11-introduction-to-mysql-client-server-architecture--innodb "What a database server is and how MySQL is organized")
- [1.2. Data Types, Databases & Tables (DDL)](#12-data-types-databases--tables-ddl "Creating the structures that will hold your data")
- [1.3. Basic CRUD Operations (DML)](#13-basic-crud-operations-dml "SELECT, INSERT, UPDATE, DELETE")
- [1.4. Primary Keys, Foreign Keys & Constraints](#14-primary-keys-foreign-keys--constraints "Linking tables together and protecting data integrity")
- [1.5. Normalization & E/R Design](#15-normalization--er-design "1NF, 2NF, 3NF and entity-relationship diagrams")

</div>

---

## 1.1. Introduction to MySQL, Client-Server Architecture & InnoDB

A **database** is an organized collection of information, stored so it can be searched, filtered, and updated reliably — think of it as a much smarter, much faster version of a spreadsheet. **MySQL** is a piece of software, called a **relational database management system (RDBMS)**, that creates, stores, and manages databases made of **tables**: grids of rows and columns, very similar to a spreadsheet tab, where each table usually holds one type of thing (customers, products, orders...).

MySQL works with a **client-server architecture**: the **server** is the program that actually stores the data and runs in the background (often on a separate machine reachable over a network); a **client** is any program that connects to the server to send it commands and read the results — the command-line tool from the installation guide is one client, but a website's backend code, a mobile app, or a graphical tool like MySQL Workbench can all be clients of the very same server at the same time.

| | Server | Client |
| :--- | :--- | :--- |
| **Role** | Stores and manages the actual data | Sends requests and displays results |
| **Where it runs** | Continuously, in the background | Only while you are actively using it |
| **How many at once** | Usually one per database | Many clients can connect to the same server |

Internally, MySQL delegates the actual work of reading and writing data to a component called a **storage engine**. **InnoDB** is the default and most widely used one: it keeps data safe even if the power goes out mid-write, and it supports the relationships between tables covered later in this guide. Unless you have a specific reason to choose another engine, InnoDB is the right default.

**Common mistake:** confusing MySQL (the software) with "a database". MySQL is the *server* that can hold many separate *databases* at once, the same way one filing cabinet can hold many separate folders.

---

## 1.2. Data Types, Databases & Tables (DDL)

Commands that create or change the *structure* of your data (as opposed to the data itself) are called **DDL** (Data Definition Language). The first structure you need is a **database**, a named container for related tables:

```sql

    CREATE DATABASE bookstore;
    USE bookstore;   -- Tells MySQL every following command applies to this database


```

Inside a database, a **table** is created by listing its **columns** (the pieces of information each row will have) and the **data type** of each one — this tells MySQL in advance what kind of value to expect, so it can store it efficiently and reject anything that does not fit.

| Data type | Stores | Example |
| :--- | :--- | :--- |
| `INT` | Whole numbers | `42` |
| `DECIMAL(10,2)` | Precise decimal numbers (e.g. money) | `19.99` |
| `VARCHAR(n)` | Short text, up to `n` characters | `"Alex"` |
| `TEXT` | Long, unlimited-length text | A book's full description |
| `DATE` | A calendar date | `2024-05-20` |
| `BOOLEAN` | True or false | `TRUE` |

```sql

    CREATE TABLE books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        price DECIMAL(10,2),
        published_date DATE
    );


```

`AUTO_INCREMENT` tells MySQL to generate a new, ever-increasing number for that column automatically, so you never have to invent an ID by hand. `NOT NULL` means that column can never be left empty — MySQL will refuse to save a row that does not provide it.

**Common mistake:** choosing `VARCHAR(255)` for every single piece of text out of habit. A `price` should be a number type (so MySQL can do math with it, like sorting or summing), and a very long description should be `TEXT` rather than an artificially large `VARCHAR`.

---

## 1.3. Basic CRUD Operations (DML)

Once tables exist, day-to-day work happens through **DML** (Data Manipulation Language): commands that read and change the *data itself*. These four cover the vast majority of everyday needs, an acronym often shortened to **CRUD** (Create, Read, Update, Delete):

```sql

    -- CREATE: add a new row
    INSERT INTO books (title, price, published_date)
    VALUES ('The Pragmatic Programmer', 39.99, '1999-10-30');

    -- READ: retrieve rows
    SELECT title, price FROM books WHERE price < 40;

    -- UPDATE: modify existing rows
    UPDATE books SET price = 34.99 WHERE title = 'The Pragmatic Programmer';

    -- DELETE: remove rows
    DELETE FROM books WHERE title = 'The Pragmatic Programmer';


```

`SELECT` is the command you will type the most: `SELECT * FROM books;` reads every column of every row (`*` means "all columns"), while `SELECT title, price FROM books;` reads only the two columns you ask for — narrowing the columns you request keeps results readable and queries faster.

**Common mistake:** running `UPDATE` or `DELETE` **without** a `WHERE` clause. `WHERE` is the filter that says *which* rows to touch; without it, MySQL updates or deletes **every single row** in the table, with no confirmation and no easy undo.

```sql

    -- ❌ DANGEROUS: changes the price of every book in the table
    UPDATE books SET price = 34.99;

    -- ✅ SAFE: changes the price of only the matching book
    UPDATE books SET price = 34.99 WHERE title = 'The Pragmatic Programmer';


```

---

## 1.4. Primary Keys, Foreign Keys & Constraints

A **primary key (PK)** is a column (or combination of columns) that uniquely identifies each row in a table — no two rows can ever share the same value, similar to how no two people share the same passport number. It is what `id INT AUTO_INCREMENT PRIMARY KEY` set up in section 1.2.

A **foreign key (FK)** is a column in one table that points to the primary key of another table, creating a link between them. This is the "relational" part of "relational database": instead of repeating a customer's full details on every single order, an `orders` table just stores that customer's `id`.

```sql

    CREATE TABLE customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL
    );

    CREATE TABLE orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT,
        total DECIMAL(10,2),
        FOREIGN KEY (customer_id) REFERENCES customers(id)
    );


```

With this foreign key in place, MySQL enforces a **constraint**: a rule the database refuses to break. Here, it refuses to insert an order whose `customer_id` does not correspond to an existing customer, and by default it also refuses to delete a customer who still has orders pointing to them — protecting you from ending up with "orphaned" orders that reference someone who no longer exists.

| Constraint | What it guarantees |
| :--- | :--- |
| `PRIMARY KEY` | Every row is uniquely identifiable |
| `FOREIGN KEY` | A reference always points to a row that actually exists |
| `NOT NULL` | A column is never left empty |
| `UNIQUE` | No two rows share the same value in that column (e.g. an email address) |

**Common mistake:** storing repeated information (like a customer's full name and address) directly in the `orders` table instead of linking to the `customers` table with a foreign key. If that customer moves, every single one of their past orders would need to be updated individually instead of the change happening in one place.

---

## 1.5. Normalization & E/R Design

**Normalization** is the process of organizing tables so that each piece of information is stored in exactly one place, avoiding duplication and the inconsistencies it causes. It is usually explained through a series of increasingly strict rules, called **normal forms**:

| Normal Form | Rule (in plain terms) |
| :--- | :--- |
| **1NF** (First) | Every column holds a single value — no lists or comma-separated values crammed into one cell. |
| **2NF** (Second) | Every non-key column depends on the *whole* primary key, not just part of it. |
| **3NF** (Third) | Every non-key column depends *only* on the primary key, not on another non-key column. |

A quick before/after example of fixing a 1NF violation:

```sql

    -- ❌ Violates 1NF: several phone numbers crammed into a single cell
    -- | id | name  | phones                  |
    -- | 1  | Alex  | "555-1234, 555-5678"    |

    -- ✅ Fixed: one phone number per row, in its own table linked by a foreign key
    CREATE TABLE customer_phones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT,
        phone VARCHAR(20),
        FOREIGN KEY (customer_id) REFERENCES customers(id)
    );


```

Before creating any tables, most database designers first sketch an **E/R diagram** (Entity-Relationship diagram): a simple drawing where boxes represent **entities** (the "things" that will become tables, like `Customer` or `Order`) and lines represent the **relationships** between them (one customer can have *many* orders). Planning this on paper first makes it much easier to spot missing foreign keys or duplicated data before any SQL is written.

**Common mistake:** over-normalizing a simple, small project until nearly every query needs to join five or six tables together just to display one screen. Normalization reduces duplication, but every additional table also adds complexity — real-world designs balance the two rather than chasing the strictest normal form at all costs.

---
title: "Advanced Queries & Operations in MySQL"
---

# Advanced Queries & Operations

With the basics in place, it is time to combine information spread across several tables, summarize large amounts of data, and make sure changes happen safely even when many people use the database at once. This section covers joining tables, aggregating data, transactions, indexes, and automating logic inside MySQL itself.

---

## Table of Contents

<div id="content-table">

- [2.1. Multi-Table Queries: JOINs & Subqueries](#21-multi-table-queries-joins--subqueries "Combining data from several tables")
- [2.2. Data Aggregation](#22-data-aggregation "GROUP BY, HAVING and aggregate functions")
- [2.3. Transactions & ACID Properties](#23-transactions--acid-properties "COMMIT, ROLLBACK and isolation")
- [2.4. Indexes](#24-indexes "Speeding up searches with B-Tree, composite and UNIQUE indexes")
- [2.5. Views, Stored Procedures & Triggers](#25-views-stored-procedures--triggers "Automating logic inside the database")

</div>

---

## 2.1. Multi-Table Queries: JOINs & Subqueries

Because a relational database splits information across several linked tables (see section 1.4 on foreign keys), reading a complete picture — like "each order together with the customer's name" — usually requires combining, or **joining**, two or more tables in a single query.

```sql

    -- Only shows orders that DO have a matching customer
    SELECT orders.id, customers.name, orders.total
    FROM orders
    INNER JOIN customers ON orders.customer_id = customers.id;


```

`INNER JOIN` keeps only the rows that match on both sides. `LEFT JOIN` keeps **every** row from the first (left) table, filling in empty values (`NULL`) when there is no match on the right — useful for questions like "list every customer, including the ones who have never placed an order."

```sql

    -- Includes customers even if they have zero orders (orders.id will be NULL for them)
    SELECT customers.name, orders.id
    FROM customers
    LEFT JOIN orders ON orders.customer_id = customers.id;


```

| | `INNER JOIN` | `LEFT JOIN` | `RIGHT JOIN` |
| :--- | :--- | :--- | :--- |
| **Keeps** | Only matching rows on both sides | All rows from the left table | All rows from the right table |
| **Typical use** | "Orders that have a customer" | "Every customer, with or without orders" | "Every order, with or without a customer" (rare) |

A **subquery** is a query nested inside another one, useful when a filter depends on a value that itself needs to be calculated first:

```sql

    -- Finds customers whose total spending is above the average
    SELECT name FROM customers
    WHERE id IN (
        SELECT customer_id FROM orders
        GROUP BY customer_id
        HAVING SUM(total) > (SELECT AVG(total) FROM orders)
    );


```

**Common mistake:** using `INNER JOIN` when the goal was actually to include unmatched rows. Since `INNER JOIN` silently drops anything without a match, a report can quietly lose entries (like customers with no orders yet) without any error being shown.

---

## 2.2. Data Aggregation

**Aggregate functions** collapse many rows into a single summary value — a total, an average, a count. `GROUP BY` applies that calculation separately for each distinct value in a column, turning "the total of all orders" into "the total of orders, per customer."

```sql

    SELECT customer_id, COUNT(*) AS order_count, SUM(total) AS total_spent
    FROM orders
    GROUP BY customer_id;


```

| Function | Returns |
| :--- | :--- |
| `COUNT(*)` | The number of rows |
| `SUM(column)` | The sum of a numeric column |
| `AVG(column)` | The average of a numeric column |
| `MIN(column)` / `MAX(column)` | The smallest / largest value |

`WHERE` filters individual rows **before** grouping; `HAVING` filters the **groups themselves**, after the aggregate function has run — this is the key difference between the two, and why `HAVING` is needed at all.

```sql

    -- WHERE: only consider orders placed this year, before grouping
    -- HAVING: after grouping, only keep customers who spent over $500 in total
    SELECT customer_id, SUM(total) AS total_spent
    FROM orders
    WHERE YEAR(order_date) = 2024
    GROUP BY customer_id
    HAVING SUM(total) > 500;


```

**Common mistake:** trying to filter on an aggregate result using `WHERE` instead of `HAVING` (e.g. `WHERE SUM(total) > 500`). MySQL rejects this with an error, because `WHERE` runs before the totals even exist — the sum is only calculated once rows are grouped.

---

## 2.3. Transactions & ACID Properties

A **transaction** groups several changes into a single, all-or-nothing unit of work — essential when one real-world action requires multiple database changes to succeed together. The classic example is a bank transfer: subtracting money from one account and adding it to another must either **both** happen, or **neither** should, otherwise money disappears or appears out of nowhere.

```sql

    START TRANSACTION;

    UPDATE accounts SET balance = balance - 100 WHERE id = 1;
    UPDATE accounts SET balance = balance + 100 WHERE id = 2;

    COMMIT;   -- Makes both changes permanent at once
    -- ROLLBACK;   -- Or: undoes every change made since START TRANSACTION


```

If anything goes wrong midway (an error, a lost connection), running `ROLLBACK` instead of `COMMIT` discards every change made since the transaction started, as if it never happened.

Transactions are guaranteed by four properties known by the acronym **ACID**:

| Letter | Property | Meaning |
| :--- | :--- | :--- |
| **A** | Atomicity | All the changes in a transaction happen, or none of them do. |
| **C** | Consistency | A transaction can never leave the database violating its own rules (like constraints). |
| **I** | Isolation | Transactions running at the same time do not interfere with each other's in-progress changes. |
| **D** | Durability | Once a transaction is committed, it survives even a crash right after. |

**Common mistake:** wrapping a long series of changes in a transaction and forgetting to `COMMIT` (or `ROLLBACK`) at the end. The changes stay "pending" and invisible to other connections, and can end up **locking** the affected rows, blocking other users until the transaction is finally closed.

---

## 2.4. Indexes

Without help, MySQL has to scan every single row of a table to find the ones matching a `WHERE` condition — fast for a hundred rows, painfully slow for ten million. An **index** is an extra, separate structure MySQL maintains that lets it jump almost directly to the matching rows, similar to how a book's index lets you find a topic without reading every page.

```sql

    CREATE INDEX idx_customer_email ON customers(email);

    -- A UNIQUE index also enforces that no two rows share the same value
    CREATE UNIQUE INDEX idx_customer_email_unique ON customers(email);


```

By default, MySQL (via InnoDB) builds indexes using a **B-Tree**, a structure organized so that finding any value takes roughly the same, small number of steps regardless of how large the table grows. A **composite index** covers more than one column at once, and speeds up queries that filter or sort by that exact combination of columns together.

```sql

    -- Speeds up queries that filter by BOTH last_name and first_name together
    CREATE INDEX idx_full_name ON customers(last_name, first_name);


```

Indexes are not free: every index MySQL must also update every time a row is inserted, updated, or deleted, so adding one to a column that is rarely searched but frequently written to can slow the database down rather than speed it up. `EXPLAIN` (covered in section 3.1) shows whether a query is actually using an available index.

**Common mistake:** adding an index to every column "just in case." Indexes speed up reads but slow down writes and take up extra disk space, so they should be added deliberately, based on the columns that queries actually filter or sort by.

---

## 2.5. Views, Stored Procedures & Triggers

A **view** is a saved query that behaves like a virtual table: it does not store data itself, but re-runs its underlying query every time it is used, which is handy for hiding a complex `JOIN` behind a simple name.

```sql

    CREATE VIEW customer_orders_summary AS
    SELECT customers.name, COUNT(orders.id) AS order_count
    FROM customers
    LEFT JOIN orders ON orders.customer_id = customers.id
    GROUP BY customers.name;

    -- From now on, this reads just like a regular table
    SELECT * FROM customer_orders_summary;


```

A **stored procedure** is a saved, reusable block of SQL logic — similar to a function in a programming language — that can accept parameters and be called by name instead of retyping the same set of statements every time.

```sql

    DELIMITER //
    CREATE PROCEDURE AddOrder(IN cust_id INT, IN order_total DECIMAL(10,2))
    BEGIN
        INSERT INTO orders (customer_id, total) VALUES (cust_id, order_total);
    END //
    DELIMITER ;

    CALL AddOrder(1, 49.99);


```

A **trigger** runs a block of SQL **automatically** whenever a specific event happens on a table (before or after an `INSERT`, `UPDATE`, or `DELETE`), without anyone having to remember to call it.

```sql

    CREATE TABLE order_audit (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT,
        changed_at DATETIME
    );

    CREATE TRIGGER after_order_update
    AFTER UPDATE ON orders
    FOR EACH ROW
    INSERT INTO order_audit (order_id, changed_at) VALUES (NEW.id, NOW());


```

**Common mistake:** hiding important business logic inside triggers that run silently in the background. They are useful for small, predictable tasks (like the audit log above), but logic that is hard to see can make debugging an application much harder, since a developer reading the application's code will not necessarily know a trigger is also running.

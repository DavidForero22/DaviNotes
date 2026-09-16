---
title: "MongoDB Fundamentals & the Document Model"
---

# Fundamentals & the Document Model

MongoDB organizes data very differently from a database like MySQL. Before writing any queries, it helps to understand what a "document" actually is, how to perform the basic operations on it, and how to decide where related information should live. This section builds that foundation.

---

## Table of Contents

<div id="content-table">

- [1.1. Introduction to NoSQL & JSON/BSON Documents](#11-introduction-to-nosql--jsonbson-documents "What makes MongoDB different from a relational database")
- [1.2. Using mongosh & MongoDB Compass](#12-using-mongosh--mongodb-compass "Talking to the database after installation")
- [1.3. CRUD Operations on Collections](#13-crud-operations-on-collections "insertOne, find, updateMany, deleteOne")
- [1.4. Query & Update Operators](#14-query--update-operators "$eq, $gt, $set, $push and more")
- [1.5. Schema Design: Embedding vs. Referencing](#15-schema-design-embedding-vs-referencing "Deciding where related data should live")

</div>

---

## 1.1. Introduction to NoSQL & JSON/BSON Documents

**NoSQL** is a broad label for databases that store data differently from the tables-and-rows model used by MySQL (often called **SQL** or **relational** databases). MongoDB is the most popular **document database**: instead of rigid rows split across separate, linked tables, it stores each record as a single, flexible **document** — a structure that looks almost exactly like a JSON object, the same format used all over the web to exchange data.

```json

    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Alex",
      "email": "alex@example.com",
      "age": 30,
      "hobbies": ["reading", "cycling"]
    }


```

Every document lives inside a **collection**, MongoDB's equivalent of a table — but unlike a SQL table, a collection does not force every document to share exactly the same columns. One `users` document could have a `hobbies` list while another does not, with no error from the database.

| SQL (MySQL) | MongoDB | Roughly equivalent to |
| :--- | :--- | :--- |
| Database | Database | A named container for the rest |
| Table | Collection | A group of similar records |
| Row | Document | One single record |
| Column | Field | One piece of information inside a record |

Documents are written and read as JSON, but MongoDB actually stores them on disk as **BSON** (Binary JSON): a binary format that adds a few extra data types JSON does not have on its own (like proper dates and binary data) and that MongoDB can read and write much faster than plain text JSON.

**Common mistake:** assuming "no fixed structure" means "no planning needed." MongoDB does not force a schema at the database level, but a real application still expects each document to follow a consistent, predictable shape — that consistency just needs to be planned and enforced by the people building the application (or, later, using tools covered in section 2.4) instead of by the database automatically.

---

## 1.2. Using mongosh & MongoDB Compass

*If MongoDB is not installed on your machine yet, see the Installation Guide first, which covers installing the server and connecting through mongosh for the first time.*

**mongosh** is the command-line client for MongoDB. Beyond connecting and listing databases, it is a full JavaScript environment, which is why MongoDB commands look like JavaScript function calls rather than a separate query language like SQL:

```bash

    use bookstore          // Switches to (or creates) a database called "bookstore"
    db.books.insertOne({ title: "Dune", price: 15.99 })   // "db" always refers to the current database


```

**MongoDB Compass** offers the same capabilities through a graphical interface: a sidebar lists your databases and collections, a document viewer lets you browse and edit records by clicking, and a visual query bar builds the same filters you would otherwise type in mongosh.

| | mongosh | Compass |
| :--- | :--- | :--- |
| **Interface** | Command-line, text-based | Graphical, point-and-click |
| **Best for** | Scripting, quick one-off commands | Exploring data visually, building queries interactively |
| **Underlying engine** | Same MongoDB server | Same MongoDB server |

**Common mistake:** typing `db.collectionName` for a collection that does not exist yet and expecting an error. MongoDB creates collections (and even entire databases) automatically the first time you insert a document into them — there is no separate `CREATE TABLE`-style step required.

---

## 1.3. CRUD Operations on Collections

Just like MySQL, everyday work in MongoDB revolves around **CRUD**: Create, Read, Update, and Delete. The exact method names differ, and most come in a singular (`One`) and plural (`Many`) version, since a single command can affect one document or every document matching a filter.

```js

    // CREATE
    db.books.insertOne({ title: "Dune", price: 15.99, genre: "sci-fi" });
    db.books.insertMany([
        { title: "1984", price: 9.99, genre: "dystopian" },
        { title: "Neuromancer", price: 12.5, genre: "sci-fi" },
    ]);

    // READ
    db.books.find({ genre: "sci-fi" });          // Every sci-fi book
    db.books.findOne({ title: "Dune" });          // Only the first match

    // UPDATE
    db.books.updateOne({ title: "Dune" }, { $set: { price: 17.99 } });
    db.books.updateMany({ genre: "sci-fi" }, { $set: { onSale: true } });

    // DELETE
    db.books.deleteOne({ title: "1984" });
    db.books.deleteMany({ genre: "dystopian" });


```

Every one of these methods takes a first argument called a **filter**: a small document describing which records to match. `{}` (an empty filter) matches every document, so `db.books.find({})` reads the entire collection, the same way `SELECT * FROM books` would in MySQL.

**Common mistake:** calling `updateOne` or `deleteOne` when the intent was actually to affect every matching document. `updateOne`/`deleteOne` stop after the very first match they find, silently leaving every other matching document untouched — reach for the `Many` version whenever more than one record could match the filter.

---

## 1.4. Query & Update Operators

A plain field like `{ genre: "sci-fi" }` only matches an exact value. **Query operators**, always written starting with a dollar sign `$`, let filters express comparisons, ranges, and more complex logic.

```js

    db.books.find({ price: { $gt: 10 } });              // Price greater than 10
    db.books.find({ price: { $gte: 10, $lte: 20 } });    // Price between 10 and 20 (inclusive)
    db.books.find({ genre: { $in: ["sci-fi", "fantasy"] } }); // genre is either of these


```

| Operator | Meaning |
| :--- | :--- |
| `$eq` | Equal to (the default when you just write a plain value) |
| `$gt` / `$gte` | Greater than / greater than or equal to |
| `$lt` / `$lte` | Less than / less than or equal to |
| `$in` | Matches any value in a given list |

**Update operators**, used inside `updateOne`/`updateMany`, describe *how* to change a document rather than replacing it entirely:

```js

    db.books.updateOne({ title: "Dune" }, { $set: { price: 17.99 } });      // Sets (or adds) a field
    db.books.updateOne({ title: "Dune" }, { $inc: { price: 1 } });          // Increases a numeric field
    db.books.updateOne({ title: "Dune" }, { $push: { tags: "bestseller" } }); // Adds one item to an array field


```

**Common mistake:** calling `updateOne({ title: "Dune" }, { price: 17.99 })` **without** `$set`. Without an update operator, MongoDB treats the second argument as the document's **entire new content** and replaces everything else in it — every other field the document had is silently deleted.

---

## 1.5. Schema Design: Embedding vs. Referencing

Because MongoDB does not require splitting related data across separate collections the way MySQL requires separate tables, every design decision comes down to one central question: should related information be **embedded** inside the same document, or **referenced** in a separate collection (similar to a foreign key)?

```js

    // Embedding: the address lives directly inside the customer document
    {
      "_id": 1,
      "name": "Alex",
      "address": { "street": "123 Main St", "city": "Springfield" }
    }

    // Referencing: the customer document just stores an ID pointing to a separate collection
    { "_id": 1, "name": "Alex", "addressId": 501 }
    // In a separate "addresses" collection:
    { "_id": 501, "street": "123 Main St", "city": "Springfield" }


```

| | Embedding | Referencing |
| :--- | :--- | :--- |
| **Read performance** | Fast — one single query retrieves everything | Slower — may require a second query or a `$lookup` (covered in section 2.3) |
| **Best for** | Data that is always read together and rarely changes independently (an address, order line items) | Data that is shared across many documents, or grows without bound (a product's reviews, a user's orders) |
| **Risk of duplication** | Higher, if the same data is embedded in many places | Lower, since each fact is stored once |

A common rule of thumb: embed data that "belongs to" one document and is always read together with it; reference data that is shared, reused across many documents, or could grow indefinitely (embedding thousands of reviews directly inside a single product document, for instance, would make that one document unmanageably large).

**Common mistake:** always embedding, out of habit, even for data that grows without bound — like embedding every single order a customer has ever placed directly inside their customer document. That document keeps growing forever and eventually becomes slow to read and update, when a separate, referenced `orders` collection would scale much better.

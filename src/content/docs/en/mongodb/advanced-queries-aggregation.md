---
title: "Advanced Queries & Aggregation in MongoDB"
---

# Advanced Queries & Aggregation

With the fundamentals in place, it is time to make searches faster with indexes and to answer bigger questions than a simple filter can — totals, joined data, transformed shapes — using MongoDB's aggregation pipeline. This section also covers keeping documents consistent and a few proven ways to structure collections for common, real-world needs.

---

## Table of Contents

<div id="content-table">

- [2.1. Indexing in MongoDB](#21-indexing-in-mongodb "Simple, compound, text and geospatial indexes")
- [2.2. Aggregation Pipeline I: Basic Stages](#22-aggregation-pipeline-i-basic-stages "$match, $project, $group, $sort")
- [2.3. Aggregation Pipeline II: Joining & Unwinding](#23-aggregation-pipeline-ii-joining--unwinding "$lookup and $unwind")
- [2.4. Schema Validation](#24-schema-validation "Enforcing structure with JSON Schema")
- [2.5. NoSQL Design Patterns](#25-nosql-design-patterns "Bucket, Subset and Outlier patterns")

</div>

---

## 2.1. Indexing in MongoDB

Just like MySQL (section 2.4 of its guide), MongoDB has to scan every document in a collection to satisfy a query unless it can use an **index** — a separate structure that lets it jump straight to matching documents instead of checking each one.

```js

    db.books.createIndex({ genre: 1 });                         // Simple index, ascending order
    db.books.createIndex({ genre: 1, price: -1 });               // Compound index (genre, then price descending)
    db.books.createIndex({ title: "text", description: "text" }); // Text index, for searching words inside text fields
    db.stores.createIndex({ location: "2dsphere" });              // Geospatial index, for location-based queries


```

| Index type | Speeds up |
| :--- | :--- |
| Simple | Filtering or sorting by one field |
| Compound | Filtering or sorting by several fields together, in that order |
| Text | Searching for words inside string fields (`$text` queries) |
| Geospatial | "Near me" or "inside this area" queries on coordinates |

`db.books.find({ genre: "sci-fi" }).explain("executionStats")` shows whether a query actually used an index (`IXSCAN`) or fell back to scanning the whole collection (`COLLSCAN`) — the same diagnostic role `EXPLAIN` plays in MySQL.

**Common mistake:** creating a compound index in the wrong field order. A compound index on `{ genre: 1, price: -1 }` efficiently speeds up queries that filter by `genre` alone, or by `genre` and `price` together, but does **not** meaningfully help a query that filters by `price` alone — order matters.

---

## 2.2. Aggregation Pipeline I: Basic Stages

The **aggregation pipeline** is MongoDB's tool for anything beyond a simple filter: totals, grouped counts, reshaping documents, and more. It works as a sequence of **stages**, each one taking the documents produced by the previous stage and transforming them further — like an assembly line for data.

```js

    db.orders.aggregate([
        { $match: { status: "completed" } },              // 1. Keep only completed orders
        { $group: { _id: "$customerId", total: { $sum: "$amount" } } }, // 2. Sum amounts per customer
        { $sort: { total: -1 } },                          // 3. Sort customers by total spent, highest first
    ]);


```

| Stage | Purpose |
| :--- | :--- |
| `$match` | Filters documents, just like `find()` — usually placed first to reduce the work later stages have to do |
| `$project` | Reshapes each document: choose fields to include, exclude, or compute new ones |
| `$group` | Groups documents by a chosen value and computes totals, counts, or averages per group |
| `$sort` | Orders the resulting documents |

`$project` is particularly useful for hiding fields you do not want to send to an application (like an internal-only field), or for computing a new value on the fly:

```js

    db.books.aggregate([
        { $project: { title: 1, discountedPrice: { $multiply: ["$price", 0.9] } } },
    ]);


```

**Common mistake:** placing `$match` at the end of the pipeline instead of as close to the start as possible. `$match` reduces the number of documents every later stage has to process, so filtering early makes the entire pipeline faster; filtering late means earlier stages waste effort processing documents that get thrown away anyway.

---

## 2.3. Aggregation Pipeline II: Joining & Unwinding

MongoDB favors embedding (section 1.5), but when data is referenced across separate collections, `$lookup` performs a join, much like SQL's `JOIN`, pulling in matching documents from another collection.

```js

    db.orders.aggregate([
        {
            $lookup: {
                from: "customers",        // The collection to join
                localField: "customerId", // Field in "orders"
                foreignField: "_id",      // Matching field in "customers"
                as: "customerInfo",       // Name of the new array field holding the matches
            },
        },
    ]);


```

Because a `$lookup` can match more than one document, its result is always placed into an **array** field (`customerInfo` above), even when — as with a single matching customer — that array only ever holds one element.

`$unwind` takes an array field and turns it back into several separate documents, one per array element — useful right after a `$lookup`, or whenever an embedded list (like an order's line items) needs to be processed one item at a time.

```js

    db.orders.aggregate([
        { $unwind: "$items" },   // One output document per item in the "items" array
        { $group: { _id: "$items.productId", totalSold: { $sum: "$items.quantity" } } },
    ]);


```

**Common mistake:** forgetting that `$lookup` returns an **array**, and trying to read the joined data as if it were a single object (e.g. `customerInfo.name` instead of `customerInfo[0].name`, or following it with `$unwind` when a single match was expected but not guaranteed).

---

## 2.4. Schema Validation

MongoDB does not force every document in a collection to share the same shape, but a collection can still be given optional **validation rules**, written using the **JSON Schema** standard, so the database itself rejects documents that do not meet a minimum structure.

```js

    db.createCollection("books", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["title", "price"],
                properties: {
                    title: { bsonType: "string" },
                    price: { bsonType: "number", minimum: 0 },
                },
            },
        },
    });


```

With this rule in place, `db.books.insertOne({ price: -5 })` is rejected outright: `title` is missing, and a negative `price` violates the `minimum` rule. This gives a document database a safety net similar to the `NOT NULL` and data-type constraints that come for free in a SQL table (section 1.2 of the MySQL guide).

**Common mistake:** relying only on the application's code to check the shape of the data, with no validation at the database level. If more than one application (or a future teammate running a one-off script) ever writes to that same collection, only a rule enforced by the database itself is guaranteed to be respected by all of them.

---

## 2.5. NoSQL Design Patterns

Beyond the basic embed-vs-reference choice (section 1.5), a few named patterns solve common, recurring modeling problems in MongoDB:

| Pattern | Problem it solves | How |
| :--- | :--- | :--- |
| **Bucket pattern** | Storing huge numbers of small, individual readings (like sensor data taken once a second) as separate documents becomes wasteful and slow | Group many readings that occurred close together in time into a single document, as an array field |
| **Subset pattern** | Embedding *all* of something (like every review of a product) makes the main document too large to load efficiently | Embed only a small, useful subset (e.g. the 5 most recent reviews) and keep the full list in a separate, referenced collection |
| **Outlier pattern** | A design works well for the typical case, but a rare document (a celebrity account with millions of followers) breaks the assumption that a list can be safely embedded | Detect the rare, oversized case and store its extra data separately, while the common case keeps the simpler embedded design |

```js

    // Bucket pattern: one document per hour, holding many individual readings
    {
      "sensorId": "temp-1",
      "hour": "2024-05-20T14:00:00Z",
      "readings": [
        { "time": "14:00:03", "value": 21.4 },
        { "time": "14:00:04", "value": 21.5 },
        // ... potentially hundreds more within this same hour
      ]
    }


```

**Common mistake:** picking a pattern before actually knowing how the data will be read. NoSQL modeling (unlike normalization in SQL) is driven by **access patterns** — the specific questions the application needs to answer quickly — so the right structure depends entirely on how the data will be queried, not on an abstract idea of "correctness."

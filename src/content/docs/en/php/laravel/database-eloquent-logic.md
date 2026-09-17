---
title: "Database, Eloquent & Business Logic in Laravel"
---

# Database, Eloquent & Business Logic

With the request/response flow and MVC structure in place, the next step is persisting data reliably. This section covers Laravel's approach to database schema changes, its ORM (**Eloquent**) for working with the database through PHP objects instead of raw SQL, validating incoming data, and filtering requests with middleware.

---

## Table of Contents

<div id="content-table">

- [2.1. Migrations & Seeders](#21-migrations--seeders "Database version control")
- [2.2. Eloquent ORM I: Models & CRUD](#22-eloquent-orm-i-models--crud "Fluent create, read, update and delete operations")
- [2.3. Eloquent ORM II: Relationships & Eager Loading](#23-eloquent-orm-ii-relationships--eager-loading "1:1, 1:N, N:M and the N+1 query problem")
- [2.4. Validation & Exception Handling](#24-validation--exception-handling "Form Requests and handling errors gracefully")
- [2.5. Middleware](#25-middleware "Filtering requests and protecting routes")

</div>

---

## 2.1. Migrations & Seeders

A **migration** is a PHP file that describes one change to the database schema (creating a table, adding a column...) in code instead of raw SQL, generated through Artisan and run in order.

```bash

    php artisan make:migration create_books_table


```

```php

    // database/migrations/xxxx_xx_xx_create_books_table.php
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->decimal('price', 10, 2);
            $table->timestamps(); // Adds created_at and updated_at columns automatically
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('books');
    }


```

```bash

    php artisan migrate         # Applies every migration that hasn't run yet
    php artisan migrate:rollback   # Undoes the last batch of migrations, using each one's "down" method


```

Because migrations are just versioned files, every developer on a team — and every environment (staging, production) — can rebuild the exact same schema by running `php artisan migrate`, instead of manually keeping databases in sync by hand.

A **seeder** fills the database with data, typically for local development or testing, often paired with **factories** that generate realistic fake data automatically.

```php

    // database/seeders/BookSeeder.php
    public function run(): void
    {
        Book::factory()->count(50)->create();
    }


```

**Common mistake:** editing an already-run migration file to fix a mistake, instead of creating a new migration. Anyone who already ran the original migration has a database that no longer matches the edited file, since Laravel only tracks *which* migrations ran, not their current content.

---

## 2.2. Eloquent ORM I: Models & CRUD

**Eloquent** is Laravel's **ORM** (Object-Relational Mapper): each database table gets a corresponding **Model** class, and rows become instances of that class, letting you read and write data through plain PHP method calls instead of writing SQL by hand.

```php

    // app/Models/Book.php
    class Book extends Model
    {
        // By convention, this maps to the "books" table automatically
    }


```

```php

    // CREATE
    $book = Book::create(['title' => 'Dune', 'price' => 15.99]);

    // READ
    $book = Book::find(1);
    $cheapBooks = Book::where('price', '<', 20)->get();

    // UPDATE
    $book->price = 17.99;
    $book->save();

    // DELETE
    $book->delete();


```

This chainable style — `Book::where(...)->orderBy(...)->get()` — is called the **fluent query builder**: each method returns an object that more methods can be called on, letting a query be built up piece by piece while staying readable.

**Common mistake:** calling `Book::find($id)` on an id that does not exist. It quietly returns `null` instead of throwing an error, which crashes the application later with a confusing "call to a member function on null" error the moment code tries to use it. `Book::findOrFail($id)` is the safer default: it throws an explicit, catchable 404 error immediately when nothing is found.

---

## 2.3. Eloquent ORM II: Relationships & Eager Loading

Just like foreign keys link tables in raw SQL, Eloquent models declare **relationships** to each other as PHP methods, after which related data can be accessed as if it were a regular property.

```php

    class Author extends Model
    {
        public function books() // 1:N — one author has many books
        {
            return $this->hasMany(Book::class);
        }
    }

    class Book extends Model
    {
        public function author() // The inverse side of the 1:N relationship above
        {
            return $this->belongsTo(Author::class);
        }

        public function tags() // N:M — a book can have many tags, and a tag many books
        {
            return $this->belongsToMany(Tag::class);
        }
    }


```

```php

    $author = Author::find(1);
    $author->books;          // Every book by this author (1:N)

    $book = Book::find(1);
    $book->author;           // The author of this book (the inverse side)
    $book->tags;              // Every tag attached to this book (N:M)


```

A **1:1** relationship (a user and their single profile, for example) uses `hasOne`/`belongsTo` the same way `hasMany`/`belongsTo` handles 1:N.

Accessing a relationship inside a loop triggers what is known as the **N+1 query problem**: one query to fetch the books, then one *additional* query per book to fetch its author — for 100 books, that is 101 queries instead of 2.

```php

    // ❌ N+1 problem: 1 query for books, then 1 more query PER BOOK for its author
    foreach (Book::all() as $book) {
        echo $book->author->name;
    }

    // ✅ Eager loading: only 2 queries total, no matter how many books there are
    foreach (Book::with('author')->get() as $book) {
        echo $book->author->name;
    }


```

**Common mistake:** not noticing the N+1 problem because it works fine, if a little slow, with the handful of test rows used during development — and only becomes a serious performance issue once the table holds thousands of real rows in production.

---

## 2.4. Validation & Exception Handling

Trusting data straight from a request is unsafe: **Form Requests** are dedicated classes that validate incoming data *before* it ever reaches a controller's logic, keeping validation rules out of the controller itself.

```bash

    php artisan make:request StoreBookRequest


```

```php

    // app/Http/Requests/StoreBookRequest.php
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:150',
            'price' => 'required|numeric|min:0',
        ];
    }


```

```php

    // The controller only runs if validation passes; Laravel handles the error response automatically otherwise
    public function store(StoreBookRequest $request)
    {
        return Book::create($request->validated());
    }


```

When validation fails, Laravel automatically returns a `422 Unprocessable Entity` response (as JSON for an API, or a redirect back with error messages for a normal form) — the controller's code never even runs.

For errors that happen deeper in the application, Laravel's central **exception handler** (`bootstrap/app.php` in recent versions) converts uncaught exceptions into an appropriate response instead of letting a raw PHP error reach the browser, and can be customized to log, report, or format specific exception types differently.

**Common mistake:** re-implementing the same validation rules by hand inside a controller instead of using a Form Request. It duplicates logic across every place that needs it and loses Laravel's automatic error-response handling.

---

## 2.5. Middleware

**Middleware** are classes that run *before* (or after) a request reaches its route's controller, used for cross-cutting concerns that apply across many routes at once: authentication checks, logging, or rate limiting.

```php

    // app/Http/Middleware/EnsureSubscribed.php
    public function handle(Request $request, Closure $next)
    {
        if (! $request->user()->subscribed()) {
            return redirect('/subscribe');
        }

        return $next($request); // Passes control to the next middleware or the route's controller
    }


```

Middleware is attached to routes individually or grouped, and Laravel ships with several built-in ones — `auth` (requires a logged-in user) being one of the most common:

```php

    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('auth');

    Route::middleware(['auth', 'subscribed'])->group(function () {
        Route::get('/premium-content', [ContentController::class, 'index']);
    });


```

**Common mistake:** forgetting to call `$next($request)` inside a custom middleware. Request handling silently stops at that point — the route's controller never runs, and no response is ever sent back.

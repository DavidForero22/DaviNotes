---
title: "Laravel Fundamentals & MVC Architecture"
---

# Fundamentals & MVC Architecture

**Laravel** is a PHP framework: instead of handling every HTTP request, database query and template by hand as covered in the core PHP guides, Laravel provides a structured, opinionated way to organize that code, along with tools that remove most of the repetitive work. This section covers Laravel's workflow, the **MVC** (Model-View-Controller) pattern it is built around, and building dynamic interfaces with its templating engine, **Blade**.

The full reference for everything covered here lives in the <a href="https://laravel.com/docs" class="doc-link" target="_blank" rel="noopener noreferrer" title="Official Laravel Documentation">official Laravel documentation</a>, which this guide links to throughout.

---

## Table of Contents

<div id="content-table">

- [1.1. Installation, Artisan CLI & Directory Structure](#11-installation-artisan-cli--directory-structure "Setting up a project and the .env file")
- [1.2. Routing & Controllers](#12-routing--controllers "Mapping URLs to application logic")
- [1.3. Views & Blade](#13-views--blade "Layouts and Components")
- [1.4. The Request/Response Lifecycle](#14-the-requestresponse-lifecycle "How Laravel turns an HTTP request into a response")
- [1.5. Dependency Injection & Service Providers](#15-dependency-injection--service-providers "How Laravel wires the pieces of an application together")

</div>

---

## 1.1. Installation, Artisan CLI & Directory Structure

A new Laravel project is created through **Composer**, PHP's package manager, which downloads Laravel itself along with every dependency it needs:

```bash

    composer create-project laravel/laravel example-app
    cd example-app
    php artisan serve   # Starts a local development server at http://localhost:8000


```

**Artisan** is Laravel's built-in command-line tool, used constantly throughout a project's life: it generates boilerplate code (controllers, models, migrations...), runs database migrations, and exposes dozens of maintenance commands. `php artisan list` shows every command available.

```bash

    php artisan make:controller BookController
    php artisan make:model Book -m   # The -m flag also generates a matching migration


```

Configuration that changes between environments (database credentials, API keys, debug mode) lives in a `.env` file at the project root — never committed to version control — and is read through the `env()` helper or, more commonly, through Laravel's own `config()` files that wrap it.

| Directory | Purpose |
| :--- | :--- |
| `app/` | Application code: Models, Controllers, Providers... |
| `routes/` | Route definitions (`web.php`, `api.php`) |
| `resources/views/` | Blade templates |
| `database/migrations/` | Database schema version control |
| `.env` | Environment-specific configuration (never committed) |

**Common mistake:** committing the `.env` file to version control. It holds real secrets (database passwords, API keys) for whichever environment it was last configured for; `.env.example`, a version with placeholder values, is what should be committed instead.

---

## 1.2. Routing & Controllers

A **route** maps a URL and an HTTP method to the code that should handle it, defined in `routes/web.php` for a normal website or `routes/api.php` for an API.

```php

    // routes/web.php
    use App\Http\Controllers\BookController;

    Route::get('/books', [BookController::class, 'index']);
    Route::get('/books/{id}', [BookController::class, 'show']);
    Route::post('/books', [BookController::class, 'store']);


```

For anything beyond a one-line response, the route points to a method on a **Controller**: a class that groups related request-handling logic together, keeping the route file itself short and readable.

```php

    // app/Http/Controllers/BookController.php
    namespace App\Http\Controllers;

    class BookController extends Controller
    {
        public function index()
        {
            return Book::all();
        }

        public function show($id)
        {
            return Book::findOrFail($id);
        }
    }


```

`{id}` in a route path is a **route parameter**: Laravel extracts that segment of the URL and passes it as an argument to the matching controller method, in the same order it appears in the path.

**Common mistake:** cramming complex business logic directly inside a route's closure in `web.php` instead of a controller. It works for a quick prototype, but the file quickly becomes unreadable, and that logic cannot be reused or tested in isolation.

---

## 1.3. Views & Blade

A **view** is the template rendered back to the browser. Laravel's templating engine, **Blade**, lets plain HTML mix with PHP-like directives, and compiles to plain, optimized PHP behind the scenes, so it adds virtually no runtime overhead.

```blade

    {{-- resources/views/books/index.blade.php --}}
    <h1>Books</h1>
    <ul>
        @foreach ($books as $book)
            <li>{{ $book->title }}</li>
        @endforeach
    </ul>


```

`{{ }}` outputs a value with its special characters automatically escaped, preventing **XSS** (cross-site scripting) attacks by default; `{{-- --}}` is a Blade comment, stripped from the final output entirely.

A **layout** is a shared template (header, navigation, footer) that individual pages fill in through `@section`/`@yield`, or more commonly today, through **components** — reusable pieces of markup with their own logic, similar to a component in a frontend framework like React or Astro.

```blade

    {{-- resources/views/components/alert.blade.php --}}
    <div class="alert alert-{{ $type }}">
        {{ $slot }}
    </div>

    {{-- Used in another view as: --}}
    <x-alert type="danger">Something went wrong.</x-alert>


```

**Common mistake:** outputting untrusted data with `{!! !!}` instead of `{{ }}` out of habit or to "fix" broken-looking HTML. `{!! !!}` outputs raw, unescaped HTML, reopening the door to XSS attacks that `{{ }}` closes by default — use it only for content you are certain is already safe.

---

## 1.4. The Request/Response Lifecycle

Every request to a Laravel application follows the same journey: it enters through `public/index.php`, is handled by the framework's central **kernel**, passes through any applicable **middleware** (covered in the next guide), gets matched to a route, and that route's controller returns a **Response** — which Laravel then sends back to the browser.

```bash

    Browser Request --> index.php --> Kernel --> Middleware --> Route --> Controller --> Response --> Browser


```

A controller does not need to manually build a full HTTP response object for common cases — returning a string, an array (auto-converted to JSON), or a view is enough, and Laravel wraps it in a proper `Response` automatically.

```php

    public function show($id)
    {
        // Returning a view: Laravel builds an HTML response
        return view('books.show', ['book' => Book::findOrFail($id)]);
    }

    public function apiShow($id)
    {
        // Returning an array: Laravel builds a JSON response automatically
        return Book::findOrFail($id);
    }


```

**Common mistake:** assuming a controller method must always explicitly build and return a `Response` object. In practice, returning simpler values (a view, an array, a model) is idiomatic Laravel, and the framework converts them for you.

---

## 1.5. Dependency Injection & Service Providers

**Dependency injection** means a class receives the objects it depends on from the outside, instead of creating them itself. Laravel's **service container** resolves these dependencies automatically: type-hinting a class in a controller method's parameters is enough for Laravel to instantiate it and hand it over.

```php

    use App\Services\BookRecommender;

    class BookController extends Controller
    {
        public function recommendations(BookRecommender $recommender)
        {
            // Laravel instantiates BookRecommender (and anything IT depends on) automatically
            return $recommender->forCurrentUser();
        }
    }


```

A **service provider** is where the application tells Laravel's container *how* to build a class, typically when that class needs specific configuration rather than a plain `new SomeClass()`. Every Laravel application already ships with a handful of default providers, registered in `bootstrap/providers.php`.

```php

    // app/Providers/AppServiceProvider.php
    public function register()
    {
        $this->app->bind(BookRecommender::class, function ($app) {
            return new BookRecommender(config('services.recommendations.api_key'));
        });
    }


```

**Common mistake:** manually instantiating a class with `new` deep inside a controller instead of letting the container inject it. Beyond the extra boilerplate, it makes that piece of code much harder to test, since a test cannot easily substitute a fake version of a dependency that was hardcoded with `new`.

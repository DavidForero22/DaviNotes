---
title: "Ecosystem, APIs & Advanced Laravel"
---

# Ecosystem, APIs & Advanced Level

The last step is preparing an application for the real world: exposing it as an API for modern frontends (React, Vue), authenticating those clients securely, reacting to events in real time, offloading slow work so it does not block a request, and deploying it efficiently. This section also introduces a few first-party Laravel packages worth knowing exist, even before you need to reach for them directly.

---

## Table of Contents

<div id="content-table">

- [3.1. Building RESTful APIs](#31-building-restful-apis "API routes and API Resources")
- [3.2. Modern Authentication](#32-modern-authentication "Tokens, SPAs and social login")
- [3.3. Events & WebSockets](#33-events--websockets "Real-time applications")
- [3.4. Background Jobs & Scheduled Tasks](#34-background-jobs--scheduled-tasks "Queues, Jobs and the task scheduler")
- [3.5. Deployment & Cache Optimization](#35-deployment--cache-optimization "Preparing an application for production")

</div>

---

## 3.1. Building RESTful APIs

Routes meant for an API (rather than a browser rendering HTML) live in `routes/api.php`, automatically prefixed with `/api` and stripped of session/cookie-based state, since API clients are expected to be stateless.

```php

    // routes/api.php
    Route::get('/books', [Api\BookController::class, 'index']);
    Route::apiResource('books', Api\BookController::class); // Generates index/store/show/update/destroy routes at once


```

Returning an Eloquent model directly from a controller converts it to JSON automatically, but that couples the API's response shape directly to the database schema. An **API Resource** is a dedicated class that controls exactly what a model's JSON representation looks like, decoupling the two.

```php

    // app/Http/Resources/BookResource.php
    class BookResource extends JsonResource
    {
        public function toArray(Request $request): array
        {
            return [
                'id' => $this->id,
                'title' => $this->title,
                'price_formatted' => '$' . number_format($this->price, 2),
                // "created_at" from the database is deliberately left out of the API response
            ];
        }
    }


```

```php

    public function show($id)
    {
        return new BookResource(Book::findOrFail($id));
    }


```

**Common mistake:** returning Eloquent models directly from every API endpoint. It works initially, but any internal-only column (like a password hash, or a field not ready for public use yet) gets exposed to every API client automatically, and the response shape becomes tightly coupled to database column names.

---

## 3.2. Modern Authentication

Traditional session-based login (used by the `auth` middleware from the previous guide) assumes a browser holding cookies — it does not fit a mobile app or a separate frontend calling the API from a different domain. <a href="https://laravel.com/docs/sanctum" class="doc-link" target="_blank" rel="noopener noreferrer" title="Laravel Sanctum Documentation">**Laravel Sanctum**</a> is an official, lightweight package that solves both cases: it issues simple API tokens (ideal for mobile apps) and, separately, authenticates **SPAs** (Single Page Applications built with React, Vue, etc.) securely through cookies, without the complexity of a full OAuth2 setup.

```php

    // Issuing a token for a mobile client
    $token = $user->createToken('mobile-app')->plainTextToken;

    // Protecting an API route so only a valid token can access it
    Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
        return $request->user();
    });


```

For "Login with Google/GitHub/X" style authentication, <a href="https://laravel.com/docs/socialite" class="doc-link" target="_blank" rel="noopener noreferrer" title="Laravel Socialite Documentation">**Laravel Socialite**</a> provides a simple, fluent interface to OAuth providers, avoiding the need to write the connection and validation code for each social network from scratch.

```php

    // Redirects the user to the provider's login page
    Route::get('/auth/github', fn () => Socialite::driver('github')->redirect());

    // Handles the callback once the user approves and returns from GitHub
    Route::get('/auth/github/callback', function () {
        $githubUser = Socialite::driver('github')->user();
        // ...find or create a local user based on $githubUser, then log them in
    });


```

**Common mistake:** reaching straight for a full OAuth2 server setup (like Passport) when the actual need is simpler — a mobile app's API token, or a same-organization SPA. Sanctum covers both of those common cases with far less configuration.

---

## 3.3. Events & WebSockets

An **event** represents something that happened in the application (an order was placed, a comment was posted); one or more **listeners** react to it, decoupling the code that triggers an action from the code that handles its side effects.

```php

    // Dispatching an event
    event(new OrderShipped($order));

    // app/Listeners/SendShipmentNotification.php
    class SendShipmentNotification
    {
        public function handle(OrderShipped $event): void
        {
            Mail::to($event->order->customer)->send(new ShipmentMailable($event->order));
        }
    }


```

Some events need to reach the browser instantly, without waiting for the user to reload the page — live notifications, a chat message appearing for the other participant. This requires a **WebSocket** connection, kept open between the browser and the server. <a href="https://laravel.com/docs/reverb" class="doc-link" target="_blank" rel="noopener noreferrer" title="Laravel Reverb Documentation">**Laravel Reverb**</a> is Laravel's own, first-party WebSocket server: fast, natively integrated with Laravel's event system, and a free, self-hosted alternative to third-party paid services like Pusher.

```php

    // Marking an event as broadcastable sends it over WebSockets automatically
    class OrderShipped implements ShouldBroadcast
    {
        public function broadcastOn(): array
        {
            return [new PrivateChannel('orders.' . $this->order->id)];
        }
    }


```

```js

    // On the frontend (using Laravel Echo, the companion JS client)
    Echo.private(`orders.${orderId}`).listen('OrderShipped', (event) => {
        console.log('Order shipped!', event);
    });


```

**Common mistake:** using events purely for logging side effects that a simple function call would handle just as well, adding indirection without real benefit. Events pay off when multiple, genuinely independent listeners need to react to the same thing — or when that reaction needs to be broadcast in real time.

---

## 3.4. Background Jobs & Scheduled Tasks

Some work is too slow to run during a request — sending an email, processing an uploaded video, generating a report — and would leave the user waiting unnecessarily. A **Job** dispatched onto a **Queue** runs in a separate background process instead, so the original request can return to the user immediately.

```php

    // app/Jobs/GenerateReportPdf.php
    class GenerateReportPdf implements ShouldQueue
    {
        public function handle(): void
        {
            // Slow work: runs in the background, not during the original request
        }
    }


```

```php

    GenerateReportPdf::dispatch($report);   // Returns immediately; the job runs separately


```

```bash

    php artisan queue:work   # Starts a worker process that picks up and runs queued jobs


```

The **scheduler** replaces manually configuring cron jobs on a server with plain PHP: every scheduled task is defined once in code, and a single cron entry runs the scheduler itself every minute, which then decides what actually needs to run.

```php

    // routes/console.php
    Schedule::command('reports:cleanup')->daily();
    Schedule::call(fn () => Report::pruneOld())->weekly();


```

**Common mistake:** running slow work (like sending an email) directly during a request instead of dispatching it as a job. The user is left staring at a loading spinner for however long that slow operation takes, for no benefit — queuing it lets the response return immediately.

---

## 3.5. Deployment & Cache Optimization

Laravel reads configuration, routes, and views fresh on every request by default, which is convenient during development but wastes time in production, where none of those things change between requests. Several Artisan commands cache them ahead of time:

```bash

    php artisan config:cache   # Combines every config file into a single, fast-to-load file
    php artisan route:cache    # Same idea, for route definitions
    php artisan view:cache     # Pre-compiles Blade templates to plain PHP


```

These caches must be cleared and rebuilt after every deployment (`php artisan optimize` runs the common ones together); forgetting this after changing a config value or `.env` variable is a frequent source of "my change isn't taking effect in production" confusion, since the cached version keeps being served instead.

Beyond caching, a production deployment typically also runs pending migrations (`php artisan migrate --force`), sets `APP_DEBUG=false` in `.env` (so detailed error pages are never shown to real users), and runs queue workers and the scheduler as persistent background processes (often managed by a tool like Supervisor).

**Common mistake:** deploying a code change and expecting it to take effect immediately, without clearing the config/route/view caches from the previous deployment. Laravel keeps serving the stale, cached version until it is explicitly rebuilt.

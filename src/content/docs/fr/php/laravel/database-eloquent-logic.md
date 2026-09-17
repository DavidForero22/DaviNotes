---
title: "Base de données, Eloquent et logique métier avec Laravel"
---

# Base de Données, Eloquent et Logique Métier

Le flux requête/réponse et la structure MVC posés, l'étape suivante est de persister les données de façon fiable. Cette section couvre l'approche de Laravel pour les changements de schéma de base de données, son ORM (**Eloquent**) pour travailler avec la base de données via des objets PHP plutôt que du SQL brut, la validation des données entrantes, et le filtrage des requêtes avec des middlewares.

---

## Table des matières

<div id="content-table">

- [2.1. Migrations et Seeders](#21-migrations-et-seeders "Contrôle de version de la base de données")
- [2.2. Eloquent ORM I : Modèles et CRUD](#22-eloquent-orm-i--modèles-et-crud "Opérations fluides de création, lecture, mise à jour et suppression")
- [2.3. Eloquent ORM II : Relations et Eager Loading](#23-eloquent-orm-ii--relations-et-eager-loading "1:1, 1:N, N:M et le problème des requêtes N+1")
- [2.4. Validation et gestion des exceptions](#24-validation-et-gestion-des-exceptions "Form Requests et gérer les erreurs avec élégance")
- [2.5. Middlewares](#25-middlewares "Filtrage des requêtes et protection des routes")

</div>

---

## 2.1. Migrations et Seeders

Une **migration** est un fichier PHP qui décrit un changement du schéma de base de données (créer une table, ajouter une colonne...) sous forme de code plutôt que de SQL brut, généré via Artisan et exécuté dans l'ordre.

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
            $table->timestamps(); // Ajoute automatiquement les colonnes created_at et updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('books');
    }


```

```bash

    php artisan migrate            # Applique toutes les migrations pas encore exécutées
    php artisan migrate:rollback   # Annule le dernier lot de migrations, via la méthode "down" de chacune


```

Comme les migrations ne sont que des fichiers versionnés, chaque développeur d'une équipe — et chaque environnement (staging, production) — peut reconstruire exactement le même schéma en exécutant `php artisan migrate`, au lieu de synchroniser les bases de données à la main.

Un **seeder** remplit la base de données avec des données, généralement pour le développement local ou les tests, souvent couplé à des **factories** qui génèrent automatiquement de fausses données réalistes.

```php

    // database/seeders/BookSeeder.php
    public function run(): void
    {
        Book::factory()->count(50)->create();
    }


```

**Erreur courante :** modifier un fichier de migration déjà exécuté pour corriger une erreur, au lieu de créer une nouvelle migration. Quiconque a déjà exécuté la migration originale se retrouve avec une base de données qui ne correspond plus au fichier modifié, car Laravel ne suit que *quelles* migrations ont été exécutées, pas leur contenu actuel.

---

## 2.2. Eloquent ORM I : Modèles et CRUD

**Eloquent** est l'**ORM** (Object-Relational Mapper) de Laravel : chaque table de la base de données obtient une classe **Modèle** correspondante, et les lignes deviennent des instances de cette classe, permettant de lire et écrire des données via de simples appels de méthodes PHP plutôt que d'écrire du SQL à la main.

```php

    // app/Models/Book.php
    class Book extends Model
    {
        // Par convention, ceci correspond automatiquement à la table "books"
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

Ce style chaînable — `Book::where(...)->orderBy(...)->get()` — s'appelle le **fluent query builder** : chaque méthode renvoie un objet sur lequel d'autres méthodes peuvent être appelées, permettant de construire une requête morceau par morceau tout en restant lisible.

**Erreur courante :** appeler `Book::find($id)` avec un id qui n'existe pas. La méthode renvoie silencieusement `null` au lieu de lever une erreur, ce qui fait planter l'application plus tard avec une erreur confuse de type "appel d'une fonction membre sur null" dès que le code tente de l'utiliser. `Book::findOrFail($id)` est le choix par défaut le plus sûr : il lève immédiatement une erreur 404 explicite et interceptable quand rien n'est trouvé.

---

## 2.3. Eloquent ORM II : Relations et Eager Loading

Tout comme les clés étrangères relient les tables en SQL pur, les modèles Eloquent déclarent des **relations** entre eux sous forme de méthodes PHP, après quoi les données liées sont accessibles comme s'il s'agissait d'une propriété normale.

```php

    class Author extends Model
    {
        public function books() // 1:N — un auteur a plusieurs livres
        {
            return $this->hasMany(Book::class);
        }
    }

    class Book extends Model
    {
        public function author() // Le sens inverse de la relation 1:N ci-dessus
        {
            return $this->belongsTo(Author::class);
        }

        public function tags() // N:M — un livre peut avoir plusieurs tags, et un tag plusieurs livres
        {
            return $this->belongsToMany(Tag::class);
        }
    }


```

```php

    $author = Author::find(1);
    $author->books;          // Tous les livres de cet auteur (1:N)

    $book = Book::find(1);
    $book->author;           // L'auteur de ce livre (le sens inverse)
    $book->tags;              // Tous les tags de ce livre (N:M)


```

Une relation **1:1** (un utilisateur et son unique profil, par exemple) utilise `hasOne`/`belongsTo` de la même façon que `hasMany`/`belongsTo` gère les relations 1:N.

Accéder à une relation à l'intérieur d'une boucle déclenche ce qu'on appelle le **problème des requêtes N+1** : une requête pour récupérer les livres, puis une requête *supplémentaire par livre* pour récupérer son auteur — pour 100 livres, cela fait 101 requêtes au lieu de 2.

```php

    // ❌ Problème N+1 : 1 requête pour les livres, puis 1 requête EN PLUS PAR LIVRE pour son auteur
    foreach (Book::all() as $book) {
        echo $book->author->name;
    }

    // ✅ Eager loading : seulement 2 requêtes au total, quel que soit le nombre de livres
    foreach (Book::with('author')->get() as $book) {
        echo $book->author->name;
    }


```

**Erreur courante :** ne pas remarquer le problème N+1 parce qu'il fonctionne, un peu lentement, avec la poignée de lignes de test utilisées en développement — et ne devient un vrai problème de performance qu'une fois la table remplie de milliers de lignes réelles en production.

---

## 2.4. Validation et gestion des exceptions

Faire confiance aux données telles qu'elles arrivent dans une requête n'est pas sûr : les **Form Requests** sont des classes dédiées qui valident les données entrantes *avant* qu'elles n'atteignent la logique d'un contrôleur, gardant les règles de validation hors du contrôleur lui-même.

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

    // Le contrôleur ne s'exécute que si la validation passe ; Laravel gère automatiquement la réponse d'erreur sinon
    public function store(StoreBookRequest $request)
    {
        return Book::create($request->validated());
    }


```

Quand la validation échoue, Laravel renvoie automatiquement une réponse `422 Unprocessable Entity` (en JSON pour une API, ou une redirection avec des messages d'erreur pour un formulaire classique) — le code du contrôleur ne s'exécute même jamais.

Pour les erreurs qui surviennent plus profondément dans l'application, le **gestionnaire d'exceptions** central de Laravel (`bootstrap/app.php` dans les versions récentes) convertit les exceptions non interceptées en une réponse appropriée plutôt que de laisser une erreur PHP brute atteindre le navigateur, et peut être personnalisé pour journaliser, signaler ou formater différemment certains types d'exceptions.

**Erreur courante :** réimplémenter à la main les mêmes règles de validation dans un contrôleur au lieu d'utiliser un Form Request. Cela duplique la logique partout où elle est nécessaire et fait perdre la gestion automatique des réponses d'erreur de Laravel.

---

## 2.5. Middlewares

Les **middlewares** sont des classes qui s'exécutent *avant* (ou après) qu'une requête n'atteigne le contrôleur de sa route, utilisées pour des préoccupations transverses s'appliquant à de nombreuses routes à la fois : vérifications d'authentification, journalisation, ou limitation du nombre de requêtes.

```php

    // app/Http/Middleware/EnsureSubscribed.php
    public function handle(Request $request, Closure $next)
    {
        if (! $request->user()->subscribed()) {
            return redirect('/subscribe');
        }

        return $next($request); // Passe la main au middleware suivant ou au contrôleur de la route
    }


```

Les middlewares sont attachés aux routes individuellement ou par groupe, et Laravel en fournit plusieurs par défaut — `auth` (exige un utilisateur connecté) étant l'un des plus courants :

```php

    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('auth');

    Route::middleware(['auth', 'subscribed'])->group(function () {
        Route::get('/premium-content', [ContentController::class, 'index']);
    });


```

**Erreur courante :** oublier d'appeler `$next($request)` dans un middleware personnalisé. Le traitement de la requête s'arrête alors silencieusement à cet endroit — le contrôleur de la route ne s'exécute jamais, et aucune réponse n'est jamais renvoyée.

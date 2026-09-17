---
title: "Fondamentaux et architecture MVC de Laravel"
---

# Fondamentaux et Architecture MVC

**Laravel** est un framework PHP : plutôt que de gérer chaque requête HTTP, requête à la base de données et template à la main comme vu dans les guides PHP de base, Laravel offre une façon structurée et opinionée d'organiser ce code, avec des outils qui suppriment la majeure partie du travail répétitif. Cette section couvre le flux de travail de Laravel, le patron **MVC** (Modèle-Vue-Contrôleur) sur lequel il repose, et la création d'interfaces dynamiques avec son moteur de templates, **Blade**.

La référence complète de tout ce qui est couvert ici se trouve dans la <a href="https://laravel.com/docs" class="doc-link" target="_blank" rel="noopener noreferrer" title="Documentation officielle de Laravel">documentation officielle de Laravel</a>, vers laquelle ce guide renvoie tout au long du texte.

---

## Table des matières

<div id="content-table">

- [1.1. Installation, CLI Artisan et structure des dossiers](#11-installation-cli-artisan-et-structure-des-dossiers "Configurer un projet et le fichier .env")
- [1.2. Routage et Contrôleurs](#12-routage-et-contrôleurs "Faire correspondre des URLs à la logique de l'application")
- [1.3. Vues et Blade](#13-vues-et-blade "Layouts et Composants")
- [1.4. Le cycle de vie requête/réponse](#14-le-cycle-de-vie-requêteréponse "Comment Laravel transforme une requête HTTP en réponse")
- [1.5. Injection de dépendances et Service Providers](#15-injection-de-dépendances-et-service-providers "Comment Laravel relie les pièces d'une application entre elles")

</div>

---

## 1.1. Installation, CLI Artisan et structure des dossiers

Un nouveau projet Laravel se crée via **Composer**, le gestionnaire de paquets de PHP, qui télécharge Laravel lui-même ainsi que toutes les dépendances dont il a besoin :

```bash

    composer create-project laravel/laravel example-app
    cd example-app
    php artisan serve   # Démarre un serveur de développement local sur http://localhost:8000


```

**Artisan** est l'outil en ligne de commande intégré à Laravel, utilisé constamment tout au long de la vie d'un projet : il génère du code répétitif (contrôleurs, modèles, migrations...), exécute les migrations de base de données, et expose des dizaines de commandes de maintenance. `php artisan list` affiche toutes les commandes disponibles.

```bash

    php artisan make:controller BookController
    php artisan make:model Book -m   # L'option -m génère aussi une migration correspondante


```

La configuration qui change selon l'environnement (identifiants de base de données, clés d'API, mode debug) vit dans un fichier `.env` à la racine du projet — jamais versionné — et se lit via le helper `env()` ou, plus généralement, via les propres fichiers `config()` de Laravel qui l'enveloppent.

| Dossier | Rôle |
| :--- | :--- |
| `app/` | Code de l'application : Modèles, Contrôleurs, Providers... |
| `routes/` | Définitions de routes (`web.php`, `api.php`) |
| `resources/views/` | Templates Blade |
| `database/migrations/` | Contrôle de version du schéma de base de données |
| `.env` | Configuration propre à l'environnement (jamais versionnée) |

**Erreur courante :** versionner le fichier `.env`. Il contient de vrais secrets (mots de passe de base de données, clés d'API) pour l'environnement pour lequel il a été configuré en dernier ; c'est `.env.example`, une version avec des valeurs de substitution, qui devrait être versionné à la place.

---

## 1.2. Routage et Contrôleurs

Une **route** associe une URL et une méthode HTTP au code censé la traiter, définie dans `routes/web.php` pour un site web classique ou `routes/api.php` pour une API.

```php

    // routes/web.php
    use App\Http\Controllers\BookController;

    Route::get('/books', [BookController::class, 'index']);
    Route::get('/books/{id}', [BookController::class, 'show']);
    Route::post('/books', [BookController::class, 'store']);


```

Au-delà d'une réponse tenant sur une ligne, la route pointe vers une méthode d'un **Contrôleur** : une classe qui regroupe la logique de traitement de requêtes liée, gardant le fichier de routes lui-même court et lisible.

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

`{id}` dans le chemin d'une route est un **paramètre de route** : Laravel extrait ce segment de l'URL et le transmet comme argument à la méthode du contrôleur correspondante, dans le même ordre que dans le chemin.

**Erreur courante :** entasser une logique métier complexe directement dans la closure d'une route de `web.php` au lieu d'un contrôleur. Cela fonctionne pour un prototype rapide, mais le fichier devient vite illisible, et cette logique ne peut ni être réutilisée ni testée isolément.

---

## 1.3. Vues et Blade

Une **vue** est le template renvoyé au navigateur. Le moteur de templates de Laravel, **Blade**, permet de mélanger du HTML classique avec des directives ressemblant à du PHP, et se compile en PHP simple et optimisé en coulisses, donc il n'ajoute quasiment aucune surcharge à l'exécution.

```blade

    {{-- resources/views/books/index.blade.php --}}
    <h1>Books</h1>
    <ul>
        @foreach ($books as $book)
            <li>{{ $book->title }}</li>
        @endforeach
    </ul>


```

`{{ }}` affiche une valeur en échappant automatiquement ses caractères spéciaux, empêchant par défaut les attaques **XSS** (cross-site scripting) ; `{{-- --}}` est un commentaire Blade, entièrement retiré de la sortie finale.

Un **layout** est un template partagé (en-tête, navigation, pied de page) que chaque page vient compléter via `@section`/`@yield`, ou plus couramment aujourd'hui, via des **composants** : des morceaux de markup réutilisables avec leur propre logique, semblables à un composant d'un framework frontend comme React ou Astro.

```blade

    {{-- resources/views/components/alert.blade.php --}}
    <div class="alert alert-{{ $type }}">
        {{ $slot }}
    </div>

    {{-- Utilisé dans une autre vue ainsi : --}}
    <x-alert type="danger">Une erreur s'est produite.</x-alert>


```

**Erreur courante :** afficher des données non fiables avec `{!! !!}` au lieu de `{{ }}`, par habitude ou pour "réparer" du HTML qui semblait cassé. `{!! !!}` affiche du HTML brut, non échappé, rouvrant la porte aux attaques XSS que `{{ }}` ferme par défaut ; à réserver au contenu dont on est certain qu'il est déjà sûr.

---

## 1.4. Le cycle de vie requête/réponse

Chaque requête vers une application Laravel suit le même parcours : elle entre par `public/index.php`, est prise en charge par le **kernel** central du framework, traverse les éventuels **middlewares** applicables (vus dans le guide suivant), est associée à une route, et le contrôleur de cette route renvoie une **Response** — que Laravel envoie ensuite au navigateur.

```bash

    Requête du navigateur --> index.php --> Kernel --> Middleware --> Route --> Contrôleur --> Response --> Navigateur


```

Un contrôleur n'a pas besoin de construire manuellement un objet de réponse HTTP complet dans les cas courants : renvoyer une chaîne, un tableau (converti automatiquement en JSON) ou une vue suffit, et Laravel l'enveloppe automatiquement dans une `Response` appropriée.

```php

    public function show($id)
    {
        // Renvoyer une vue : Laravel construit une réponse HTML
        return view('books.show', ['book' => Book::findOrFail($id)]);
    }

    public function apiShow($id)
    {
        // Renvoyer un tableau : Laravel construit automatiquement une réponse JSON
        return Book::findOrFail($id);
    }


```

**Erreur courante :** supposer qu'une méthode de contrôleur doit toujours construire et renvoyer explicitement un objet `Response`. En pratique, renvoyer des valeurs plus simples (une vue, un tableau, un modèle) est idiomatique en Laravel, et le framework les convertit à votre place.

---

## 1.5. Injection de dépendances et Service Providers

L'**injection de dépendances** signifie qu'une classe reçoit de l'extérieur les objets dont elle dépend, au lieu de les créer elle-même. Le **conteneur de services** de Laravel résout ces dépendances automatiquement : indiquer le type d'une classe dans les paramètres d'une méthode de contrôleur suffit pour que Laravel l'instancie et la fournisse.

```php

    use App\Services\BookRecommender;

    class BookController extends Controller
    {
        public function recommendations(BookRecommender $recommender)
        {
            // Laravel instancie BookRecommender (et tout ce dont IL dépend) automatiquement
            return $recommender->forCurrentUser();
        }
    }


```

Un **Service Provider** est l'endroit où l'application indique au conteneur de Laravel *comment* construire une classe, généralement quand cette classe a besoin d'une configuration spécifique plutôt que d'un simple `new SomeClass()`. Chaque application Laravel est déjà livrée avec quelques providers par défaut, enregistrés dans `bootstrap/providers.php`.

```php

    // app/Providers/AppServiceProvider.php
    public function register()
    {
        $this->app->bind(BookRecommender::class, function ($app) {
            return new BookRecommender(config('services.recommendations.api_key'));
        });
    }


```

**Erreur courante :** instancier manuellement une classe avec `new` au fond d'un contrôleur au lieu de laisser le conteneur l'injecter. Au-delà du code répétitif supplémentaire, cela rend cette partie du code bien plus difficile à tester, car un test ne peut pas facilement substituer une fausse version d'une dépendance figée avec `new`.

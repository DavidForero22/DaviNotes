---
title: "Écosystème, API et niveau avancé de Laravel"
---

# Écosystème, API et Niveau Avancé

La dernière étape consiste à préparer une application pour le monde réel : l'exposer comme une API pour des frontends modernes (React, Vue), authentifier ces clients de façon sécurisée, réagir à des événements en temps réel, déporter le travail lent pour qu'il ne bloque pas une requête, et la déployer efficacement. Cette section présente aussi quelques paquets officiels Laravel qu'il vaut la peine de connaître, même avant d'en avoir besoin directement.

---

## Table des matières

<div id="content-table">

- [3.1. Développement d'API RESTful](#31-développement-dapi-restful "Routes API et API Resources")
- [3.2. Authentification moderne](#32-authentification-moderne "Tokens, SPA et login social")
- [3.3. Événements et WebSockets](#33-événements-et-websockets "Applications en temps réel")
- [3.4. Tâches en arrière-plan et tâches planifiées](#34-tâches-en-arrière-plan-et-tâches-planifiées "Queues, Jobs et le planificateur de tâches")
- [3.5. Déploiement et optimisation du cache](#35-déploiement-et-optimisation-du-cache "Préparer une application pour la production")

</div>

---

## 3.1. Développement d'API RESTful

Les routes destinées à une API (plutôt qu'à un navigateur affichant du HTML) vivent dans `routes/api.php`, automatiquement préfixées par `/api` et débarrassées de l'état basé sur les sessions/cookies, puisque les clients d'API sont censés être sans état.

```php

    // routes/api.php
    Route::get('/books', [Api\BookController::class, 'index']);
    Route::apiResource('books', Api\BookController::class); // Génère d'un coup les routes index/store/show/update/destroy


```

Renvoyer directement un modèle Eloquent depuis un contrôleur le convertit automatiquement en JSON, mais cela couple directement la forme de la réponse de l'API au schéma de la base de données. Une **API Resource** est une classe dédiée qui contrôle exactement à quoi ressemble la représentation JSON d'un modèle, découplant les deux.

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
                // "created_at" de la base de données est volontairement omis de la réponse de l'API
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

**Erreur courante :** renvoyer directement des modèles Eloquent depuis chaque point d'entrée de l'API. Cela fonctionne au début, mais toute colonne à usage interne (comme un hash de mot de passe, ou un champ pas encore prêt à être public) se retrouve exposée automatiquement à chaque client de l'API, et la forme de la réponse devient fortement couplée aux noms des colonnes de la base de données.

---

## 3.2. Authentification moderne

La connexion traditionnelle basée sur les sessions (utilisée par le middleware `auth` du guide précédent) suppose un navigateur conservant des cookies — cela ne convient ni à une application mobile ni à un frontend séparé appelant l'API depuis un autre domaine. <a href="https://laravel.com/docs/sanctum" class="doc-link" target="_blank" rel="noopener noreferrer" title="Documentation de Laravel Sanctum">**Laravel Sanctum**</a> est un paquet officiel et léger qui résout les deux cas : il émet de simples tokens d'API (idéal pour les applications mobiles) et, séparément, authentifie les **SPA** (Single Page Applications construites avec React, Vue, etc.) de façon sécurisée via des cookies, sans la complexité d'une configuration OAuth2 complète.

```php

    // Émettre un token pour un client mobile
    $token = $user->createToken('mobile-app')->plainTextToken;

    // Protéger une route API pour que seul un token valide puisse y accéder
    Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
        return $request->user();
    });


```

Pour une authentification de type "Se connecter avec Google/GitHub/X", <a href="https://laravel.com/docs/socialite" class="doc-link" target="_blank" rel="noopener noreferrer" title="Documentation de Laravel Socialite">**Laravel Socialite**</a> fournit une interface simple et fluide vers les fournisseurs OAuth, évitant d'avoir à écrire le code de connexion et de validation pour chaque réseau social depuis zéro.

```php

    // Redirige l'utilisateur vers la page de connexion du fournisseur
    Route::get('/auth/github', fn () => Socialite::driver('github')->redirect());

    // Gère le retour une fois que l'utilisateur a approuvé depuis GitHub
    Route::get('/auth/github/callback', function () {
        $githubUser = Socialite::driver('github')->user();
        // ...trouve ou crée un utilisateur local à partir de $githubUser, puis connecte-le
    });


```

**Erreur courante :** se tourner directement vers une configuration OAuth2 complète (comme Passport) alors que le besoin réel est plus simple — un token d'API pour une application mobile, ou une SPA de la même organisation. Sanctum couvre ces deux cas courants avec bien moins de configuration.

---

## 3.3. Événements et WebSockets

Un **événement** représente quelque chose qui s'est produit dans l'application (une commande a été passée, un commentaire a été publié) ; un ou plusieurs **listeners** y réagissent, découplant le code qui déclenche une action du code qui gère ses effets de bord.

```php

    // Déclencher un événement
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

Certains événements doivent atteindre le navigateur instantanément, sans attendre que l'utilisateur recharge la page — notifications en direct, un message de chat qui apparaît chez l'autre participant. Cela nécessite une connexion **WebSocket**, maintenue ouverte entre le navigateur et le serveur. <a href="https://laravel.com/docs/reverb" class="doc-link" target="_blank" rel="noopener noreferrer" title="Documentation de Laravel Reverb">**Laravel Reverb**</a> est le propre serveur WebSocket officiel de Laravel : rapide, nativement intégré à son système d'événements, et une alternative gratuite et auto-hébergée aux services tiers payants comme Pusher.

```php

    // Marquer un événement comme diffusable l'envoie automatiquement via WebSockets
    class OrderShipped implements ShouldBroadcast
    {
        public function broadcastOn(): array
        {
            return [new PrivateChannel('orders.' . $this->order->id)];
        }
    }


```

```js

    // Côté frontend (avec Laravel Echo, le client JS qui l'accompagne)
    Echo.private(`orders.${orderId}`).listen('OrderShipped', (event) => {
        console.log('Commande expédiée !', event);
    });


```

**Erreur courante :** utiliser les événements uniquement pour des effets de bord de journalisation qu'un simple appel de fonction gérerait tout aussi bien, ajoutant de l'indirection sans réel bénéfice. Les événements sont rentables quand plusieurs listeners réellement indépendants doivent réagir à la même chose — ou quand cette réaction doit être diffusée en temps réel.

---

## 3.4. Tâches en arrière-plan et tâches planifiées

Certains travaux sont trop lents pour s'exécuter pendant une requête — envoyer un e-mail, traiter une vidéo téléversée, générer un rapport — et laisseraient l'utilisateur attendre inutilement. Un **Job** envoyé sur une **Queue** s'exécute à la place dans un processus séparé en arrière-plan, afin que la requête d'origine puisse répondre immédiatement à l'utilisateur.

```php

    // app/Jobs/GenerateReportPdf.php
    class GenerateReportPdf implements ShouldQueue
    {
        public function handle(): void
        {
            // Travail lent : s'exécute en arrière-plan, pas pendant la requête d'origine
        }
    }


```

```php

    GenerateReportPdf::dispatch($report);   // Revient immédiatement ; le job s'exécute séparément


```

```bash

    php artisan queue:work   # Démarre un processus worker qui récupère et exécute les jobs en file d'attente


```

Le **planificateur (scheduler)** remplace la configuration manuelle de tâches cron sur un serveur par du PHP simple : chaque tâche planifiée est définie une fois dans le code, et une seule entrée cron exécute le planificateur lui-même chaque minute, qui décide alors ce qui doit réellement s'exécuter.

```php

    // routes/console.php
    Schedule::command('reports:cleanup')->daily();
    Schedule::call(fn () => Report::pruneOld())->weekly();


```

**Erreur courante :** exécuter un travail lent (comme l'envoi d'un e-mail) directement pendant une requête au lieu de le déléguer à un job. L'utilisateur reste face à un indicateur de chargement pendant toute la durée de cette opération lente, sans aucun bénéfice — la mettre en file d'attente permet à la réponse de revenir immédiatement.

---

## 3.5. Déploiement et optimisation du cache

Par défaut, Laravel lit la configuration, les routes et les vues à neuf à chaque requête, ce qui est pratique en développement mais fait perdre du temps en production, où rien de tout cela ne change entre les requêtes. Plusieurs commandes Artisan les mettent en cache à l'avance :

```bash

    php artisan config:cache   # Combine tous les fichiers de configuration en un seul, rapide à charger
    php artisan route:cache    # Même principe, pour les définitions de routes
    php artisan view:cache     # Précompile les templates Blade en PHP simple


```

Ces caches doivent être vidés puis reconstruits après chaque déploiement (`php artisan optimize` exécute les principales commandes ensemble) ; oublier cette étape après avoir changé une valeur de configuration ou une variable `.env` est une source fréquente de confusion du type "mon changement ne prend pas effet en production", puisque c'est la version mise en cache qui continue d'être servie.

Au-delà du cache, un déploiement en production exécute généralement aussi les migrations en attente (`php artisan migrate --force`), définit `APP_DEBUG=false` dans `.env` (pour que des pages d'erreur détaillées ne soient jamais montrées à de vrais utilisateurs), et fait tourner les workers de files d'attente et le planificateur comme des processus d'arrière-plan persistants (souvent gérés par un outil comme Supervisor).

**Erreur courante :** déployer un changement de code et s'attendre à ce qu'il prenne effet immédiatement, sans vider les caches de configuration/routes/vues du déploiement précédent. Laravel continue de servir la version périmée et mise en cache jusqu'à ce qu'elle soit explicitement reconstruite.

---
title: "Développement d'applications et d'API avec Node.js"
---

# Développement d'Applications et d'API

Les fondamentaux acquis, place à la pratique : construire des API fonctionnelles, structurées et connectées à des données réelles. Cette section couvre la création d'un serveur à partir de zéro, l'utilisation d'un framework pour ne pas réinventer la roue, et les éléments dont toute API en production a besoin — routage, validation, persistance et gestion des erreurs.

---

## Table des matières

<div id="content-table">

- [2.1. Création d'un serveur HTTP à partir de zéro](#21-création-dun-serveur-http-à-partir-de-zéro "Utiliser le module http de Node")
- [2.2. Frameworks de développement](#22-frameworks-de-développement "Express.js et Fastify")
- [2.3. Routes, Middleware et validation des données](#23-routes-middleware-et-validation-des-données "Structurer une API")
- [2.4. Connexion et persistance avec les bases de données](#24-connexion-et-persistance-avec-les-bases-de-données "Bases de données SQL et NoSQL")
- [2.5. Gestion globale des erreurs et Logging](#25-gestion-globale-des-erreurs-et-logging "Garder une app en production observable et stable")

</div>

---

## 2.1. Création d'un serveur HTTP à partir de zéro

Avant de se tourner vers un framework, il vaut la peine de voir précisément ce qu'il permet d'éviter. Le module `http` intégré à Node peut démarrer un serveur web fonctionnel sans aucune dépendance externe.

```js

    const http = require("http");

    const server = http.createServer((req, res) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");

        if (req.url === "/" && req.method === "GET") {
            res.end(JSON.stringify({ message: "Bonjour, Node.js !" }));
        } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: "Introuvable" }));
        }
    });

    server.listen(3000, () => {
        console.log("Serveur lancé sur http://localhost:3000");
    });


```

Chaque gestionnaire de requête reçoit un objet **request** (`req`, avec l'URL, la méthode, les en-têtes et le corps) et un objet **response** (`res`, utilisé pour renvoyer le statut, les en-têtes et un corps de réponse). Remarquez la quantité de travail manuel nécessaire juste pour vérifier l'URL et la méthode : le routage, l'analyse du corps de la requête et la gestion des erreurs devraient tous être écrits à la main.

**Erreur courante :** oublier d'appeler `res.end()`. Sans cela, la réponse ne se termine jamais et la requête du client reste bloquée jusqu'à expiration du délai.

---

## 2.2. Frameworks de développement

Les **frameworks** prennent en charge les parties répétitives de la construction d'un serveur — routage, analyse des corps de requête, envoi des réponses — pour que vous puissiez vous concentrer sur la logique métier. **Express.js** est le framework Node.js le plus utilisé, apprécié pour sa simplicité et son immense écosystème de plugins (appelés *middleware*). **Fastify** est une alternative plus récente conçue pour la performance et intégrant nativement la validation des requêtes.

Le même serveur que dans la section précédente, réécrit avec Express :

```js

    const express = require("express");
    const app = express();

    app.use(express.json()); // Analyse automatiquement les corps de requête au format JSON

    app.get("/", (req, res) => {
        res.json({ message: "Bonjour, Node.js !" });
    });

    app.listen(3000, () => {
        console.log("Serveur lancé sur http://localhost:3000");
    });


```

| | `http` (intégré) | Express.js | Fastify |
| :--- | :--- | :--- | :--- |
| **Configuration** | Sans dépendances | Minimale, peu de parti pris | Minimale, orientée schémas |
| **Routage** | Manuel (`if`/`switch` sur `req.url`) | Intégré (`app.get`, `app.post`...) | Intégré |
| **Performance** | N/A (le strict minimum) | Bonne | Optimisée pour un fort débit |
| **Validation** | Manuelle | Via middleware (p. ex. `zod`, `joi`) | Intégrée, basée sur des schémas |

**Erreur courante :** oublier `express.json()` (ou l'équivalent pour analyser le corps de la requête) puis constater que `req.body` vaut `undefined` sur chaque requête `POST`. Express n'analyse pas le corps de la requête par défaut.

---

## 2.3. Routes, Middleware et validation des données

Une **route** associe une méthode HTTP et un motif d'URL à une fonction gestionnaire. Les **middleware** sont des fonctions exécutées *avant* le gestionnaire de route, utilisées pour des préoccupations transverses comme le logging, l'authentification ou — le plus souvent — la validation des données entrantes avant qu'elles n'atteignent votre logique métier.

```js

    const express = require("express");
    const app = express();
    app.use(express.json());

    // Middleware : s'exécute pour chaque requête, dans l'ordre, avant la route correspondante
    function logRequest(req, res, next) {
        console.log(`${req.method} ${req.url}`);
        next(); // Passe la main au middleware ou gestionnaire de route suivant
    }
    app.use(logRequest);

    // Route avec un paramètre d'URL (":id")
    app.get("/users/:id", (req, res) => {
        res.json({ id: req.params.id, name: "Alex" });
    });

    // Middleware de validation spécifique à la route
    function validateUser(req, res, next) {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: "name et email sont requis" });
        }
        next();
    }

    app.post("/users", validateUser, (req, res) => {
        res.status(201).json({ id: 1, ...req.body });
    });


```

Valider manuellement chaque champ (comme ci-dessus) passe mal à l'échelle au-delà de deux ou trois champs. Des librairies comme `zod` ou `joi` permettent de déclarer un **schéma** une seule fois et de valider tout le corps de la requête en un seul appel, produisant des messages d'erreur cohérents.

**Erreur courante :** oublier d'appeler `next()` à l'intérieur d'une fonction middleware. Le traitement de la requête s'arrête alors silencieusement, et la requête du client reste bloquée sans réponse ni message d'erreur.

---

## 2.4. Connexion et persistance avec les bases de données

Une véritable API a besoin de stocker les données quelque part de façon persistante. Node.js n'inclut aucun driver de base de données par défaut : vous vous connectez à l'une d'elles via un paquet, soit avec des requêtes brutes, soit via un **ORM/ODM** (Object-Relational/Document Mapper) qui permet de travailler avec des objets JavaScript plutôt que d'écrire directement la syntaxe de requête.

| | SQL (p. ex. PostgreSQL, MySQL) | NoSQL (p. ex. MongoDB) |
| :--- | :--- | :--- |
| **Forme des données** | Tables structurées avec un schéma fixe | Flexible, basée sur des documents (type JSON) |
| **Relations** | Natives (clés étrangères, jointures) | Généralement modélisées manuellement ou imbriquées |
| **Driver/ORM courant** | `pg`, `mysql2`, Prisma, Sequelize | `mongodb`, Mongoose |
| **Idéal pour** | Données à la structure claire et fortes exigences de cohérence | Données évoluant rapidement ou peu structurées |

Exemple avec **Mongoose** (un ODM populaire pour MongoDB) pour définir et interroger des données :

```js

    const mongoose = require("mongoose");
    await mongoose.connect("mongodb://localhost:27017/myapp");

    const userSchema = new mongoose.Schema({
        name: String,
        email: { type: String, required: true, unique: true },
    });

    const User = mongoose.model("User", userSchema);

    // Créer
    const user = await User.create({ name: "Alex", email: "alex@example.com" });

    // Lire
    const found = await User.findOne({ email: "alex@example.com" });


```

**Erreur courante :** ouvrir une nouvelle connexion à la base de données à chaque requête au lieu de réutiliser une connexion unique (ou un pool de connexions) ouverte une seule fois au démarrage du serveur. Cela épuise les connexions disponibles de la base de données sous un trafic réel et ralentit chaque requête.

---

## 2.5. Gestion globale des erreurs et Logging

Sans stratégie pour les erreurs, une seule exception inattendue peut faire planter tout le processus Node.js, entraînant avec elle la requête de chaque utilisateur, pas seulement celle qui a échoué. Express permet de centraliser la gestion des erreurs à un seul endroit plutôt que de répéter `try`/`catch` dans chaque route.

```js

    // Les gestionnaires de route transmettent les erreurs à next(err) plutôt que de les lever directement
    app.get("/users/:id", async (req, res, next) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                const error = new Error("Utilisateur introuvable");
                error.status = 404;
                throw error;
            }
            res.json(user);
        } catch (err) {
            next(err); // Transmet l'erreur au middleware de gestion des erreurs ci-dessous
        }
    });

    // Middleware de gestion des erreurs : Express le reconnaît car il prend 4 arguments
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
    });


```

Au-delà de `console.log`, une librairie de **logging** dédiée (comme `pino` ou `winston`) ajoute des journaux structurés et hiérarchisés (`info`, `warn`, `error`) faciles à filtrer et à transmettre à un service de supervision — indispensable dès qu'une application tourne sans surveillance en production.

**Erreur courante :** laisser une erreur faire planter le processus sans aucun gestionnaire, ou capturer une erreur et l'ignorer silencieusement (un bloc `catch` vide). La première emporte tout le serveur pour tous les utilisateurs ; la seconde masque de vrais bugs jusqu'à ce qu'ils causent des problèmes plus graves en aval.

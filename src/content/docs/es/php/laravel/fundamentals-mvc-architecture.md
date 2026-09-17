---
title: "Fundamentos y arquitectura MVC en Laravel"
---

# Fundamentos y Arquitectura MVC

**Laravel** es un framework de PHP: en lugar de gestionar cada petición HTTP, consulta a la base de datos y plantilla a mano como se explica en las guías básicas de PHP, Laravel ofrece una forma estructurada y con criterios definidos de organizar ese código, junto con herramientas que eliminan la mayor parte del trabajo repetitivo. Esta sección cubre el flujo de trabajo de Laravel, el patrón **MVC** (Modelo-Vista-Controlador) sobre el que se construye, y la creación de interfaces dinámicas con su motor de plantillas, **Blade**.

La referencia completa de todo lo que se trata aquí está en la <a href="https://laravel.com/docs" class="doc-link" target="_blank" rel="noopener noreferrer" title="Documentación oficial de Laravel">documentación oficial de Laravel</a>, a la que esta guía enlaza a lo largo del texto.

---

## Tabla de Contenidos

<div id="content-table">

- [1.1. Instalación, CLI Artisan y estructura de directorios](#11-instalación-cli-artisan-y-estructura-de-directorios "Configurar un proyecto y el archivo .env")
- [1.2. Enrutamiento y Controladores](#12-enrutamiento-y-controladores "Mapear URLs a la lógica de la aplicación")
- [1.3. Vistas y Blade](#13-vistas-y-blade "Layouts y Componentes")
- [1.4. El ciclo de vida de la petición y respuesta](#14-el-ciclo-de-vida-de-la-petición-y-respuesta "Cómo convierte Laravel una petición HTTP en una respuesta")
- [1.5. Inyección de dependencias y Service Providers](#15-inyección-de-dependencias-y-service-providers "Cómo conecta Laravel las piezas de una aplicación")

</div>

---

## 1.1. Instalación, CLI Artisan y estructura de directorios

Un proyecto nuevo de Laravel se crea a través de **Composer**, el gestor de paquetes de PHP, que descarga el propio Laravel junto con todas las dependencias que necesita:

```bash

    composer create-project laravel/laravel example-app
    cd example-app
    php artisan serve   # Inicia un servidor de desarrollo local en http://localhost:8000


```

**Artisan** es la herramienta de línea de comandos incorporada de Laravel, usada constantemente durante toda la vida de un proyecto: genera código repetitivo (controladores, modelos, migraciones...), ejecuta las migraciones de base de datos y expone docenas de comandos de mantenimiento. `php artisan list` muestra todos los comandos disponibles.

```bash

    php artisan make:controller BookController
    php artisan make:model Book -m   # La opción -m también genera una migración a juego


```

La configuración que cambia entre entornos (credenciales de base de datos, claves de API, modo debug) vive en un archivo `.env` en la raíz del proyecto —nunca se sube al control de versiones— y se lee mediante el helper `env()` o, más habitualmente, a través de los propios archivos `config()` de Laravel que lo envuelven.

| Directorio | Propósito |
| :--- | :--- |
| `app/` | Código de la aplicación: Modelos, Controladores, Providers... |
| `routes/` | Definición de rutas (`web.php`, `api.php`) |
| `resources/views/` | Plantillas Blade |
| `database/migrations/` | Control de versiones del esquema de base de datos |
| `.env` | Configuración específica del entorno (nunca se sube al repositorio) |

**Error común:** subir el archivo `.env` al control de versiones. Contiene secretos reales (contraseñas de base de datos, claves de API) del entorno para el que se configuró por última vez; lo que debería subirse en su lugar es `.env.example`, una versión con valores de ejemplo.

---

## 1.2. Enrutamiento y Controladores

Una **ruta (route)** asocia una URL y un método HTTP con el código que debe gestionarla, definida en `routes/web.php` para un sitio web normal o en `routes/api.php` para una API.

```php

    // routes/web.php
    use App\Http\Controllers\BookController;

    Route::get('/books', [BookController::class, 'index']);
    Route::get('/books/{id}', [BookController::class, 'show']);
    Route::post('/books', [BookController::class, 'store']);


```

Para cualquier cosa más allá de una respuesta de una sola línea, la ruta apunta a un método de un **Controlador (Controller)**: una clase que agrupa la lógica de gestión de peticiones relacionada, manteniendo el propio archivo de rutas corto y legible.

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

`{id}` en la ruta de una URL es un **parámetro de ruta**: Laravel extrae ese segmento de la URL y lo pasa como argumento al método del controlador correspondiente, en el mismo orden en que aparece en la ruta.

**Error común:** meter lógica de negocio compleja directamente dentro del closure de una ruta en `web.php` en lugar de un controlador. Funciona para un prototipo rápido, pero el archivo se vuelve ilegible enseguida, y esa lógica no se puede reutilizar ni probar de forma aislada.

---

## 1.3. Vistas y Blade

Una **vista (view)** es la plantilla que se devuelve al navegador. El motor de plantillas de Laravel, **Blade**, permite mezclar HTML normal con directivas parecidas a PHP, y compila a PHP plano y optimizado por debajo, así que apenas añade sobrecarga en tiempo de ejecución.

```blade

    {{-- resources/views/books/index.blade.php --}}
    <h1>Books</h1>
    <ul>
        @foreach ($books as $book)
            <li>{{ $book->title }}</li>
        @endforeach
    </ul>


```

`{{ }}` muestra un valor escapando automáticamente sus caracteres especiales, previniendo ataques **XSS** (cross-site scripting) por defecto; `{{-- --}}` es un comentario de Blade, que se elimina por completo de la salida final.

Un **layout** es una plantilla compartida (cabecera, navegación, pie de página) que cada página concreta rellena mediante `@section`/`@yield`, o, más habitualmente hoy en día, mediante **componentes**: piezas de markup reutilizables con su propia lógica, parecidas a un componente de un framework frontend como React o Astro.

```blade

    {{-- resources/views/components/alert.blade.php --}}
    <div class="alert alert-{{ $type }}">
        {{ $slot }}
    </div>

    {{-- Usado en otra vista así: --}}
    <x-alert type="danger">Algo salió mal.</x-alert>


```

**Error común:** mostrar datos no fiables con `{!! !!}` en lugar de `{{ }}` por costumbre o para "arreglar" HTML que se veía roto. `{!! !!}` muestra HTML en crudo, sin escapar, reabriendo la puerta a los ataques XSS que `{{ }}` cierra por defecto; úsalo solo para contenido del que tengas certeza de que ya es seguro.

---

## 1.4. El ciclo de vida de la petición y respuesta

Cada petición a una aplicación Laravel sigue el mismo recorrido: entra por `public/index.php`, la gestiona el **kernel** central del framework, pasa por cualquier **middleware** aplicable (se ve en la siguiente guía), se hace coincidir con una ruta, y el controlador de esa ruta devuelve una **Response**, que Laravel envía de vuelta al navegador.

```bash

    Petición del navegador --> index.php --> Kernel --> Middleware --> Ruta --> Controlador --> Response --> Navegador


```

Un controlador no necesita construir manualmente un objeto de respuesta HTTP completo para los casos comunes: devolver una cadena, un array (convertido automáticamente a JSON) o una vista es suficiente, y Laravel lo envuelve automáticamente en una `Response` adecuada.

```php

    public function show($id)
    {
        // Devolver una vista: Laravel construye una respuesta HTML
        return view('books.show', ['book' => Book::findOrFail($id)]);
    }

    public function apiShow($id)
    {
        // Devolver un array: Laravel construye una respuesta JSON automáticamente
        return Book::findOrFail($id);
    }


```

**Error común:** asumir que un método de controlador siempre debe construir y devolver explícitamente un objeto `Response`. En la práctica, devolver valores más simples (una vista, un array, un modelo) es lo habitual en Laravel, y el framework los convierte por ti.

---

## 1.5. Inyección de dependencias y Service Providers

La **inyección de dependencias** significa que una clase recibe desde fuera los objetos de los que depende, en lugar de crearlos ella misma. El **contenedor de servicios** de Laravel resuelve estas dependencias automáticamente: basta con indicar el tipo de una clase en los parámetros de un método de controlador para que Laravel la instancie y se la entregue.

```php

    use App\Services\BookRecommender;

    class BookController extends Controller
    {
        public function recommendations(BookRecommender $recommender)
        {
            // Laravel instancia BookRecommender (y todo de lo que ESTE dependa) automáticamente
            return $recommender->forCurrentUser();
        }
    }


```

Un **Service Provider** es el lugar donde la aplicación le indica al contenedor de Laravel *cómo* construir una clase, normalmente cuando esa clase necesita una configuración específica en lugar de un simple `new SomeClass()`. Toda aplicación Laravel ya viene con varios providers por defecto, registrados en `bootstrap/providers.php`.

```php

    // app/Providers/AppServiceProvider.php
    public function register()
    {
        $this->app->bind(BookRecommender::class, function ($app) {
            return new BookRecommender(config('services.recommendations.api_key'));
        });
    }


```

**Error común:** instanciar manualmente una clase con `new` en lo más profundo de un controlador en lugar de dejar que el contenedor la inyecte. Además del código repetitivo extra, hace que esa parte del código sea mucho más difícil de testear, ya que un test no puede sustituir fácilmente una versión falsa de una dependencia que quedó fijada con `new`.

---
title: "Base de datos, Eloquent y lógica de negocio en Laravel"
---

# Base de Datos, Eloquent y Lógica de Negocio

Con el flujo de petición/respuesta y la estructura MVC ya vistos, el siguiente paso es persistir datos de forma fiable. Esta sección cubre el enfoque de Laravel para los cambios de esquema de base de datos, su ORM (**Eloquent**) para trabajar con la base de datos mediante objetos PHP en lugar de SQL en crudo, la validación de datos entrantes y el filtrado de peticiones con middleware.

---

## Tabla de Contenidos

<div id="content-table">

- [2.1. Migraciones y Seeders](#21-migraciones-y-seeders "Control de versiones de la base de datos")
- [2.2. Eloquent ORM I: Modelos y CRUD](#22-eloquent-orm-i-modelos-y-crud "Operaciones fluidas de crear, leer, actualizar y eliminar")
- [2.3. Eloquent ORM II: Relaciones y Eager Loading](#23-eloquent-orm-ii-relaciones-y-eager-loading "1:1, 1:N, N:M y el problema de las consultas N+1")
- [2.4. Validación y manejo de excepciones](#24-validación-y-manejo-de-excepciones "Form Requests y gestionar errores con elegancia")
- [2.5. Middlewares](#25-middlewares "Filtrado de peticiones y protección de rutas")

</div>

---

## 2.1. Migraciones y Seeders

Una **migración** es un archivo PHP que describe un cambio en el esquema de la base de datos (crear una tabla, añadir una columna...) mediante código en lugar de SQL en crudo, generado con Artisan y ejecutado en orden.

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
            $table->timestamps(); // Añade automáticamente las columnas created_at y updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('books');
    }


```

```bash

    php artisan migrate            # Aplica todas las migraciones que aún no se han ejecutado
    php artisan migrate:rollback   # Deshace el último lote de migraciones, usando el método "down" de cada una


```

Como las migraciones son solo archivos versionados, cada desarrollador de un equipo —y cada entorno (staging, producción)— puede reconstruir exactamente el mismo esquema ejecutando `php artisan migrate`, en lugar de mantener las bases de datos sincronizadas a mano.

Un **seeder** rellena la base de datos con datos, normalmente para desarrollo local o testing, a menudo combinado con **factories** que generan datos falsos realistas de forma automática.

```php

    // database/seeders/BookSeeder.php
    public function run(): void
    {
        Book::factory()->count(50)->create();
    }


```

**Error común:** editar un archivo de migración que ya se ha ejecutado para corregir un error, en lugar de crear una nueva migración. Cualquiera que ya haya ejecutado la migración original tiene una base de datos que ya no coincide con el archivo editado, porque Laravel solo registra *qué* migraciones se han ejecutado, no su contenido actual.

---

## 2.2. Eloquent ORM I: Modelos y CRUD

**Eloquent** es el **ORM** (Object-Relational Mapper) de Laravel: cada tabla de la base de datos obtiene una clase **Modelo** correspondiente, y las filas se convierten en instancias de esa clase, permitiéndote leer y escribir datos mediante simples llamadas a métodos PHP en lugar de escribir SQL a mano.

```php

    // app/Models/Book.php
    class Book extends Model
    {
        // Por convención, esto se asocia automáticamente a la tabla "books"
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

Este estilo encadenable —`Book::where(...)->orderBy(...)->get()`— se llama **fluent query builder**: cada método devuelve un objeto sobre el que se pueden encadenar más métodos, permitiendo construir una consulta paso a paso sin perder legibilidad.

**Error común:** llamar a `Book::find($id)` con un id que no existe. Devuelve `null` en silencio en lugar de lanzar un error, lo que hace que la aplicación falle más tarde con un confuso error de "llamada a una función de miembro sobre null" en cuanto el código intenta usarlo. `Book::findOrFail($id)` es la opción por defecto más segura: lanza inmediatamente un error 404 explícito y capturable cuando no se encuentra nada.

---

## 2.3. Eloquent ORM II: Relaciones y Eager Loading

Igual que las claves foráneas enlazan tablas en SQL puro, los modelos Eloquent declaran **relaciones** entre ellos como métodos PHP, tras lo cual los datos relacionados se pueden acceder como si fueran una propiedad normal.

```php

    class Author extends Model
    {
        public function books() // 1:N — un autor tiene muchos libros
        {
            return $this->hasMany(Book::class);
        }
    }

    class Book extends Model
    {
        public function author() // El lado inverso de la relación 1:N de arriba
        {
            return $this->belongsTo(Author::class);
        }

        public function tags() // N:M — un libro puede tener muchas etiquetas, y una etiqueta muchos libros
        {
            return $this->belongsToMany(Tag::class);
        }
    }


```

```php

    $author = Author::find(1);
    $author->books;          // Todos los libros de este autor (1:N)

    $book = Book::find(1);
    $book->author;           // El autor de este libro (el lado inverso)
    $book->tags;              // Todas las etiquetas de este libro (N:M)


```

Una relación **1:1** (un usuario y su único perfil, por ejemplo) usa `hasOne`/`belongsTo` de la misma forma en que `hasMany`/`belongsTo` gestiona las relaciones 1:N.

Acceder a una relación dentro de un bucle dispara lo que se conoce como el **problema de consultas N+1**: una consulta para obtener los libros, y luego una consulta *adicional* por cada libro para obtener a su autor; para 100 libros, eso son 101 consultas en lugar de 2.

```php

    // ❌ Problema N+1: 1 consulta para los libros, y luego 1 consulta MÁS POR LIBRO para su autor
    foreach (Book::all() as $book) {
        echo $book->author->name;
    }

    // ✅ Eager loading: solo 2 consultas en total, sin importar cuántos libros haya
    foreach (Book::with('author')->get() as $book) {
        echo $book->author->name;
    }


```

**Error común:** no darse cuenta del problema N+1 porque funciona bien, aunque algo lento, con el puñado de filas de prueba usadas durante el desarrollo, y solo se convierte en un problema serio de rendimiento cuando la tabla tiene miles de filas reales en producción.

---

## 2.4. Validación y manejo de excepciones

Confiar en los datos tal y como llegan en una petición no es seguro: los **Form Requests** son clases dedicadas que validan los datos entrantes *antes* de que lleguen a la lógica de un controlador, manteniendo las reglas de validación fuera del propio controlador.

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

    // El controlador solo se ejecuta si la validación pasa; Laravel gestiona la respuesta de error automáticamente en caso contrario
    public function store(StoreBookRequest $request)
    {
        return Book::create($request->validated());
    }


```

Cuando la validación falla, Laravel devuelve automáticamente una respuesta `422 Unprocessable Entity` (como JSON para una API, o una redirección de vuelta con mensajes de error para un formulario normal); el código del controlador ni siquiera llega a ejecutarse.

Para errores que ocurren más adentro de la aplicación, el **manejador de excepciones** central de Laravel (`bootstrap/app.php` en las versiones recientes) convierte las excepciones no capturadas en una respuesta adecuada en lugar de dejar que un error de PHP en crudo llegue al navegador, y se puede personalizar para registrar, reportar o formatear tipos de excepción concretos de forma distinta.

**Error común:** reimplementar a mano las mismas reglas de validación dentro de un controlador en lugar de usar un Form Request. Duplica lógica en cada sitio que la necesita y pierde el manejo automático de respuestas de error de Laravel.

---

## 2.5. Middlewares

Los **middlewares** son clases que se ejecutan *antes* (o después) de que una petición llegue al controlador de su ruta, usados para asuntos transversales que se aplican a muchas rutas a la vez: comprobaciones de autenticación, logging o limitación de peticiones.

```php

    // app/Http/Middleware/EnsureSubscribed.php
    public function handle(Request $request, Closure $next)
    {
        if (! $request->user()->subscribed()) {
            return redirect('/subscribe');
        }

        return $next($request); // Pasa el control al siguiente middleware o al controlador de la ruta
    }


```

Los middlewares se asignan a las rutas individualmente o en grupo, y Laravel incluye varios de fábrica —`auth` (exige un usuario con sesión iniciada) es uno de los más comunes—:

```php

    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('auth');

    Route::middleware(['auth', 'subscribed'])->group(function () {
        Route::get('/premium-content', [ContentController::class, 'index']);
    });


```

**Error común:** olvidar llamar a `$next($request)` dentro de un middleware personalizado. El manejo de la petición se detiene en silencio en ese punto: el controlador de la ruta nunca se ejecuta, y no se envía ninguna respuesta.

---
title: "Ecosistema, APIs y nivel avanzado en Laravel"
---

# Ecosistema, APIs y Nivel Avanzado

El último paso es preparar una aplicación para el mundo real: exponerla como una API para frontends modernos (React, Vue), autenticar esos clientes de forma segura, reaccionar a eventos en tiempo real, delegar el trabajo lento para que no bloquee una petición y desplegarla de forma eficiente. Esta sección también presenta algunos paquetes oficiales de Laravel que vale la pena conocer, incluso antes de necesitarlos directamente.

---

## Tabla de Contenidos

<div id="content-table">

- [3.1. Desarrollo de APIs RESTful](#31-desarrollo-de-apis-restful "Rutas API y API Resources")
- [3.2. Autenticación moderna](#32-autenticación-moderna "Tokens, SPAs y login social")
- [3.3. Eventos y WebSockets](#33-eventos-y-websockets "Aplicaciones en tiempo real")
- [3.4. Trabajos en segundo plano y tareas programadas](#34-trabajos-en-segundo-plano-y-tareas-programadas "Queues, Jobs y el planificador de tareas")
- [3.5. Despliegue y optimización de caché](#35-despliegue-y-optimización-de-caché "Preparar una aplicación para producción")

</div>

---

## 3.1. Desarrollo de APIs RESTful

Las rutas pensadas para una API (en lugar de un navegador que renderiza HTML) viven en `routes/api.php`, con el prefijo `/api` automático y sin el estado basado en sesiones/cookies, ya que se espera que los clientes de una API no tengan estado.

```php

    // routes/api.php
    Route::get('/books', [Api\BookController::class, 'index']);
    Route::apiResource('books', Api\BookController::class); // Genera de golpe las rutas index/store/show/update/destroy


```

Devolver un modelo Eloquent directamente desde un controlador lo convierte a JSON automáticamente, pero eso acopla la forma de la respuesta de la API directamente al esquema de la base de datos. Un **API Resource** es una clase dedicada que controla exactamente cómo se ve la representación JSON de un modelo, desacoplando ambas cosas.

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
                // "created_at" de la base de datos se omite deliberadamente en la respuesta de la API
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

**Error común:** devolver modelos Eloquent directamente en cada endpoint de la API. Funciona al principio, pero cualquier columna de uso interno (como un hash de contraseña, o un campo que todavía no está listo para ser público) queda expuesta automáticamente a cada cliente de la API, y la forma de la respuesta queda fuertemente acoplada a los nombres de las columnas de la base de datos.

---

## 3.2. Autenticación moderna

El login tradicional basado en sesiones (usado por el middleware `auth` de la guía anterior) asume un navegador que guarda cookies: no encaja con una app móvil ni con un frontend separado que llama a la API desde otro dominio. <a href="https://laravel.com/docs/sanctum" class="doc-link" target="_blank" rel="noopener noreferrer" title="Documentación de Laravel Sanctum">**Laravel Sanctum**</a> es un paquete oficial y ligero que resuelve ambos casos: emite tokens de API sencillos (ideales para apps móviles) y, por separado, autentica **SPAs** (Single Page Applications construidas con React, Vue, etc.) de forma segura mediante cookies, sin la complejidad de montar un OAuth2 completo.

```php

    // Emitir un token para un cliente móvil
    $token = $user->createToken('mobile-app')->plainTextToken;

    // Proteger una ruta de API para que solo un token válido pueda acceder
    Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
        return $request->user();
    });


```

Para autenticación tipo "Iniciar sesión con Google/GitHub/X", <a href="https://laravel.com/docs/socialite" class="doc-link" target="_blank" rel="noopener noreferrer" title="Documentación de Laravel Socialite">**Laravel Socialite**</a> ofrece una interfaz sencilla y fluida para proveedores OAuth, evitando tener que escribir desde cero el código de conexión y validación para cada red social.

```php

    // Redirige al usuario a la página de login del proveedor
    Route::get('/auth/github', fn () => Socialite::driver('github')->redirect());

    // Gestiona la vuelta desde GitHub una vez el usuario aprueba
    Route::get('/auth/github/callback', function () {
        $githubUser = Socialite::driver('github')->user();
        // ...busca o crea un usuario local a partir de $githubUser, y luego inicia su sesión
    });


```

**Error común:** recurrir directamente a montar un servidor OAuth2 completo (como Passport) cuando la necesidad real es más simple: un token de API para una app móvil, o una SPA de la misma organización. Sanctum cubre ambos casos habituales con mucha menos configuración.

---

## 3.3. Eventos y WebSockets

Un **evento** representa algo que ha ocurrido en la aplicación (se hizo un pedido, se publicó un comentario); uno o varios **listeners** reaccionan a él, desacoplando el código que dispara una acción del código que gestiona sus efectos secundarios.

```php

    // Disparar un evento
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

Algunos eventos necesitan llegar al navegador al instante, sin esperar a que el usuario recargue la página: notificaciones en vivo, un mensaje de chat que aparece para el otro participante. Esto requiere una conexión **WebSocket**, mantenida abierta entre el navegador y el servidor. <a href="https://laravel.com/docs/reverb" class="doc-link" target="_blank" rel="noopener noreferrer" title="Documentación de Laravel Reverb">**Laravel Reverb**</a> es el propio servidor de WebSockets oficial de Laravel: rápido, integrado de forma nativa con su sistema de eventos, y una alternativa gratuita y autoalojada a servicios de pago de terceros como Pusher.

```php

    // Marcar un evento como retransmisible lo envía automáticamente por WebSockets
    class OrderShipped implements ShouldBroadcast
    {
        public function broadcastOn(): array
        {
            return [new PrivateChannel('orders.' . $this->order->id)];
        }
    }


```

```js

    // En el frontend (usando Laravel Echo, el cliente JS que lo acompaña)
    Echo.private(`orders.${orderId}`).listen('OrderShipped', (event) => {
        console.log('¡Pedido enviado!', event);
    });


```

**Error común:** usar eventos únicamente para efectos secundarios de logging que una simple llamada a función resolvería igual de bien, añadiendo indirección sin beneficio real. Los eventos compensan cuando varios listeners genuinamente independientes necesitan reaccionar a lo mismo, o cuando esa reacción debe retransmitirse en tiempo real.

---

## 3.4. Trabajos en segundo plano y tareas programadas

Algunos trabajos son demasiado lentos para ejecutarse durante una petición —enviar un correo, procesar un vídeo subido, generar un informe— y dejarían al usuario esperando innecesariamente. Un **Job** enviado a una **Queue** se ejecuta en un proceso separado en segundo plano en su lugar, así la petición original puede devolver una respuesta al usuario de inmediato.

```php

    // app/Jobs/GenerateReportPdf.php
    class GenerateReportPdf implements ShouldQueue
    {
        public function handle(): void
        {
            // Trabajo lento: se ejecuta en segundo plano, no durante la petición original
        }
    }


```

```php

    GenerateReportPdf::dispatch($report);   // Vuelve de inmediato; el job se ejecuta por separado


```

```bash

    php artisan queue:work   # Inicia un proceso worker que recoge y ejecuta los jobs en cola


```

El **planificador (scheduler)** sustituye la configuración manual de tareas cron en un servidor por PHP plano: cada tarea programada se define una vez en código, y una única entrada cron ejecuta el planificador en sí cada minuto, que decide qué es lo que realmente hay que ejecutar.

```php

    // routes/console.php
    Schedule::command('reports:cleanup')->daily();
    Schedule::call(fn () => Report::pruneOld())->weekly();


```

**Error común:** ejecutar trabajo lento (como enviar un correo) directamente durante una petición en lugar de despacharlo como un job. El usuario se queda mirando un indicador de carga durante todo lo que tarde esa operación lenta, sin ningún beneficio; ponerlo en cola permite que la respuesta vuelva de inmediato.

---

## 3.5. Despliegue y optimización de caché

Laravel lee la configuración, las rutas y las vistas de cero en cada petición por defecto, lo cual es cómodo durante el desarrollo pero desperdicia tiempo en producción, donde ninguna de esas cosas cambia entre peticiones. Varios comandos de Artisan los cachean de antemano:

```bash

    php artisan config:cache   # Combina todos los archivos de configuración en uno solo, rápido de cargar
    php artisan route:cache    # La misma idea, para las definiciones de rutas
    php artisan view:cache     # Precompila las plantillas Blade a PHP plano


```

Estas cachés deben limpiarse y reconstruirse después de cada despliegue (`php artisan optimize` ejecuta las habituales juntas); olvidarlo tras cambiar un valor de configuración o una variable de `.env` es una fuente frecuente de confusión del tipo "mi cambio no se refleja en producción", ya que sigue sirviéndose la versión cacheada en su lugar.

Más allá de la caché, un despliegue a producción normalmente también ejecuta las migraciones pendientes (`php artisan migrate --force`), pone `APP_DEBUG=false` en `.env` (para que nunca se muestren páginas de error detalladas a usuarios reales), y ejecuta los workers de las colas y el planificador como procesos en segundo plano persistentes (a menudo gestionados con una herramienta como Supervisor).

**Error común:** desplegar un cambio de código y esperar que surta efecto de inmediato, sin limpiar las cachés de configuración/rutas/vistas del despliegue anterior. Laravel sigue sirviendo la versión cacheada y desactualizada hasta que se reconstruye explícitamente.

---
title: "Formularios e interacción con el servidor en PHP"
---

# Formularios e interacción con el servidor

La verdadera potencia de PHP está en su capacidad para reaccionar a lo que hacen los usuarios. Esta guía explica cómo recibir los datos que la gente envía mediante formularios HTML, la diferencia entre las dos formas de enviarlos y, sobre todo, cómo manejar esos datos de forma **segura**.

*Si todavía no conoces los formularios HTML, lee antes la guía de Formularios de HTML.*

---

## Índice

<div id="content-table">

- [1. Las superglobales](#1-las-superglobales "Las variables $_GET y $_POST")
- [2. Procesar el envío de formularios](#2-procesar-el-envío-de-formularios "Cómo acceder a los datos de un formulario")
- [3. Seguridad, limpieza y validación](#3-seguridad-limpieza-y-validación "Evitar XSS y validar los datos")
- [4. Ejemplo completo de formulario](#4-ejemplo-completo-de-formulario "Un ejemplo completo que funciona")

</div>

---

## 1. Las superglobales

Cuando un navegador pide una página al servidor, envía una **petición** que puede incluir datos. PHP guarda automáticamente esos datos en unas variables especiales llamadas **superglobales**, disponibles en cualquier parte del código. Las dos más importantes para formularios son `$_GET` y `$_POST`.

Las dos son **arrays asociativos**: cada valor se guarda bajo una clave que coincide con el atributo `name` del campo del formulario.

### La variable $_GET
Contiene los datos enviados con el método GET:
* Los datos se ven en la URL, después de un `?` (por ejemplo, `process.php?name=Juan&age=25`).
* Las URL tienen una longitud limitada, así que solo sirve para pocos datos.
* **Ideal para:** buscadores, filtros, paginación o cualquier página que quieras guardar en favoritos o compartir. Nunca para contraseñas.

```php

    <?php
    // URL visitada: process.php?name=Juan&age=25

    if (isset($_GET['name']) && isset($_GET['age'])) {
        echo "Nombre: " . htmlspecialchars($_GET['name']) . "<br>";
        echo "Edad: " . htmlspecialchars($_GET['age']);
    }
    ?>


```

`isset()` comprueba que un valor existe antes de usarlo. `htmlspecialchars()` hace que el valor sea seguro para mostrarlo (ver sección 3).

### La variable $_POST
Contiene los datos enviados con el método POST:
* Los datos **no** se ven en la URL: viajan dentro del cuerpo de la petición.
* Puede llevar muchos más datos (el tamaño máximo se define en la configuración del servidor).
* **Ideal para:** inicios de sesión, registros, publicar contenido, subir archivos o cualquier cosa que cambie datos en el servidor.

```php

    <?php
    // Datos enviados por un formulario HTML con method="post"

    if (isset($_POST['email'])) {
        echo "Email recibido: " . htmlspecialchars($_POST['email']);
    }
    ?>


```

**Error habitual:** leer un campo sin comprobar que existe. La primera vez que se carga la página el formulario aún no se ha enviado, así que la clave no existe y PHP muestra un aviso.

```php

    <?php
    // ❌ INCORRECTO: Warning: Undefined array key "email" si el formulario no se ha enviado
    $email = $_POST['email'];

    // ✅ CORRECTO: ?? usa un texto vacío cuando la clave no existe
    $email = $_POST['email'] ?? '';
    ?>


```

---

## 2. Procesar el envío de formularios

Para procesar un formulario, normalmente se comprueba qué método se usó para pedir la página y después se leen los valores usando como clave el `name` de cada campo.

### El formulario HTML
Fíjate en los atributos `action` (qué archivo recibe los datos) y `method` (cómo se envían).

```html

    <form action="welcome.php" method="post">
        <label for="fname">Nombre:</label>
        <input type="text" id="fname" name="fname">

        <label for="email">Email:</label>
        <input type="email" id="email" name="email">

        <button type="submit">Enviar</button>
    </form>


```

### Procesamiento en PHP (welcome.php)
El valor de cada campo está disponible como `$_POST['nombre_del_campo']`.

```php

    <?php
    // Comprobar que la página se pidió al enviar el formulario (POST)
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        
        // Leer el valor del campo "fname"
        $name = trim($_POST['fname'] ?? ''); // trim() quita los espacios del principio y del final
        
        if (empty($name)) {
            echo "El nombre está vacío";
        } else {
            echo "Hola, " . htmlspecialchars($name);
        }
    }
    ?>


```

`$_SERVER` es otra superglobal con información sobre la petición; `REQUEST_METHOD` indica si fue `GET` o `POST`.

---

## 3. Seguridad, limpieza y validación

**Nunca te fíes de lo que envía el usuario.** Es la regla de oro del desarrollo en servidor. Cualquiera puede escribir cualquier cosa en un formulario, incluido código malicioso. Si muestras esos datos en una página sin prepararlos antes, un atacante podría hacer que los navegadores de otros visitantes ejecuten sus scripts. Este ataque se llama **XSS** (Cross-Site Scripting) y puede usarse para robar cuentas o datos personales.

### Limpieza (sanitización)
**Sanitizar** significa transformar los datos para que no puedan causar daño. La función más importante para mostrar datos es `htmlspecialchars()`: convierte los caracteres con un significado especial en HTML (como `<` y `>`) en códigos inofensivos, para que el navegador los muestre como texto en lugar de ejecutarlos.

```php

    <?php
    $raw_input = "<script>alert('Hackeado');</script>";

    // ❌ INCORRECTO: el navegador recibe una etiqueta <script> real y la ejecuta
    echo $raw_input;

    // ✅ CORRECTO: < pasa a ser &lt; y > pasa a ser &gt;, así que el texto solo se muestra
    echo htmlspecialchars($raw_input);
    ?>


```

### Validación (comprobación)
**Validar** significa comprobar que los datos tienen el formato esperado (¿es un email real?, ¿la edad es un número?) y rechazarlos si no es así. La función `filter_var()` de PHP incluye comprobaciones ya preparadas para los casos más habituales.

```php

    <?php
    $email = $_POST["email"] ?? "";

    // Quitar los caracteres que no se permiten en una dirección de email
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);

    // Comprobar que el resultado es una dirección de email válida
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Formato de email no válido"; 
    } else {
        echo "El email es válido";
    }
    ?>


```

**Recuerda:** los atributos de validación de HTML (`required`, `type="email"`...) solo son una comodidad para el usuario. Se pueden saltar fácilmente, así que PHP siempre debe volver a validar los datos en el servidor.

---

## 4. Ejemplo completo de formulario

Este ejemplo combina HTML y PHP en un solo archivo que muestra el formulario y también lo procesa (lo que a menudo se llama «formulario autoprocesado»).

```php

    <?php
    $name = "";
    $nameErr = "";

    // Procesar los datos solo cuando se ha enviado el formulario
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        if (empty($_POST["name"])) {
            $nameErr = "El nombre es obligatorio";
        } else {
            // Sanitizar el dato antes de guardarlo o mostrarlo
            $name = htmlspecialchars(trim($_POST["name"]));
        }
    }
    ?>

    <!-- htmlspecialchars() también protege la dirección de la página actual -->
    <form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>">
        <label for="name">Nombre:</label>
        <!-- value conserva lo que escribió el usuario si la página se recarga -->
        <input type="text" id="name" name="name" value="<?php echo $name; ?>">
        
        <span class="error">* <?php echo $nameErr; ?></span>
        
        <button type="submit">Enviar</button>
    </form>

    <?php
    if ($name) {
        echo "<h2>Tus datos:</h2>";
        echo "Bienvenido de nuevo, " . $name;
    }
    ?>


```

`$_SERVER["PHP_SELF"]` contiene la dirección del archivo actual, así que el formulario envía los datos a la misma página.

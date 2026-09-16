---
title: "Fundamentos de PHP"
---

# Fundamentos de PHP

Esta guía presenta las piezas básicas de PHP. PHP es un lenguaje **del lado del servidor**: su código se ejecuta en el **servidor** (el ordenador que aloja la web), no en el navegador del visitante. El servidor ejecuta el código PHP, genera como resultado una página HTML y envía al navegador solo ese HTML. Por eso los visitantes nunca ven tu código PHP.

Es justo lo contrario que **JavaScript** en el navegador, que se envía al dispositivo del visitante y se ejecuta allí.

---

## Índice

<div id="content-table">

- [1. Sintaxis básica](#1-sintaxis-básica "Introducción a la sintaxis de PHP")
    - [1.1. Insertar PHP en HTML](#11-insertar-php-en-html "Cómo incluir código PHP dentro de un documento HTML")
- [2. Variables y constantes](#2-variables-y-constantes "Definir y usar variables y constantes en PHP")
    - [2.1. Reglas de las variables](#21-reglas-de-las-variables "Normas para nombrar y usar variables")
    - [2.2. Constantes](#22-constantes "Cómo crear y usar constantes")
- [3. Tipos de datos](#3-tipos-de-datos "Los tipos de datos de PHP")
- [4. Operadores](#4-operadores "Operadores aritméticos, de comparación y lógicos")
- [5. Estructuras de control](#5-estructuras-de-control "Controlar el flujo con condiciones y bucles")
    - [5.1. Condicionales](#51-condicionales "Uso de if, elseif y else")
    - [5.2. Bucles](#52-bucles "Repetir código con bucles")

</div>

---

## 1. Sintaxis básica

Un archivo PHP (terminado en `.php`) suele mezclar HTML normal con fragmentos de código PHP. El código PHP va entre las etiquetas `<?php` y `?>`: todo lo que hay dentro se ejecuta en el servidor, y todo lo que hay fuera se envía al navegador tal cual.

```php

    <?php
    // Aquí va el código PHP
    echo "¡Hola, mundo!";
    ?>


```

`echo` escribe texto en la página que se enviará al navegador.

Cada instrucción de PHP debe terminar con punto y coma (`;`), como el punto al final de una frase. Olvidar el punto y coma es el error más habitual al empezar.

```php

    <?php
    // ❌ INCORRECTO: falta el punto y coma (Parse error: syntax error, unexpected token "echo")
    echo "Hola"
    echo "Mundo";

    // ✅ CORRECTO
    echo "Hola";
    echo "Mundo";
    ?>


```

Los **comentarios** son notas para quien lee el código; PHP los ignora. Se pueden escribir de tres formas:

```php

    <?php
    // Esto es un comentario de una línea

    # Esto también es un comentario de una línea

    /*
    Esto es un bloque de comentario
    que ocupa varias líneas
    */
    ?>


```

### 1.1. Insertar PHP en HTML

El código PHP se puede colocar directamente dentro de un documento HTML. Así puedes combinar la estructura fija de la página (HTML) con contenido que cambia (PHP).

```php

    <!DOCTYPE html>
    <html>
    <head>
        <title>Mi página PHP</title>
    </head>
    <body>
        <h1>Bienvenido a mi web</h1>
        <p>
            <?php
            $name = "Alicia";
            echo "Hola, " . $name . "!";
            ?>
        </p>
    </body>
    </html>


```

En este ejemplo, el código PHP dentro de la etiqueta `<p>` genera el saludo, mientras que el resto del HTML no cambia. El navegador solo recibe `<p>Hola, Alicia!</p>`. Es una de las formas más habituales de usar PHP.

El punto `.` une fragmentos de texto (esto se llama *concatenación*).

---

## 2. Variables y constantes

Una **variable** es una caja con nombre que guarda un valor para usarlo más tarde. PHP es *débilmente tipado*: no hace falta indicar si una variable guardará un número o un texto; PHP lo deduce a partir del valor.

### 2.1. Reglas de las variables
* Una variable siempre empieza con el signo `$`, seguido de su nombre.
* El nombre debe empezar por una letra o un guion bajo (`_`), nunca por un número.
* Los nombres **distinguen mayúsculas de minúsculas** (`$age` y `$AGE` son dos variables distintas).

```php

    <?php
    $txt = "Aprendiendo PHP";
    $x = 5;
    $y = 10.5;
    
    echo $txt;
    echo $x + $y; // Muestra: 15.5
    ?>


```

**Error habitual:** olvidar el signo `$`. Sin él, PHP no entiende que te refieres a una variable.

```php

    <?php
    $name = "Alicia";

    // ❌ INCORRECTO: "name" sin $ no es una variable (Error: Undefined constant "name")
    echo name;

    // ✅ CORRECTO
    echo $name;
    ?>


```

### 2.2. Constantes

Las **constantes** son como variables, pero una vez definidas su valor no puede cambiar nunca. Se usan para ajustes fijos, como la dirección de la web. No llevan el prefijo `$` y, por convención, se escriben en mayúsculas.

```php

    <?php
    // Con define()
    define("SITE_URL", "https://mysite.com");

    // Con la palabra clave const
    const MAX_USERS = 50;

    echo SITE_URL;
    ?>


```

---

## 3. Tipos de datos

PHP admite varios tipos de datos para guardar distintas clases de información.

1. **String**: Un texto (`"Hola"`).
2. **Integer**: Un número entero (`10`, `-5`).
3. **Float**: Un número con decimales, escritos con punto (`3.14`).
4. **Boolean**: Solo dos valores posibles, `true` (verdadero) o `false` (falso).
5. **Array**: Una lista que guarda varios valores en una sola variable.
6. **NULL**: La ausencia de valor.

```php

    <?php
    $string = "Hola, mundo";
    $int = 5985;
    $float = 10.365;
    $is_active = true;
    $colors = ["Rojo", "Verde", "Azul"];
    $empty = null;

    var_dump($float); // Muestra el tipo y el valor: float(10.365)
    ?>


```

`var_dump()` es muy útil mientras aprendes: muestra a la vez el tipo y el valor de una variable.

**Comillas dobles frente a comillas simples:** dentro de comillas dobles, PHP sustituye las variables por su valor. Dentro de comillas simples, el texto se muestra tal cual.

```php

    <?php
    $name = "Alicia";

    // ❌ INCORRECTO (si quieres el valor): las comillas simples muestran el texto literal
    echo 'Hola, $name'; // Muestra: Hola, $name

    // ✅ CORRECTO: las comillas dobles insertan el valor de la variable
    echo "Hola, $name"; // Muestra: Hola, Alicia
    ?>


```

---

## 4. Operadores

Los operadores son símbolos que realizan operaciones con valores, como sumar números o compararlos.

### Operadores aritméticos
Las operaciones matemáticas habituales: `+` (sumar), `-` (restar), `*` (multiplicar), `/` (dividir) y `%` (resto de una división).

### Operadores de comparación
Comparan dos valores y devuelven `true` o `false`. Presta especial atención a la diferencia entre `==` y `===`.

* `==`: Igual (los valores son iguales, aunque sus tipos sean distintos).
* `===`: Idéntico (los valores **y** los tipos son iguales).
* `!=`: Distinto.
* `>` / `<`: Mayor que / Menor que.

```php

    <?php
    $x = 100;  
    $y = "100";

    var_dump($x == $y);  // bool(true): los valores son iguales
    var_dump($x === $y); // bool(false): los tipos son distintos (int frente a string)
    ?>


```

**Error habitual:** usar `==` cuando el tipo importa. Por ejemplo, `strpos()` devuelve la posición en la que encuentra un texto, que puede ser `0` (justo al principio), o `false` si no lo encuentra. Con `==`, `0` y `false` se consideran iguales.

```php

    <?php
    $text = "PHP es divertido";

    // ❌ INCORRECTO: "PHP" está en la posición 0, y 0 == false es verdadero, así que dice «No encontrado»
    if (strpos($text, "PHP") == false) {
        echo "No encontrado";
    }

    // ✅ CORRECTO: === solo coincide con un false de verdad
    if (strpos($text, "PHP") === false) {
        echo "No encontrado";
    }
    ?>


```

### Operadores lógicos
Sirven para combinar condiciones:
* `&&` (y): las dos condiciones deben ser verdaderas.
* `||` (o): al menos una condición debe ser verdadera.
* `!` (no): invierte el resultado.

---

## 5. Estructuras de control

Por defecto, un script ejecuta sus instrucciones una detrás de otra. Las **estructuras de control** cambian ese orden: permiten que el código tome decisiones o repita acciones.

### 5.1. Condicionales

Los condicionales ejecutan bloques de código distintos según si una condición es verdadera. La forma más habitual es `if...elseif...else` («si... si no, si... si no»).

```php

    <?php
    $hour = (int) date("H"); // Hora actual como número entero (0-23)

    if ($hour < 10) {
        echo "¡Buenos días!";
    } elseif ($hour < 20) {
        echo "¡Que tengas un buen día!";
    } else {
        echo "¡Buenas noches!";
    }
    ?>


```

PHP también ofrece una forma corta de escribir un `if...else` sencillo, el **operador ternario**: `condición ? valor_si_verdadero : valor_si_falso`.

```php

    <?php
    $age = 20;

    $message = $age >= 18 ? "Mayor de edad" : "Menor de edad";

    echo $message; // Muestra: Mayor de edad
    ?>


```

### 5.2. Bucles
Los **bucles** repiten un bloque de código mientras se cumpla una condición.

**Bucle while:**

```php

    <?php
    $x = 1;

    while ($x <= 5) {
        echo "El número es: $x <br>";
        $x++; // Suma 1 a $x
    }
    ?>


```

**Error habitual:** olvidar actualizar la variable de la condición. La condición siempre es verdadera, así que el bucle no termina nunca y la página nunca acaba de cargar.

```php

    <?php
    $x = 1;

    // ❌ INCORRECTO: $x siempre vale 1, bucle infinito
    while ($x <= 5) {
        echo $x;
    }

    // ✅ CORRECTO: $x aumenta hasta que la condición es falsa
    while ($x <= 5) {
        echo $x;
        $x++;
    }
    ?>


```

**Bucle foreach:**

El bucle `foreach` («para cada») recorre uno a uno todos los elementos de un array. Es uno de los bucles más usados en PHP, por ejemplo para mostrar una lista de productos que vienen de una base de datos.

```php

    <?php
    $colors = ["rojo", "verde", "azul", "amarillo"];

    foreach ($colors as $color) {
        echo "$color <br>";
    }
    ?>


```

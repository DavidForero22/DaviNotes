---
title: "Funciones y manejo de datos en PHP"
---

# Funciones y manejo de datos

Una vez conoces la sintaxis básica, el siguiente paso es organizar tu código y trabajar con datos. Esta guía explica cómo crear **funciones** (bloques de código reutilizables) y cómo manejar los dos tipos de datos más habituales en el desarrollo web: los **strings** (textos) y los **arrays** (listas de valores).

---

## Índice

<div id="content-table">

- [1. Funciones propias](#1-funciones-propias "Crear tus propias funciones")
- [2. Parámetros y valores de retorno](#2-parámetros-y-valores-de-retorno "Argumentos y valores devueltos")
- [3. Manipulación de textos](#3-manipulación-de-textos "Técnicas para trabajar con strings")
- [4. Trabajar con arrays](#4-trabajar-con-arrays "Las estructuras de arrays de PHP")
    - [4.1. Arrays indexados](#41-arrays-indexados "Arrays con índices numéricos para datos ordenados")
    - [4.2. Arrays asociativos](#42-arrays-asociativos "Arrays que usan claves con nombre")
    - [4.3. Arrays multidimensionales](#43-arrays-multidimensionales "Arrays que contienen otros arrays")
- [5. Funciones de arrays habituales](#5-funciones-de-arrays-habituales "Funciones incorporadas para trabajar con arrays")

</div>

---

## 1. Funciones propias

Una **función** es un bloque de instrucciones con nombre que puedes ejecutar tantas veces como quieras, simplemente escribiendo su nombre. Es como una receta: la escribes una vez y la sigues cada vez que la necesitas.

Una función no se ejecuta sola al cargar la página; solo se ejecuta cuando se la **llama**. Para crear una, empieza con la palabra `function`, seguida de su nombre y unos paréntesis.

```php

    <?php
    // Definir la función (escribir la receta)
    function writeMessage() {
        echo "¡Hola, bienvenido al desarrollo con PHP!";
    }

    // Llamar a la función (seguir la receta)
    writeMessage();
    writeMessage(); // Se puede llamar tantas veces como haga falta
    ?>


```

---

## 2. Parámetros y valores de retorno

Las funciones son mucho más útiles cuando pueden recibir datos y devolver un resultado.

Los **parámetros** son variables que se escriben entre los paréntesis de la función. Los valores que pasas al llamarla se llaman **argumentos**.

```php

    <?php
    function familyName($firstName) {
        echo "$firstName Jaeger.<br>";
    }

    familyName("Eren"); // Muestra: Eren Jaeger.
    familyName("Zeke"); // Muestra: Zeke Jaeger.
    ?>


```

Para que una función devuelva un valor, usa la instrucción `return`. El resultado se puede guardar después en una variable o usar en otra operación.

```php

    <?php
    function sum($x, $y) {
        $z = $x + $y;
        return $z;
    }

    echo "5 + 10 = " . sum(5, 10); // Muestra: 5 + 10 = 15
    ?>


```

**Error habitual:** usar `echo` dentro de una función cuando necesitas el resultado. `echo` solo muestra el valor en la página; el código que llamó a la función no recibe nada.

```php

    <?php
    // ❌ INCORRECTO: muestra 15, pero sum() no devuelve nada (NULL), así que $total acaba valiendo 0
    function sum($x, $y) {
        echo $x + $y;
    }
    $total = sum(5, 10) * 2;

    // ✅ CORRECTO: return devuelve el valor, así que $total vale 30
    function sum($x, $y) {
        return $x + $y;
    }
    $total = sum(5, 10) * 2;
    ?>


```

**Error habitual:** usar una variable de fuera de la función. Cada función tiene su propio espacio separado para las variables (su *ámbito*), así que no puede ver las variables creadas fuera. Pásalas como parámetros.

```php

    <?php
    $taxRate = 0.21;

    // ❌ INCORRECTO: $taxRate no existe dentro de la función (Warning: Undefined variable)
    function addTax($price) {
        return $price + $price * $taxRate;
    }

    // ✅ CORRECTO: el valor se recibe como parámetro
    function addTax($price, $taxRate) {
        return $price + $price * $taxRate;
    }

    echo addTax(100, $taxRate); // Muestra: 121
    ?>


```

---

## 3. Manipulación de textos

Un **string** es un texto. Como crear páginas web consiste sobre todo en producir texto (HTML), PHP incluye muchas funciones para trabajar con strings.

Estas son algunas de las **funciones de texto** más habituales:

* `strlen()`: Devuelve el número de caracteres de un texto.
* `str_word_count()`: Cuenta las palabras de un texto.
* `strtoupper()` / `strtolower()`: Pasa el texto a mayúsculas / minúsculas.
* `strpos()`: Busca la posición de un texto dentro de otro.
* `str_replace()`: Reemplaza un texto por otro.

Ejemplo:

```php

    <?php
    $text = "Hello World";

    // Obtener la longitud
    echo strlen($text); // Muestra: 11

    // Reemplazar texto
    echo str_replace("World", "PHP", $text); // Muestra: Hello PHP

    // Pasar a mayúsculas
    echo strtoupper($text); // Muestra: HELLO WORLD
    ?>


```

*Nota: `strlen()` cuenta bytes, así que las letras con tilde (como `é` o `ñ`) cuentan como dos. Usa `mb_strlen()` cuando tu texto pueda contenerlas.*

---

## 4. Trabajar con arrays

Un **array** guarda varios valores en una sola variable, como una lista. En PHP los arrays son muy flexibles y se usan en todas partes, desde ajustes de configuración hasta los resultados de una consulta a una base de datos.

### 4.1. Arrays indexados
Arrays en los que cada valor tiene una posición numérica (el **índice**), asignada automáticamente y que empieza en `0`.

```php

    <?php
    $cars = ["Volvo", "BMW", "Toyota"];
    
    echo "Me gustan " . $cars[0] . " y " . $cars[1]; // Muestra: Me gustan Volvo y BMW
    ?>


```

La sintaxis corta `[...]` es la forma moderna de crear arrays. También verás la forma antigua `array("Volvo", "BMW", "Toyota")`, que hace exactamente lo mismo.

### 4.2. Arrays asociativos
Arrays en los que cada valor tiene una **clave** (un nombre) que eliges tú, en lugar de un número. Se parecen a los objetos JSON o a los diccionarios de Python.

```php

    <?php
    $ages = ["Pedro" => 35, "Ben" => 37, "Joe" => 43];

    // Acceder a los valores por clave
    echo "Pedro tiene " . $ages["Pedro"] . " años.";
    ?>


```

### 4.3. Arrays multidimensionales
Arrays que contienen otros arrays, como una tabla con filas y columnas. Son típicos al trabajar con listas de registros, como los usuarios de una web.

```php

    <?php
    $contacts = [
        ["name" => "Pedro", "email" => "pedro@test.com"],
        ["name" => "Ben", "email" => "ben@test.com"],
    ];

    // Primera fila, columna "email"
    echo $contacts[0]["email"]; // Muestra: pedro@test.com
    ?>


```

**Error habitual:** intentar mostrar un array entero con `echo`. `echo` solo funciona con valores simples, así que muestra la palabra `Array` y un aviso. Usa `print_r()` (o `var_dump()`) para ver su contenido mientras pruebas.

```php

    <?php
    $cars = ["Volvo", "BMW"];

    // ❌ INCORRECTO: muestra "Array" (Warning: Array to string conversion)
    echo $cars;

    // ✅ CORRECTO: muestra cada elemento con su índice
    print_r($cars); // Muestra: Array ( [0] => Volvo [1] => BMW )
    ?>


```

---

## 5. Funciones de arrays habituales

PHP incluye una gran biblioteca de funciones para trabajar con arrays.

* `count()`: Devuelve el número de elementos.
* `sort()` / `rsort()`: Ordena el array de forma ascendente / descendente.
* `array_push()`: Añade uno o varios elementos al final. La forma corta `$array[] = valor;` hace lo mismo con un solo elemento.
* `in_array()`: Comprueba si un valor existe en el array.

```php

    <?php
    $fruits = ["Manzana", "Plátano"];

    // Añadir un elemento (las dos líneas hacen lo mismo)
    array_push($fruits, "Naranja");
    $fruits[] = "Mango";

    echo count($fruits); // Muestra: 4

    // Comprobar si existe un valor
    if (in_array("Manzana", $fruits)) {
        echo "¡Tenemos manzanas!";
    }
    ?>


```

**Error habitual:** fiarse de `in_array()` con valores de distinto tipo. Por defecto compara de forma flexible (como `==`), así que un texto como `"1e1"` se considera igual al número `10`. Pasa `true` como tercer argumento para una comparación estricta (como `===`).

```php

    <?php
    $allowedIds = [10, 20, 30];

    // ❌ INCORRECTO: "1e1" (notación científica de 10) se acepta como id válido
    in_array("1e1", $allowedIds);       // true

    // ✅ CORRECTO: el modo estricto también compara el tipo
    in_array("1e1", $allowedIds, true); // false
    ?>


```

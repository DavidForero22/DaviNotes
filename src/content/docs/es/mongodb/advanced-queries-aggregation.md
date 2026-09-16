---
title: "Consultas avanzadas y agregación en MongoDB"
---

# Consultas Avanzadas y Agregación

Con los fundamentos ya cubiertos, toca acelerar las búsquedas con índices y responder preguntas más complejas de lo que permite un simple filtro —totales, datos cruzados, formas transformadas— usando la tubería de agregación de MongoDB. Esta sección también cubre mantener los documentos consistentes y algunas formas probadas de estructurar colecciones para necesidades habituales del mundo real.

---

## Tabla de Contenidos

<div id="content-table">

- [2.1. Indexación en MongoDB](#21-indexación-en-mongodb "Índices simples, compuestos, de texto y geoespaciales")
- [2.2. Aggregation Pipeline I: Etapas básicas](#22-aggregation-pipeline-i-etapas-básicas "$match, $project, $group, $sort")
- [2.3. Aggregation Pipeline II: Cruce y desestructuración](#23-aggregation-pipeline-ii-cruce-y-desestructuración "$lookup y $unwind")
- [2.4. Validación de esquemas](#24-validación-de-esquemas "Forzar una estructura con JSON Schema")
- [2.5. Patrones de diseño NoSQL](#25-patrones-de-diseño-nosql "Bucket, Subset y Outlier pattern")

</div>

---

## 2.1. Indexación en MongoDB

Igual que MySQL (sección 2.4 de su guía), MongoDB tiene que recorrer cada documento de una colección para satisfacer una consulta a menos que pueda usar un **índice**: una estructura separada que le permite saltar directamente a los documentos que coinciden en lugar de revisarlos uno a uno.

```js

    db.books.createIndex({ genre: 1 });                         // Índice simple, orden ascendente
    db.books.createIndex({ genre: 1, price: -1 });               // Índice compuesto (genre, luego price descendente)
    db.books.createIndex({ title: "text", description: "text" }); // Índice de texto, para buscar palabras dentro de campos de texto
    db.stores.createIndex({ location: "2dsphere" });              // Índice geoespacial, para consultas basadas en ubicación


```

| Tipo de índice | Acelera |
| :--- | :--- |
| Simple | Filtrar u ordenar por un campo |
| Compuesto | Filtrar u ordenar por varios campos juntos, en ese orden |
| Texto | Buscar palabras dentro de campos de tipo cadena (consultas `$text`) |
| Geoespacial | Consultas de "cerca de mí" o "dentro de esta zona" sobre coordenadas |

`db.books.find({ genre: "sci-fi" }).explain("executionStats")` muestra si una consulta realmente usó un índice (`IXSCAN`) o si acabó recorriendo toda la colección (`COLLSCAN`); el mismo papel de diagnóstico que cumple `EXPLAIN` en MySQL.

**Error común:** crear un índice compuesto con el orden de campos equivocado. Un índice compuesto sobre `{ genre: 1, price: -1 }` acelera de forma eficiente las consultas que filtran solo por `genre`, o por `genre` y `price` juntos, pero **no** ayuda de forma significativa a una consulta que filtra solo por `price`: el orden importa.

---

## 2.2. Aggregation Pipeline I: Etapas básicas

La **tubería de agregación (aggregation pipeline)** es la herramienta de MongoDB para cualquier cosa más allá de un simple filtro: totales, conteos agrupados, remodelar documentos y más. Funciona como una secuencia de **etapas**, cada una tomando los documentos producidos por la etapa anterior y transformándolos aún más, como una cadena de montaje para datos.

```js

    db.orders.aggregate([
        { $match: { status: "completed" } },              // 1. Conserva solo los pedidos completados
        { $group: { _id: "$customerId", total: { $sum: "$amount" } } }, // 2. Suma los importes por cliente
        { $sort: { total: -1 } },                          // 3. Ordena los clientes por total gastado, de mayor a menor
    ]);


```

| Etapa | Propósito |
| :--- | :--- |
| `$match` | Filtra documentos, igual que `find()`; normalmente se coloca al principio para reducir el trabajo de las etapas siguientes |
| `$project` | Remodela cada documento: elige campos a incluir, excluir o calcular nuevos |
| `$group` | Agrupa documentos según un valor elegido y calcula totales, conteos o medias por grupo |
| `$sort` | Ordena los documentos resultantes |

`$project` es especialmente útil para ocultar campos que no quieres enviar a una aplicación (como un campo de uso interno), o para calcular un nuevo valor al vuelo:

```js

    db.books.aggregate([
        { $project: { title: 1, discountedPrice: { $multiply: ["$price", 0.9] } } },
    ]);


```

**Error común:** colocar `$match` al final de la tubería en lugar de lo más cerca posible del principio. `$match` reduce el número de documentos que cada etapa posterior tiene que procesar, así que filtrar pronto hace que toda la tubería sea más rápida; filtrar tarde significa que las etapas anteriores desperdician esfuerzo procesando documentos que de todas formas acabarán descartados.

---

## 2.3. Aggregation Pipeline II: Cruce y desestructuración

MongoDB favorece el embebido (sección 1.5), pero cuando los datos están referenciados en colecciones separadas, `$lookup` realiza una unión, muy parecida al `JOIN` de SQL, trayendo documentos coincidentes de otra colección.

```js

    db.orders.aggregate([
        {
            $lookup: {
                from: "customers",        // La colección con la que unir
                localField: "customerId", // Campo en "orders"
                foreignField: "_id",      // Campo coincidente en "customers"
                as: "customerInfo",       // Nombre del nuevo campo de tipo array que contendrá las coincidencias
            },
        },
    ]);


```

Como un `$lookup` puede coincidir con más de un documento, su resultado siempre se coloca en un campo de tipo **array** (`customerInfo` arriba), incluso cuando —como con un único cliente coincidente— ese array solo contenga un elemento.

`$unwind` toma un campo de tipo array y lo convierte de nuevo en varios documentos separados, uno por cada elemento del array; útil justo después de un `$lookup`, o siempre que una lista embebida (como las líneas de un pedido) necesite procesarse elemento por elemento.

```js

    db.orders.aggregate([
        { $unwind: "$items" },   // Un documento de salida por cada elemento del array "items"
        { $group: { _id: "$items.productId", totalSold: { $sum: "$items.quantity" } } },
    ]);


```

**Error común:** olvidar que `$lookup` devuelve un **array**, e intentar leer los datos unidos como si fueran un único objeto (p. ej. `customerInfo.name` en lugar de `customerInfo[0].name`, o encadenar un `$unwind` cuando se esperaba una única coincidencia sin tener la garantía de que lo fuera).

---

## 2.4. Validación de esquemas

MongoDB no obliga a que todos los documentos de una colección compartan la misma forma, pero aun así se le pueden dar a una colección **reglas de validación** opcionales, escritas con el estándar **JSON Schema**, para que la propia base de datos rechace documentos que no cumplan una estructura mínima.

```js

    db.createCollection("books", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["title", "price"],
                properties: {
                    title: { bsonType: "string" },
                    price: { bsonType: "number", minimum: 0 },
                },
            },
        },
    });


```

Con esta regla en marcha, `db.books.insertOne({ price: -5 })` se rechaza directamente: falta `title`, y un `price` negativo incumple la regla `minimum`. Esto le da a una base de datos documental una red de seguridad parecida a las restricciones `NOT NULL` y de tipo de dato que vienen gratis en una tabla SQL (sección 1.2 de la guía de MySQL).

**Error común:** confiar únicamente en el código de la aplicación para comprobar la forma de los datos, sin validación a nivel de base de datos. Si más de una aplicación (o un compañero futuro ejecutando un script puntual) llega a escribir alguna vez en esa misma colección, solo una regla impuesta por la propia base de datos tiene garantizado que la respetarán todos.

---

## 2.5. Patrones de diseño NoSQL

Más allá de la elección básica entre embebido y referenciado (sección 1.5), algunos patrones con nombre resuelven problemas de modelado recurrentes y habituales en MongoDB:

| Patrón | Problema que resuelve | Cómo |
| :--- | :--- | :--- |
| **Bucket pattern** | Guardar enormes cantidades de lecturas pequeñas e individuales (como datos de un sensor tomados cada segundo) como documentos separados se vuelve costoso y lento | Agrupar muchas lecturas ocurridas cerca en el tiempo en un único documento, como un campo tipo array |
| **Subset pattern** | Embeber *todo* de algo (como cada reseña de un producto) hace que el documento principal sea demasiado grande para cargarse de forma eficiente | Embeber solo un subconjunto pequeño y útil (p. ej. las 5 reseñas más recientes) y mantener la lista completa en una colección separada y referenciada |
| **Outlier pattern** | Un diseño funciona bien para el caso típico, pero un documento poco común (una cuenta de celebridad con millones de seguidores) rompe la suposición de que una lista se puede embeber sin problemas | Detectar el caso raro y desproporcionadamente grande y guardar sus datos extra por separado, mientras el caso habitual conserva el diseño embebido más sencillo |

```js

    // Bucket pattern: un documento por hora, con muchas lecturas individuales dentro
    {
      "sensorId": "temp-1",
      "hour": "2024-05-20T14:00:00Z",
      "readings": [
        { "time": "14:00:03", "value": 21.4 },
        { "time": "14:00:04", "value": 21.5 },
        // ... potencialmente cientos más dentro de esta misma hora
      ]
    }


```

**Error común:** elegir un patrón antes de saber realmente cómo se van a leer los datos. El modelado NoSQL (a diferencia de la normalización en SQL) está guiado por los **patrones de acceso**: las preguntas concretas que la aplicación necesita responder rápido, así que la estructura correcta depende por completo de cómo se van a consultar los datos, no de una idea abstracta de "corrección."

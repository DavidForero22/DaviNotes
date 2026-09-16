---
title: "Fundamentos y modelo documental en MongoDB"
---

# Fundamentos y Modelo Documental

MongoDB organiza los datos de forma muy distinta a una base de datos como MySQL. Antes de escribir ninguna consulta, conviene entender qué es realmente un "documento", cómo realizar las operaciones básicas sobre él y cómo decidir dónde debe vivir la información relacionada. Esta sección construye esa base.

---

## Tabla de Contenidos

<div id="content-table">

- [1.1. Introducción a NoSQL y documentos JSON/BSON](#11-introducción-a-nosql-y-documentos-jsonbson "Qué hace diferente a MongoDB de una base de datos relacional")
- [1.2. Uso de mongosh y MongoDB Compass](#12-uso-de-mongosh-y-mongodb-compass "Comunicarse con la base de datos tras la instalación")
- [1.3. Operaciones CRUD en colecciones](#13-operaciones-crud-en-colecciones "insertOne, find, updateMany, deleteOne")
- [1.4. Operadores de consulta y actualización](#14-operadores-de-consulta-y-actualización "$eq, $gt, $set, $push y más")
- [1.5. Diseño de esquemas: Embebido vs. Referenciado](#15-diseño-de-esquemas-embebido-vs-referenciado "Decidir dónde debe vivir la información relacionada")

</div>

---

## 1.1. Introducción a NoSQL y documentos JSON/BSON

**NoSQL** es una etiqueta amplia para bases de datos que almacenan la información de forma distinta al modelo de tablas y filas que usa MySQL (a menudo llamadas bases de datos **SQL** o **relacionales**). MongoDB es la **base de datos documental** más popular: en lugar de filas rígidas repartidas entre tablas separadas y vinculadas, almacena cada registro como un único **documento** flexible, una estructura que se parece casi exactamente a un objeto JSON, el mismo formato que se usa por toda la web para intercambiar datos.

```json

    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Alex",
      "email": "alex@example.com",
      "age": 30,
      "hobbies": ["reading", "cycling"]
    }


```

Cada documento vive dentro de una **colección**, el equivalente de MongoDB a una tabla, pero a diferencia de una tabla SQL, una colección no obliga a que todos los documentos compartan exactamente las mismas columnas. Un documento de `users` podría tener una lista `hobbies` mientras que otro no, sin ningún error por parte de la base de datos.

| SQL (MySQL) | MongoDB | Equivale aproximadamente a |
| :--- | :--- | :--- |
| Base de datos | Base de datos | Un contenedor con nombre para el resto |
| Tabla | Colección | Un grupo de registros similares |
| Fila | Documento | Un único registro |
| Columna | Campo | Un dato dentro de un registro |

Los documentos se escriben y se leen como JSON, pero MongoDB en realidad los almacena en disco como **BSON** (JSON Binario): un formato binario que añade algunos tipos de datos extra que JSON no tiene por sí mismo (como fechas propiamente dichas y datos binarios) y que MongoDB puede leer y escribir mucho más rápido que JSON en texto plano.

**Error común:** asumir que "sin estructura fija" significa "sin necesidad de planificación." MongoDB no obliga a un esquema a nivel de base de datos, pero una aplicación real sigue esperando que cada documento tenga una forma consistente y predecible; esa consistencia simplemente hay que planearla y hacerla cumplir desde las personas que construyen la aplicación (o, más adelante, con las herramientas de la sección 2.4) en lugar de que lo haga la base de datos automáticamente.

---

## 1.2. Uso de mongosh y MongoDB Compass

*Si MongoDB todavía no está instalado en tu máquina, consulta primero la Guía de instalación, que cubre la instalación del servidor y cómo conectarse por primera vez a través de mongosh.*

**mongosh** es el cliente de línea de comandos de MongoDB. Más allá de conectarse y listar bases de datos, es un entorno completo de JavaScript, por eso los comandos de MongoDB se parecen a llamadas a funciones de JavaScript en lugar de a un lenguaje de consulta separado como SQL:

```bash

    use libreria          // Cambia a (o crea) una base de datos llamada "libreria"
    db.books.insertOne({ title: "Dune", price: 15.99 })   // "db" siempre se refiere a la base de datos actual


```

**MongoDB Compass** ofrece las mismas funciones mediante una interfaz gráfica: una barra lateral lista tus bases de datos y colecciones, un visor de documentos te permite explorar y editar registros haciendo clic, y una barra de consultas visual construye los mismos filtros que escribirías en mongosh.

| | mongosh | Compass |
| :--- | :--- | :--- |
| **Interfaz** | Línea de comandos, basada en texto | Gráfica, apuntar y hacer clic |
| **Ideal para** | Scripts, comandos rápidos y puntuales | Explorar datos visualmente, construir consultas de forma interactiva |
| **Motor subyacente** | El mismo servidor de MongoDB | El mismo servidor de MongoDB |

**Error común:** escribir `db.nombreColeccion` para una colección que todavía no existe y esperar un error. MongoDB crea colecciones (e incluso bases de datos enteras) automáticamente la primera vez que insertas un documento en ellas: no hace falta ningún paso previo al estilo `CREATE TABLE`.

---

## 1.3. Operaciones CRUD en colecciones

Igual que en MySQL, el trabajo diario en MongoDB gira en torno al **CRUD**: Create, Read, Update y Delete (crear, leer, actualizar, eliminar). Los nombres exactos de los métodos son distintos, y la mayoría vienen en una versión singular (`One`) y otra plural (`Many`), ya que un solo comando puede afectar a un documento o a todos los documentos que cumplan un filtro.

```js

    // CREATE
    db.books.insertOne({ title: "Dune", price: 15.99, genre: "sci-fi" });
    db.books.insertMany([
        { title: "1984", price: 9.99, genre: "dystopian" },
        { title: "Neuromancer", price: 12.5, genre: "sci-fi" },
    ]);

    // READ
    db.books.find({ genre: "sci-fi" });          // Todos los libros de ciencia ficción
    db.books.findOne({ title: "Dune" });          // Solo la primera coincidencia

    // UPDATE
    db.books.updateOne({ title: "Dune" }, { $set: { price: 17.99 } });
    db.books.updateMany({ genre: "sci-fi" }, { $set: { onSale: true } });

    // DELETE
    db.books.deleteOne({ title: "1984" });
    db.books.deleteMany({ genre: "dystopian" });


```

Todos estos métodos reciben un primer argumento llamado **filtro**: un pequeño documento que describe qué registros deben coincidir. `{}` (un filtro vacío) coincide con todos los documentos, así que `db.books.find({})` lee la colección entera, igual que `SELECT * FROM books` haría en MySQL.

**Error común:** llamar a `updateOne` o `deleteOne` cuando la intención en realidad era afectar a todos los documentos que coincidan. `updateOne`/`deleteOne` se detienen después de la primera coincidencia que encuentran, dejando en silencio cualquier otro documento coincidente sin tocar; recurre a la versión `Many` siempre que más de un registro pueda coincidir con el filtro.

---

## 1.4. Operadores de consulta y actualización

Un campo plano como `{ genre: "sci-fi" }` solo coincide con un valor exacto. Los **operadores de consulta**, siempre escritos con un símbolo de dólar `$` al principio, permiten que los filtros expresen comparaciones, rangos y lógica más compleja.

```js

    db.books.find({ price: { $gt: 10 } });              // Precio mayor que 10
    db.books.find({ price: { $gte: 10, $lte: 20 } });    // Precio entre 10 y 20 (ambos incluidos)
    db.books.find({ genre: { $in: ["sci-fi", "fantasy"] } }); // genre es cualquiera de estos valores


```

| Operador | Significado |
| :--- | :--- |
| `$eq` | Igual a (el valor por defecto cuando solo escribes un valor plano) |
| `$gt` / `$gte` | Mayor que / mayor o igual que |
| `$lt` / `$lte` | Menor que / menor o igual que |
| `$in` | Coincide con cualquier valor de una lista dada |

Los **operadores de actualización**, usados dentro de `updateOne`/`updateMany`, describen *cómo* cambiar un documento en lugar de reemplazarlo por completo:

```js

    db.books.updateOne({ title: "Dune" }, { $set: { price: 17.99 } });      // Establece (o añade) un campo
    db.books.updateOne({ title: "Dune" }, { $inc: { price: 1 } });          // Incrementa un campo numérico
    db.books.updateOne({ title: "Dune" }, { $push: { tags: "bestseller" } }); // Añade un elemento a un campo tipo array


```

**Error común:** llamar a `updateOne({ title: "Dune" }, { price: 17.99 })` **sin** `$set`. Sin un operador de actualización, MongoDB trata el segundo argumento como el **contenido nuevo y completo** del documento y reemplaza todo lo demás que tenía: cualquier otro campo del documento se elimina en silencio.

---

## 1.5. Diseño de esquemas: Embebido vs. Referenciado

Como MongoDB no obliga a repartir la información relacionada entre colecciones separadas de la forma en que MySQL obliga a usar tablas separadas, cada decisión de diseño se reduce a una pregunta central: ¿la información relacionada debería estar **embebida** dentro del mismo documento, o **referenciada** en una colección separada (parecido a una clave foránea)?

```js

    // Embebido: la dirección vive directamente dentro del documento del cliente
    {
      "_id": 1,
      "name": "Alex",
      "address": { "street": "123 Main St", "city": "Springfield" }
    }

    // Referenciado: el documento del cliente solo guarda un ID que apunta a una colección separada
    { "_id": 1, "name": "Alex", "addressId": 501 }
    // En una colección separada "addresses":
    { "_id": 501, "street": "123 Main St", "city": "Springfield" }


```

| | Embebido | Referenciado |
| :--- | :--- | :--- |
| **Rendimiento de lectura** | Rápido: una sola consulta obtiene todo | Más lento: puede requerir una segunda consulta o un `$lookup` (visto en la sección 2.3) |
| **Ideal para** | Datos que siempre se leen juntos y rara vez cambian de forma independiente (una dirección, líneas de un pedido) | Datos compartidos entre muchos documentos, o que crecen sin límite (las reseñas de un producto, los pedidos de un usuario) |
| **Riesgo de duplicación** | Mayor, si el mismo dato está embebido en muchos sitios | Menor, ya que cada dato se almacena una sola vez |

Una regla general habitual: embebe datos que "pertenecen" a un documento y siempre se leen junto a él; referencia datos que se comparten, se reutilizan entre muchos documentos, o podrían crecer indefinidamente (embeber miles de reseñas directamente dentro de un único documento de producto, por ejemplo, haría que ese documento fuera inmanejablemente grande).

**Error común:** embeber siempre, por costumbre, incluso para datos que crecen sin límite, como embeber cada pedido que un cliente ha hecho alguna vez directamente dentro de su documento de cliente. Ese documento crece indefinidamente y acaba volviéndose lento de leer y actualizar, cuando una colección `orders` separada y referenciada escalaría mucho mejor.

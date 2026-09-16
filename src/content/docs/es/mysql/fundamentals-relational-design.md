---
title: "Fundamentos y diseño relacional en MySQL"
---

# Fundamentos y Diseño Relacional

Antes de escribir una sola consulta, conviene entender qué es realmente una base de datos, cómo organiza MySQL la información y el vocabulario básico que usarás en todas las guías a partir de ahora. Esta sección construye el modelo mental de tablas, filas y columnas, e introduce el puñado de comandos que se usan para crearlas y manipularlas.

---

## Tabla de Contenidos

<div id="content-table">

- [1.1. Introducción a MySQL, arquitectura cliente-servidor y motor InnoDB](#11-introducción-a-mysql-arquitectura-cliente-servidor-y-motor-innodb "Qué es un servidor de base de datos y cómo se organiza MySQL")
- [1.2. Tipos de datos, bases de datos y tablas (DDL)](#12-tipos-de-datos-bases-de-datos-y-tablas-ddl "Crear las estructuras que contendrán tus datos")
- [1.3. Operaciones CRUD básicas (DML)](#13-operaciones-crud-básicas-dml "SELECT, INSERT, UPDATE, DELETE")
- [1.4. Claves primarias, claves foráneas y restricciones](#14-claves-primarias-claves-foráneas-y-restricciones "Vincular tablas y proteger la integridad de los datos")
- [1.5. Normalización y diseño E/R](#15-normalización-y-diseño-er "1FN, 2FN, 3FN y diagramas entidad-relación")

</div>

---

## 1.1. Introducción a MySQL, arquitectura cliente-servidor y motor InnoDB

Una **base de datos** es una colección organizada de información, almacenada de forma que se pueda buscar, filtrar y actualizar con fiabilidad; piénsala como una versión mucho más inteligente y rápida de una hoja de cálculo. **MySQL** es un software, llamado **sistema gestor de bases de datos relacionales (RDBMS)**, que crea, almacena y gestiona bases de datos formadas por **tablas**: cuadrículas de filas y columnas, muy parecidas a una pestaña de una hoja de cálculo, donde cada tabla suele guardar un tipo de cosa (clientes, productos, pedidos...).

MySQL funciona con una **arquitectura cliente-servidor**: el **servidor** es el programa que realmente almacena los datos y se ejecuta en segundo plano (a menudo en una máquina separada, accesible por red); un **cliente** es cualquier programa que se conecta al servidor para enviarle comandos y leer los resultados. La herramienta de línea de comandos de la guía de instalación es un cliente, pero el código del backend de un sitio web, una app móvil o una herramienta gráfica como MySQL Workbench pueden ser clientes del mismo servidor al mismo tiempo.

| | Servidor | Cliente |
| :--- | :--- | :--- |
| **Rol** | Almacena y gestiona los datos reales | Envía peticiones y muestra los resultados |
| **Dónde se ejecuta** | De forma continua, en segundo plano | Solo mientras lo estás usando activamente |
| **Cuántos a la vez** | Normalmente uno por base de datos | Muchos clientes pueden conectarse al mismo servidor |

Internamente, MySQL delega el trabajo real de leer y escribir datos a un componente llamado **motor de almacenamiento**. **InnoDB** es el más usado y el que viene por defecto: mantiene los datos a salvo incluso si se corta la luz a mitad de una escritura, y admite las relaciones entre tablas que se ven más adelante en esta guía. Salvo que tengas una razón concreta para elegir otro motor, InnoDB es la opción por defecto correcta.

**Error común:** confundir MySQL (el software) con "una base de datos". MySQL es el *servidor* que puede contener muchas *bases de datos* distintas a la vez, igual que un archivador puede contener muchas carpetas distintas.

---

## 1.2. Tipos de datos, bases de datos y tablas (DDL)

Los comandos que crean o cambian la *estructura* de tus datos (en lugar de los datos en sí) se llaman **DDL** (Data Definition Language, lenguaje de definición de datos). La primera estructura que necesitas es una **base de datos**, un contenedor con nombre para tablas relacionadas:

```sql

    CREATE DATABASE libreria;
    USE libreria;   -- Indica a MySQL que todos los comandos siguientes aplican a esta base de datos


```

Dentro de una base de datos, una **tabla** se crea listando sus **columnas** (los datos que tendrá cada fila) y el **tipo de dato** de cada una; esto le dice a MySQL de antemano qué tipo de valor esperar, para almacenarlo de forma eficiente y rechazar cualquier cosa que no encaje.

| Tipo de dato | Almacena | Ejemplo |
| :--- | :--- | :--- |
| `INT` | Números enteros | `42` |
| `DECIMAL(10,2)` | Números decimales precisos (p. ej. dinero) | `19.99` |
| `VARCHAR(n)` | Texto corto, hasta `n` caracteres | `"Alex"` |
| `TEXT` | Texto largo, de longitud prácticamente ilimitada | La descripción completa de un libro |
| `DATE` | Una fecha del calendario | `2024-05-20` |
| `BOOLEAN` | Verdadero o falso | `TRUE` |

```sql

    CREATE TABLE libros (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(150) NOT NULL,
        precio DECIMAL(10,2),
        fecha_publicacion DATE
    );


```

`AUTO_INCREMENT` le dice a MySQL que genere automáticamente un número nuevo y siempre creciente para esa columna, así nunca tienes que inventar un ID a mano. `NOT NULL` significa que esa columna nunca puede quedar vacía: MySQL rechazará guardar una fila que no la proporcione.

**Error común:** elegir `VARCHAR(255)` para cualquier texto por costumbre. Un `precio` debería ser un tipo numérico (para que MySQL pueda hacer cálculos con él, como ordenar o sumar), y una descripción muy larga debería ser `TEXT` en lugar de un `VARCHAR` artificialmente grande.

---

## 1.3. Operaciones CRUD básicas (DML)

Una vez que existen las tablas, el trabajo del día a día pasa por el **DML** (Data Manipulation Language, lenguaje de manipulación de datos): comandos que leen y cambian los *datos en sí*. Estos cuatro cubren la gran mayoría de necesidades cotidianas, un acrónimo a menudo abreviado como **CRUD** (Create, Read, Update, Delete):

```sql

    -- CREATE: añade una fila nueva
    INSERT INTO libros (titulo, precio, fecha_publicacion)
    VALUES ('The Pragmatic Programmer', 39.99, '1999-10-30');

    -- READ: obtiene filas
    SELECT titulo, precio FROM libros WHERE precio < 40;

    -- UPDATE: modifica filas existentes
    UPDATE libros SET precio = 34.99 WHERE titulo = 'The Pragmatic Programmer';

    -- DELETE: elimina filas
    DELETE FROM libros WHERE titulo = 'The Pragmatic Programmer';


```

`SELECT` es el comando que más escribirás: `SELECT * FROM libros;` lee todas las columnas de todas las filas (`*` significa "todas las columnas"), mientras que `SELECT titulo, precio FROM libros;` lee solo las dos columnas que pides; limitar las columnas que pides mantiene los resultados legibles y las consultas más rápidas.

**Error común:** ejecutar `UPDATE` o `DELETE` **sin** una cláusula `WHERE`. `WHERE` es el filtro que indica *qué* filas tocar; sin él, MySQL actualiza o elimina **todas y cada una de las filas** de la tabla, sin confirmación y sin deshacer fácil.

```sql

    -- ❌ PELIGROSO: cambia el precio de todos los libros de la tabla
    UPDATE libros SET precio = 34.99;

    -- ✅ SEGURO: cambia el precio solo del libro que coincide
    UPDATE libros SET precio = 34.99 WHERE titulo = 'The Pragmatic Programmer';


```

---

## 1.4. Claves primarias, claves foráneas y restricciones

Una **clave primaria (PK)** es una columna (o combinación de columnas) que identifica de forma única cada fila de una tabla: nunca dos filas pueden compartir el mismo valor, de forma parecida a como dos personas no comparten el mismo número de pasaporte. Es lo que configuró `id INT AUTO_INCREMENT PRIMARY KEY` en la sección 1.2.

Una **clave foránea (FK)** es una columna de una tabla que apunta a la clave primaria de otra tabla, creando un vínculo entre ambas. Esta es la parte "relacional" de "base de datos relacional": en lugar de repetir todos los datos de un cliente en cada pedido, una tabla `pedidos` simplemente guarda el `id` de ese cliente.

```sql

    CREATE TABLE clientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL
    );

    CREATE TABLE pedidos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cliente_id INT,
        total DECIMAL(10,2),
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    );


```

Con esta clave foránea en su sitio, MySQL aplica una **restricción (constraint)**: una regla que la base de datos se niega a romper. En este caso, se niega a insertar un pedido cuyo `cliente_id` no corresponda a un cliente existente, y por defecto también se niega a eliminar un cliente que todavía tenga pedidos que apunten a él, protegiéndote de acabar con pedidos "huérfanos" que hacen referencia a alguien que ya no existe.

| Restricción | Qué garantiza |
| :--- | :--- |
| `PRIMARY KEY` | Cada fila se puede identificar de forma única |
| `FOREIGN KEY` | Una referencia siempre apunta a una fila que realmente existe |
| `NOT NULL` | Una columna nunca queda vacía |
| `UNIQUE` | Ninguna fila comparte el mismo valor en esa columna (p. ej. un email) |

**Error común:** guardar información repetida (como el nombre completo y la dirección de un cliente) directamente en la tabla `pedidos` en vez de vincularla a la tabla `clientes` con una clave foránea. Si ese cliente se muda, habría que actualizar cada uno de sus pedidos pasados uno por uno, en lugar de que el cambio ocurra en un único sitio.

---

## 1.5. Normalización y diseño E/R

La **normalización** es el proceso de organizar las tablas para que cada dato se almacene en exactamente un solo lugar, evitando duplicaciones y las inconsistencias que provocan. Normalmente se explica mediante una serie de reglas cada vez más estrictas, llamadas **formas normales**:

| Forma normal | Regla (en términos sencillos) |
| :--- | :--- |
| **1FN** (Primera) | Cada columna guarda un único valor: sin listas ni valores separados por comas metidos en una sola celda. |
| **2FN** (Segunda) | Cada columna que no es clave depende de *toda* la clave primaria, no solo de una parte de ella. |
| **3FN** (Tercera) | Cada columna que no es clave depende *únicamente* de la clave primaria, no de otra columna que tampoco sea clave. |

Un ejemplo rápido de antes/después al corregir una violación de la 1FN:

```sql

    -- ❌ Viola la 1FN: varios números de teléfono metidos en una sola celda
    -- | id | nombre | telefonos               |
    -- | 1  | Alex   | "555-1234, 555-5678"    |

    -- ✅ Corregido: un número de teléfono por fila, en su propia tabla vinculada con una clave foránea
    CREATE TABLE telefonos_cliente (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cliente_id INT,
        telefono VARCHAR(20),
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    );


```

Antes de crear ninguna tabla, la mayoría de diseñadores de bases de datos primero esbozan un **diagrama E/R** (diagrama entidad-relación): un dibujo sencillo donde las cajas representan **entidades** (las "cosas" que se convertirán en tablas, como `Cliente` o `Pedido`) y las líneas representan las **relaciones** entre ellas (un cliente puede tener *muchos* pedidos). Planear esto primero sobre el papel facilita mucho detectar claves foráneas que faltan o datos duplicados antes de escribir ni una línea de SQL.

**Error común:** sobre-normalizar un proyecto simple y pequeño hasta el punto de que casi cualquier consulta necesita unir cinco o seis tablas solo para mostrar una pantalla. La normalización reduce la duplicación, pero cada tabla adicional también añade complejidad: los diseños del mundo real equilibran ambas cosas en lugar de perseguir la forma normal más estricta a toda costa.

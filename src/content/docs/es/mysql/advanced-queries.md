---
title: "Consultas avanzadas y operativa en MySQL"
---

# Consultas Avanzadas y Operativa

Con lo básico ya cubierto, toca combinar información repartida entre varias tablas, resumir grandes cantidades de datos y asegurarse de que los cambios ocurren de forma segura incluso cuando muchas personas usan la base de datos a la vez. Esta sección cubre unir tablas, agregar datos, transacciones, índices y automatizar lógica dentro del propio MySQL.

---

## Tabla de Contenidos

<div id="content-table">

- [2.1. Consultas multitabla: JOINs y subconsultas](#21-consultas-multitabla-joins-y-subconsultas "Combinar datos de varias tablas")
- [2.2. Agregación de datos](#22-agregación-de-datos "GROUP BY, HAVING y funciones de agregación")
- [2.3. Transacciones y propiedades ACID](#23-transacciones-y-propiedades-acid "COMMIT, ROLLBACK y aislamiento")
- [2.4. Índices](#24-índices "Acelerar búsquedas con índices B-Tree, compuestos y UNIQUE")
- [2.5. Vistas, Procedimientos Almacenados y Triggers](#25-vistas-procedimientos-almacenados-y-triggers "Automatizar lógica dentro de la base de datos")

</div>

---

## 2.1. Consultas multitabla: JOINs y subconsultas

Como una base de datos relacional divide la información entre varias tablas vinculadas (ver la sección 1.4 sobre claves foráneas), leer una imagen completa —como "cada pedido junto con el nombre del cliente"— normalmente requiere combinar, o **unir (join)**, dos o más tablas en una sola consulta.

```sql

    -- Solo muestra pedidos que SÍ tienen un cliente coincidente
    SELECT pedidos.id, clientes.nombre, pedidos.total
    FROM pedidos
    INNER JOIN clientes ON pedidos.cliente_id = clientes.id;


```

`INNER JOIN` conserva solo las filas que coinciden en ambos lados. `LEFT JOIN` conserva **todas** las filas de la primera tabla (la izquierda), rellenando con valores vacíos (`NULL`) cuando no hay coincidencia en la derecha; útil para preguntas como "lista a todos los clientes, incluidos los que nunca han hecho un pedido."

```sql

    -- Incluye clientes aunque tengan cero pedidos (pedidos.id será NULL para ellos)
    SELECT clientes.nombre, pedidos.id
    FROM clientes
    LEFT JOIN pedidos ON pedidos.cliente_id = clientes.id;


```

| | `INNER JOIN` | `LEFT JOIN` | `RIGHT JOIN` |
| :--- | :--- | :--- | :--- |
| **Conserva** | Solo las filas que coinciden en ambos lados | Todas las filas de la tabla izquierda | Todas las filas de la tabla derecha |
| **Uso típico** | "Pedidos que tienen cliente" | "Todos los clientes, con o sin pedidos" | "Todos los pedidos, con o sin cliente" (poco común) |

Una **subconsulta** es una consulta anidada dentro de otra, útil cuando un filtro depende de un valor que primero hay que calcular:

```sql

    -- Encuentra clientes cuyo gasto total está por encima de la media
    SELECT nombre FROM clientes
    WHERE id IN (
        SELECT cliente_id FROM pedidos
        GROUP BY cliente_id
        HAVING SUM(total) > (SELECT AVG(total) FROM pedidos)
    );


```

**Error común:** usar `INNER JOIN` cuando en realidad el objetivo era incluir filas sin coincidencia. Como `INNER JOIN` descarta en silencio cualquier fila sin coincidencia, un informe puede perder entradas (como clientes sin pedidos todavía) sin mostrar ningún error.

---

## 2.2. Agregación de datos

Las **funciones de agregación** colapsan muchas filas en un único valor resumen: un total, una media, un conteo. `GROUP BY` aplica ese cálculo por separado para cada valor distinto de una columna, convirtiendo "el total de todos los pedidos" en "el total de pedidos, por cliente."

```sql

    SELECT cliente_id, COUNT(*) AS num_pedidos, SUM(total) AS total_gastado
    FROM pedidos
    GROUP BY cliente_id;


```

| Función | Devuelve |
| :--- | :--- |
| `COUNT(*)` | El número de filas |
| `SUM(columna)` | La suma de una columna numérica |
| `AVG(columna)` | La media de una columna numérica |
| `MIN(columna)` / `MAX(columna)` | El valor más pequeño / más grande |

`WHERE` filtra filas individuales **antes** de agrupar; `HAVING` filtra los **grupos en sí**, después de que se haya ejecutado la función de agregación; esta es la diferencia clave entre ambas, y la razón por la que `HAVING` es necesario.

```sql

    -- WHERE: solo considera pedidos de este año, antes de agrupar
    -- HAVING: después de agrupar, conserva solo los clientes que gastaron más de 500€ en total
    SELECT cliente_id, SUM(total) AS total_gastado
    FROM pedidos
    WHERE YEAR(fecha_pedido) = 2024
    GROUP BY cliente_id
    HAVING SUM(total) > 500;


```

**Error común:** intentar filtrar sobre un resultado agregado usando `WHERE` en vez de `HAVING` (p. ej. `WHERE SUM(total) > 500`). MySQL rechaza esto con un error, porque `WHERE` se ejecuta antes de que los totales existan siquiera: la suma solo se calcula una vez que las filas están agrupadas.

---

## 2.3. Transacciones y propiedades ACID

Una **transacción** agrupa varios cambios en una única unidad de trabajo de todo-o-nada, esencial cuando una acción del mundo real requiere que varios cambios en la base de datos tengan éxito juntos. El ejemplo clásico es una transferencia bancaria: restar dinero de una cuenta y añadirlo a otra deben ocurrir **ambas** cosas, o **ninguna**, o de lo contrario el dinero desaparece o aparece de la nada.

```sql

    START TRANSACTION;

    UPDATE cuentas SET saldo = saldo - 100 WHERE id = 1;
    UPDATE cuentas SET saldo = saldo + 100 WHERE id = 2;

    COMMIT;   -- Hace ambos cambios permanentes a la vez
    -- ROLLBACK;   -- O bien: deshace todos los cambios hechos desde START TRANSACTION


```

Si algo falla a mitad de camino (un error, una conexión perdida), ejecutar `ROLLBACK` en vez de `COMMIT` descarta todos los cambios hechos desde que empezó la transacción, como si nunca hubieran pasado.

Las transacciones están garantizadas por cuatro propiedades conocidas por el acrónimo **ACID**:

| Letra | Propiedad | Significado |
| :--- | :--- | :--- |
| **A** | Atomicidad | Todos los cambios de una transacción ocurren, o no ocurre ninguno. |
| **C** | Consistencia | Una transacción nunca puede dejar la base de datos violando sus propias reglas (como las restricciones). |
| **I** | Aislamiento | Las transacciones que se ejecutan al mismo tiempo no interfieren con los cambios en curso de las demás. |
| **D** | Durabilidad | Una vez confirmada (commit) una transacción, sobrevive incluso a una caída justo después. |

**Error común:** envolver una larga serie de cambios en una transacción y olvidarse de hacer `COMMIT` (o `ROLLBACK`) al final. Los cambios quedan "pendientes" e invisibles para otras conexiones, y pueden acabar **bloqueando** las filas afectadas, impidiendo el paso a otros usuarios hasta que la transacción finalmente se cierre.

---

## 2.4. Índices

Sin ayuda, MySQL tiene que recorrer cada fila de una tabla para encontrar las que cumplen una condición `WHERE`: rápido con cien filas, dolorosamente lento con diez millones. Un **índice** es una estructura adicional y separada que MySQL mantiene y que le permite saltar casi directamente a las filas que coinciden, parecido a cómo el índice de un libro te permite encontrar un tema sin leer todas las páginas.

```sql

    CREATE INDEX idx_email_cliente ON clientes(email);

    -- Un índice UNIQUE también obliga a que ninguna fila comparta el mismo valor
    CREATE UNIQUE INDEX idx_email_cliente_unico ON clientes(email);


```

Por defecto, MySQL (mediante InnoDB) construye los índices usando un **B-Tree**, una estructura organizada de forma que encontrar cualquier valor requiere aproximadamente el mismo número, pequeño, de pasos, sin importar cuánto crezca la tabla. Un **índice compuesto** cubre más de una columna a la vez, y acelera las consultas que filtran u ordenan por esa combinación exacta de columnas juntas.

```sql

    -- Acelera consultas que filtran por apellido Y nombre A LA VEZ
    CREATE INDEX idx_nombre_completo ON clientes(apellido, nombre);


```

Los índices no son gratis: cada índice también debe actualizarlo MySQL cada vez que se inserta, actualiza o elimina una fila, así que añadir uno a una columna que rara vez se busca pero se escribe con frecuencia puede ralentizar la base de datos en lugar de acelerarla. `EXPLAIN` (que se ve en la sección 3.1) muestra si una consulta realmente está usando un índice disponible.

**Error común:** añadir un índice a cada columna "por si acaso". Los índices aceleran las lecturas pero ralentizan las escrituras y ocupan espacio en disco adicional, así que deberían añadirse de forma deliberada, según las columnas que las consultas realmente filtran u ordenan.

---

## 2.5. Vistas, Procedimientos Almacenados y Triggers

Una **vista (view)** es una consulta guardada que se comporta como una tabla virtual: no almacena datos en sí misma, sino que vuelve a ejecutar su consulta subyacente cada vez que se usa, lo cual es práctico para esconder un `JOIN` complejo detrás de un nombre sencillo.

```sql

    CREATE VIEW resumen_pedidos_cliente AS
    SELECT clientes.nombre, COUNT(pedidos.id) AS num_pedidos
    FROM clientes
    LEFT JOIN pedidos ON pedidos.cliente_id = clientes.id
    GROUP BY clientes.nombre;

    -- A partir de ahora, esto se lee igual que una tabla normal
    SELECT * FROM resumen_pedidos_cliente;


```

Un **procedimiento almacenado (stored procedure)** es un bloque de lógica SQL guardado y reutilizable, parecido a una función en un lenguaje de programación, que puede aceptar parámetros y llamarse por su nombre en lugar de reescribir el mismo conjunto de sentencias cada vez.

```sql

    DELIMITER //
    CREATE PROCEDURE AgregarPedido(IN id_cliente INT, IN total_pedido DECIMAL(10,2))
    BEGIN
        INSERT INTO pedidos (cliente_id, total) VALUES (id_cliente, total_pedido);
    END //
    DELIMITER ;

    CALL AgregarPedido(1, 49.99);


```

Un **trigger** ejecuta un bloque de SQL **automáticamente** cada vez que ocurre un evento concreto en una tabla (antes o después de un `INSERT`, `UPDATE` o `DELETE`), sin que nadie tenga que acordarse de llamarlo.

```sql

    CREATE TABLE auditoria_pedidos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pedido_id INT,
        modificado_en DATETIME
    );

    CREATE TRIGGER despues_actualizar_pedido
    AFTER UPDATE ON pedidos
    FOR EACH ROW
    INSERT INTO auditoria_pedidos (pedido_id, modificado_en) VALUES (NEW.id, NOW());


```

**Error común:** esconder lógica de negocio importante dentro de triggers que se ejecutan en silencio en segundo plano. Son útiles para tareas pequeñas y predecibles (como el registro de auditoría de arriba), pero una lógica difícil de ver puede complicar mucho la depuración de una aplicación, ya que un desarrollador que lea el código de la aplicación no necesariamente sabrá que también se está ejecutando un trigger.

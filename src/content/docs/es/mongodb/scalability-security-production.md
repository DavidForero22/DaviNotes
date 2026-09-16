---
title: "Escalabilidad, seguridad y producción en MongoDB"
---

# Escalabilidad, Seguridad y Producción

Llevar MongoDB de un proyecto en tu propio ordenador a una base de datos de la que depende gente real requiere algunas piezas más: mantener seguros varios cambios relacionados a la vez, sobrevivir a un fallo de hardware, controlar quién puede acceder a qué y una forma fiable de desplegar una aplicación y conectarla con ella. Esta sección cubre todo eso.

---

## Tabla de Contenidos

<div id="content-table">

- [3.1. Transacciones multi-documento](#31-transacciones-multi-documento "Agrupar varios cambios en una unidad segura")
- [3.2. Replica Sets y Sharding](#32-replica-sets-y-sharding "Alta disponibilidad y escalabilidad horizontal")
- [3.3. Seguridad: Autenticación, RBAC y cifrado](#33-seguridad-autenticación-rbac-y-cifrado "Controlar quién puede acceder a qué")
- [3.4. Despliegue en la nube con MongoDB Atlas](#34-despliegue-en-la-nube-con-mongodb-atlas "Hosting gestionado y copias de seguridad")
- [3.5. Integración con Node.js](#35-integración-con-nodejs "El driver oficial de Node.js y el ODM Mongoose")

</div>

---

## 3.1. Transacciones multi-documento

Como MongoDB se usa a menudo con documentos embebidos (sección 1.5), un único `updateOne` sobre un documento ya es **atómico** por defecto: o tiene éxito por completo, o falla por completo, sin estados intermedios, incluso sin hacer nada extra. Pero algunas operaciones todavía necesitan cambiar **varios documentos separados** juntos como una unidad de todo-o-nada, de la misma forma que una transferencia bancaria necesita que dos cuentas se actualicen juntas (ver la sección 2.3 de la guía de MySQL para la misma idea en SQL).

```js

    const session = client.startSession();

    try {
        session.startTransaction();

        await accounts.updateOne({ _id: 1 }, { $inc: { balance: -100 } }, { session });
        await accounts.updateOne({ _id: 2 }, { $inc: { balance: 100 } }, { session });

        await session.commitTransaction(); // Hace ambos cambios permanentes a la vez
    } catch (error) {
        await session.abortTransaction();  // Deshace ambos cambios si algo salió mal
    } finally {
        session.endSession();
    }


```

**Error común:** recurrir a una transacción multi-documento como solución por defecto para cualquier problema de diseño. Como un único documento ya se actualiza de forma atómica, un esquema que embebe bien los datos relacionados (sección 1.5) a menudo evita necesitar una transacción; las transacciones son la herramienta adecuada específicamente cuando el diseño requiere tocar más de un documento a la vez.

---

## 3.2. Replica Sets y Sharding

Un **replica set** es un grupo de servidores MongoDB que contienen todos los mismos datos: un nodo **primario** recibe todas las escrituras, y uno o más nodos **secundarios** copian continuamente esos cambios, listos para tomar el relevo automáticamente si el primario falla; este ascenso automático se llama **failover**, y normalmente tarda solo unos segundos.

```js

    // Al conectar una aplicación a un replica set se listan todos los miembros, así el driver
    // puede encontrar cuál es el primario actual y reconectar automáticamente tras un failover
    mongodb://host1:27017,host2:27017,host3:27017/?replicaSet=miReplicaSet


```

El **sharding** resuelve un problema distinto: una vez que un conjunto de datos crece demasiado (o recibe demasiado tráfico) como para que lo maneje cómodamente un único servidor, el sharding divide los propios datos entre varios servidores, llamados **shards**, según un campo elegido (la **clave de sharding**). Cada shard contiene solo una parte del total de datos, así que la base de datos en conjunto puede manejar mucho más volumen y tráfico del que soportaría una sola máquina.

| | Replica Set | Sharding |
| :--- | :--- | :--- |
| **Resuelve** | Sobrevivir al fallo de un único servidor | Manejar más datos o tráfico del que un servidor puede contener |
| **Cada nodo tiene** | Una copia completa de todos los datos | Solo una parte de los datos |
| **Se usa normalmente** | Casi siempre, incluso en despliegues pequeños | Solo cuando la capacidad de un único servidor se convierte en un cuello de botella real |

**Error común:** configurar sharding antes de que realmente haga falta. El sharding añade una complejidad operativa real (elegir una buena clave de sharding es una decisión genuinamente difícil y complicada de deshacer), y un único servidor con buenos recursos o un simple replica set atienden cómodamente a la gran mayoría de aplicaciones sin necesitarlo.

---

## 3.3. Seguridad: Autenticación, RBAC y cifrado

Por defecto, durante la configuración inicial, MongoDB puede permitir conexiones locales sin ningún usuario ni contraseña; está bien para un experimento local rápido, pero nunca es aceptable en cuanto entran en juego datos reales o una conexión de red. La **autenticación** exige que cada conexión demuestre su identidad con un usuario y una contraseña antes de poder hacer nada.

```js

    // Crear un usuario de aplicación con un rol específico y limitado
    db.createUser({
        user: "usuario_app",
        pwd: "una-contraseña-fuerte",
        roles: [{ role: "readWrite", db: "libreria" }],
    });


```

El **Control de Acceso Basado en Roles (RBAC)** es el mismo principio visto para MySQL en la sección 3.2 de su guía: cada usuario debería tener concedidos solo los roles que realmente necesita. MongoDB incluye varios **roles predefinidos** que cubren necesidades habituales, y se pueden definir roles personalizados para cualquier cosa más específica.

| Rol predefinido | Concede |
| :--- | :--- |
| `read` | Acceso de solo lectura a una base de datos |
| `readWrite` | Acceso de lectura y escritura a una base de datos |
| `dbAdmin` | Tareas administrativas (índices, validación de esquemas) pero no lectura/escritura de datos |
| `root` | Acceso completo a todo lo que hay en el servidor |

El **cifrado** protege los datos en dos situaciones distintas: el **cifrado en tránsito** (TLS/SSL) codifica los datos mientras viajan por la red entre la aplicación y la base de datos, protegiéndolos por si son interceptados; el **cifrado en reposo** codifica los propios archivos de datos guardados en disco, protegiéndolos por si el almacenamiento físico llega a ser robado o accedido sin autorización.

**Error común:** dejar una base de datos accesible desde internet con la autenticación desactivada o usando credenciales por defecto, aunque sea "temporalmente" durante el desarrollo. Herramientas automatizadas de escaneo buscan activamente por internet este tipo de bases de datos expuestas y sin proteger, las 24 horas del día.

---

## 3.4. Despliegue en la nube con MongoDB Atlas

**MongoDB Atlas** es la versión oficial de MongoDB gestionada en la nube: en lugar de instalar y mantener tú mismo `mongod` en un servidor, Atlas lo ejecuta por ti, y además automatiza los replica sets, las copias de seguridad, el monitoreo y los parches de seguridad.

<ol>
  <li>
    Crea una cuenta gratuita en
    <a href="https://www.mongodb.com/cloud/atlas/register"
       class="doc-link"
       target="_blank"
       rel="noopener noreferrer"
       title="Registro en MongoDB Atlas">
       MongoDB Atlas
    </a>
    y crea un clúster nuevo del nivel gratuito.
  </li>
  <li>
    En <strong>Network Access</strong>, permite conexiones desde tu dirección IP actual (o, solo durante el desarrollo inicial, temporalmente desde cualquier lugar).
  </li>
  <li>
    En <strong>Database Access</strong>, crea un usuario de base de datos con una contraseña fuerte y generada automáticamente.
  </li>
  <li>
    Haz clic en <strong>"Connect"</strong> en tu clúster para obtener una cadena de conexión lista para usar con mongosh, Compass o el driver de Node.js de una aplicación.
  </li>
</ol>

Atlas hace copias de seguridad automáticas y continuas (llamadas **continuous cloud backups**) y permite restaurar un clúster a casi cualquier punto específico en el tiempo, lo que elimina la necesidad de ejecutar `mongodump` (el equivalente de MongoDB a `mysqldump` de MySQL) a mano según un calendario.

**Error común:** dejar Network Access abierto a cualquier dirección IP (`0.0.0.0/0`) en un despliegue de producción real. Este ajuste está pensado únicamente para el desarrollo local rápido y siempre debería restringirse a direcciones IP concretas y conocidas (o a una conexión de red privada) antes de que entren en juego datos reales y valiosos.

---

## 3.5. Integración con Node.js

Una aplicación de Node.js puede comunicarse con MongoDB de dos formas principales: el **driver oficial de Node.js**, que envía comandos de forma muy parecida a mongosh, o **Mongoose**, un **ODM** (Object-Document Mapper) que añade esquemas, validación y una forma más estructurada de trabajar encima del driver.

```js

    // Usando el driver oficial directamente
    const { MongoClient } = require("mongodb");

    const client = new MongoClient("mongodb://localhost:27017");
    await client.connect();

    const books = client.db("libreria").collection("books");
    const results = await books.find({ genre: "sci-fi" }).toArray();


```

```js

    // Usando Mongoose: define un esquema una vez, y luego se trabaja con él como con una clase normal
    const mongoose = require("mongoose");
    await mongoose.connect("mongodb://localhost:27017/libreria");

    const bookSchema = new mongoose.Schema({
        title: String,
        price: { type: Number, min: 0 },
    });
    const Book = mongoose.model("Book", bookSchema);

    const results = await Book.find({ genre: "sci-fi" });


```

| | Driver oficial | Mongoose (ODM) |
| :--- | :--- | :--- |
| **Estilo** | Cercano a los comandos nativos de MongoDB | Basado en esquemas, más estructurado |
| **Validación** | Manual, o mediante JSON Schema a nivel de base de datos (sección 2.4) | Integrada en la propia definición del esquema |
| **Ideal para** | Control detallado, mínima sobrecarga | Aplicaciones grandes que se benefician de una estructura forzada |

**Error común:** crear una conexión `MongoClient` nueva para cada petición entrante en lugar de crear una al arrancar la aplicación y reutilizarla en cada petición posterior. El driver ya gestiona un pool de conexiones interno de forma eficiente por sí mismo; reconectarse repetidamente añade retraso y carga innecesarios a la base de datos sin ningún beneficio.

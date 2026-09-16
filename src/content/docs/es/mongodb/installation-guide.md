---
title: "Guía de instalación de MongoDB"
---

# Guía de instalación de MongoDB

**MongoDB** es un **servidor de bases de datos**, igual que MySQL: un programa que se ejecuta en segundo plano y se encarga de almacenar y recuperar tus datos de forma fiable. La diferencia está en *cómo* almacena esos datos: en lugar de filas y columnas, MongoDB guarda registros flexibles, parecidos a JSON, llamados **documentos**, que se explican en detalle en la siguiente guía.

Instalar MongoDB te da el propio servidor de base de datos (`mongod`) más **mongosh**, el cliente de línea de comandos que usas para comunicarte con él.

---

## 1. Windows

<ol>
  <li>
    Ve a la
    <a href="https://www.mongodb.com/try/download/community"
       class="doc-link"
       target="_blank"
       rel="noopener noreferrer"
       title="Descarga de MongoDB Community Server">
       página de descarga de MongoDB Community Server
    </a>
    y descarga el instalador <code>.msi</code> para Windows.
  </li>
  <li>
    Ejecuta el instalador y elige la instalación <strong>"Complete"</strong>. Mantén activada la opción de instalar MongoDB como <strong>Servicio de Windows</strong>, así el servidor de base de datos se inicia automáticamente en segundo plano cada vez que enciendes el ordenador.
  </li>
  <li>
    Cuando se te indique, instala también <strong>MongoDB Compass</strong>, la herramienta gráfica oficial (se explica en la sección 4).
  </li>
</ol>

### Verificar la instalación

Abre una **nueva** ventana de Símbolo del sistema o PowerShell y escribe:

```bash

    mongod --version


```

Deberías ver un número de versión, por ejemplo `db version v7.0.5`.

---

## 2. macOS

<ol>
  <li>
    Si usas <a href="https://brew.sh/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Homebrew">Homebrew</a> (una herramienta para instalar software desde la terminal), ejecuta los siguientes comandos.
  </li>
</ol>

```bash

    brew tap mongodb/brew
    brew install mongodb-community
    brew services start mongodb-community   # Inicia el servidor de base de datos y lo mantiene en marcha


```

### Verificar la instalación

```bash

    mongod --version


```

---

## 3. Linux (Ubuntu/Debian)

Instalar MongoDB en Linux requiere primero añadir el repositorio oficial de paquetes de MongoDB, ya que la mayoría de distribuciones no lo incluyen por defecto:

```bash

    # Importa la clave GPG pública de MongoDB y añade su repositorio de paquetes (los comandos varían un poco según la versión; consulta la documentación oficial)
    curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

    sudo apt update
    sudo apt install mongodb-org

    sudo systemctl start mongod       # Inicia el servidor de base de datos
    sudo systemctl enable mongod      # Hace que se inicie automáticamente en cada arranque


```

### Verificar la instalación

```bash

    mongod --version


```

---

## 4. Conectarse por primera vez

Una vez que el servidor está en marcha, conéctate a través de **mongosh** ("Mongo Shell"), el cliente de línea de comandos de MongoDB:

```bash

    mongosh


```

El prompt cambia a `test>`, lo que significa que ya estás "dentro" de MongoDB y puedes escribir comandos directamente. Escribe `exit` para salir.

```bash

    test> show dbs         // Lista todas las bases de datos que hay actualmente en el servidor
    test> exit


```

**Error común:** esperar que un punto y coma `;` sea obligatorio al final de cada comando, como ocurre en MySQL. Los comandos de mongosh son JavaScript puro, así que el punto y coma es opcional y un comando se ejecuta en cuanto pulsas Enter.

---

## 5. Opcional: MongoDB Compass

Escribir cada comando no es la única forma de trabajar con MongoDB. **MongoDB Compass** es la herramienta gráfica oficial: te permite explorar documentos, construir consultas haciendo clic en un constructor visual y ver estadísticas de rendimiento, sin escribir ni un solo comando. Se conecta exactamente al mismo servidor que mongosh: son solo dos formas distintas de comunicarse con él.

*La sección 1.1 de la siguiente guía explica qué es realmente un documento y cómo se compara con una tabla de base de datos tradicional.*

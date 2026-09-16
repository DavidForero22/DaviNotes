---
title: "Guía de instalación de MySQL"
---

# Guía de instalación de MySQL

**MySQL** es un **servidor de bases de datos**: un programa que se ejecuta en segundo plano en tu ordenador (o en un servidor remoto) y se encarga de almacenar, organizar y recuperar datos, igual que un archivador guarda papeles, salvo que una base de datos puede buscar entre millones de registros en una fracción de segundo.

A diferencia de una aplicación normal que abres haciendo clic en un icono, un servidor de bases de datos no tiene ventana propia. Interactúas con él a través de un programa aparte llamado **cliente**, ya sea de línea de comandos o gráfico, que le envía instrucciones y te muestra los resultados.

---

## 1. Windows

<ol>
  <li>
    Ve a la
    <a href="https://dev.mysql.com/downloads/installer/"
       class="doc-link"
       target="_blank"
       rel="noopener noreferrer"
       title="Instalador oficial de MySQL">
       página oficial del instalador de MySQL
    </a>
    y descarga <strong>MySQL Installer for Windows</strong> (elige la versión "web", más pequeña, salvo que vayas a estar sin conexión durante la instalación).
  </li>
  <li>
    Ejecuta el instalador y elige el tipo de instalación <strong>"Developer Default"</strong>, que instala el servidor de base de datos junto con algunas herramientas útiles.
  </li>
  <li>
    Cuando se te pida, define una <strong>contraseña de root</strong>. La cuenta "root" es la cuenta de administrador de la base de datos: anota esta contraseña en un lugar seguro, la necesitarás cada vez que te conectes.
  </li>
  <li>
    Mantén activada la opción de ejecutar MySQL como <strong>Servicio de Windows</strong>, así el servidor de base de datos se inicia automáticamente cada vez que enciendes el ordenador.
  </li>
</ol>

### Verificar la instalación

Abre una **nueva** ventana de Símbolo del sistema o PowerShell y escribe:

```bash

    mysql --version


```

Deberías ver un número de versión, por ejemplo `mysql  Ver 8.0.36`.

---

## 2. macOS

<ol>
  <li>
    Ve a la <a href="https://dev.mysql.com/downloads/mysql/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Descargas oficiales de MySQL Community">página oficial de descargas de MySQL</a> y descarga el instalador <code>.dmg</code> para macOS.
  </li>
  <li>
    Como alternativa, si usas <a href="https://brew.sh/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Homebrew">Homebrew</a> (una herramienta para instalar software desde la terminal), puedes ejecutar el siguiente comando en su lugar.
  </li>
</ol>

```bash

    brew install mysql
    brew services start mysql   # Inicia el servidor de base de datos y lo mantiene en marcha


```

### Verificar la instalación

```bash

    mysql --version


```

---

## 3. Linux (Ubuntu/Debian)

```bash

    sudo apt update
    sudo apt install mysql-server
    sudo mysql_secure_installation   # Asistente guiado para definir la contraseña de root y quitar configuraciones inseguras por defecto


```

`mysql_secure_installation` hace una breve serie de preguntas de sí/no: responder "sí" a todas es la opción segura para un entorno personal o de aprendizaje.

### Verificar la instalación

```bash

    mysql --version


```

---

## 4. Conectarse por primera vez

Una vez instalado, conéctate al servidor a través del cliente de línea de comandos, indicando el usuario administrador (`-u root`) y pidiendo que te solicite la contraseña (`-p`):

```bash

    mysql -u root -p


```

Después de escribir tu contraseña, el prompt cambia a `mysql>`, lo que significa que ya estás "dentro" de MySQL y puedes escribir comandos directamente. Escribe `exit` para salir.

```bash

    mysql> SHOW DATABASES;   -- Lista todas las bases de datos que hay actualmente en el servidor
    mysql> exit


```

**Error común:** olvidar el punto y coma `;` al final de un comando. MySQL considera que cualquier comando está incompleto hasta que lo ve, así que si falta, la terminal se queda esperando en silencio en vez de mostrar un error.

---

## 5. Opcional: Clientes gráficos

Escribir cada comando no es la única forma de trabajar con MySQL. **MySQL Workbench** (incluido en el instalador de Windows, o descargable aparte para macOS/Linux) ofrece una interfaz visual para explorar tablas, construir consultas haciendo clic y diseñar diagramas de bases de datos. Otras opciones populares son <a href="https://tableplus.com/" class="doc-link" target="_blank" rel="noopener noreferrer" title="TablePlus">TablePlus</a> y <a href="https://dbeaver.io/" class="doc-link" target="_blank" rel="noopener noreferrer" title="DBeaver">DBeaver</a>. Ninguna de estas herramientas sustituye al servidor de MySQL en sí: son solo formas más amigables de comunicarse con él.

*La sección 1.1 de la siguiente guía explica qué hace exactamente un servidor de base de datos y cómo está organizado internamente.*

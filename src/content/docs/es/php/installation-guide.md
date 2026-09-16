---
title: "Guía de instalación de PHP"
---

# Guía de instalación de PHP

Para ejecutar código PHP necesitas el **intérprete de PHP**: el programa que lee tus archivos `.php` y los ejecuta. Te recomendamos instalar una versión estable reciente (PHP 8.3 o posterior).

Varios pasos usan la **terminal** (también llamada *línea de comandos*, *Símbolo del sistema* o *PowerShell* en Windows): una ventana en la que escribes órdenes en lugar de hacer clic en botones.

---

## 1. Descarga e instalación

**Windows**

<ol>
  <li>
    Descarga <strong>XAMPP</strong> (la opción más sencilla) desde la 
    <a href="https://www.apachefriends.org/" 
       class="doc-link" 
       target="_blank" 
       rel="noopener noreferrer"
       title="Descargar XAMPP desde Apache Friends">
       web de Apache Friends
    </a>. XAMPP es un paquete gratuito que instala PHP junto con un servidor web (Apache) y una base de datos (MariaDB).
  </li>
  <li>
    Ejecuta el archivo <code>.exe</code> descargado. Durante la instalación puedes desmarcar los componentes que no necesites, como «FileZilla» o «Tomcat», para que ocupe menos.
  </li>
  <li>
    <strong>Importante:</strong> para usar la orden <code>php</code> en la terminal, añade la carpeta de PHP (normalmente <code>C:\xampp\php</code>) al <strong>PATH</strong> de Windows: la lista de carpetas en las que Windows busca programas. Busca «Editar las variables de entorno del sistema» en el menú Inicio → <em>Variables de entorno</em> → selecciona <em>Path</em> → <em>Editar</em> → <em>Nuevo</em>, y pega la carpeta.
  </li>
</ol>

**macOS (con Homebrew)**

Si tienes <a href="https://brew.sh/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Homebrew">Homebrew</a> (una herramienta para instalar programas desde la terminal), abre la terminal y ejecuta:

```bash

    brew install php


```

**Linux (Debian/Ubuntu)**

Abre la terminal y usa `apt` (el instalador de paquetes de Ubuntu) para instalar PHP. `sudo` ejecuta la orden con permisos de administrador, así que te pedirá tu contraseña:

```bash

    sudo apt update
    sudo apt install php


```

---

## 2. Comprobar la instalación

Una vez instalado, **abre una terminal nueva** (las que ya estaban abiertas no ven el cambio) y ejecuta:

```bash

    php -v


```

Deberías ver algo parecido a esto (los números dependen de tu versión):

```bash

    PHP 8.3.14 (cli) (built: Nov 19 2024 15:14:02) (NTS)
    Copyright (c) The PHP Group
    Zend Engine v4.3.14, Copyright (c) Zend Technologies


```

---

## 3. Tu primer programa

Crea un archivo llamado `hello.php` y pega el siguiente código:

```php

    <?php
        echo "¡Hola, PHP!";
    ?>


```

Puedes ejecutarlo directamente en la terminal, desde la misma carpeta que el archivo:

```bash

    php hello.php

    # Resultado:
    # ¡Hola, PHP!


```

Para verlo en el navegador como una página web, arranca en esa carpeta el servidor de desarrollo que incluye PHP:

```bash

    php -S localhost:8000


```

Después abre `http://localhost:8000/hello.php` en el navegador. Pulsa `Ctrl+C` en la terminal para detener el servidor.

**Error habitual:** abrir un archivo `.php` haciendo doble clic. El navegador no sabe ejecutar PHP por sí solo, así que muestra el código como texto o descarga el archivo. Los archivos PHP siempre deben abrirse a través de un servidor.

```bash

    # ❌ INCORRECTO: el navegador abre el archivo directamente y no ejecuta el código PHP
    file:///C:/proyectos/hello.php

    # ✅ CORRECTO: el servidor ejecuta el código PHP y envía la página resultante
    http://localhost:8000/hello.php


```

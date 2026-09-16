---
title: "Guía de instalación de Python"
---

# Guía de instalación de Python

Python es un lenguaje de programación potente, conocido por su sencillez y legibilidad. Tanto si te interesa el desarrollo web como la ciencia de datos o automatizar tareas repetitivas, Python es una herramienta imprescindible.

Para ejecutar programas en Python, tu ordenador necesita el **intérprete de Python**: el programa que lee tu código y lo ejecuta. Sigue los pasos para tu sistema operativo.

Varios pasos usan la **terminal** (llamada *Símbolo del sistema* o *PowerShell* en Windows y *Terminal* en macOS y Linux): una ventana en la que escribes órdenes en lugar de hacer clic en botones.

---

## 1. Windows

La forma más sencilla de instalar Python en Windows es con el instalador oficial.

<ol>
  <li>
    Entra en la 
    <a href="https://www.python.org/downloads/" 
       class="doc-link" 
       target="_blank" 
       rel="noopener noreferrer"
       title="Web oficial de Python">
       web oficial de Python
    </a>.
  </li>
  <li>
    Haz clic en el botón <strong>Download Python 3.x.x</strong> (la última versión).
  </li>
  <li>
    Abre el archivo descargado.
  </li>
  <li>
    <strong>IMPORTANTE:</strong> Antes de pulsar «Install Now», marca la casilla que dice:
    <blockquote>
      <strong>Add python.exe to PATH</strong>
    </blockquote>
    <em>El PATH es la lista de carpetas en las que Windows busca programas. Si te saltas este paso, la terminal no encontrará Python.</em>
  </li>
  <li>
    Pulsa <strong>Install Now</strong> y espera a que termine el proceso.
  </li>
</ol>

### Comprobar la instalación

Abre una ventana **nueva** del Símbolo del sistema o de PowerShell y escribe:

```bash

    python --version


```

Deberías ver la versión instalada, por ejemplo `Python 3.13.1`.

---

## 2. macOS

macOS puede incluir una versión antigua de Python que usa el propio sistema. Es mejor instalar la última versión por separado para no interferir con esas herramientas del sistema.

<ol>
  <li>
    Visita la
    <a href="https://www.python.org/downloads/macos/" 
       class="doc-link" 
       target="_blank" 
       rel="noopener noreferrer"
       title="Descargas de Python para macOS">
       página de descargas de Python para macOS
    </a>.
  </li>
  <li>
    Descarga el <strong>macOS 64-bit universal2 installer</strong> de la última versión.
  </li>
  <li>
    Abre el archivo <code>.pkg</code> descargado y sigue el asistente de instalación.
  </li>
</ol>

También puedes usar <a href="https://brew.sh/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Homebrew">Homebrew</a> (una herramienta para instalar programas desde la terminal), si lo tienes:

```bash

    brew install python


```

### Comprobar la instalación

En macOS normalmente hay que escribir `python3` en lugar de `python`:

```bash

    python3 --version


```

---

## 3. Linux (Ubuntu/Debian)

La mayoría de distribuciones de Linux ya traen Python instalado. Aun así, puedes usar la terminal para asegurarte de tenerlo, junto con `pip` (la herramienta que descarga paquetes adicionales de Python).

Actualiza la lista de paquetes disponibles e instala Python. `sudo` ejecuta la orden con permisos de administrador, así que te pedirá tu contraseña:

```bash

    sudo apt update
    sudo apt install python3 python3-pip


```

### Comprobar la instalación

```bash

    python3 --version


```

---

## 4. Ejecutar tu primer programa

Crea un archivo llamado `hello.py` con este contenido:

```python

    print("¡Hola, Python!")


```

Abre la terminal en la misma carpeta y ejecútalo (usa `python` en Windows y `python3` en macOS y Linux):

```bash

    python hello.py

    # Resultado:
    # ¡Hola, Python!


```

**Error habitual:** escribir órdenes de la terminal dentro del modo interactivo de Python. Si escribes solo `python`, aparece el indicador `>>>`: es Python esperando código Python, no órdenes de la terminal. Escribe `exit()` para salir.

```bash

    # ❌ INCORRECTO: ejecutar una orden de la terminal dentro del indicador >>>
    >>> python hello.py
    SyntaxError: invalid syntax

    # ✅ CORRECTO: primero se sale de Python y la orden se ejecuta en la terminal normal
    >>> exit()
    python hello.py


```

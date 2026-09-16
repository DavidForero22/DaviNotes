---
title: "Guía de instalación de Git"
---

# Guía de instalación de Git

Git es el **sistema de control de versiones** en el que se apoya casi cualquier proyecto profesional: registra el historial de tus archivos y te permite volver a cualquier estado anterior. A diferencia de una aplicación normal, Git funciona principalmente desde la **terminal** (llamada *Símbolo del sistema* o *PowerShell* en Windows y *Terminal* en macOS y Linux), aunque existen programas gráficos (llamados **clientes GUI**) que permiten hacer lo mismo a base de clics en lugar de escribir comandos.

A lo largo de esta serie de guías verás tanto los **comandos** de terminal como su equivalente en **GUI**, así que elige el que mejor se adapte a tu forma de trabajar.

---

## 1. Windows

<ol>
  <li>
    Entra en el
    <a href="https://git-scm.com/downloads"
       class="doc-link"
       target="_blank"
       rel="noopener noreferrer"
       title="Sitio oficial de Git">
       sitio oficial de Git
    </a>
    y descarga el instalador para Windows.
  </li>
  <li>
    Ejecuta el archivo descargado. Las opciones por defecto funcionan bien para empezar; las únicas pantallas a las que vale la pena prestar atención son la del editor de texto predeterminado y la que pregunta cómo gestionar los finales de línea (puedes dejar la opción recomendada sin problema).
  </li>
  <li>
    El instalador también añade <strong>Git Bash</strong>, una terminal que entiende comandos al estilo Unix y que se usa habitualmente para trabajar con Git en Windows.
  </li>
</ol>

### Verificar la instalación

Abre una **nueva** ventana de Símbolo del sistema, PowerShell o Git Bash y escribe:

```bash

    git --version


```

Deberías ver la versión instalada, por ejemplo `git version 2.46.0.windows.1`.

---

## 2. macOS

<ol>
  <li>
    Abre la aplicación <strong>Terminal</strong> y escribe <code>git --version</code>.
  </li>
  <li>
    Si Git aún no está instalado, macOS te ofrecerá instalar las <strong>Herramientas de línea de comandos de Xcode</strong>, que lo incluyen. Acepta y espera a que termine la descarga.
  </li>
</ol>

Alternativamente, si usas <a href="https://brew.sh/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Homebrew">Homebrew</a> (una herramienta para instalar software desde la terminal), puedes ejecutar:

```bash

    brew install git


```

### Verificar la instalación

```bash

    git --version


```

---

## 3. Linux (Ubuntu/Debian)

Actualiza la lista de paquetes disponibles e instala Git. `sudo` ejecuta el comando con permisos de administrador, así que te pedirá tu contraseña:

```bash

    sudo apt update
    sudo apt install git


```

### Verificar la instalación

```bash

    git --version


```

---

## 4. Configuración inicial

Antes de hacer tu primer commit, Git necesita saber quién eres, para que cada cambio quede firmado con tu nombre y correo. Solo tienes que hacer esto una vez por máquina:

```bash

    git config --global user.name "Tu Nombre"
    git config --global user.email "tucorreo@ejemplo.com"


```

*La sección 1.2 de la siguiente guía trata esta configuración con más detalle.*

**Error común:** saltarse este paso y no darse cuenta hasta haber hecho varios commits. Si lo olvidas, Git puede negarse a confirmar el commit y mostrar un aviso, o usar un nombre de autor genérico que tendrás que corregir más tarde.

---

## 5. Opcional: clientes gráficos

La terminal no es la única forma de usar Git. Si prefieres un flujo de trabajo visual, puedes instalar un **cliente GUI** como <a href="https://desktop.github.com/" class="doc-link" target="_blank" rel="noopener noreferrer" title="GitHub Desktop">GitHub Desktop</a>, <a href="https://www.gitkraken.com/" class="doc-link" target="_blank" rel="noopener noreferrer" title="GitKraken">GitKraken</a> o <a href="https://www.sourcetreeapp.com/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Sourcetree">Sourcetree</a>. La mayoría de editores de código (VS Code, IDEs de JetBrains, etc.) también incluyen integración con Git. Ninguna de estas herramientas sustituye a Git en sí: siguen necesitando el comando `git` instalado en tu máquina para funcionar.

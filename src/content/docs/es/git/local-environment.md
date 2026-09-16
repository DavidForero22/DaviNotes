---
title: "Fundamentos de Git y entorno local"
---

# Fundamentos y Entorno Local

Antes de colaborar con nadie más, vale la pena entender la mentalidad de Git y dominar el flujo básico de trabajo por completo en tu propia máquina. Esta sección cubre el modelo mental detrás de Git y los comandos diarios que usarás constantemente, ya sea desde la terminal o desde un cliente gráfico.

---

## Tabla de Contenidos

<div id="content-table">

- [1.1. Conceptos Fundamentales](#11-conceptos-fundamentales "Qué es un VCS distribuido y los 3 estados de Git")
- [1.2. Configuración Inicial](#12-configuración-inicial "Define tu identidad para cada commit")
- [1.3. Creación e Inicialización de Proyectos](#13-creación-e-inicialización-de-proyectos "git init y git clone")
- [1.4. El Ciclo de Vida del Trabajo Diario](#14-el-ciclo-de-vida-del-trabajo-diario "status, add, commit y log")

</div>

---

## 1.1. Conceptos Fundamentales

### ¿Qué es un sistema de control de versiones distribuido?

Un **sistema de control de versiones (VCS)** guarda un historial de cada cambio realizado en un conjunto de archivos, para que puedas revisar quién cambió qué, comparar versiones y volver atrás si algo se rompe. Git es un VCS **distribuido**: cada desarrollador tiene una copia completa del historial del proyecto en su propio ordenador, no solo los archivos.

| | VCS Centralizado | VCS Distribuido (Git) |
| :--- | :--- | :--- |
| **¿Dónde está el historial?** | Solo en un servidor central. | Una copia completa en la máquina de cada desarrollador. |
| **Trabajo sin conexión** | Limitado: la mayoría de acciones necesitan el servidor. | Puedes hacer commits, crear ramas y revisar el historial sin conexión. |
| **Punto único de fallo** | Sí, si el servidor cae. | No, cualquier copia puede restaurar el proyecto. |

### Los 3 estados de Git

Cada archivo de un proyecto Git pasa por tres áreas. Entender este flujo es la clave para entender casi cualquier comando de Git:

| Estado | Descripción |
| :--- | :--- |
| **Working Directory** (Directorio de trabajo) | Los archivos reales en el disco, donde editas el código. Los cambios aquí todavía no los rastrea Git. |
| **Staging Area (Index)** (Área de preparación) | Una "sala de espera" para los cambios que has marcado con `git add`, listos para incluirse en el próximo commit. |
| **Repository (HEAD)** (Repositorio) | El historial permanente: al ejecutar `git commit`, los cambios preparados quedan guardados aquí como una nueva instantánea. |

```bash

    Directorio de Trabajo  --( git add )-->  Staging Area  --( git commit )-->  Repositorio


```

---

## 1.2. Configuración Inicial

Git firma cada commit con un nombre de autor y un correo, así que necesita saber quién eres antes de empezar a trabajar. Esta configuración se hace una sola vez por máquina (o por proyecto, si usas una identidad distinta para un repositorio en concreto):

```bash

    git config --global user.name "Tu Nombre"
    git config --global user.email "tucorreo@ejemplo.com"


```

`--global` aplica la configuración a todos los repositorios de tu máquina. Ejecutar los mismos comandos sin `--global` dentro de un proyecto concreto la sobrescribe solo para ese proyecto.

**GUI:** los clientes gráficos exponen la misma configuración en un menú general de **Ajustes** o **Preferencias**, normalmente bajo una sección "Git" o "Perfil", donde rellenas tu nombre y correo una sola vez.

**Error común:** hacer un commit antes de configurar tu identidad, o configurar un correo de trabajo de forma global y usarlo sin querer en proyectos personales. Consulta la configuración actual en cualquier momento con `git config --list`.

---

## 1.3. Creación e Inicialización de Proyectos

Hay dos formas de tener un proyecto Git en tu máquina: empezar uno nuevo, o copiar uno que ya existe.

```bash

    # Convertir la carpeta actual en un nuevo repositorio Git
    git init

    # Copiar un repositorio existente (con todo su historial) desde una URL
    git clone <url>


```

`git init` crea una carpeta oculta `.git` en el directorio actual: esa carpeta *es* el repositorio; borrarla elimina todo el historial de Git sin tocar tus archivos. `git clone` hace esto automáticamente y además descarga todos los commits del repositorio remoto.

**GUI:** los clientes muestran esto como un botón **"New Repository"** (equivalente a `git init`) y un botón **"Clone"** que pide una URL (equivalente a `git clone`).

---

## 1.4. El Ciclo de Vida del Trabajo Diario

Este es el bucle que repetirás constantemente: comprobar qué ha cambiado, elegir qué incluir y guardar una instantánea.

```bash

    git status           # Ver qué archivos han cambiado, preparados o no
    git add <archivo>    # Mover un cambio al Staging Area
    git commit -m "Mensaje que describe el cambio"
    git log --oneline    # Recorrer el historial del proyecto, una línea por commit


```

**GUI:** el panel de archivos lista los archivos modificados con una casilla (o acción de arrastrar) para prepararlos, un cuadro de texto debajo para el mensaje del commit y un botón **"Commit"**, además de una vista de árbol/historial equivalente a `git log`.

**Error común:** ejecutar `git commit` sin haber preparado nada antes (`git commit -m "..."` solo dará error o no confirmará nada nuevo si no hay cambios en el Staging Area), y escribir mensajes de commit vagos como `"fix"` o `"update"` que no dan ninguna información útil en el futuro.

---
title: "Ramificaciones y colaboración remota en Git"
---

# Ramificaciones y Colaboración Remota

Una vez que te sientes cómodo trabajando en solitario, el siguiente paso es aprender a trabajar en paralelo con características aisladas y sincronizar tus cambios con plataformas remotas como GitHub, GitLab o Bitbucket.

---

## Tabla de Contenidos

<div id="content-table">

- [2.1. Gestión de Ramas](#21-gestión-de-ramas "Por qué y cómo crear ramas")
- [2.2. Integración de Cambios (Merging)](#22-integración-de-cambios-merging "Fast-forward vs. three-way merge")
- [2.3. Resolución de Conflictos](#23-resolución-de-conflictos "Entender y corregir conflictos de merge")
- [2.4. Sincronización Remota](#24-sincronización-remota "fetch, pull y push")

</div>

---

## 2.1. Gestión de Ramas (Branching)

Una **rama** es una línea de desarrollo independiente: te permite trabajar en una nueva característica o corrección sin tocar el código estable del que depende el resto del equipo. Por debajo, una rama no es más que un puntero móvil a un commit concreto, por eso crear una en Git es instantáneo y no cuesta nada.

Una estrategia de nombres habitual antepone el tipo de trabajo a la rama, por ejemplo `feature/login-form`, `fix/navbar-overflow` o `docs/readme-update`, para que cualquiera sepa de un vistazo para qué sirve esa rama.

```bash

    git branch                   # Listar las ramas locales
    git branch nueva-funcion      # Crear una rama (te quedas en la actual)
    git checkout -b nueva-funcion # Crear la rama Y cambiarte a ella
    git switch -c nueva-funcion   # Lo mismo que arriba, usando el comando "switch" más reciente


```

**GUI:** un menú desplegable de ramas (normalmente en la barra superior) lista las ramas existentes y permite cambiar entre ellas, además de una opción **"New Branch"** que crea una de forma visual a partir de la rama en la que estás.

---

## 2.2. Integración de Cambios (Merging)

Un **merge** incorpora los cambios de una rama en otra. Git lo resuelve de dos formas posibles:

| Tipo | Cuándo ocurre | Cómo se ve |
| :--- | :--- | :--- |
| **Fast-forward** | La rama de destino no tiene commits nuevos desde que se creó la otra rama. | Git simplemente mueve el puntero de la rama hacia delante: no se crea ningún commit nuevo. |
| **Three-way merge** | Ambas ramas tienen commits nuevos desde que se separaron. | Git crea un nuevo **commit de merge** que combina ambos historiales, usando las dos puntas de rama más su ancestro común. |

```bash

    git checkout main     # Ir a la rama que va a recibir los cambios
    git merge nueva-funcion # Traer los cambios de "nueva-funcion" a "main"


```

**GUI:** una opción como **"Merge branch into current"**, que se activa arrastrando una rama sobre otra en el gráfico, o haciendo clic derecho sobre una rama y seleccionándola desde el árbol.

---

## 2.3. Resolución de Conflictos

Un **conflicto** ocurre cuando Git no puede decidir automáticamente cómo combinar dos cambios, normalmente porque ambas ramas modificaron las mismas líneas del mismo archivo. Git pausa el merge y marca el archivo con marcadores de conflicto para que los resuelvas a mano:

```bash

    <<<<<<< HEAD
    Esta es la versión de tu rama actual.
    =======
    Esta es la versión de la rama que se está fusionando.
    >>>>>>> nueva-funcion


```

Todo lo que hay entre `<<<<<<< HEAD` y `=======` es la versión de tu rama actual; todo lo que hay entre `=======` y `>>>>>>> nueva-funcion` es la versión entrante. Edita el archivo para dejar el contenido que quieras (eliminando también los marcadores), y luego prepáralo para indicarle a Git que el conflicto está resuelto:

```bash

    git add <archivo>
    git commit


```

**GUI:** los clientes ofrecen una **herramienta visual de resolución lado a lado (side-by-side diff / merge tool)** que muestra ambas versiones una junto a la otra con botones para aceptar un lado, el otro, o ambos, en lugar de editar los marcadores a mano.

**Error común:** confirmar un archivo que todavía contiene los marcadores `<<<<<<<`, `=======` o `>>>>>>>` porque se pasaron por alto al resolver el conflicto; busca siempre estos símbolos en el archivo antes de hacer commit.

---

## 2.4. Sincronización Remota

Un **remoto** es una versión de tu repositorio alojada en otro sitio (como GitHub). Conectarte a uno te permite intercambiar commits con tu equipo.

```bash

    git remote add origin <url>  # Enlazar un remoto llamado "origin" a este repositorio
    git fetch                     # Descargar los commits nuevos del remoto, sin fusionarlos
    git pull                      # Descargar Y fusionar los commits nuevos en tu rama actual
    git push                      # Subir tus commits locales al remoto


```

`git fetch` es la forma segura de ver qué ha cambiado en el remoto antes de decidir qué hacer con ello; `git pull` es, en esencia, un `git fetch` seguido de un `git merge`.

**GUI:** botones directos de **Fetch**, **Pull** y **Push**, normalmente acompañados de indicadores que muestran cuántos commits vas por delante o por detrás del remoto.

**Error común:** ejecutar `git pull` en una rama con cambios locales sin preparar, lo que provoca conflictos evitables; primero haz commit o guarda tu trabajo con `stash` (ver la sección 3.1). Evita también forzar el push (`git push --force`) a una rama en la que trabaja más gente, ya que puede sobrescribir sus commits.

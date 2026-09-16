---
title: "Control avanzado y corrección de errores en Git"
---

# Control Avanzado y Corrección de Errores

A todo el mundo se le escapa algún error. Esta sección te da las herramientas para solucionar problemas comunes, volver atrás en el tiempo de forma segura y mantener un historial limpio y legible.

---

## Tabla de Contenidos

<div id="content-table">

- [3.1. Trabajo Temporal y Descarte de Cambios](#31-trabajo-temporal-y-descarte-de-cambios "restore y stash")
- [3.2. Reescribir el Historial y Corregir Errores](#32-reescribir-el-historial-y-corregir-errores "amend, reset y revert")
- [3.3. Reorganización Avanzada (Rebase & Cherry-pick)](#33-reorganización-avanzada-rebase--cherry-pick "Cuándo hacer rebase y cómo usar cherry-pick")

</div>

---

## 3.1. Trabajo Temporal y Descarte de Cambios

A veces quieres descartar cambios que aún no has confirmado, o apartarlos sin llegar a hacer un commit.

```bash

    git restore <archivo>  # Descartar cambios sin confirmar en un archivo, volviendo al último commit

    git stash                # Guardar temporalmente todos los cambios sin confirmar y limpiar el directorio de trabajo
    git stash pop             # Recuperar los últimos cambios guardados con stash


```

`git stash` es útil cuando necesitas cambiar de rama rápidamente pero todavía no estás listo para confirmar tu trabajo actual, por ejemplo, para arreglar un bug urgente en otra rama.

**GUI:** una opción de clic derecho **"Discard changes"** sobre un archivo modificado (equivalente a `git restore`), y un panel dedicado de **Stashes** que lista todo lo que has guardado para más tarde.

---

## 3.2. Reescribir el Historial y Corregir Errores

| Comando | Qué hace | ¿Seguro en commits compartidos/subidos? |
| :--- | :--- | :--- |
| `git commit --amend` | Sustituye el último commit por uno nuevo (nuevo mensaje y/o nuevos cambios preparados). | Solo si nadie más lo ha descargado todavía. |
| `git reset --soft <commit>` | Mueve la rama hacia atrás hasta `<commit>`, dejando todos los cambios en el Staging Area. | No: reescribe el historial. |
| `git reset --hard <commit>` | Mueve la rama hacia atrás hasta `<commit>` y **descarta** todos los cambios posteriores. | No: reescribe el historial y pierdes trabajo. |
| `git revert <commit>` | Crea un commit **nuevo** que deshace `<commit>`, manteniendo el original en el historial. | Sí: seguro para ramas compartidas. |

```bash

    git commit --amend -m "Mensaje corregido"

    git reset --soft HEAD~1   # Deshacer el último commit, dejando sus cambios preparados
    git reset --hard HEAD~1   # Deshacer el último commit y sus cambios por completo

    git revert HEAD            # Deshacer el último commit de forma segura con un nuevo commit


```

**GUI:** una opción **"Amend"** para modificar el último commit, una forma de restablecer la rama a un commit concreto seleccionado en el gráfico, y una acción **"Revert commit"** en el menú contextual del árbol.

**Error común:** usar `git reset --hard` o `git commit --amend` en commits que ya se han subido y que otras personas han descargado. Como estos comandos reescriben el historial, las copias locales de tus compañeros divergirán y provocarán conflictos confusos. En ramas compartidas, usa mejor `git revert`.

---

## 3.3. Reorganización Avanzada (Rebase & Cherry-pick)

Un **rebase** vuelve a aplicar los commits de tu rama encima de otra rama, generando un historial lineal sin commit de merge. Es muy potente, pero también reescribe los hashes de los commits; esta es la **regla de oro del rebase**: nunca hagas rebase de una rama que otras personas ya hayan descargado o en la que estén trabajando; hazlo solo en tu propio trabajo local que todavía no has subido.

| | `git merge` | `git rebase` |
| :--- | :--- | :--- |
| **Historial** | Conserva el historial exacto, añade un commit de merge. | Reescribe el historial en una línea recta. |
| **Seguridad** | Siempre seguro, incluso en ramas compartidas. | Solo seguro en ramas privadas que no se han subido. |
| **Ideal para** | Integrar trabajo terminado en una rama compartida. | Limpiar tu propia rama antes de compartirla. |

```bash

    git rebase main            # Reaplicar los commits de la rama actual encima de "main"

    git cherry-pick <hash>      # Aplicar un único commit de otra rama sobre la actual


```

`git cherry-pick` resulta útil cuando solo necesitas un commit concreto de otra rama, en lugar de la rama entera.

**GUI:** arrastrar y soltar un commit sobre otra rama en el gráfico, o una opción explícita **"Rebase onto..."** disponible sobre una rama o un commit.

**Error común:** hacer rebase de una rama pública o compartida. Como el rebase crea commits nuevos con hashes nuevos, todo el que ya tuviera los commits antiguos verá un historial reescrito y se encontrará con conflictos la próxima vez que sincronice.

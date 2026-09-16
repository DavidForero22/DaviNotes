---
title: "Branches et collaboration à distance avec Git"
---

# Branches et collaboration à distance

Une fois à l'aise pour travailler seul, l'étape suivante consiste à apprendre à travailler en parallèle sur des fonctionnalités isolées et à synchroniser vos changements avec des plateformes distantes comme GitHub, GitLab ou Bitbucket.

---

## Table des matières

<div id="content-table">

- [2.1. Gestion des branches](#21-gestion-des-branches "Pourquoi et comment créer des branches")
- [2.2. Intégration des changements (Merging)](#22-intégration-des-changements-merging "Fast-forward vs. three-way merge")
- [2.3. Résolution des conflits](#23-résolution-des-conflits "Comprendre et corriger les conflits de fusion")
- [2.4. Synchronisation à distance](#24-synchronisation-à-distance "fetch, pull et push")

</div>

---

## 2.1. Gestion des branches (Branching)

Une **branche** est une ligne de développement indépendante : elle vous permet de travailler sur une nouvelle fonctionnalité ou une correction sans toucher au code stable dont dépendent les autres. En coulisses, une branche n'est qu'un pointeur mobile vers un commit précis, c'est pourquoi en créer une dans Git est instantané et ne coûte rien.

Une stratégie de nommage courante préfixe la branche par le type de travail, par exemple `feature/login-form`, `fix/navbar-overflow` ou `docs/readme-update`, afin que chacun comprenne en un coup d'œil à quoi sert la branche.

```bash

    git branch                    # Lister les branches locales
    git branch nouvelle-fonction    # Créer une branche (reste sur la branche actuelle)
    git checkout -b nouvelle-fonction # Créer ET basculer sur la nouvelle branche
    git switch -c nouvelle-fonction   # Identique, avec la commande "switch" plus récente


```

**GUI :** un menu déroulant de branches (généralement dans la barre du haut) liste les branches existantes et permet de basculer entre elles, ainsi qu'une option **"New Branch"** qui en crée une visuellement à partir de la branche actuellement active.

---

## 2.2. Intégration des changements (Merging)

Le **merge** intègre les changements d'une branche dans une autre. Git le résout de deux façons possibles :

| Type | Quand cela arrive | À quoi cela ressemble |
| :--- | :--- | :--- |
| **Fast-forward** | La branche cible n'a aucun nouveau commit depuis la création de l'autre branche. | Git déplace simplement le pointeur de la branche vers l'avant — aucun nouveau commit n'est créé. |
| **Three-way merge** | Les deux branches ont de nouveaux commits depuis leur divergence. | Git crée un nouveau **commit de fusion** qui combine les deux historiques, à partir des deux extrémités de branche et de leur ancêtre commun. |

```bash

    git checkout main        # Se placer sur la branche qui va recevoir les changements
    git merge nouvelle-fonction # Intégrer les changements de "nouvelle-fonction" dans "main"


```

**GUI :** une option telle que **"Merge branch into current"**, déclenchée en glissant une branche sur une autre dans le graphique, ou par clic droit sur une branche puis sélection depuis la vue arborescente.

---

## 2.3. Résolution des conflits

Un **conflit** survient lorsque Git ne peut pas décider automatiquement comment combiner deux changements — généralement parce que les deux branches ont modifié les mêmes lignes du même fichier. Git met le merge en pause et marque le fichier avec des marqueurs de conflit que vous devez résoudre à la main :

```bash

    <<<<<<< HEAD
    Ceci est la version de votre branche actuelle.
    =======
    Ceci est la version de la branche en cours de fusion.
    >>>>>>> nouvelle-fonction


```

Tout ce qui se trouve entre `<<<<<<< HEAD` et `=======` est la version de votre branche actuelle ; tout ce qui se trouve entre `=======` et `>>>>>>> nouvelle-fonction` est la version entrante. Modifiez le fichier pour ne garder que le contenu voulu (en supprimant aussi les marqueurs), puis préparez-le pour indiquer à Git que le conflit est résolu :

```bash

    git add <fichier>
    git commit


```

**GUI :** les clients proposent un **outil visuel de résolution côte à côte (side-by-side diff / merge tool)** qui affiche les deux versions l'une à côté de l'autre avec des boutons pour accepter un côté, l'autre, ou les deux, plutôt que d'éditer les marqueurs à la main.

**Erreur courante :** valider un fichier qui contient encore les marqueurs `<<<<<<<`, `=======` ou `>>>>>>>` parce qu'ils sont passés inaperçus lors de la résolution — recherchez toujours ces symboles dans le fichier avant de commiter.

---

## 2.4. Synchronisation à distance

Un **remote** est une version de votre dépôt hébergée ailleurs (comme sur GitHub). S'y connecter permet d'échanger des commits avec votre équipe.

```bash

    git remote add origin <url>  # Relier un remote nommé "origin" à ce dépôt
    git fetch                     # Télécharger les nouveaux commits du remote, sans les fusionner
    git pull                      # Télécharger ET fusionner les nouveaux commits dans votre branche actuelle
    git push                      # Envoyer vos commits locaux vers le remote


```

`git fetch` est le moyen sûr de voir ce qui a changé à distance avant de décider quoi en faire ; `git pull` correspond essentiellement à un `git fetch` suivi d'un `git merge`.

**GUI :** des boutons directs **Fetch**, **Pull** et **Push**, généralement accompagnés d'indicateurs montrant votre avance ou votre retard en commits par rapport au remote.

**Erreur courante :** exécuter `git pull` sur une branche contenant des changements locaux non préparés, ce qui provoque des conflits évitables — commitez ou mettez de côté votre travail avec `stash` au préalable (voir la section 3.1). Évitez également de forcer le push (`git push --force`) sur une branche sur laquelle d'autres personnes travaillent, car cela peut écraser leurs commits.

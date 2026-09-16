---
title: "Contrôle avancé et correction des erreurs avec Git"
---

# Contrôle avancé et correction des erreurs

Tout le monde fait des erreurs. Cette section vous donne les outils pour résoudre les problèmes courants, revenir en arrière dans le temps en toute sécurité et conserver un historique propre et lisible.

---

## Table des matières

<div id="content-table">

- [3.1. Travail temporaire et abandon des changements](#31-travail-temporaire-et-abandon-des-changements "restore et stash")
- [3.2. Réécrire l'historique et corriger les erreurs](#32-réécrire-lhistorique-et-corriger-les-erreurs "amend, reset et revert")
- [3.3. Réorganisation avancée (Rebase & Cherry-pick)](#33-réorganisation-avancée-rebase--cherry-pick "Quand utiliser rebase et comment faire un cherry-pick")

</div>

---

## 3.1. Travail temporaire et abandon des changements

Parfois, vous voulez jeter des changements que vous n'avez pas encore commités, ou les mettre de côté sans les commiter du tout.

```bash

    git restore <fichier>  # Annuler les changements non commités d'un fichier, retour au dernier commit

    git stash                # Sauvegarder temporairement tous les changements non commités et nettoyer le répertoire de travail
    git stash pop             # Restaurer les derniers changements mis de côté avec stash


```

`git stash` est utile quand vous devez changer rapidement de branche mais n'êtes pas encore prêt à commiter votre travail en cours — par exemple, pour corriger un bug urgent sur une autre branche.

**GUI :** une option de clic droit **"Discard changes"** sur un fichier modifié (équivalent à `git restore`), et un panneau dédié **Stashes** qui liste tout ce que vous avez mis de côté.

---

## 3.2. Réécrire l'historique et corriger les erreurs

| Commande | Ce qu'elle fait | Sûre sur des commits partagés/poussés ? |
| :--- | :--- | :--- |
| `git commit --amend` | Remplace le dernier commit par un nouveau (nouveau message et/ou nouveaux changements préparés). | Seulement si personne d'autre ne l'a encore récupéré. |
| `git reset --soft <commit>` | Ramène la branche à `<commit>`, en gardant tous les changements préparés. | Non — réécrit l'historique. |
| `git reset --hard <commit>` | Ramène la branche à `<commit>` et **supprime** tous les changements depuis. | Non — réécrit l'historique et perd du travail. |
| `git revert <commit>` | Crée un **nouveau** commit qui annule `<commit>`, en gardant l'original dans l'historique. | Oui — sûr pour les branches partagées. |

```bash

    git commit --amend -m "Message corrigé"

    git reset --soft HEAD~1   # Annuler le dernier commit, en gardant ses changements préparés
    git reset --hard HEAD~1   # Annuler complètement le dernier commit et ses changements

    git revert HEAD            # Annuler le dernier commit en toute sécurité avec un nouveau commit


```

**GUI :** une option **"Amend"** pour modifier le dernier commit, un moyen de réinitialiser la branche à un commit précis sélectionné dans le graphique, et une action **"Revert commit"** dans le menu contextuel de l'arborescence.

**Erreur courante :** utiliser `git reset --hard` ou `git commit --amend` sur des commits déjà poussés et récupérés par d'autres personnes. Comme ces commandes réécrivent l'historique, les copies locales de vos collègues divergeront et provoqueront des conflits déroutants. Sur les branches partagées, préférez `git revert`.

---

## 3.3. Réorganisation avancée (Rebase & Cherry-pick)

Le **rebase** rejoue les commits de votre branche par-dessus une autre branche, produisant un historique linéaire sans commit de fusion. C'est puissant, mais cela réécrit aussi les hachages des commits — voici la **règle d'or du rebase** : ne rebasez jamais une branche que d'autres personnes ont déjà récupérée ou sur laquelle elles travaillent ; ne rebasez que votre propre travail local, non poussé.

| | `git merge` | `git rebase` |
| :--- | :--- | :--- |
| **Historique** | Préserve l'historique exact, ajoute un commit de fusion. | Réécrit l'historique en une ligne droite. |
| **Sécurité** | Toujours sûr, même sur des branches partagées. | Sûr uniquement sur des branches privées, non poussées. |
| **Idéal pour** | Intégrer du travail terminé dans une branche partagée. | Nettoyer sa propre branche avant de la partager. |

```bash

    git rebase main             # Rejouer les commits de la branche actuelle par-dessus "main"

    git cherry-pick <hash>       # Appliquer un seul commit d'une autre branche sur la branche actuelle


```

`git cherry-pick` est pratique lorsque vous avez besoin d'un seul commit précis d'une autre branche, plutôt que de toute la branche.

**GUI :** glisser-déposer un commit sur une autre branche dans le graphique, ou une option explicite **"Rebase onto..."** disponible sur une branche ou un commit.

**Erreur courante :** rebaser une branche publique ou partagée. Comme le rebase crée de nouveaux commits avec de nouveaux hachages, toute personne ayant déjà les anciens commits verra un historique réécrit et rencontrera des conflits lors de sa prochaine synchronisation.

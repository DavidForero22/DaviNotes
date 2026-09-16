---
title: "Guide d'installation de Python"
---

# Guide d'installation de Python

Python est un langage de programmation puissant, réputé pour sa simplicité et sa lisibilité. Que vous vous intéressiez au développement web, à la science des données ou à l'automatisation de tâches répétitives, Python est un outil incontournable.

Pour exécuter des programmes Python, votre ordinateur a besoin de l'**interpréteur Python** : le programme qui lit votre code et l'exécute. Suivez les étapes correspondant à votre système d'exploitation.

Plusieurs étapes utilisent le **terminal** (appelé *Invite de commandes* ou *PowerShell* sous Windows et *Terminal* sous macOS et Linux) : une fenêtre où l'on tape des commandes au lieu de cliquer sur des boutons.

---

## 1. Windows

Le moyen le plus simple d'installer Python sous Windows est d'utiliser l'installateur officiel.

<ol>
  <li>
    Rendez-vous sur le 
    <a href="https://www.python.org/downloads/" 
       class="doc-link" 
       target="_blank" 
       rel="noopener noreferrer"
       title="Site officiel de Python">
       site officiel de Python
    </a>.
  </li>
  <li>
    Cliquez sur le bouton <strong>Download Python 3.x.x</strong> (la dernière version).
  </li>
  <li>
    Ouvrez le fichier téléchargé.
  </li>
  <li>
    <strong>IMPORTANT :</strong> Avant de cliquer sur « Install Now », cochez la case :
    <blockquote>
      <strong>Add python.exe to PATH</strong>
    </blockquote>
    <em>Le PATH est la liste des dossiers où Windows cherche les programmes. Si vous sautez cette étape, le terminal ne trouvera pas Python.</em>
  </li>
  <li>
    Cliquez sur <strong>Install Now</strong> et attendez la fin de l'installation.
  </li>
</ol>

### Vérifier l'installation

Ouvrez une **nouvelle** fenêtre d'Invite de commandes ou de PowerShell et tapez :

```bash

    python --version


```

Vous devriez voir la version installée, par exemple `Python 3.13.1`.

---

## 2. macOS

macOS peut inclure une ancienne version de Python utilisée par le système lui-même. Il vaut mieux installer la dernière version séparément pour ne pas perturber ces outils système.

<ol>
  <li>
    Rendez-vous sur la
    <a href="https://www.python.org/downloads/macos/" 
       class="doc-link" 
       target="_blank" 
       rel="noopener noreferrer"
       title="Téléchargements Python pour macOS">
       page de téléchargement de Python pour macOS
    </a>.
  </li>
  <li>
    Téléchargez le <strong>macOS 64-bit universal2 installer</strong> de la dernière version.
  </li>
  <li>
    Ouvrez le fichier <code>.pkg</code> téléchargé et suivez l'assistant d'installation.
  </li>
</ol>

Si vous utilisez <a href="https://brew.sh/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Homebrew">Homebrew</a> (un outil pour installer des logiciels depuis le terminal), vous pouvez aussi lancer :

```bash

    brew install python


```

### Vérifier l'installation

Sous macOS, il faut généralement taper `python3` au lieu de `python` :

```bash

    python3 --version


```

---

## 3. Linux (Ubuntu/Debian)

La plupart des distributions Linux sont livrées avec Python. Vous pouvez tout de même utiliser le terminal pour vous assurer de l'avoir, ainsi que `pip` (l'outil qui télécharge des paquets Python supplémentaires).

Mettez à jour la liste des paquets disponibles et installez Python. `sudo` exécute la commande avec les droits d'administrateur, votre mot de passe vous sera donc demandé :

```bash

    sudo apt update
    sudo apt install python3 python3-pip


```

### Vérifier l'installation

```bash

    python3 --version


```

---

## 4. Exécuter votre premier programme

Créez un fichier nommé `hello.py` avec ce contenu :

```python

    print("Bonjour, Python !")


```

Ouvrez le terminal dans le même dossier et lancez-le (utilisez `python` sous Windows et `python3` sous macOS et Linux) :

```bash

    python hello.py

    # Résultat :
    # Bonjour, Python !


```

**Erreur fréquente :** taper des commandes du terminal dans le mode interactif de Python. Si vous tapez seulement `python`, l'invite `>>>` apparaît : c'est Python qui attend du code Python, pas des commandes du terminal. Tapez `exit()` pour en sortir.

```bash

    # ❌ INCORRECT : lancer une commande du terminal dans l'invite >>>
    >>> python hello.py
    SyntaxError: invalid syntax

    # ✅ CORRECT : on quitte d'abord Python, puis on lance la commande dans le terminal normal
    >>> exit()
    python hello.py


```

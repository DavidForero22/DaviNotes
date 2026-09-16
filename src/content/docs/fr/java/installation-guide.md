---
title: "Guide d'installation de Java"
---

# Guide d'installation de Java

Pour écrire et exécuter des programmes Java, il vous faut le **JDK** (Java Development Kit, « kit de développement Java ») : un paquet gratuit qui contient le *compilateur* (l'outil qui traduit votre code en quelque chose que l'ordinateur peut exécuter) et tout le nécessaire pour l'exécuter.

Nous recommandons une version **LTS** (Long Term Support, « support à long terme »), qui reçoit des mises à jour et des correctifs de sécurité pendant plusieurs années, comme Java 21 ou Java 25.

Plusieurs étapes utilisent le **terminal** (aussi appelé *ligne de commande*, *Invite de commandes* ou *PowerShell* sous Windows) : une fenêtre où l'on tape des commandes au lieu de cliquer sur des boutons.

---

## 1. Téléchargement et installation

**Windows**

<ol>
  <li>
    Téléchargez l'installateur (x64 Installer) depuis le site
    <a href="https://adoptium.net/" 
       class="doc-link" 
       target="_blank" 
       rel="noopener noreferrer"
       title="Télécharger Java depuis Eclipse Adoptium">
       Eclipse Adoptium
    </a> 
    (gratuit) ou depuis le
    <a href="https://www.oracle.com/java/technologies/downloads/" 
       class="doc-link" 
       target="_blank" 
       rel="noopener noreferrer"
       title="Télécharger Java depuis le site d'Oracle">
       site d'Oracle
    </a>.
  </li>
  <li>
    Lancez le fichier <code>.msi</code> ou <code>.exe</code> téléchargé et suivez les instructions à l'écran.
  </li>
  <li>
    <strong>Important :</strong> si l'installateur propose les options <strong>« Add to PATH »</strong> ou <strong>« Set JAVA_HOME variable »</strong>, activez-les. Le PATH est la liste des dossiers où l'ordinateur cherche les programmes : c'est ce qui vous permet de taper <code>java</code> dans n'importe quel terminal.
  </li>
</ol>

**macOS (avec Homebrew)**

<a href="https://brew.sh/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Homebrew">Homebrew</a> est un outil très répandu pour installer des logiciels sur macOS depuis le terminal. Si vous l'avez, ouvrez le terminal et lancez :

```bash

    brew install --cask temurin


```

**Linux (Debian/Ubuntu)**

Ouvrez le terminal et utilisez `apt` (l'installateur de paquets d'Ubuntu) pour installer le JDK par défaut. `sudo` exécute la commande avec les droits d'administrateur, votre mot de passe vous sera donc demandé :

```bash

    sudo apt update
    sudo apt install default-jdk


```

---

## 2. Vérifier l'installation

Une fois l'installation terminée, **ouvrez un nouveau terminal** (ceux qui étaient déjà ouverts ne voient pas la nouvelle installation) et lancez :

```bash

    java --version


```

Vous devriez voir quelque chose de ce genre (les numéros dépendent de la version installée) :

```bash

    openjdk 21.0.1 2023-10-17 LTS
    OpenJDK Runtime Environment Temurin-21.0.1+12 (build 21.0.1+12-LTS)
    OpenJDK 64-Bit Server VM Temurin-21.0.1+12 (build 21.0.1+12-LTS, mixed mode)


```

Si un message comme *« 'java' n'est pas reconnu en tant que commande interne ou externe »* s'affiche, Java n'a pas été ajouté au PATH. Réinstallez-le avec cette option activée ou redémarrez l'ordinateur.

---

## 3. Votre premier programme

Créez un fichier nommé `Main.java` et collez-y le code suivant :

```java

    public class Main {
        public static void main(String[] args) {
            System.out.println("Bonjour, Java !");
        }
    }


```

Pour l'exécuter, ouvrez le terminal dans le même dossier que le fichier et tapez :

```bash

    # 1. Compiler : traduit Main.java en Main.class
    javac Main.java

    # 2. Exécuter le programme compilé (sans l'extension .class)
    java Main

    # Résultat :
    # Bonjour, Java !


```

**Erreur fréquente :** donner au fichier un nom différent de celui de la classe. Une classe `public` doit se trouver dans un fichier portant exactement le même nom, majuscules comprises.

```bash

    # ❌ INCORRECT : la classe s'appelle Main, mais le fichier est main.java
    javac main.java
    # error: class Main is public, should be declared in a file named Main.java

    # ✅ CORRECT : le nom du fichier et celui de la classe correspondent exactement
    javac Main.java


```

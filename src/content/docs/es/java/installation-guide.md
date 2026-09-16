---
title: "Guía de instalación de Java"
---

# Guía de instalación de Java

Para escribir y ejecutar programas en Java necesitas el **JDK** (Java Development Kit, «kit de desarrollo de Java»): un paquete gratuito que incluye el *compilador* (la herramienta que traduce tu código a algo que el ordenador puede ejecutar) y todo lo necesario para ejecutarlo.

Te recomendamos una versión **LTS** (Long Term Support, «soporte a largo plazo»), que recibe actualizaciones y parches de seguridad durante varios años, como Java 21 o Java 25.

Varios pasos usan la **terminal** (también llamada *línea de comandos*, *Símbolo del sistema* o *PowerShell* en Windows): una ventana en la que escribes órdenes en lugar de hacer clic en botones.

---

## 1. Descarga e instalación

**Windows**

<ol>
  <li>
    Descarga el instalador (x64 Installer) desde la web de
    <a href="https://adoptium.net/" 
       class="doc-link" 
       target="_blank" 
       rel="noopener noreferrer"
       title="Descargar Java desde Eclipse Adoptium">
       Eclipse Adoptium
    </a> 
    (gratuito) o desde la
    <a href="https://www.oracle.com/java/technologies/downloads/" 
       class="doc-link" 
       target="_blank" 
       rel="noopener noreferrer"
       title="Descargar Java desde la web de Oracle">
       web de Oracle
    </a>.
  </li>
  <li>
    Ejecuta el archivo <code>.msi</code> o <code>.exe</code> descargado y sigue las instrucciones en pantalla.
  </li>
  <li>
    <strong>Importante:</strong> si el instalador ofrece las opciones <strong>«Add to PATH»</strong> o <strong>«Set JAVA_HOME variable»</strong>, actívalas. El PATH es la lista de carpetas en las que el ordenador busca programas, y es lo que te permite escribir <code>java</code> en cualquier terminal.
  </li>
</ol>

**macOS (con Homebrew)**

<a href="https://brew.sh/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Homebrew">Homebrew</a> es una herramienta muy popular para instalar programas en macOS desde la terminal. Si la tienes, abre la terminal y ejecuta:

```bash

    brew install --cask temurin


```

**Linux (Debian/Ubuntu)**

Abre la terminal y usa `apt` (el instalador de paquetes de Ubuntu) para instalar el JDK por defecto. `sudo` ejecuta la orden con permisos de administrador, así que te pedirá tu contraseña:

```bash

    sudo apt update
    sudo apt install default-jdk


```

---

## 2. Comprobar la instalación

Una vez instalado, **abre una terminal nueva** (las que ya estaban abiertas no ven la nueva instalación) y ejecuta:

```bash

    java --version


```

Deberías ver algo parecido a esto (los números dependen de la versión que hayas instalado):

```bash

    openjdk 21.0.1 2023-10-17 LTS
    OpenJDK Runtime Environment Temurin-21.0.1+12 (build 21.0.1+12-LTS)
    OpenJDK 64-Bit Server VM Temurin-21.0.1+12 (build 21.0.1+12-LTS, mixed mode)


```

Si aparece un mensaje como *«"java" no se reconoce como un comando interno o externo»*, Java no se añadió al PATH. Vuelve a instalarlo con esa opción activada o reinicia el ordenador.

---

## 3. Tu primer programa

Crea un archivo llamado `Main.java` y pega el siguiente código:

```java

    public class Main {
        public static void main(String[] args) {
            System.out.println("¡Hola, Java!");
        }
    }


```

Para ejecutarlo, abre la terminal en la misma carpeta que el archivo y escribe:

```bash

    # 1. Compilar: traduce Main.java a Main.class
    javac Main.java

    # 2. Ejecutar el programa compilado (sin la terminación .class)
    java Main

    # Resultado:
    # ¡Hola, Java!


```

**Error habitual:** poner al archivo un nombre distinto al de la clase. Una clase `public` debe estar en un archivo con exactamente el mismo nombre, mayúsculas incluidas.

```bash

    # ❌ INCORRECTO: la clase se llama Main, pero el archivo es main.java
    javac main.java
    # error: class Main is public, should be declared in a file named Main.java

    # ✅ CORRECTO: el nombre del archivo y el de la clase coinciden exactamente
    javac Main.java


```

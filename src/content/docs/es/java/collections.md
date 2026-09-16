---
title: "Colecciones en Java"
---

# Colecciones en Java

Los programas casi nunca trabajan con un único dato: una tienda tiene muchos productos y un colegio tiene muchos alumnos. Una **colección** es una estructura que guarda un grupo de valores bajo un mismo nombre.

Java ofrece el **Collections Framework** («marco de colecciones»), un conjunto de clases ya hechas para guardar grupos de datos que pueden crecer y encoger. Antes de usarlo conviene entender la estructura más básica (el array) y dos formas clásicas de organizar datos (pilas y colas), para elegir la herramienta adecuada en cada caso.

---

## Índice

<div id="content-table">

- [1. Estructuras básicas](#1-estructuras-básicas "Las estructuras de datos fundamentales de Java")
  - [A) Arrays](#a-arrays "Arrays de tamaño fijo: ventajas e inconvenientes")
  - [B) Pilas y colas](#b-pilas-y-colas "Procesamiento LIFO y FIFO con pilas y colas")
- [2. ArrayList](#2-arraylist "Listas dinámicas con ArrayList")
- [3. HashMap](#3-hashmap "Pares clave-valor y búsquedas rápidas con HashMap")
- [4. API Stream](#4-api-stream "Procesar colecciones de forma declarativa con Streams")
- [5. Otras colecciones](#5-otras-colecciones "Descubre el resto de colecciones de Java")

</div>

---

## 1. Estructuras básicas

Antes de entrar en el Collections Framework, veamos las estructuras más sencillas y en qué se diferencia Java de otros lenguajes.

### A) Arrays

Un **array** es una fila de cajas del mismo tipo, creada con un número fijo de posiciones. Cada posición tiene un número llamado **índice**, que empieza en `0`.

- **Ventajas:** Es muy rápido y ligero, porque todos los valores se guardan uno al lado del otro en memoria.
- **Inconvenientes:** Su tamaño es fijo: una vez creado, no se le pueden añadir más posiciones.

En Python (`list`) o JavaScript (`[]`), las listas crecen solas. En Java, un array como `int[]` no puede; si necesitas una lista que crezca, usa `ArrayList` (ver sección 2).

```java

    public class Main {
        public static void main(String[] args) {
            // Un array de 5 números enteros: posiciones 0, 1, 2, 3 y 4
            int[] numbers = new int[5];
            numbers[0] = 10; // Guarda 10 en la primera posición
        }
    }


```

**Error habitual:** usar una posición que no existe. Un array de 5 elementos va del índice `0` al `4`, así que el índice `5` hace fallar el programa con un `ArrayIndexOutOfBoundsException`.

```java

    int[] numbers = new int[5];

    // ❌ INCORRECTO: la última posición es la 4, no la 5
    numbers[5] = 50;

    // ✅ CORRECTO: la última posición siempre es length - 1
    numbers[numbers.length - 1] = 50;


```

### B) Pilas y colas

Las pilas y las colas definen el **orden** en que se añaden y se sacan los elementos.

- **Pila (Last-In, First-Out o LIFO, «el último en entrar es el primero en salir»):** Como una pila de platos. El último plato que pones arriba es el primero que coges. Un uso típico es el botón «atrás» del navegador: la última página que visitaste es la primera a la que vuelves.

```java

    import java.util.ArrayDeque;
    import java.util.Deque;

    public class Main {
        public static void main(String[] args) {
            Deque<String> history = new ArrayDeque<>();

            // 1. Añadir elementos arriba (push)
            history.push("Página de inicio");
            history.push("Ajustes");
            history.push("Perfil"); // Este queda arriba del todo

            // 2. Mirar el elemento de arriba sin sacarlo (peek)
            System.out.println("Actual: " + history.peek()); // Muestra: Perfil

            // 3. Sacar el elemento de arriba (pop)
            String lastVisited = history.pop(); // Saca "Perfil"

            System.out.println("Volviendo a: " + history.peek()); // Muestra: Ajustes
        }
    }


```

*Nota: Java también tiene una clase `Stack` más antigua que funciona igual, pero la documentación oficial recomienda `ArrayDeque` para código nuevo.*

- **Cola (First-In, First-Out o FIFO, «el primero en entrar es el primero en salir»):** Como la fila del supermercado. La primera persona en llegar es la primera a la que atienden. Un uso típico es la cola de una impresora.

```java

    import java.util.LinkedList; 
    import java.util.Queue;

    public class Main {
        public static void main(String[] args) {
            // LinkedList es una de las clases que pueden funcionar como cola (Queue)
            Queue<String> printerQueue = new LinkedList<>();

            // 1. Añadir elementos al final de la fila (offer)
            printerQueue.offer("Documento_A.pdf");
            printerQueue.offer("Foto_B.jpg");

            // 2. Sacar el primer elemento de la fila (poll)
            // "Documento_A.pdf" se añadió primero, así que sale primero
            System.out.println("Imprimiendo: " + printerQueue.poll());

            // 3. Ver quién va después sin sacarlo (peek)
            System.out.println("Siguiente: " + printerQueue.peek()); // Muestra: Foto_B.jpg
        }
    }


```

La parte `<String>` entre los símbolos `<` y `>` indica qué tipo de elementos guarda la colección. Se llaman **genéricos**.

---

## 2. ArrayList

`ArrayList` forma parte del Collections Framework. Funciona como un array que cambia de tamaño automáticamente al añadir o quitar elementos, igual que las listas de Python y JavaScript.

- **Ventajas:** Leer un elemento por su posición (`get(i)`) es instantáneo.
- **Inconvenientes:** Insertar o borrar elementos en medio es más lento, porque todos los elementos posteriores tienen que desplazarse una posición.

```java

    import java.util.ArrayList;

    public class Main {
        public static void main(String[] args) {
            // Crear una lista de textos vacía
            ArrayList<String> languages = new ArrayList<>();

            // Crece automáticamente
            languages.add("Java");
            languages.add("Python");
            languages.add("C++");

            System.out.println(languages.get(0)); // Muestra: Java
            System.out.println(languages.size()); // Muestra: 3
        }
    }


```

**Error habitual:** usar un tipo primitivo entre los símbolos `< >`. Las colecciones solo pueden guardar objetos, así que cada primitivo tiene su versión en objeto: `Integer` para `int`, `Double` para `double`, `Boolean` para `boolean`, etc.

```java

    // ❌ INCORRECTO: int es un tipo primitivo y aquí no compila
    ArrayList<int> numbers = new ArrayList<>();

    // ✅ CORRECTO: Integer es la versión en objeto de int
    ArrayList<Integer> numbers = new ArrayList<>();
    numbers.add(42); // Java convierte 42 en Integer automáticamente


```

---

## 3. HashMap

Un `HashMap` guarda datos en **pares clave-valor**, como un diccionario en el que buscas una palabra (la clave) para encontrar su definición (el valor). Internamente usa una función matemática (un *hash*) para decidir dónde se guarda cada clave, lo que hace que encontrar valores sea rapidísimo.

- **Ventajas:** Encontrar un valor por su clave es rápido, haya los datos que haya.
- **Inconvenientes:** No mantiene los elementos en ningún orden concreto, y cada clave solo puede aparecer una vez.

```java

    import java.util.HashMap;

    public class Main {
        public static void main(String[] args) {
            // Mapa: Clave (String) -> Valor (Integer)
            HashMap<String, Integer> scores = new HashMap<>();

            scores.put("Jugador1", 1500);
            scores.put("Jugador2", 3000);

            // Búsqueda instantánea por clave
            System.out.println(scores.get("Jugador1")); // Muestra: 1500
        }
    }


```

**Error habitual:** dar por hecho que una clave existe. Si no existe, `get()` devuelve `null` (ningún valor), y usar ese `null` como número hace fallar el programa. `getOrDefault()` permite indicar un valor de reserva.

```java

    // ❌ INCORRECTO: "Jugador3" no existe, get() devuelve null y el programa falla
    int score = scores.get("Jugador3");

    // ✅ CORRECTO: devuelve 0 cuando la clave no existe
    int score = scores.getOrDefault("Jugador3", 0);


```

---

## 4. API Stream

Introducidos en Java 8, los **Streams** («flujos») permiten procesar una colección paso a paso, como una cadena de montaje: describes *qué* quieres (filtra estos, transforma aquellos) en lugar de escribir *cómo* hacerlo con bucles.

- **Ventajas:** Código más corto y legible para filtrar, transformar y resumir datos.
- **Inconvenientes:** En tareas muy sencillas puede ser algo más lento que un bucle, y los errores son más difíciles de localizar.

```java

    import java.util.List;

    public class Main {
        public static void main(String[] args) {
            List<String> names = List.of("Alice", "Bob", "Charlie", "David");

            names.stream()
                .filter(name -> name.startsWith("A")) // 1. Quedarse con los nombres que empiezan por "A"
                .map(String::toUpperCase)             // 2. Pasarlos a mayúsculas
                .forEach(System.out::println);        // 3. Mostrar cada uno

            // Resultado: ALICE
        }
    }


```

`name -> name.startsWith("A")` es una **lambda**: una función diminuta escrita en línea. Léela como «para cada `name`, comprueba si empieza por A».

**Error habitual:** esperar que un stream modifique la lista original. Los streams crean resultados nuevos; la colección original no cambia.

```java

    List<String> names = List.of("alice", "bob");

    // ❌ INCORRECTO: el resultado se pierde y names sigue en minúsculas
    names.stream().map(String::toUpperCase);

    // ✅ CORRECTO: se recoge el resultado en una lista nueva
    List<String> upperNames = names.stream()
        .map(String::toUpperCase)
        .toList();


```

---

## 5. Otras colecciones

Java ofrece muchas más estructuras de datos que las vistas aquí. La imagen muestra el árbol completo del Collections Framework y cómo se relacionan sus interfaces principales (Set, List, Queue, Map).

<div class="doc-img">

![Jerarquía de colecciones de Java](/images/java-collections.webp "Créditos de la imagen: akcoding.com")

</div>

Solo hemos visto las estructuras **más habituales**.

<p>Si quieres profundizar, te recomendamos consultar la <a href="https://docs.oracle.com/en/java/" class="doc-link" target="_blank" rel="noopener noreferrer" title="Visita la documentación oficial de Java para más información">documentación oficial de Java</a> (en inglés).</p>

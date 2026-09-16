---
title: "Estructuras de datos en Python"
---

# Estructuras de datos

Una **estructura de datos** es una forma de guardar varios valores juntos, como una lista de la compra o una agenda de contactos. Python incluye cuatro estructuras para ello. A diferencia de **Java**, donde normalmente hay que importar clases como `ArrayList` o `HashMap`, estas cuatro forman parte del propio lenguaje y están listas para usar.

Para elegir la adecuada, hazte tres preguntas sobre tus datos:

- **¿Ordenados?** ¿Los elementos mantienen la posición en la que los añadiste?
- **¿Mutables?** ¿Se pueden cambiar, añadir o quitar elementos después de crear la estructura?
- **¿Duplicados?** ¿Puede aparecer el mismo valor más de una vez?

| Estructura | Ordenada | Mutable | Duplicados | Sintaxis |
| :--- | :--- | :--- | :--- | :--- |
| Lista | Sí | Sí | Sí | `[1, 2, 3]` |
| Tupla | Sí | No | Sí | `(1, 2, 3)` |
| Diccionario | Sí | Sí | Claves: no | `{"a": 1}` |
| Conjunto | No | Sí | No | `{1, 2, 3}` |

---

## Índice

<div id="content-table">

- [1. Listas](#1-listas "Colecciones ordenadas y modificables")
- [2. Tuplas](#2-tuplas "Colecciones ordenadas e inmutables")
- [3. Diccionarios](#3-diccionarios "Pares clave-valor")
- [4. Conjuntos (sets)](#4-conjuntos-sets "Colecciones sin orden de elementos únicos")

</div>

---

## 1. Listas

Las listas son la estructura más versátil de Python. Son **ordenadas**, **mutables** (se pueden modificar) y admiten valores duplicados. Se parecen a `ArrayList` de Java, pero una misma lista puede mezclar distintos tipos de datos.

Cada elemento tiene una posición llamada **índice**, que empieza en `0`.

**Sintaxis**: Corchetes `[]`.

```python

    # Crear una lista
    fruits = ["manzana", "plátano", "cereza"]
    
    # Acceder a elementos por índice (el primero es el 0)
    print(fruits[0])   # Resultado: manzana
    print(fruits[-1])  # Los índices negativos cuentan desde el final. Resultado: cereza
    
    # Modificar la lista
    fruits.append("naranja")  # Añade al final
    fruits[1] = "arándano"    # Cambia el segundo elemento
    
    # Rebanado (slicing): obtener una parte de la lista, del índice 1 hasta el 3 (sin incluirlo)
    print(fruits[1:3]) # Resultado: ['arándano', 'cereza']


```

**Error habitual:** usar un índice que no existe. Una lista de 3 elementos tiene los índices `0`, `1` y `2`, así que `fruits[3]` detiene el programa con un `IndexError`.

```python

    fruits = ["manzana", "plátano", "cereza"]

    # ❌ INCORRECTO: no hay un cuarto elemento
    print(fruits[3])

    # ✅ CORRECTO: el último elemento está en len(lista) - 1, o simplemente en -1
    print(fruits[len(fruits) - 1])
    print(fruits[-1])


```

---

## 2. Tuplas

Las tuplas son como las listas, pero **inmutables**: una vez creada una tupla, no se pueden cambiar, añadir ni quitar sus elementos. Se usan para datos que deben permanecer fijos, como unas coordenadas en un mapa o los valores RGB de un color. Como no pueden cambiar, además son algo más ligeras que las listas.

**Sintaxis**: Paréntesis `()`.

```python

    # Crear una tupla
    coordinates = (10, 20)
    
    # Se accede a los elementos igual que en las listas
    print(coordinates[0])  # Resultado: 10
    
    # Esto detendría el programa con un error:
    # coordinates[0] = 15  <-- TypeError: 'tuple' object does not support item assignment
    
    # Desempaquetado: guardar cada valor en su propia variable
    x, y = coordinates
    print(x)  # Resultado: 10


```

**Error habitual:** crear una tupla de un solo elemento y olvidar la coma. Sin ella, Python solo ve un valor entre paréntesis.

```python

    # ❌ INCORRECTO: esto es el número 5, no una tupla
    single = (5)

    # ✅ CORRECTO: la coma final la convierte en tupla
    single = (5,)


```

---

## 3. Diccionarios

Los diccionarios guardan datos en pares `clave: valor`, como un diccionario de verdad en el que buscas una palabra (la clave) para encontrar su definición (el valor). Son **ordenados** (mantienen el orden de inserción desde Python 3.7), **mutables**, y cada clave solo puede aparecer una vez. Son el equivalente en Python a `HashMap` de Java o a los objetos de JavaScript.

**Sintaxis**: Llaves `{}` con dos puntos `:` entre cada clave y su valor.

```python

    # Crear un diccionario
    student = {
        "name": "Juan",
        "age": 25,
        "courses": ["Matemáticas", "Informática"]
    }
    
    # Acceder a valores por clave
    print(student["name"])      # Resultado: Juan
    print(student.get("age"))   # Resultado: 25
    
    # Añadir o actualizar pares
    student["grade"] = "A"   # Clave nueva, así que se añade un par
    student["age"] = 26      # Clave existente, así que se reemplaza su valor


```

**Error habitual:** leer con corchetes una clave que no existe. El programa se detiene con un `KeyError`. El método `.get()` devuelve `None` (ningún valor) o un valor por defecto que elijas.

```python

    # ❌ INCORRECTO: "phone" no existe, KeyError
    print(student["phone"])

    # ✅ CORRECTO: devuelve "No disponible" cuando la clave no existe
    print(student.get("phone", "No disponible"))


```

---

## 4. Conjuntos (sets)

Los conjuntos son colecciones **sin orden**, **sin índices** y **sin duplicados**: cada valor aparece una sola vez. Sirven para eliminar valores repetidos, para comprobar muy rápido si algo está incluido y para operaciones matemáticas como la unión (juntar) y la intersección (elementos en común).

**Sintaxis**: Llaves `{}`, pero sin dos puntos.

```python

    # Crear un conjunto
    unique_ids = {101, 102, 103, 102} 
    
    # Los duplicados se eliminan automáticamente
    print(unique_ids)  # Resultado: {101, 102, 103}
    
    # Comprobar si un valor está incluido (muy rápido)
    if 101 in unique_ids:
        print("¡ID encontrado!")
        
    # Añadir elementos
    unique_ids.add(104)

    # Elementos en común entre dos conjuntos
    print({1, 2, 3} & {2, 3, 4})  # Resultado: {2, 3}


```

**Error habitual:** crear un conjunto vacío con `{}`. Las llaves vacías crean un *diccionario* vacío, no un conjunto.

```python

    # ❌ INCORRECTO: esto es un diccionario vacío
    tags = {}
    tags.add("python")  # AttributeError: 'dict' object has no attribute 'add'

    # ✅ CORRECTO: set() crea un conjunto vacío
    tags = set()
    tags.add("python")


```

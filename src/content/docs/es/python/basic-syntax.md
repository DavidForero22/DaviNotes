---
title: "Sintaxis básica en Python"
---

# Sintaxis básica

Python es un lenguaje de programación conocido por ser fácil de leer, a menudo parecido al inglés corriente. Tres términos que oirás sobre él:

- **Interpretado:** no hace falta un paso previo para traducir (compilar) el código antes de ejecutarlo; Python lo lee y lo ejecuta línea a línea.
- **De alto nivel:** oculta muchos detalles técnicos del ordenador, para que puedas centrarte en el problema que quieres resolver.
- **De tipado dinámico:** no tienes que indicar de antemano si una variable guarda un número o un texto; Python lo deduce solo.

A diferencia de **Java** o **C++**, Python no usa llaves `{}` para agrupar código ni necesita un punto y coma `;` al final de cada línea. En su lugar usa la **sangría** (los espacios al principio de una línea) para indicar qué líneas van juntas.

---

## Índice
<div id="content-table">

- [1. Estructura](#1-estructura "La sangría y la estructura del código en Python")
- [2. Variables](#2-variables "Las variables en Python")
- [3. Operadores](#3-operadores "Operadores aritméticos, de comparación y lógicos")
- [4. Estructuras de control](#4-estructuras-de-control "Controlar el flujo con condiciones y bucles")
  - [4.1 Condicionales](#41-condicionales "Uso de if, elif y else")
  - [4.2 Bucles](#42-bucles "Repetir código con for o while")
    - [A) Bucles for](#a-bucles-for "Recorrer secuencias o rangos de números")
    - [B) Bucles while](#b-bucles-while "Repetir mientras una condición sea verdadera")

</div>

---

## 1. Estructura

En Python, la sangría no es solo estética: es una regla del lenguaje. Las líneas que pertenecen a un bloque (por ejemplo, las que solo deben ejecutarse *si* se cumple una condición) tienen que llevar el mismo número de espacios, normalmente 4.

Los **comentarios** empiezan con una almohadilla (`#`). Python ignora el resto de la línea; son notas para quien lee el código.

```python

    # Esto es un comentario
    # Python usa la sangría para definir bloques
    if 5 > 2:
        print("¡Cinco es mayor que dos!")  # Esta línea está dentro del bloque if
        
    print("Esto está fuera del bloque")


```

`print()` muestra un mensaje en pantalla (en la *consola*, la ventana de texto donde los programas muestran sus resultados).

**Reglas clave**:
- **Coherencia**: Todas las líneas de un mismo bloque deben tener la misma sangría.
- **Dos puntos** (`:`): Las líneas que abren un bloque (como `if`, `for`, `def`) siempre terminan en dos puntos, que significan «a continuación viene un bloque con sangría».
- **Sin punto y coma**: No hace falta terminar las líneas con `;`.

**Error habitual:** mezclar sangrías distintas en el mismo bloque. Python se detiene con un `IndentationError`.

```python

    # ❌ INCORRECTO: la segunda línea tiene 2 espacios en lugar de 4
    if 5 > 2:
        print("¡Cinco es mayor que dos!")
      print("Esta línea rompe el programa")

    # ✅ CORRECTO: las dos líneas usan la misma sangría
    if 5 > 2:
        print("¡Cinco es mayor que dos!")
        print("Las dos líneas están dentro del bloque")


```

---

## 2. Variables

Una **variable** es una caja con nombre que guarda un valor para usarlo más tarde. Se crea simplemente dándole un nombre y un valor con `=`. Python es de **tipado dinámico**, así que no declaras el tipo: se decide automáticamente a partir del valor, e incluso puede cambiar después.

Los nombres de variable distinguen mayúsculas de minúsculas (`age` y `Age` son distintas) y suelen seguir el estilo `snake_case`: palabras en minúscula separadas por guiones bajos.

- **Números**: `int` (enteros), `float` (con decimales, escritos con punto), `complex` (números complejos, usados en matemáticas)
- **Cadenas de texto** (`str`): Texto escrito entre comillas simples `'` o dobles `"`
- **Booleanos** (`bool`): `True` (verdadero) o `False` (falso), siempre con la primera letra en mayúscula

Ejemplo:

```python

    # Números
    x = 5           # int
    y = 3.14        # float
    z = 1j          # complex

    # Cadena de texto
    name = "Python"

    # Booleano
    is_active = True

    # Tipado dinámico: la misma variable ahora guarda un texto
    x = "Ahora soy un texto"


```

Puedes crear **textos de varias líneas** con triples comillas (`"""` o `'''`). Es útil para textos largos.

```python

    x = """Este es un
    texto muy largo,
    así que puede escribirse en varias líneas."""


```

**Error habitual:** unir texto y números con `+`. Python no convierte el número en texto automáticamente y se detiene con un `TypeError`. La solución más sencilla es una **f-string**: pon una `f` delante de las comillas y escribe las variables entre `{}`.

```python

    age = 25

    # ❌ INCORRECTO: no se puede sumar un str y un int
    print("Tengo " + age + " años")

    # ✅ CORRECTO: la f-string inserta el valor dentro del texto
    print(f"Tengo {age} años")


```

---

## 3. Operadores

Los operadores son símbolos que realizan operaciones con valores, como sumar números o compararlos. Python usa palabras en inglés para las operaciones lógicas, así que las condiciones se leen casi como una frase.

**Operadores aritméticos**

```python

    x = 10
    y = 3

    print(x + y)   # Suma: 13
    print(x / y)   # División: 3.3333333333333335
    print(x // y)  # División entera, quita los decimales: 3
    print(x % y)   # Resto de la división: 1
    print(x ** y)  # Potencia (10 elevado a 3): 1000


```

**Operadores de comparación**

Comparan dos valores y devuelven `True` o `False`: `==` (igual), `!=` (distinto), `>` (mayor que), `<` (menor que), `>=` (mayor o igual) y `<=` (menor o igual).

**Error habitual:** confundir `=` con `==`. Un solo `=` *guarda* un valor; el doble `==` *compara* dos valores.

```python

    age = 18

    # ❌ INCORRECTO: = intenta guardar un valor dentro de la condición (SyntaxError)
    if age = 18:
        print("Acaba de cumplir la mayoría de edad")

    # ✅ CORRECTO: == pregunta «¿age es igual a 18?»
    if age == 18:
        print("Acaba de cumplir la mayoría de edad")


```

**Operadores lógicos**

Donde Java usa los símbolos `&&`, `||` y `!`, Python usa las palabras `and` (y), `or` (o) y `not` (no).

| Operador | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `and` | Devuelve `True` solo si **ambas** condiciones son verdaderas. | `x > 5 and x < 10` |
| `or` | Devuelve `True` si **al menos una** de las condiciones es verdadera. | `x < 5 or x > 10` |
| `not` | Invierte el resultado: `True` pasa a ser `False` y viceversa. | `not x > 5` |


```python

    age = 25
    has_license = True

    if age >= 18 and has_license:
        print("Puedes conducir.")
        
    if not has_license:
        print("No puedes conducir.")


```

```python

    # ❌ INCORRECTO: && no es válido en Python (SyntaxError)
    if age >= 18 && has_license:
        print("Puedes conducir.")

    # ✅ CORRECTO
    if age >= 18 and has_license:
        print("Puedes conducir.")


```

---

## 4. Estructuras de control

Por defecto, un programa ejecuta sus instrucciones una detrás de otra. Las **estructuras de control** cambian ese orden: permiten tomar decisiones o repetir código. En Python se basan en la *sangría y los dos puntos* (`:`) en lugar de las llaves `{}` de Java o C++.

Los paréntesis `()` alrededor de las condiciones son opcionales y normalmente se omiten.

### 4.1 Condicionales

Python usa las palabras clave `if` (si), `elif` (abreviatura de «else if», «si no, si») y `else` (si no). Solo se ejecuta el primer bloque cuya condición sea verdadera.

```python

    temperature = 28

    if temperature > 30:
        print("Hace calor")
    elif temperature > 20:
        print("Hace un día agradable")
    else:
        print("Hace frío")


```

Python también permite escribir una condición sencilla en una sola línea, con una **expresión condicional** (o *ternaria*): `valor_si_verdadero if condición else valor_si_falso`.

```python

    admin = True

    message = "¡Bienvenido, administrador!" if admin else "Acceso denegado"

    print(message)  # Resultado: ¡Bienvenido, administrador!


```

### 4.2 Bucles

Los **bucles** repiten un bloque de código. Python tiene dos tipos principales.

#### A) Bucles for

A diferencia del `for (int i = 0; i < 10; i++)` de Java, el bucle `for` de Python recorre uno a uno los elementos de una secuencia: los elementos de una lista, las letras de un texto o un rango de números.

```python

    # range(5) genera los números 0, 1, 2, 3, 4
    for i in range(5):
        print(i)

    # Recorrer una lista
    colors = ["rojo", "verde", "azul"]
    for color in colors:
        print("Color actual: " + color)


```

**Error habitual:** esperar que `range(5)` incluya el número 5. El rango se detiene justo *antes* del valor final.

```python

    # ❌ INCORRECTO: se espera 1, 2, 3, 4, 5 pero muestra 0, 1, 2, 3, 4
    for i in range(5):
        print(i)

    # ✅ CORRECTO: range(inicio, fin) muestra 1, 2, 3, 4, 5
    for i in range(1, 6):
        print(i)


```

#### B) Bucles while

El bucle `while` («mientras») repite un bloque de código mientras una condición sea verdadera.

```python

    count = 0

    while count < 3:
        print("La cuenta es:", count)
        count += 1  # Suma 1 a count


```

**Error habitual:** usar `++` para sumar uno, como en Java o JavaScript. Python no tiene ese operador.

```python

    # ❌ INCORRECTO: count++ es un SyntaxError en Python
    count++

    # ✅ CORRECTO
    count += 1


```

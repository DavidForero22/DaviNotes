---
title: "Fundamentos de React"
---

# Fundamentos

React es una librería de JavaScript para construir interfaces de usuario a partir de **componentes**: piezas independientes y reutilizables de la pantalla, como un botón, la ficha de un producto o un menú completo. Construyes componentes pequeños y los combinas como piezas de construcción para crear páginas completas.

Para que los componentes sean dinámicos e interactivos, React usa dos tipos de datos: las **props** y el **estado** (*state*).

- Las **props** son datos que un componente *recibe* del componente que lo contiene, como los argumentos de una función.
- El **estado** son datos que un componente *crea y gestiona él mismo*, como su propia memoria. Cuando el estado cambia, React actualiza automáticamente lo que se ve en pantalla.

Entender la diferencia entre ambos es fundamental, porque define cómo se mueven los datos por tu aplicación.

---

## Índice

<div id="content-table">

- [1. Fundamentos de JSX](#1-fundamentos-de-jsx "Estructura, listas y eventos")
- [2. Props](#2-props "Pasar datos de padre a hijo")
- [3. Estado (state)](#3-estado-state "Gestionar datos que cambian dentro de un componente")
- [4. Flujo de datos en un solo sentido](#4-flujo-de-datos-en-un-solo-sentido "La dirección en la que viajan los datos")

</div>

---

## 1. Fundamentos de JSX

**JSX** (JavaScript XML) es la sintaxis que usarás para describir lo que muestra cada componente. Permite escribir algo parecido a HTML directamente dentro del código JavaScript. Resulta familiar, pero tiene algunas reglas propias.

En React, un componente es simplemente una función de JavaScript que devuelve JSX.

### A) Reglas de estructura
1.  **Un único padre:** Un componente debe devolver un solo elemento que envuelva todo lo demás. Si no quieres un `<div>` extra, usa un **Fragment** (`<>...</>`), un envoltorio invisible.
2.  **Atributos en camelCase:** Como `class` es una palabra reservada de JavaScript, se usa `className`. Los eventos también se escriben en camelCase (`onClick` en lugar de `onclick`).
3.  **Etiquetas cerradas:** Todas las etiquetas deben cerrarse, incluidas las que no tienen contenido (`<img />`, `<br />`).
4.  **Llaves:** Todo lo que va entre `{}` se evalúa como JavaScript, así que puedes insertar variables o cálculos en el marcado.

```jsx

    // Un componente sencillo que muestra datos dinámicos
    export default function UserCard() {
        const username = "Alex";
        const isActive = true;

        return (
            <div className="card">
                {/* Las llaves {} insertan el valor de una variable de JavaScript */}
                <h2>Bienvenido, {username}</h2>
                
                {/* Elegir un texto con el operador ternario: condición ? siVerdadero : siFalso */}
                <p>Estado: {isActive ? "Conectado" : "Desconectado"}</p>
            </div>
        );
    }


```

```jsx

    // ❌ INCORRECTO: dos elementos seguidos sin envoltorio, y "class" en lugar de "className"
    return (
        <h1 class="title">Hola</h1>
        <p>Bienvenido</p>
    );

    // ✅ CORRECTO: un Fragment envuelve los dos elementos y se usa className
    return (
        <>
            <h1 className="title">Hola</h1>
            <p>Bienvenido</p>
        </>
    );


```

### B) Renderizar listas
Para mostrar una lista, React usa el método de arrays `.map()`, que convierte cada dato en un elemento. Cada elemento debe tener una prop `key` con un valor único, para que React pueda distinguirlos cuando la lista cambia.

```jsx

    const fruits = [
        { id: 1, name: "Manzana" },
        { id: 2, name: "Plátano" },
        { id: 3, name: "Naranja" },
    ];

    return (
        <ul>
            {fruits.map((fruit) => (
                <li key={fruit.id}>{fruit.name}</li>
            ))}
        </ul>
    );


```

**Error habitual:** usar la posición en la lista (`index`) como `key` cuando se pueden añadir, quitar o reordenar elementos. React puede confundir qué elemento es cuál y, por ejemplo, dejar una casilla marcada en la fila equivocada.

```jsx

    // ❌ INCORRECTO: el índice cambia cuando se borra o reordena un elemento
    {fruits.map((fruit, index) => (
        <li key={index}>{fruit.name}</li>
    ))}

    // ✅ CORRECTO: un identificador único y estable que viene de los datos
    {fruits.map((fruit) => (
        <li key={fruit.id}>{fruit.name}</li>
    ))}


```

### C) Gestionar eventos
En HTML, el código que se ejecuta se escribe como texto (`onclick="hacerAlgo()"`). En React se pasa **la propia función** entre llaves.

```jsx

    function Button() {
        const handleClick = () => alert("¡Clic!");

        return (
            <button onClick={handleClick}>Haz clic</button>
        );
    }


```

```jsx

    // ❌ INCORRECTO: los paréntesis ejecutan handleClick en el momento de dibujar la página
    <button onClick={handleClick()}>Haz clic</button>

    // ✅ CORRECTO: se pasa la función; React la ejecutará al pulsar el botón
    <button onClick={handleClick}>Haz clic</button>

    // ✅ CORRECTO: si necesitas pasar argumentos, envuélvela en una función flecha
    <button onClick={() => deleteItem(3)}>Borrar</button>


```

---

## 2. Props

Abreviatura de *properties* («propiedades»), las **props** son la forma en que un componente padre pasa datos a un componente hijo. Hacen que los componentes sean reutilizables: el mismo componente puede mostrar contenido distinto según las props que reciba, igual que una función devuelve resultados distintos con argumentos distintos.

**Regla clave:** Un componente nunca debe cambiar sus propias props. Son de *solo lectura*.

En este ejemplo, el componente `Welcome` recibe las props `name` y `role` para mostrar una tarjeta personalizada.

```jsx

    // 1. Componente hijo
    // { name, role } extrae esos dos valores del objeto props
    function Welcome({ name, role }) {
        return (
            <div className="card">
                <h2>¡Hola, {name}!</h2>
                <p>Rol: {role}</p>
            </div>
        );
    }

    // 2. Componente padre
    export default function App() {
        return (
            <main>
                {/* El mismo componente, configurado con datos distintos */}
                <Welcome name="Alicia" role="Desarrolladora frontend" />
                <Welcome name="Bruno" role="Diseñador" />
            </main>
        );
    }


```

```jsx

    // ❌ INCORRECTO: un componente no debe modificar las props que recibe
    function Welcome(props) {
        props.name = props.name.toUpperCase();
        return <h2>¡Hola, {props.name}!</h2>;
    }

    // ✅ CORRECTO: se crea un valor nuevo a partir de la prop
    function Welcome({ name }) {
        const upperName = name.toUpperCase();
        return <h2>¡Hola, {upperName}!</h2>;
    }


```

---

## 3. Estado (state)

El **estado** es la memoria interna de un componente. A diferencia de las props, el estado **puede cambiar**. Cuando cambia, React vuelve a *renderizar* el componente automáticamente: ejecuta de nuevo la función y actualiza la pantalla con los datos nuevos.

Para crear estado en un componente se usa `useState`. Es un **hook**: una función especial de React cuyo nombre empieza por `use`.

*Nota: los Hooks se explican a fondo en la siguiente guía, pero `useState` es necesario aquí para mostrar el concepto.*

```jsx

    import { useState } from 'react';

    export default function Counter() {
        // [valor actual, función para cambiarlo] = useState(valor inicial)
        const [count, setCount] = useState(0);

        return (
            <div>
                <p>Cuenta actual: {count}</p>

                {/* Al hacer clic se llama a setCount con el nuevo valor */}
                <button onClick={() => setCount(count + 1)}>
                    Sumar
                </button>
            </div>
        );
    }


```

**¿Qué ocurre aquí?**

1. El componente empieza con `count` a `0`.

2. El usuario pulsa el botón.

3. `setCount` guarda el nuevo valor.

4. React detecta el cambio y vuelve a dibujar el componente con el número nuevo.

**Error habitual:** cambiar directamente la variable de estado. React no detecta el cambio, así que la pantalla no se actualiza.

```jsx

    // ❌ INCORRECTO: count cambia en memoria, pero React no vuelve a renderizar
    <button onClick={() => { count = count + 1; }}>Sumar</button>

    // ✅ CORRECTO: usa siempre la función que devuelve useState
    <button onClick={() => setCount(count + 1)}>Sumar</button>


```

---

## 4. Flujo de datos en un solo sentido

React sigue un **flujo de datos en un solo sentido**: los datos solo viajan en una dirección, **hacia abajo**, de los componentes padre a sus hijos.

- **De padre a hijo:** Los datos se envían mediante **props**.

- **De hijo a padre:** Los datos no pueden subir directamente. En su lugar, el padre pasa una **función** al hijo como prop, y el hijo llama a esa función cuando ocurre algo.

Así queda claro de dónde viene cada dato y qué componente puede cambiarlo, lo que hace mucho más fácil encontrar errores.

```jsx

    import { useState } from 'react';

    // Componente HIJO
    function ButtonChild({ onButtonClick }) {
        // El hijo no sabe qué hace la función; solo la llama
        return (
            <button onClick={onButtonClick}>
                ¡Haz clic para avisar al padre!
            </button>
        );
    }

    // Componente PADRE
    export default function Parent() {
        const [message, setMessage] = useState("Esperando...");

        // Esta función vive en el padre, junto al estado que modifica
        const handleUpdate = () => {
            setMessage("¡El hijo ha pulsado el botón!");
        };

        return (
            <div>
                <h1>El padre dice: {message}</h1>
                
                {/* Se pasa la FUNCIÓN como prop */}
                <ButtonChild onButtonClick={handleUpdate} />
            </div>
        );
    }


```

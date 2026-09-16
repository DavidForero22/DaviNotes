---
title: "Hooks en React"
---

# Hooks

Los **Hooks** son funciones especiales que dan a los componentes capacidades extra, como recordar datos entre renderizados o ejecutar código después de que el componente aparezca en pantalla. Llegaron con React 16.8 y hoy son la forma estándar de escribir componentes. Sus nombres siempre empiezan por `use` (por ejemplo, `useState`, `useEffect`).

Antes de los Hooks, estas capacidades solo existían en los *componentes de clase*, una forma más antigua y más larga de escribir componentes. Todavía puedes encontrarlos en proyectos antiguos, pero el código nuevo usa funciones y Hooks.

---

## Índice

<div id="content-table">

- [1. ¿Qué son los Hooks?](#1-qué-son-los-hooks "Los superpoderes de los componentes de función")
- [2. useState](#2-usestate "Gestionar el estado local de un componente")
- [3. useEffect](#3-useeffect "Efectos secundarios como cargar datos o suscripciones")
- [4. useMemo](#4-usememo "Guardar resultados de cálculos costosos")
- [5. useCallback](#5-usecallback "Recordar funciones para evitar renderizados innecesarios")
- [6. Reglas de los Hooks](#6-reglas-de-los-hooks "Reglas obligatorias para usar Hooks")

</div>

---

## 1. ¿Qué son los Hooks?

Un componente de React es una función que se ejecuta cada vez que hay que dibujarlo en pantalla (cada ejecución se llama **renderizado** o *render*). Las variables normales de una función se pierden al terminar, así que un componente no tiene memoria propia. Los Hooks lo resuelven: conectan la función con funcionalidades que gestiona React, como el estado (memoria), los efectos secundarios o los datos compartidos.

**Características clave**:

- **Reutilizables:** Puedes combinar varios Hooks en tus propios *Hooks personalizados* (funciones cuyo nombre empieza por `use`) para compartir lógica entre componentes.
- **Graduales:** Puedes usar Hooks en componentes nuevos sin reescribir los existentes.
- **Solo en funciones:** Los Hooks funcionan en componentes de función, no en componentes de clase.

---

## 2. useState

`useState` da a un componente una porción de **estado**: un valor que React recuerda entre renderizados. Cuando lo cambias, React vuelve a dibujar el componente con el valor nuevo.

**Sintaxis**: `const [state, setState] = useState(valorInicial);`

Devuelve una pareja: el **valor actual** y una **función** para actualizarlo. Por convención, la función se llama `set` + el nombre del valor.

```jsx

    import { useState } from "react";

    export default function TextInput() {
        // Declarar una variable de estado llamada "text", que empieza con "Hola"
        const [text, setText] = useState("Hola");

        return (
            <div>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)} // Guardar cada cambio en el estado
                />
                <p>Has escrito: {text}</p>
            </div>
        );
    }


```

**Error habitual:** modificar directamente un objeto o una lista guardados en el estado. React compara el valor antiguo con el nuevo; si cambias el mismo objeto, parecen idénticos y la pantalla no se actualiza. Crea siempre un objeto o una lista **nuevos**.

```jsx

    const [user, setUser] = useState({ name: "Alex", age: 30 });

    // ❌ INCORRECTO: se cambia el mismo objeto y React no lo detecta
    user.age = 31;
    setUser(user);

    // ✅ CORRECTO: se crea un objeto nuevo copiando el anterior (...user) y cambiando age
    setUser({ ...user, age: 31 });


```

---

## 3. useEffect

`useEffect` permite ejecutar código **después** de que el componente se haya dibujado en pantalla. Se usa para **efectos secundarios**: acciones que salen fuera del componente, como cargar datos de un servidor, iniciar un temporizador o cambiar el título de la pestaña del navegador.

Por defecto, el efecto se ejecuta tras el **primer renderizado** y tras **cada** actualización.

```jsx

    import { useState, useEffect } from "react";

    function PageTitle() {
        const [count, setCount] = useState(0);

        useEffect(() => {
            // Actualizar el texto de la pestaña del navegador
            document.title = `Has hecho clic ${count} veces`;
        });

        return <button onClick={() => setCount(count + 1)}>Haz clic</button>;
    }


```

Puedes indicar a React que ejecute el efecto solo cuando cambien ciertos valores pasando un array como segundo argumento. Este array se llama **array de dependencias**.

```jsx

    useEffect(() => {
        document.title = `Has hecho clic ${count} veces`;
    }, [count]); // Solo se vuelve a ejecutar cuando cambia 'count'


```

**Patrones habituales:**

- `[a, b]`: Se ejecuta tras el primer renderizado Y cada vez que cambian `a` o `b`.

- `[]` (array vacío): Se ejecuta **una sola vez**, tras el primer renderizado.

- Sin array: Se ejecuta tras **cada** renderizado.

**Error habitual:** actualizar el estado dentro de un efecto que no tiene array de dependencias. El cambio de estado provoca un nuevo renderizado, el nuevo renderizado vuelve a ejecutar el efecto, y así para siempre (un *bucle infinito*).

```jsx

    // ❌ INCORRECTO: efecto -> setUsers -> render -> efecto -> setUsers -> ...
    useEffect(() => {
        fetch("/api/users")
            .then((response) => response.json())
            .then((data) => setUsers(data));
    });

    // ✅ CORRECTO: el array vacío hace que solo se ejecute una vez, al aparecer el componente
    useEffect(() => {
        fetch("/api/users")
            .then((response) => response.json())
            .then((data) => setUsers(data));
    }, []);


```

Algunos efectos necesitan **limpiarse** cuando el componente desaparece de la pantalla, como detener un temporizador o cerrar una conexión. Si no, siguen funcionando en segundo plano y malgastan memoria. Para ello, devuelve una función desde el efecto: React la ejecutará cuando se elimine el componente.

```jsx

    useEffect(() => {
        const timer = setInterval(() => {
            console.log("Tic...");
        }, 1000);

        // Función de limpieza: se ejecuta cuando se elimina el componente
        return () => {
            clearInterval(timer);
            console.log("Temporizador detenido");
        };
    }, []);


```

```jsx

    // ❌ INCORRECTO: el temporizador sigue funcionando cuando el componente desaparece
    useEffect(() => {
        setInterval(() => console.log("Tic..."), 1000);
    }, []);

    // ✅ CORRECTO: la función de limpieza detiene el temporizador
    useEffect(() => {
        const timer = setInterval(() => console.log("Tic..."), 1000);
        return () => clearInterval(timer);
    }, []);


```

---

## 4. useMemo

`useMemo` **recuerda el resultado de un cálculo** para no tener que repetirlo en cada renderizado. Esta técnica se llama *memoización*. Es útil para operaciones lentas, como filtrar una lista enorme o hacer cálculos matemáticos complejos.

**El problema:** Sin `useMemo`, cada cálculo dentro del componente se repite en **cada** renderizado, aunque sus datos no hayan cambiado.

**La solución:** `useMemo` comprueba si las dependencias han cambiado. Si no, devuelve al instante el resultado guardado.

**Sintaxis:** `const cachedValue = useMemo(calcularValor, [dependencias]);`

```jsx

    import { useState, useMemo } from "react";

    export default function ExpensiveComponent() {
        const [count, setCount] = useState(0);
        const [darkTheme, setDarkTheme] = useState(false);

        // 1. Una función lenta a propósito
        const expensiveCalculation = (num) => {
            console.log("Calculando...");
            for (let i = 0; i < 1000000000; i++) {} // Retraso artificial
            return num * 2;
        };

        // 2. Uso de useMemo
        // El cálculo SOLO se repite cuando cambia 'count'.
        // Cambiar el tema vuelve a renderizar el componente, pero reutiliza el resultado guardado.
        const calculatedValue = useMemo(() => {
            return expensiveCalculation(count);
        }, [count]);

        return (
            <div style={{ background: darkTheme ? "#333" : "#FFF" }}>
                <h2>Resultado: {calculatedValue}</h2>
                <button onClick={() => setCount(count + 1)}>Sumar</button>
                <button onClick={() => setDarkTheme(!darkTheme)}>Cambiar tema</button>
            </div>
        );
    }


```

**Error habitual:** no incluir en el array de dependencias un valor que usa el cálculo. `useMemo` sigue devolviendo el resultado antiguo aunque los datos hayan cambiado.

```jsx

    // ❌ INCORRECTO: el resultado usa 'filter', pero no es una dependencia, así que la lista nunca se actualiza
    const visibleItems = useMemo(() => {
        return items.filter((item) => item.includes(filter));
    }, [items]);

    // ✅ CORRECTO: están todos los valores que se usan dentro
    const visibleItems = useMemo(() => {
        return items.filter((item) => item.includes(filter));
    }, [items, filter]);


```

*Consejo: `useMemo` es una optimización. Úsalo solo para cálculos realmente lentos; en los sencillos añade complejidad sin ningún beneficio.*

---

## 5. useCallback

`useCallback` funciona como `useMemo`, pero en lugar de recordar un valor, **recuerda una función**.

En JavaScript, cada vez que un componente se renderiza, todas las funciones definidas dentro se vuelven a crear como funciones nuevas. Normalmente no importa, pero puede dar problemas cuando:

1. Pasas la función como prop a un componente hijo optimizado con `memo` (un hijo que solo se vuelve a renderizar si cambian sus props). Una función nueva cuenta como una prop distinta, así que la optimización deja de funcionar.

2. La función está en el array de dependencias de un `useEffect`, que entonces se ejecutaría en cada renderizado.

**Sintaxis:** `const cachedFn = useCallback(fn, [dependencias]);`

En este ejemplo, `ChildButton` solo se vuelve a renderizar cuando cambian sus props. Sin `useCallback`, `handleClick` sería una función nueva en cada renderizado del padre, obligando al hijo a renderizarse sin motivo.

```jsx

    import { useState, useCallback, memo } from "react";

    // Un componente hijo que solo se vuelve a renderizar si cambian sus props
    const ChildButton = memo(({ onClick }) => {
        console.log("Hijo renderizado");
        return <button onClick={onClick}>Botón del hijo</button>;
    });

    export default function Parent() {
        const [count, setCount] = useState(0);

        // ❌ SIN useCallback: una función nueva en cada renderizado, así que ChildButton siempre se renderiza
        // const handleClick = () => console.log("Clic");

        // ✅ CON useCallback: React conserva la misma función entre renderizados
        const handleClick = useCallback(() => {
            console.log("Clic");
        }, []); // Array de dependencias vacío = la función nunca necesita cambiar

        return (
            <div>
                <p>Cuenta: {count}</p>
                <button onClick={() => setCount(count + 1)}>Renderizar el padre</button>

                {/* El padre se vuelve a renderizar, pero ChildButton no */}
                <ChildButton onClick={handleClick} />
            </div>
        );
    }


```

---

## 6. Reglas de los Hooks

Los Hooks son funciones de JavaScript, pero deben cumplir dos reglas:

1. **Llama a los Hooks solo en el nivel superior:** No los llames dentro de bucles, condiciones ni funciones anidadas. React identifica cada Hook por el orden en que se llama, así que ese orden debe ser exactamente el mismo en cada renderizado.

2. **Llama a los Hooks solo desde funciones de React:** Llámalos desde componentes de función o desde tus propios Hooks personalizados, nunca desde funciones normales de JavaScript.

```jsx

    // ❌ INCORRECTO
    if (userName !== '') {
        useEffect(() => { ... }); // ¡Error! El orden de los hooks podría cambiar
    }

    // ✅ CORRECTO
    useEffect(() => {
        if (userName !== '') { ... } // La lógica dentro del hook está bien
    });


```

```jsx

    // ❌ INCORRECTO: el hook se llama dentro de una función normal que se ejecuta al hacer clic
    function handleClick() {
        const [clicked, setClicked] = useState(false);
    }

    // ✅ CORRECTO: el hook se declara al principio del componente y se usa dentro de la función
    function LikeButton() {
        const [clicked, setClicked] = useState(false);

        function handleClick() {
            setClicked(true);
        }

        return <button onClick={handleClick}>{clicked ? "Te gusta" : "Me gusta"}</button>;
    }


```

```jsx

    // ❌ INCORRECTO: un return anticipado antes de un hook hace que se salte en algunos renderizados
    function Profile({ user }) {
        if (!user) return <p>Cargando...</p>;
        const [tab, setTab] = useState("posts");
    }

    // ✅ CORRECTO: primero se llaman todos los hooks y después se decide qué devolver
    function Profile({ user }) {
        const [tab, setTab] = useState("posts");
        if (!user) return <p>Cargando...</p>;
    }


```

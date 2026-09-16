---
title: "Context API en React"
---

# Context API

En React, los datos normalmente viajan de padre a hijo mediante props. Casi siempre funciona bien, pero algunos datos los necesitan muchos componentes repartidos por toda la aplicación: el idioma elegido por el usuario, el tema de color (claro u oscuro) o la información del usuario que ha iniciado sesión. Pasarlos por cada nivel se vuelve pesado enseguida.

El **Context** («contexto») permite compartir valores como estos con cualquier componente que los necesite, sin pasar props por todos los niveles intermedios. Piensa en él como una emisora de radio: un componente emite los datos y cualquier componente que esté por debajo puede sintonizarlos.

---

## Índice

<div id="content-table">

- [1. El problema del prop drilling](#1-el-problema-del-prop-drilling "¿Por qué necesitamos Context?")
- [2. Cómo funciona](#2-cómo-funciona "Las tres partes de Context")
- [3. Crear un contexto](#3-crear-un-contexto "Inicializar el objeto Context")
- [4. Proveer el contexto](#4-proveer-el-contexto "Envolver el árbol de componentes")
- [5. Consumir el contexto](#5-consumir-el-contexto "Leer los datos con useContext")

</div>

---

## 1. El problema del prop drilling

El **prop drilling** («perforar con props») ocurre cuando necesitas enviar datos desde un componente en lo alto de la aplicación hasta otro muy profundo. Los datos tienen que pasar como prop por todos los componentes intermedios, aunque esos componentes **no los usen**.

* **Sin Context**: `App` → `Layout` → `Header` → `UserInfo` (a Layout y Header no les importa el usuario, pero tienen que pasarlo).
* **Con Context**: `App` → `UserInfo` (UserInfo lee los datos directamente).

```jsx

    // ❌ INCORRECTO (prop drilling): Layout y Header solo reciben "user" para pasarlo
    function App() {
        const user = { name: "Alex" };
        return <Layout user={user} />;
    }
    function Layout({ user }) {
        return <Header user={user} />;
    }
    function Header({ user }) {
        return <UserInfo user={user} />;
    }

    // ✅ CORRECTO (context): los componentes intermedios no necesitan saber nada de "user"
    function App() {
        const user = { name: "Alex" };
        return (
            <UserContext.Provider value={user}>
                <Layout />
            </UserContext.Provider>
        );
    }
    function UserInfo() {
        const user = useContext(UserContext);
        return <p>{user.name}</p>;
    }


```

---

## 2. Cómo funciona

La Context API tiene tres partes:

1.  **El objeto Context**: La caja donde se guardan los datos compartidos.
2.  **El Provider** («proveedor»): Un componente que envuelve tu aplicación (o una parte) y «emite» los datos a todo lo que hay dentro.
3.  **El consumidor (`useContext`)**: El hook que usa un componente para leer los datos.

---

## 3. Crear un contexto

Primero se crea un objeto Context con `createContext`. Lo habitual es hacerlo en un archivo propio, para que cualquier componente pueda importarlo.

```javascript

    // ThemeContext.js
    import { createContext } from 'react';

    // 1. Crear el Context
    // El valor entre paréntesis ('light') es el valor por defecto, que solo se usa si no hay un Provider por encima
    export const ThemeContext = createContext('light');


```

**Error habitual:** crear el contexto dentro de un componente. Cada renderizado crearía un contexto nuevo y distinto, y los componentes que lo leen nunca recibirían los datos.

```jsx

    // ❌ INCORRECTO: se crea un contexto nuevo en cada renderizado de App
    function App() {
        const ThemeContext = createContext('light');
        ...
    }

    // ✅ CORRECTO: se crea una sola vez, fuera de cualquier componente, y se exporta
    export const ThemeContext = createContext('light');


```

---

## 4. Proveer el contexto

Cada objeto Context incluye un componente **Provider**. Acepta una prop `value` con los datos que se quieren compartir. Cualquier componente dentro del Provider, por muy profundo que esté, puede leer ese valor.

```jsx

    import { useState } from 'react';
    import { ThemeContext } from './ThemeContext';

    export default function App() {
        const [theme, setTheme] = useState('dark');

        return (
            // 2. Envolver los componentes con el Provider
            // Se pasa el estado actual como valor
            <ThemeContext.Provider value={theme}>
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    Cambiar tema
                </button>
                <Toolbar />
                <Footer />
            </ThemeContext.Provider>
        );
    }


```

*Nota: en este ejemplo, `Toolbar` y `Footer` no reciben `theme` como prop. Está disponible «en el aire» para cualquier componente dentro del Provider. Como el valor viene del estado, todos los componentes que lo leen se actualizan automáticamente cuando cambia el tema.*

*Desde React 19 también puedes escribir directamente `<ThemeContext value={theme}>`, sin `.Provider`. Las dos formas funcionan.*

---

## 5. Consumir el contexto

Para leer los datos dentro de un componente, usa el hook `useContext` y pásale el objeto Context.

```jsx

    import { useContext } from 'react';
    import { ThemeContext } from './ThemeContext';

    export default function Footer() {
        // 3. Leer el valor del Provider más cercano por encima
        const currentTheme = useContext(ThemeContext);

        return (
            <footer className={currentTheme}>
                <p>Tema actual: {currentTheme}</p>
            </footer>
        );
    }


```

**Error habitual:** usar un componente que lee el contexto fuera de su Provider. React no muestra ningún error: `useContext` simplemente devuelve el valor por defecto, así que el componente parece «ignorar» los cambios.

```jsx

    // ❌ INCORRECTO: Footer está fuera del Provider, así que siempre recibe 'light'
    <>
        <ThemeContext.Provider value={theme}>
            <Toolbar />
        </ThemeContext.Provider>
        <Footer />
    </>

    // ✅ CORRECTO: Footer está dentro del Provider y recibe el tema actual
    <ThemeContext.Provider value={theme}>
        <Toolbar />
        <Footer />
    </ThemeContext.Provider>


```

**¿Cuándo usar Context?** Context es potente, pero úsalo con moderación: los componentes que dependen de un contexto son más difíciles de reutilizar en otros sitios, porque solo funcionan dentro de ese Provider.

- **Usa props** para datos sencillos que pasan de un padre a sus hijos.

- **Usa Context** para datos «globales» (usuario, tema, idioma) que necesitan muchos componentes en distintos niveles.

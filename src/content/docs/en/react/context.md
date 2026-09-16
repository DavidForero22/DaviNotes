---
title: "Context API in React"
---

# Context API

In React, data normally travels from parent to child through props. That works well most of the time, but some data is needed by many components spread all over the application: the language chosen by the user, the color theme (light or dark), or the information of the logged-in user. Passing it through every level quickly becomes tedious.

**Context** lets you share values like these with any component that needs them, without passing props through every intermediate level. Think of it as a radio station: one component broadcasts the data, and any component below it can tune in.

---

## Table of Contents

<div id="content-table">

- [1. The Problem: Prop Drilling](#1-the-problem-prop-drilling "Why do we need Context?")
- [2. How it Works](#2-how-it-works "The three main steps of Context")
- [3. Creating Context](#3-creating-context "Initializing the Context object")
- [4. Providing Context](#4-providing-context "Wrapping the component tree")
- [5. Consuming Context](#5-consuming-context "Accessing data with useContext")

</div>

---

## 1. The Problem: Prop Drilling

**Prop drilling** happens when you need to send data from a component at the top of the application to one buried deep inside. The data has to be passed as a prop through every component in between, even though those components **do not use it** themselves.

* **Without Context**: `App` → `Layout` → `Header` → `UserInfo` (Layout and Header don't care about the user, but they must pass it along).
* **With Context**: `App` → `UserInfo` (UserInfo reads the data directly).

```jsx

    // ❌ WRONG (prop drilling): Layout and Header only receive "user" to pass it on
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

    // ✅ CORRECT (context): intermediate components don't need to know about "user"
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

## 2. How it Works

The Context API has three parts:

1.  **The Context object**: The box where the shared data is kept.
2.  **The Provider**: A component that wraps your application (or part of it) and "broadcasts" the data to everything inside.
3.  **The consumer (`useContext`)**: The hook a component uses to read the data.

---

## 3. Creating Context

First, create a Context object with `createContext`. It is common practice to do this in its own file, so any component can import it.

```javascript

    // ThemeContext.js
    import { createContext } from 'react';

    // 1. Create the Context
    // The value in parentheses ('light') is the default, used only when there is no Provider above
    export const ThemeContext = createContext('light');


```

**Common mistake:** creating the context inside a component. Every render would create a brand-new, different context, and the components reading it would never receive the data.

```jsx

    // ❌ WRONG: a new context is created on every render of App
    function App() {
        const ThemeContext = createContext('light');
        ...
    }

    // ✅ CORRECT: created once, outside any component, and exported
    export const ThemeContext = createContext('light');


```

---

## 4. Providing Context

Every Context object includes a **Provider** component. It accepts a `value` prop with the data to share. Any component inside the Provider, no matter how deep, can read that value.

```jsx

    import { useState } from 'react';
    import { ThemeContext } from './ThemeContext';

    export default function App() {
        const [theme, setTheme] = useState('dark');

        return (
            // 2. Wrap the components with the Provider
            // The current state is passed as the value
            <ThemeContext.Provider value={theme}>
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    Toggle theme
                </button>
                <Toolbar />
                <Footer />
            </ThemeContext.Provider>
        );
    }


```

*Note: In this example, `Toolbar` and `Footer` don't receive `theme` as a prop. It is available "in the air" for any component inside the Provider. Because the value comes from state, every component that reads it updates automatically when the theme changes.*

*Since React 19, you can also write `<ThemeContext value={theme}>` directly, without `.Provider`. Both forms work.*

---

## 5. Consuming Context

To read the data inside a component, use the `useContext` hook and pass it the Context object.

```jsx

    import { useContext } from 'react';
    import { ThemeContext } from './ThemeContext';

    export default function Footer() {
        // 3. Read the value from the nearest Provider above
        const currentTheme = useContext(ThemeContext);

        return (
            <footer className={currentTheme}>
                <p>Current Theme: {currentTheme}</p>
            </footer>
        );
    }


```

**Common mistake:** using a component that reads the context outside its Provider. React does not show any error: `useContext` simply returns the default value, so the component seems to "ignore" the changes.

```jsx

    // ❌ WRONG: Footer is outside the Provider, so it always receives 'light'
    <>
        <ThemeContext.Provider value={theme}>
            <Toolbar />
        </ThemeContext.Provider>
        <Footer />
    </>

    // ✅ CORRECT: Footer is inside the Provider and receives the current theme
    <ThemeContext.Provider value={theme}>
        <Toolbar />
        <Footer />
    </ThemeContext.Provider>


```

**When to use Context?** Context is powerful, but use it in moderation: components that depend on a context are harder to reuse elsewhere, because they only work inside that Provider.

- **Use props** for simple data passed from a parent to its children.

- **Use Context** for "global" data (user, theme, language) needed by many components at different levels.

---
title: "Hooks in React"
---

# Hooks

**Hooks** are special functions that give components extra abilities, such as remembering data between renders or running code after the component appears on screen. They were introduced in React 16.8 and are now the standard way to write React components. Their names always start with `use` (e.g., `useState`, `useEffect`).

Before Hooks, these abilities were only available in *class components*, an older and more verbose way of writing components. You may still find them in old projects, but new code uses functions and Hooks.

---

## Table of Contents

<div id="content-table">

- [1. What are Hooks?](#1-what-are-hooks "Brief overview of functional components superpowers")
- [2. useState](#2-usestate "Managing local state in functional components")
- [3. useEffect](#3-useeffect "Handling side effects like data fetching or subscriptions")
- [4. useMemo](#4-usememo "Caching expensive calculations with memoization")
- [5. useCallback](#5-usecallback "Memoizing functions to prevent unnecessary re-renders")
- [6. Rules of Hooks](#6-rules-of-hooks "Mandatory rules for using Hooks")

</div>

---

## 1. What are Hooks?

A React component is a function that runs every time the component needs to be drawn on screen (each run is called a **render**). Normal variables inside a function are lost when it finishes, so a component has no memory of its own. Hooks solve this: they connect the function to features managed by React, such as state (memory), side effects, or shared data.

**Key Characteristics**:

- **Reusable:** You can combine several Hooks into your own *custom Hooks* (functions whose name starts with `use`) to share logic between components.
- **Gradual:** You can use Hooks in new components without rewriting existing ones.
- **Functions only:** Hooks work in function components, not in class components.

---

## 2. useState

`useState` gives a component a piece of **state**: a value that React remembers between renders. When you change it, React draws the component again with the new value.

**Syntax**: `const [state, setState] = useState(initialValue);`

It returns a pair: the **current value** and a **function** to update it. By convention, the function is named `set` + the name of the value.

```jsx

    import { useState } from "react";

    export default function TextInput() {
        // Declare a state variable called "text", starting with "Hello"
        const [text, setText] = useState("Hello");

        return (
            <div>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)} // Save each change in the state
                />
                <p>You typed: {text}</p>
            </div>
        );
    }


```

**Common mistake:** modifying an object or list stored in state directly. React compares the old and new values; if you change the same object, it looks identical and the screen does not update. Always create a **new** object or list.

```jsx

    const [user, setUser] = useState({ name: "Alex", age: 30 });

    // ❌ WRONG: the same object is changed, React does not detect it
    user.age = 31;
    setUser(user);

    // ✅ CORRECT: a new object is created by copying the old one (...user) and changing age
    setUser({ ...user, age: 31 });


```

---

## 3. useEffect

`useEffect` lets you run code **after** the component has been drawn on screen. It is used for **side effects**: actions that reach outside the component, such as loading data from a server, starting a timer, or changing the title of the browser tab.

By default, the effect runs after the **first render** and after **every** update.

```jsx

    import { useState, useEffect } from "react";

    function PageTitle() {
        const [count, setCount] = useState(0);

        useEffect(() => {
            // Update the text of the browser tab
            document.title = `You clicked ${count} times`;
        });

        return <button onClick={() => setCount(count + 1)}>Click me</button>;
    }


```

You can tell React to run the effect only when certain values change by passing an array as the second argument. This array is called the **dependency array**.

```jsx

    useEffect(() => {
        document.title = `You clicked ${count} times`;
    }, [count]); // Only runs again when 'count' changes


```

**Common Patterns:**

- `[a, b]`: Runs after the first render AND whenever `a` or `b` change.

- `[]` (empty array): Runs **only once**, after the first render.

- No array: Runs after **every** render.

**Common mistake:** updating state inside an effect that has no dependency array. The state change causes a new render, the new render runs the effect again, and so on forever (an *infinite loop*).

```jsx

    // ❌ WRONG: effect -> setUsers -> render -> effect -> setUsers -> ...
    useEffect(() => {
        fetch("/api/users")
            .then((response) => response.json())
            .then((data) => setUsers(data));
    });

    // ✅ CORRECT: the empty array makes it run only once, when the component appears
    useEffect(() => {
        fetch("/api/users")
            .then((response) => response.json())
            .then((data) => setUsers(data));
    }, []);


```

Some effects need to be **cleaned up** when the component disappears from the screen, such as stopping a timer or closing a connection. Otherwise they keep running in the background, wasting memory. To do this, return a function from the effect: React will run it when the component is removed.

```jsx

    useEffect(() => {
        const timer = setInterval(() => {
            console.log("Tick...");
        }, 1000);

        // Cleanup function: runs when the component is removed
        return () => {
            clearInterval(timer);
            console.log("Timer cleared");
        };
    }, []);


```

```jsx

    // ❌ WRONG: the timer keeps running after the component disappears
    useEffect(() => {
        setInterval(() => console.log("Tick..."), 1000);
    }, []);

    // ✅ CORRECT: the cleanup function stops the timer
    useEffect(() => {
        const timer = setInterval(() => console.log("Tick..."), 1000);
        return () => clearInterval(timer);
    }, []);


```

---

## 4. useMemo

`useMemo` **remembers the result of a calculation** so it does not have to be repeated on every render. This technique is called *memoization*. It is useful for slow operations, such as filtering a huge list or complex mathematical calculations.

**The Problem:** Without `useMemo`, every calculation inside the component runs again on **every** render, even if its data has not changed.

**The Solution:** `useMemo` checks whether the dependencies have changed. If they have not, it returns the saved result immediately.

**Syntax:** `const cachedValue = useMemo(calculateValue, [dependencies]);`

```jsx

    import { useState, useMemo } from "react";

    export default function ExpensiveComponent() {
        const [count, setCount] = useState(0);
        const [darkTheme, setDarkTheme] = useState(false);

        // 1. A deliberately slow function
        const expensiveCalculation = (num) => {
            console.log("Computing...");
            for (let i = 0; i < 1000000000; i++) {} // Artificial delay
            return num * 2;
        };

        // 2. Using useMemo
        // The calculation ONLY runs again when 'count' changes.
        // Changing the theme re-renders the component, but reuses the saved result.
        const calculatedValue = useMemo(() => {
            return expensiveCalculation(count);
        }, [count]);

        return (
            <div style={{ background: darkTheme ? "#333" : "#FFF" }}>
                <h2>Calculated: {calculatedValue}</h2>
                <button onClick={() => setCount(count + 1)}>Increment</button>
                <button onClick={() => setDarkTheme(!darkTheme)}>Toggle Theme</button>
            </div>
        );
    }


```

**Common mistake:** leaving out a value that the calculation uses from the dependency array. `useMemo` keeps returning the old result even though the data has changed.

```jsx

    // ❌ WRONG: the result uses 'filter', but it is not a dependency, so the list never updates
    const visibleItems = useMemo(() => {
        return items.filter((item) => item.includes(filter));
    }, [items]);

    // ✅ CORRECT: every value used inside is listed
    const visibleItems = useMemo(() => {
        return items.filter((item) => item.includes(filter));
    }, [items, filter]);


```

*Tip: `useMemo` is an optimization. Use it only for calculations that are actually slow; for simple ones it adds complexity without any benefit.*

---

## 5. useCallback

`useCallback` works like `useMemo`, but instead of remembering a value, it **remembers a function**.

In JavaScript, every time a component renders, all the functions defined inside it are created again as brand-new functions. Usually that does not matter, but it can cause problems when:

1. You pass the function as a prop to a child component optimized with `memo` (a child that only re-renders when its props change). A new function counts as a changed prop, so the optimization stops working.

2. The function is listed in the dependency array of a `useEffect`, which would then run on every render.

**Syntax:** `const cachedFn = useCallback(fn, [dependencies]);`

In this example, `ChildButton` only re-renders when its props change. Without `useCallback`, `handleClick` would be a new function on every render of the parent, forcing the child to re-render for no reason.

```jsx

    import { useState, useCallback, memo } from "react";

    // A child component that only re-renders when its props change
    const ChildButton = memo(({ onClick }) => {
        console.log("Child rendered");
        return <button onClick={onClick}>Click Child</button>;
    });

    export default function Parent() {
        const [count, setCount] = useState(0);

        // ❌ WITHOUT useCallback: a new function on every render, so ChildButton always re-renders
        // const handleClick = () => console.log("Clicked");

        // ✅ WITH useCallback: React keeps the same function between renders
        const handleClick = useCallback(() => {
            console.log("Clicked");
        }, []); // Empty dependency array = the function never needs to change

        return (
            <div>
                <p>Count: {count}</p>
                <button onClick={() => setCount(count + 1)}>Re-render Parent</button>

                {/* The parent re-renders, but ChildButton does not */}
                <ChildButton onClick={handleClick} />
            </div>
        );
    }


```

---

## 6. Rules of Hooks

Hooks are JavaScript functions, but they must follow two rules:

1. **Only call Hooks at the top level:** Don't call Hooks inside loops, conditions or nested functions. React identifies each Hook by the order in which it is called, so that order must be exactly the same on every render.

2. **Only call Hooks from React functions:** Call them from function components or from your own custom Hooks, never from regular JavaScript functions.

```jsx

    // ❌ WRONG
    if (userName !== '') {
        useEffect(() => { ... }); // Error! Order of hooks might change
    }

    // ✅ CORRECT
    useEffect(() => {
        if (userName !== '') { ... } // Logic inside the hook is fine
    });


```

```jsx

    // ❌ WRONG: the hook is called inside a regular function that runs on click
    function handleClick() {
        const [clicked, setClicked] = useState(false);
    }

    // ✅ CORRECT: declare the hook at the top of the component and use it inside the function
    function LikeButton() {
        const [clicked, setClicked] = useState(false);

        function handleClick() {
            setClicked(true);
        }

        return <button onClick={handleClick}>{clicked ? "Liked" : "Like"}</button>;
    }


```

```jsx

    // ❌ WRONG: an early return before a hook means it is skipped on some renders
    function Profile({ user }) {
        if (!user) return <p>Loading...</p>;
        const [tab, setTab] = useState("posts");
    }

    // ✅ CORRECT: call every hook first, then decide what to return
    function Profile({ user }) {
        const [tab, setTab] = useState("posts");
        if (!user) return <p>Loading...</p>;
    }


```

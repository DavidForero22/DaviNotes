---
title: "React Fundamentals"
---

# Fundamentals

React is a JavaScript library for building user interfaces out of **components**: independent, reusable pieces of the screen, such as a button, a product card or a whole menu. You build small components and combine them like building blocks to create complete pages.

To make components dynamic and interactive, React uses two kinds of data: **props** and **state**.

- **Props** are data that a component *receives* from the component that contains it, like the arguments of a function.
- **State** is data that a component *creates and manages itself*, like its own memory. When state changes, React automatically updates what is shown on screen.

Understanding the difference between them is essential, because it defines how data moves through your application.

---

## Table of Contents

<div id="content-table">

- [1. JSX Fundamentals](#1-jsx-fundamentals "Structure, Lists, and Events")
- [2. Props](#2-props "Passing data from parent to child")
- [3. State](#3-state "Managing changing data within a component")
- [4. One-Way Data Flow](#4-one-way-data-flow "Understanding the direction of data")

</div>

---

## 1. JSX Fundamentals

**JSX** (JavaScript XML) is the syntax you will use to describe what each component shows. It lets you write something that looks like HTML directly inside JavaScript code. It looks familiar, but it has a few rules of its own.

In React, a component is simply a JavaScript function that returns JSX.

### A) The Structure Rules
1.  **Single Parent:** A component must return a single element that wraps everything else. If you don't want an extra `<div>`, use a **Fragment** (`<>...</>`), an invisible wrapper.
2.  **camelCase Attributes:** Since `class` is a reserved word in JavaScript, use `className` instead. Events are also written in camelCase (`onClick` instead of `onclick`).
3.  **Closing Tags:** Every tag must be closed, including those that have no content (`<img />`, `<br />`).
4.  **Curly Braces:** Anything between `{}` is evaluated as JavaScript, so you can insert variables or calculations into the markup.

```jsx

    // A simple component showing dynamic data
    export default function UserCard() {
        const username = "Alex";
        const isActive = true;

        return (
            <div className="card">
                {/* Curly braces {} insert the value of a JavaScript variable */}
                <h2>Welcome, {username}</h2>
                
                {/* Choose a text with the ternary operator: condition ? ifTrue : ifFalse */}
                <p>Status: {isActive ? "Online" : "Offline"}</p>
            </div>
        );
    }


```

```jsx

    // ❌ WRONG: two elements side by side without a wrapper, and "class" instead of "className"
    return (
        <h1 class="title">Hello</h1>
        <p>Welcome</p>
    );

    // ✅ CORRECT: a Fragment wraps both elements and className is used
    return (
        <>
            <h1 className="title">Hello</h1>
            <p>Welcome</p>
        </>
    );


```

### B) Rendering Lists
To show a list, React uses the array method `.map()`, which turns each item of the data into an element. Each element must have a `key` prop with a unique value, so React can tell the items apart when the list changes.

```jsx

    const fruits = [
        { id: 1, name: "Apple" },
        { id: 2, name: "Banana" },
        { id: 3, name: "Orange" },
    ];

    return (
        <ul>
            {fruits.map((fruit) => (
                <li key={fruit.id}>{fruit.name}</li>
            ))}
        </ul>
    );


```

**Common mistake:** using the position in the list (`index`) as the `key` when items can be added, removed or reordered. React may then mix up which item is which, for example leaving a ticked checkbox on the wrong row.

```jsx

    // ❌ WRONG: the index changes when an item is removed or reordered
    {fruits.map((fruit, index) => (
        <li key={index}>{fruit.name}</li>
    ))}

    // ✅ CORRECT: a stable, unique identifier from the data
    {fruits.map((fruit) => (
        <li key={fruit.id}>{fruit.name}</li>
    ))}


```

### C) Handling Events
In HTML you write the code to run as text (`onclick="doSomething()"`). In React, you pass the **function itself** between curly braces.

```jsx

    function Button() {
        const handleClick = () => alert("Clicked!");

        return (
            <button onClick={handleClick}>Click Me</button>
        );
    }


```

```jsx

    // ❌ WRONG: the parentheses run handleClick immediately, while the page is drawn
    <button onClick={handleClick()}>Click Me</button>

    // ✅ CORRECT: pass the function; React will run it when the button is clicked
    <button onClick={handleClick}>Click Me</button>

    // ✅ CORRECT: if you need to pass arguments, wrap it in an arrow function
    <button onClick={() => deleteItem(3)}>Delete</button>


```

---

## 2. Props

Short for "properties", **props** are the way a parent component passes data down to a child component. They make components reusable: the same component can show different content depending on the props it receives, just as the same function returns different results with different arguments.

**Key Rule:** A component must never change its own props. They are *read-only*.

In this example, the `Welcome` component receives `name` and `role` props to display a personalized card.

```jsx

    // 1. Child Component
    // { name, role } extracts those two values from the props object
    function Welcome({ name, role }) {
        return (
            <div className="card">
                <h2>Hello, {name}!</h2>
                <p>Role: {role}</p>
            </div>
        );
    }

    // 2. Parent Component
    export default function App() {
        return (
            <main>
                {/* The same component, configured with different data */}
                <Welcome name="Alice" role="Frontend Dev" />
                <Welcome name="Bob" role="Designer" />
            </main>
        );
    }


```

```jsx

    // ❌ WRONG: a component must not modify the props it receives
    function Welcome(props) {
        props.name = props.name.toUpperCase();
        return <h2>Hello, {props.name}!</h2>;
    }

    // ✅ CORRECT: create a new value from the prop instead
    function Welcome({ name }) {
        const upperName = name.toUpperCase();
        return <h2>Hello, {upperName}!</h2>;
    }


```

---

## 3. State

**State** is the internal memory of a component. Unlike props, state **can change**. When it does, React automatically *re-renders* the component: it runs the function again and updates the screen to show the new data.

To create state in a component, use `useState`. It is a **hook**: a special React function whose name starts with `use`.

*Note: Hooks are covered in depth in the next guide, but `useState` is needed here to show the concept.*

```jsx

    import { useState } from 'react';

    export default function Counter() {
        // [current value, function to change it] = useState(initial value)
        const [count, setCount] = useState(0);

        return (
            <div>
                <p>Current count: {count}</p>

                {/* Clicking calls setCount with the new value */}
                <button onClick={() => setCount(count + 1)}>
                    Increment
                </button>
            </div>
        );
    }


```

**What happens here?**

1. The component starts with `count` at `0`.

2. The user clicks the button.

3. `setCount` stores the new value.

4. React notices the change and redraws the component with the new number.

**Common mistake:** changing the state variable directly. React does not notice the change, so the screen does not update.

```jsx

    // ❌ WRONG: count changes in memory, but React does not re-render
    <button onClick={() => { count = count + 1; }}>Increment</button>

    // ✅ CORRECT: always use the setter function returned by useState
    <button onClick={() => setCount(count + 1)}>Increment</button>


```

---

## 4. One-Way Data Flow

React follows a **one-way data flow**: data only travels in one direction, **downwards**, from parent components to their children.

- **Parent to child:** Data is sent through **props**.

- **Child to parent:** Data cannot travel up directly. Instead, the parent passes a **function** to the child as a prop, and the child calls that function when something happens.

This makes it clear where each piece of data comes from and which component is allowed to change it, which makes errors much easier to find.

```jsx

    import { useState } from 'react';

    // CHILD component
    function ButtonChild({ onButtonClick }) {
        // The child does not know what the function does; it just calls it
        return (
            <button onClick={onButtonClick}>
                Click me to update Parent!
            </button>
        );
    }

    // PARENT component
    export default function Parent() {
        const [message, setMessage] = useState("Waiting...");

        // This function lives in the parent, next to the state it changes
        const handleUpdate = () => {
            setMessage("Child clicked the button!");
        };

        return (
            <div>
                <h1>Parent says: {message}</h1>
                
                {/* The FUNCTION is passed down as a prop */}
                <ButtonChild onButtonClick={handleUpdate} />
            </div>
        );
    }


```

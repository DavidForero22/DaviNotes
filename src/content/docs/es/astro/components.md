---
title: "Componentes en Astro"
---

# Componentes

Los **componentes** son las piezas básicas de un proyecto de Astro: partes reutilizables de una página, como una cabecera, una tarjeta o un botón, que escribes una vez y usas tantas veces como quieras.

Los componentes de Astro producen HTML normal. Por defecto no envían nada de JavaScript al navegador del visitante, lo que hace que las páginas carguen muy rápido. Esta es la gran diferencia con librerías como **React** o **Vue**, cuyos componentes ejecutan JavaScript en el navegador.

Los componentes de Astro se guardan en archivos con la extensión `.astro` y tienen dos partes: un **script del componente** (código JavaScript o TypeScript) y una **plantilla del componente** (el marcado parecido a HTML que se mostrará).

---

## Índice

<div id="content-table">

- [1. Estructura de un componente](#1-estructura-de-un-componente "Anatomía de un archivo .astro")
- [2. Props](#2-props "Pasar datos a los componentes")
- [3. Layouts y slots](#3-layouts-y-slots "Insertar contenido dentro de los componentes")
  - [3.1 Crear un layout](#31-crear-un-layout "Cómo crear plantillas de página reutilizables")
  - [3.2 Slots con nombre](#32-slots-con-nombre "Insertar contenido en zonas concretas de un layout")
- [4. Frameworks de interfaz](#4-frameworks-de-interfaz "Usar React, Vue o Svelte en Astro")
  - [4.1 Importar componentes](#41-importar-componentes "Cómo usar componentes de otros frameworks")
  - [4.2 Directivas de hidratación](#42-directivas-de-hidratación "Hacer que los componentes sean interactivos")

</div>

---

## 1. Estructura de un componente

Un componente de Astro se divide en dos partes mediante una **valla de código**: dos líneas de tres guiones (`---`).

```astro

    ---
    // Script del componente: se ejecuta en el servidor (o al construir el sitio)
    import SomeComponent from './SomeComponent.astro';
    const name = "Astro";
    ---
    
    <!-- Plantilla del componente: el HTML que se mostrará -->
    <div class="container">
        <SomeComponent />
        <h1>¡Hola, {name}!</h1>
    </div>


```

**Partes principales**:

- **El script del componente (entre los `---`)**: Este código se ejecuta en el servidor o al construir el sitio, nunca en el navegador del visitante. Aquí puedes importar otros componentes, cargar datos o crear variables.

- **La plantilla (debajo de la valla)**: El HTML del componente. Todo lo que va entre llaves `{}` se sustituye por el valor de una expresión de JavaScript, de forma parecida a JSX en React, pero el resultado final es HTML normal.

**Error habitual:** usar funciones del navegador (como `document` o `window`) en el script del componente. Ese código se ejecuta en el servidor, donde no hay ninguna página de navegador, así que falla. El código que debe ejecutarse en el navegador va dentro de una etiqueta `<script>` en la plantilla.

```astro

    ---
    // ❌ INCORRECTO: en el servidor no existe "document" (ReferenceError: document is not defined)
    document.title = "Mi página";
    ---

    <!-- ✅ CORRECTO: las etiquetas <script> de la plantilla se ejecutan en el navegador del visitante -->
    <script>
        document.title = "Mi página";
    </script>


```

---

## 2. Props

Las **props** (abreviatura de *properties*, «propiedades») permiten que un componente padre pase datos a un componente hijo, igual que los atributos de una etiqueta HTML. Dentro del hijo, los valores se leen del objeto `Astro.props`.

También puedes describir las props con una `interface` de TypeScript, para que tu editor de código te avise si falta una prop o tiene un tipo incorrecto.

```astro

    ---
    // Card.astro
    interface Props {
        title: string;
        description?: string; // El ? indica que esta prop es opcional
    }
    
    // Leer las props; si no se pasa descripción, se usa "Descripción por defecto"
    const { title, description = "Descripción por defecto" } = Astro.props;
    ---
    
    <div class="card">
        <h2>{title}</h2>
        <p>{description}</p>
    </div>


```

**Uso**:

```astro

    <Card title="Mi proyecto" description="Hecho con Astro" />


```

**Error habitual:** escribir el nombre de un componente en minúsculas. Las etiquetas en minúscula se tratan como elementos HTML normales, así que Astro ignora tu componente.

```astro

    ---
    import card from '../components/Card.astro';
    ---

    <!-- ❌ INCORRECTO: <card> se genera como una etiqueta HTML desconocida -->
    <card title="Mi proyecto" />

    <!-- ✅ CORRECTO: los nombres de componente empiezan por mayúscula -->
    <Card title="Mi proyecto" />


```

---

## 3. Layouts y slots

Los **layouts** («plantillas de página») son componentes de Astro que aportan una estructura común a las páginas, como la cabecera, el menú de navegación y el pie de página. Envuelves tus páginas con ellos para que toda la web tenga un aspecto coherente.

Layouts y slots trabajan juntos: el **layout** define el marco, y el **slot** («hueco») marca el lugar donde se inserta el contenido propio de cada página.

### 3.1 Crear un layout

Un layout es un componente de Astro normal, que suele guardarse en `src/layouts/`. Normalmente contiene las etiquetas `<html>`, `<head>` y `<body>`.

El elemento especial `<slot />` es un hueco reservado: cuando una página usa el layout, su contenido se inserta exactamente donde está `<slot />`.

```astro

    ---
    // src/layouts/MainLayout.astro
    const { title } = Astro.props;
    ---
    
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>{title}</title>
      </head>
      <body>
        <nav>
            <a href="/">Inicio</a>
            <a href="/about">Sobre nosotros</a>
        </nav>
    
        <main>
            <!-- Aquí aparece el contenido de cada página -->
            <slot />
        </main>
    
        <footer>
            <p>© 2025 Mi web</p>
        </footer>
      </body>
    </html>


```

Para usar un layout, impórtalo en tu página y coloca el contenido entre sus etiquetas de apertura y cierre. Todo lo que haya dentro se envía al `<slot />`.

```astro

    ---
    // src/pages/index.astro
    import MainLayout from '../layouts/MainLayout.astro';
    ---
    
    <MainLayout title="Bienvenido a Astro">
        <h1>¡Hola, mundo!</h1>
        <p>Este párrafo aparecerá dentro de la etiqueta 'main' del layout.</p>
    </MainLayout>


```

### 3.2 Slots con nombre

A veces un layout necesita recibir contenido en varios sitios distintos, no solo en uno. Por ejemplo, una página puede querer añadir su propia etiqueta `<meta>` dentro del `<head>`.

Da a cada slot un `name` para crear zonas separadas, y usa el atributo `slot` en la página para elegir adónde va cada parte.

**En el layout:**

```astro

    <head>
        <!-- Zona llamada "head" -->
        <slot name="head" />
    </head>
    <body>
        <!-- Zona por defecto: todo lo que no tenga atributo slot -->
        <slot />
    </body>


```

**En la página:**

```astro

    <MainLayout title="Página especial">
        
        <!-- Va a <slot name="head" /> -->
        <meta slot="head" name="description" content="Descripción de mi página" />
        
        <!-- Va al <slot /> por defecto -->
        <h1>Este es el contenido del cuerpo</h1>
        
    </MainLayout>


```

---

## 4. Frameworks de interfaz

Astro permite usar componentes escritos con otras librerías populares, como **React**, **Vue**, **Svelte** o **Solid**, directamente en tus páginas de Astro. Incluso puedes mezclar varias en el mismo proyecto.

### 4.1 Importar componentes

Primero, añade la integración oficial de la librería. Para React, ejecuta `npx astro add react` en la terminal. Después importa el componente en tu archivo `.astro` como cualquier otro.

```astro

    ---
    import Button from '../components/Button.jsx';
    ---
    
    <Button />


```

### 4.2 Directivas de hidratación

Por defecto, incluso los componentes de React o Vue se convierten en HTML estático sin JavaScript: se muestran, pero los clics y demás interacciones no hacen nada. Para que un componente sea interactivo, tienes que indicar a Astro que envíe su JavaScript al navegador con una **directiva de cliente**. Este proceso se llama **hidratación**: el HTML estático «cobra vida».

| Directiva | Cuándo se carga el JavaScript | Ejemplo |
| :--- | :--- | :--- |
| `client:load` | Inmediatamente, en cuanto carga la página. | `<Nav client:load />` |
| `client:idle` | Cuando el navegador ha terminado su trabajo más importante. | `<Chat client:idle />` |
| `client:visible` | Solo cuando el componente aparece en pantalla al hacer scroll. | `<Carousel client:visible />` |

```astro

    ---
    import Counter from '../components/Counter.jsx';
    ---
    
    <!-- ❌ INCORRECTO: el contador se ve, pero sus botones no hacen nada -->
    <Counter />

    <!-- ✅ CORRECTO: la directiva envía el JavaScript y los botones funcionan -->
    <Counter client:load />


```

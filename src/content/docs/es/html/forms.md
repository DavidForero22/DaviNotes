---
title: "Formularios en HTML"
---

# Formularios

Los formularios son la forma principal de recoger información de las personas que visitan una web. Las pantallas de inicio de sesión, las barras de búsqueda, las páginas de contacto y las de pago son formularios. Permiten que el **cliente** (el navegador del dispositivo del visitante) envíe datos al **servidor** (el ordenador donde vive la web y donde se procesan esos datos).

Crear un formulario implica dos cosas: crear los controles con los que interactúa la gente (cajas de texto, casillas, botones...) y definir cómo y adónde se envían los datos al enviarlo.

---

## Índice

<div id="content-table">

- [1. El elemento form](#1-el-elemento-form "Los atributos action y method")
- [2. Tipos de campo](#2-tipos-de-campo "Campos habituales como texto, contraseña y email")
  - [2.1 Tipos de botón](#21-tipos-de-botón "Diferencia entre submit, button y reset")
- [3. Etiquetas y accesibilidad](#3-etiquetas-y-accesibilidad "Vincular etiquetas a los campos para lectores de pantalla")
- [4. Validación básica](#4-validación-básica "Usar atributos de HTML para imponer reglas")

</div>

---

## 1. El elemento form

El elemento `<form>` es un contenedor para todos los controles de un formulario. Define **adónde** van los datos y **cómo** se envían.

```html

    <form action="/submit-data" method="POST">
        <!-- Aquí van los controles del formulario -->
    </form>


```

**Atributos principales:**

- `action`: La dirección (URL) a la que se enviarán los datos para procesarlos.

- `method`: La forma de enviar los datos. Las dos opciones son métodos HTTP, los «verbos» que usan los navegadores para hablar con los servidores:

    - `GET`: Añade los datos al final de la URL (por ejemplo, `/search?q=zapatos`). Es útil para búsquedas porque el resultado se puede guardar en favoritos o compartir, pero nunca lo uses para contraseñas o datos privados, porque quedarían visibles en la barra de direcciones y en el historial.

    - `POST`: Envía los datos dentro del cuerpo de la petición, así que no aparecen en la URL. Úsalo para inicios de sesión, registros y cualquier dato que cambie algo en el servidor. Ten en cuenta que POST por sí solo no cifra nada: la web también debe usar HTTPS para proteger los datos.

```html

    <!-- ❌ INCORRECTO: la contraseña aparecería en la URL: /login?password=1234 -->
    <form action="/login" method="GET">
        <input type="password" name="password">
    </form>

    <!-- ✅ CORRECTO: la contraseña viaja en el cuerpo de la petición -->
    <form action="/login" method="POST">
        <input type="password" name="password">
    </form>


```

---

## 2. Tipos de campo

El elemento `<input>` es el control más versátil: cambia por completo según su atributo `type`.

**Tipos de campo habituales:**

<table>
    <thead>
        <tr>
            <th>Tipo</th>
            <th>Descripción</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>text</td>
            <td>Un campo de texto normal de una sola línea.</td>
        </tr>
        <tr>
            <td>password</td>
            <td>Oculta los caracteres mientras se escriben (muestra puntos o asteriscos).</td>
        </tr>
        <tr>
            <td>email</td>
            <td>Comprueba que el texto tenga forma de dirección de correo. En el móvil, además, muestra un teclado con el símbolo @.</td>
        </tr>
        <tr>
            <td>number</td>
            <td>Solo acepta números.</td>
        </tr>
        <tr>
            <td>checkbox</td>
            <td>Una casilla que se puede marcar. Se pueden marcar varias a la vez.</td>
        </tr>
        <tr>
            <td>radio</td>
            <td>Un botón de opción redondo. Solo se puede elegir una opción dentro de un grupo que comparte el mismo <code>name</code>.</td>
        </tr>
        <tr>
            <td>submit</td>
            <td>Un botón que envía el formulario.</td>
        </tr>
    </tbody>
</table>

**Otros controles de formulario:**

Además de `<input>`, hay otras etiquetas para tipos de datos concretos:

- `<textarea>`: Una caja de texto de varias líneas (comentarios, biografías...).

- `<select>` y `<option>`: Un menú desplegable y cada una de sus opciones.

- `<button>`: Un botón en el que se puede hacer clic (puede enviar el formulario o ejecutar código JavaScript).

```html

    <form>
        <input type="text" name="username" placeholder="Nombre de usuario">

        <input type="password" name="password" placeholder="Contraseña">

        <select name="role">
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
        </select>

        <button type="submit">Entrar</button>
    </form>


```

El atributo `placeholder` muestra una pista en gris dentro del campo vacío.

**Nota:** El atributo `name` es imprescindible. Es la etiqueta que recibe el servidor junto a cada valor. Sin él, los datos de ese campo no se envían.

```html

    <!-- ❌ INCORRECTO: sin name, el servidor nunca recibe el email -->
    <input type="email">

    <!-- ✅ CORRECTO: el servidor recibe email=el-valor-escrito -->
    <input type="email" name="email">


```

### 2.1 Tipos de botón

El elemento `<button>` puede tener distintos valores de `type` que definen lo que hace:

<table>
  <thead>
    <tr>
      <th>Tipo</th>
      <th>Descripción</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>submit</td>
      <td>Envía los datos del formulario al servidor. Es el comportamiento por defecto de un botón dentro de un formulario si no tiene <code>type</code>.</td>
    </tr>
    <tr>
      <td>button</td>
      <td>Un botón genérico que no hace nada por sí solo. Normalmente se combina con JavaScript.</td>
    </tr>
    <tr>
      <td>reset</td>
      <td>Devuelve todos los campos del formulario a su valor inicial.</td>
    </tr>
  </tbody>
</table>

**Ejemplo:**

```html

    <form id="myForm">
        <input type="text" name="username" placeholder="Usuario">

        <!-- Botón de envío: manda el usuario -->
        <button type="submit">Enviar</button>

        <!-- Botón de reinicio: vacía el campo de usuario -->
        <button type="reset">Borrar</button>

        <!-- Botón genérico: ejecuta JavaScript y no envía nada -->
        <button type="button" onclick="alert('¡Clic!')">Haz clic</button>
    </form>


```

**Consejo:** Escribe siempre `type="button"` en los botones que no deban enviar el formulario. Un `<button>` sin tipo dentro de un formulario actúa como `submit`, y puede enviarlo por accidente.

```html

    <form action="/checkout" method="POST">
        <!-- ❌ INCORRECTO: sin type, al pulsar «Ver detalles» también se envía el formulario -->
        <button onclick="showDetails()">Ver detalles</button>

        <!-- ✅ CORRECTO: este botón solo ejecuta la función de JavaScript -->
        <button type="button" onclick="showDetails()">Ver detalles</button>
    </form>


```

---

## 3. Etiquetas y accesibilidad

Cada campo de un formulario debería tener un `<label>`: el texto visible que explica qué hay que escribir. Es importante por dos motivos:

- **Accesibilidad:** los lectores de pantalla leen la etiqueta en voz alta cuando se selecciona el campo.
- **Usabilidad:** al hacer clic en la etiqueta, el cursor se coloca en el campo, lo que facilita mucho usar controles pequeños como las casillas.

Se conectan dando al campo un `id` y escribiendo ese mismo valor en el atributo `for` de la etiqueta.

```html

    <!-- ❌ INCORRECTO: el texto no está conectado con el campo -->
    <p>Correo electrónico:</p>
    <input type="email" name="email">

    <!-- ✅ CORRECTO: for="user-email" apunta a id="user-email" -->
    <label for="user-email">Correo electrónico:</label>
    <input type="email" id="user-email" name="email">


```

---

## 4. Validación básica

HTML incluye atributos de validación que permiten al navegador detectar errores antes incluso de enviar los datos al servidor:

- `required`: El campo no puede quedar vacío.

- `minlength` / `maxlength`: El número mínimo y máximo de caracteres permitidos.

- `min` / `max`: El número más pequeño y más grande permitido.

- `pattern`: Una regla personalizada escrita como *expresión regular* (un código corto que describe un formato de texto, como «exactamente 5 dígitos»: `[0-9]{5}`).

```html

    <form action="/signup" method="POST">
        <label for="age">Edad (18+):</label>
        <input 
            type="number" 
            id="age" 
            name="age" 
            min="18" 
            max="99" 
            required
        >

        <label for="zip">Código postal:</label>
        <input type="text" id="zip" name="zip" pattern="[0-9]{5}">
        
        <button type="submit">Verificar</button>
    </form>


```

Si el usuario escribe `15` o deja la edad vacía, el navegador bloquea el envío y muestra un mensaje de error.

**Importante:** La validación de HTML es una comodidad para el usuario, no una medida de seguridad. Cualquiera con algunos conocimientos técnicos puede saltársela, así que el servidor siempre debe volver a comprobar los datos.

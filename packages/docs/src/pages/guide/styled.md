# Styled

Customize every CSS variable the components are built on, from colors and radius to motion.

## No CSS Framework

Just import this stylesheet globally.

```js
// main.js
import 'pxd/styles.css'
```

## Use TailwindCSS@4

```css
/* src/styles/global.css */
@import 'tailwindcss';
@import 'pxd/tw.css';
```

## Custom variables

```css
/* src/styles/global.css */

:root {
  /* Modify the primary color of the component, such as button/input */
  --primary: 211, 100%, 42%;

  /* Modify border-radius for all components */
  --radius: 0.5rem;
  /* Modify transition duration for all components */
  --duration: 0.2s;
  /* Modify transition timing-function for all components */
  --timing-function: ease-out;
}
```

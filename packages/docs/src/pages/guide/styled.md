# Styled

Completely customize your app on a visual level

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

/* add pxd styles */
@import '../../node_modules/pxd/dist/styles/tw.css';
@source "../../node_modules/pxd";
```

## Custom

```css
/* src/styles/global.css */

:root {
  /* Modify the primary color of the component, such as button/input */
  --primary: 211, 100%, 42%;

  /* Modify transition duration for all components */
  --default-transition-duration: 500ms;
  --default-transition-timing-function: ease;
}
```

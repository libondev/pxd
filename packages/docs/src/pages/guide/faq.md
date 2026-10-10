# FAQ

Common problems when using PXD across Vue versions, bundlers and style setups, with their fixes.

## Failed to resolve import "xxx" from xxx

Strict package managers such as pnpm do not hoist dependencies of `pxd`. Add a `.npmrc` to the project root and reinstall:

```
shamefully-hoist=true
```

## camelCase events do not fire in Vue 2

Vue 2 treats `camelCase` and `kebab-case` listeners as different events, and emits are conventionally written in kebab-case. Switch to the kebab-case form when a listener does not fire:

```html
<!-- Vue 2 only -->

<!-- Bad (doesn't work) -->
<Test @cellClick="handleCellClick" />

<!-- Good (works) -->
<Test @cell-click="handleCellClick" />
```

## No loader is configured for ".vue" files

Triggered by imports such as:

```js
import AccessibilityIcon from '@gdsicon/vue/accessibility'
```

`@gdsicon/vue` publishes raw `.vue` sources, and Vite does not pre-bundle `.vue` files imported from JavaScript inside a dependency. Exclude it from dependency optimization:

```js
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    exclude: ['@gdsicon/vue'],
  },
})
```

## :active styles do not apply in mobile Safari

Mobile Safari skips `:active` until the document has handled a touch event — see [this explanation](https://stackoverflow.com/questions/3885018/active-pseudo-class-doesnt-work-in-mobile-safari/33681490#33681490){target="_blank"}. Attach an empty handler on `body`:

```html
<body ontouchstart=""></body>
```

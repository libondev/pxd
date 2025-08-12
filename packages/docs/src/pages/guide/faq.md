# FAQ
Here will record some problems encountered in the process of use. If you have no clue after finding the problems, you can come here and have a look.

## Use camelCase style in Vue2 but the event doesn't take effect?

Because the events in vue2 distinguish between camelCase and kebab-case style, but the common style in vue2 is kebab-case style, please use the form of @kebab-case when the events do not take effect.

```html
<!-- Vue2 only -->

<!-- Bad (does't work) -->
<PActiveGraph @cellClick="handleCellClick" />

<!-- Good (it works) -->
<PActiveGraph @cell-click="handleCellClick" />
```

## No loader is configured for ".wue" files
e.g.:
```js
import XxxIcon from "@gdsicon/vue/xxx"
```

This is because the source file provided by the logo library has a suffix of `. vue`, and vite will not read the `. vue` file imported by js in the child dependency by default.

The solution is to set `optimizeDeps.exclude` in vite.config:

```js
import { defineConfig } from "vite"

export default defineConfig({
  optimizeDeps: {
    exclude: ["@gdsicon/vue"],
  },
})
```

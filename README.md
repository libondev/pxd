# PXD
A library of Vue3 components based on radix-vue and unocss. Everything is just right.

> [!IMPORTANT]
> The library is still under development and may undergo major changes at any time.

![](./res/preview.png)

## Install

```bash
pnpm i pxd
```

## Usage

### Auto import

```js
// vite.config.js
import { defineConfig } from 'vite'
import VueComponents from 'unplugin-vue-components/vite'
import PxResolver from 'pxd/resolver'

export default defineConfig({
  plugins: [
    VueComponents({
      resolvers: [
        PxResolver({ ...options })
      ]
    })
  ]
})
```

#### Resolver Options
```ts
interface ResolverOptions {
  namespace: string
}
```
You can specify automatically imported component name prefixes by passing in the namespace parameter, such as:
```js
// vite.config.ts
{
  plugins: [
    VueComponents({
      resolvers: [
        resolver({ namespace: 'v' })
      ]
    })
  ]
}
```

```html
<!-- App.vue -->
<template>
  <!-- `px-button` -> `v-button` -->
  <v-button>Button</v-button>
</template>
```

### Global import
We strongly recommend using automatic import because it can significantly reduce the package size.

## Import Directly

```js
import Button from 'pxd/components/button/index.js'

// All components only need to import this style file.
import 'pxd/styles.css'
```

## Acknowledgement
rankings are in no particular order, they are all very important to this project.

- animate: https://animated-unocss.elonehoo.me/
- unocss: https://unocss.dev/
- radix-vue: https://www.radix-vue.com/
- vite: https://vitejs.dev/
- shadcn-ui: https://github.com/shadcn-ui/ui
- iconify: https://iconify.design/

# PXD
Vue component library based on radix-vue and geist design system. Everything is just right.

> [!IMPORTANT]
> The library is still under development and may undergo major changes at any time.

> [!IMPORTANT]
> This is a COMMUNITY PROJECT, not associated with Vercel, originating from [Vercel design system](https://vercel.com/geist/introduction). Did not strictly follow its implementation, and added some personal ideas.

## Install

```bash
pnpm i pxd
```

## Usage

### Styles
```js
// tailwind.config.js

export default {
  content: [
    './src/**/*.{ts,tsx,vue}',
    './node_modules/pxd/dist/components/**/*.js',
  ]
}
```

### vars.css

```js
// main.ts
import 'pxd/vars.css'
```

### Auto import

```js
// vite.config.js
import PxResolver from 'pxd/resolver'
import VueComponents from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    VueComponents({
      resolvers: [
        PxResolver()
      ]
    })
  ]
})
```

### Global import
We strongly recommend using automatic import because it can significantly reduce the package size.

## Manual Import
```js
// main.ts

// All components only need to import this style file.
import 'pxd/vars.css'
```

```vue
<script setup>
import Button from 'pxd/components/button/index.js'
</script>

<template>
  <Button>
    Button
  </Button>
</template>
```

## Acknowledgement
rankings are in no particular order, they are all very important to this project.

- Vite: https://vitejs.dev/
- Iconify: https://iconify.design/
- Geist Design System: https://vercel.com/geist/introduction

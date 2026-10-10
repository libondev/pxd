# Installation Icon

?> Icons are optional — PXD itself does not depend on an icon set.

[@gdsicon/vue](https://www.npmjs.com/package/@gdsicon/vue){target="_blank"} is maintained alongside PXD and shares its visual language; install it if you want consistent iconography.

## Install

<div class="h-5 w-max min-w-20 bg-gray-100 rounded-[3px]">

[![](https://img.shields.io/npm/v/@gdsicon/vue.svg)](https://www.npmjs.com/package/@gdsicon/vue){target="_blank"}

</div>

```bash
pnpm install @gdsicon/vue
```

There is deliberately no global registration option: it would pull every icon into the bundle.

## Import on demand

```html
<script setup>
  import AccessibilityIcon from '@gdsicon/vue/accessibility'
  // or
  // import { AccessibilityIcon } from '@gdsicon/vue'
</script>

<template>
  <AccessibilityIcon />
</template>
```

## Import automatically

Use [`unplugin-vue-components`](https://github.com/unplugin/unplugin-vue-components) to simplify the import process.

```bash
pnpm install -D unplugin-vue-components
```

```js
// vite.config.ts
import { defineConfig } from 'vite'
import Components from 'unplugin-vue-components/vite'
import GdsiResolver from '@gdsicon/vue/resolver'

export default defineConfig({
  plugins: [
    Components({
      resolvers: [
        // You can also specify other prefixes yourself,
        //  which will be used as an identification mark during automatic import.
        GdsiResolver({ prefix: 'IGds' }),
      ],
    }),
  ],
})
```

Icons then resolve on first use

```html
<template>
  <IGdsAccessibility />
</template>
```

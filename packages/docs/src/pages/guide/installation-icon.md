# Installation Icon

?> This is not necessary.

We also maintain an unofficial icon library, which provides a lot of beautiful icons. If you want to keep it consistent throughout the project, you can use the same icon.

## Install

<div class="h-5 w-max min-w-20 bg-gray-100 rounded-[3px]">

[![](https://img.shields.io/npm/v/@gdsicon/vue.svg)](https://www.npmjs.com/package/@gdsicon/vue){target="_blank"}

</div>

```bash
pnpm install @gdsicon/vue
```

For better performance, we do not recommend registering the entire icon globally, so we do not provide the option of global registration.

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

Use it directly without having to import it manually

```html
<template>
  <IGdsAccessibility />
</template>
```

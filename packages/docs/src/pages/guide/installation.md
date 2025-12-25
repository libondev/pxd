# Installation

Although pxd projects are written in [tailwindcss@4](https://tailwindcss.com/){target="_blank"}, we still provide a native way to help those projects that do not use tailwindcss access.

The adaptation of unocss/tailwindcss@3 will be completed later.

## Install

<div class="h-5 w-max min-w-22 bg-gray-100 rounded-[3px]">

![](https://img.shields.io/npm/v/pxd.svg)
</div>

```bash
npm install pxd
```

### For vue2.7+
Since the defineOptions macro is not currently supported in vue2, you need to install an additional plugin.

```bash
npm install unplugin-vue-define-options@1.5.5
```

Then enable this plugin in vite/rsbuild

`vite.config.ts`
```js
import { defineConfig } from 'vite'
import defineOptions from 'unplugin-vue-define-options/vite'

export default defineConfig({
  plugins: [
    defineOptions(),
  ]
})
```

`rsbuild.config.ts`

```js
import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import defineOptions from 'unplugin-vue-define-options/rspack'

export default defineConfig({
  plugins: [pluginVue()],
  tools: {
    rspack: {
      plugins: [
        defineOptions()
      ]
    }
  }
});
```

## Styles

### Native CSS
Just import this stylesheet globally.
```js
// main.js
import 'pxd/styles.css'
```

### Tailwindcss@4

```css
/* src/styles/global.css */
@import "tailwindcss";

/* add pxd styles */
@import "../../node_modules/pxd/dist/styles/tw.css";
@source "../../node_modules/pxd";
```

## Usage
You can register globally or import on demand, or import automatically.

### Global Import
You can register all the components to the global at one time, but this may lead to a larger volume after your construction.

```js
import PXD from 'pxd'
import { createApp } from 'vue'

const app = createApp()

app.use(PXD)
```

```html
<template>
  <PButton>Click me</PButton>
</template>
```

#### Volar support
If you are using Volar, you can specify global component types by configuring `compilerOptions.types` in `tsconfig.json`, for better type hints.

```json
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "types": ["pxd/volar"]
  }
}
```

### Import on demand
Only use the components you need to avoid being too big after packaging.

```html
<script setup>
import Button from 'pxd/components/button'
</script>

<template>
  <Button>
    Click me
  </Button>
</template>
```

### Import automatically
Use `unplugin-vue-components` to simplify the import process.

```js
// vite.config.js

import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import PxdResolver from 'pxd/resolver'

export default defineConfig({
  plugins: [
    Vue(),
    Components({
      resolvers: [
        PxdResolver(),
      ],
    }),
  ],
})
```

Then you can focus on the business logic itself.

```html
<template>
  <PButton>
    Click me
  </PButton>
</template>
```

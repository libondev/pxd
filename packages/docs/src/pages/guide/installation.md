# Installation

Although pxd projects are written in [tailwindcss@4](https://tailwindcss.com/){target="_blank"}, we still provide a native way to help those projects that do not use tailwindcss access.

The adaptation of unocss/tailwindcss@3 will be completed later.

## Install

<div class="h-5">

![](https://img.shields.io/npm/v/pxd.svg)
</div>

```bash
npm install pxd
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

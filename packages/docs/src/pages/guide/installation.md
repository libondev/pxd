# Installation
This project is deeply bound with [tailwindcss@4](https://tailwindcss.com/), so please make sure tailwindcss@4 is installed in the project for the best effect.

At present, tailwindcss is the fastest solution on the market, but we still have plans to support other solutions, even native CSS.

## Install

<div class="h-5">

![](https://img.shields.io/npm/v/pxd.svg)
</div>

```bash
npm install pxd
```

## Styles
Just this is enough.

```css
/* src/styles/index.css */
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

### Import on demand
Only import the components you use to avoid the problem of large file size.

```html
<script setup>
import { Button } from 'pxd'
// OR
import Button from 'pxd/components/button'
</script>

<template>
  <Button>
    Click me
  </Button>
</template>
```

### Import automatically
Use `unpluggin-vue-components' to simplify the import process.

```js
// vite.config.js

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import components from 'unplugin-vue-components/vite'
import pxdResolver from 'pxd/resolver'

export default defineConfig({
  plugins: [
    vue(),
    components({
      resolvers: [
        pxdResolver(),
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

# Installation

PXD itself is styled with [Tailwind CSS 4](https://tailwindcss.com/){target="_blank"}, but the compiled stylesheet also works in projects without any CSS framework.

?> Presets for Tailwind CSS 3 and UnoCSS are not available yet.

## Setup style

See <RouterLink to="/guide/styled">Styled</RouterLink> for style setting.

## Install

<div class="h-5 w-max min-w-22 bg-gray-100 rounded-[3px]">

[![](https://img.shields.io/npm/v/pxd.svg)](https://www.npmjs.com/package/pxd){target="_blank"}

</div>

```bash
pnpm install pxd
```

## Global Import

Registering the whole library in your entry file is the shortest setup, at the cost of pulling every component into the bundle.

```js
// main.js
import { createApp } from 'vue'
import PXD from 'pxd'
import App from './App.vue'

createApp(App).use(PXD).mount('#app')
```

```html
<template>
  <PButton>Click me</PButton>
</template>
```

## Import on demand

Importing components one by one keeps the bundle tree-shakeable.

```html
<script setup>
  import Button from 'pxd/components/button'
  // or
  // import { Button } from 'pxd'
</script>

<template>
  <Button>Click me</Button>
</template>
```

## Import automatically

Let [`unplugin-vue-components`](https://github.com/unplugin/unplugin-vue-components) resolve components for you with the bundled resolver.

```bash
pnpm install -D unplugin-vue-components
```

```js
// vite.config.ts
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import PxdResolver from 'pxd/resolver'

export default defineConfig({
  plugins: [
    Vue(),
    Components({
      resolvers: [PxdResolver()],
    }),
  ],
})
```

```html
<template>
  <PButton> Click me </PButton>
</template>
```

## Volar support

Register the global component types in `tsconfig.json` to get completions for `P`-prefixed components without importing them.

```json
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "types": ["pxd/volar"]
  }
}
```

If the types still do not apply, disable tsgo in the workspace:

```json
// .vscode/settings.json
{
  "typescript.experimental.useTsgo": false
}
```

## Vue 2.7

Vue 2.7 cannot compile the `defineOptions()` macro, so it needs the transform plugin.

```bash
pnpm install -D unplugin-vue-define-options@1.5.5
```

Then enable it in Vite or Rsbuild:

```js
// vite.config.ts
import { defineConfig } from 'vite'
import defineOptions from 'unplugin-vue-define-options/vite'

export default defineConfig({
  plugins: [defineOptions()],
})
```

```js
// rsbuild.config.ts
import { defineConfig } from '@rsbuild/core'
import { pluginVue } from '@rsbuild/plugin-vue'
import defineOptions from 'unplugin-vue-define-options/rspack'

export default defineConfig({
  plugins: [pluginVue()],
  tools: {
    rspack: {
      plugins: [defineOptions()],
    },
  },
})
```

# Installation

Although pxd projects are written in [tailwindcss@4](https://tailwindcss.com/){target="_blank"}, we still provide a native way to help those projects that do not use tailwindcss access.

The adaptation of unocss/tailwindcss@3 will be completed later.

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

## Import on demand

Only use the components you need to avoid being too big after packaging.

```html
<script setup>
  import Button from 'pxd/components/button'
  // or
  // import { Button } from 'pxd'
</script>

<template>
  <button>Click me</button>
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

Then you can focus on the business logic itself.

```html
<template>
  <PButton> Click me </PButton>
</template>
```

## Volar support

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

If it still has no effect, you may need to disable tsgo in the current workspace:

```json
// .vscode/settings.json
{
  "typescript.experimental.useTsgo": false
}
```

## For vue2.7+

Since the defineOptions macro is not currently supported in vue2, you need to install an additional plugin.

```bash
pnpm install unplugin-vue-define-options@1.5.5
```

Then enable this plugin in vite/rsbuild:

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

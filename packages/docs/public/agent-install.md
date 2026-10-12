# Install PXD

You are a coding agent. This guide tells you how to install the PXD component library into the user's project. Work through the steps in order, adapt every command to the project's package manager and bundler, and ask the user a question only where a step below explicitly says so.

PXD is a universal UI component library for Vue 2.7+ & Vue 3.2+: one codebase, no `vue-demi`, built-in light/dark themes, and components that resolve automatically through `unplugin-vue-components`.

## 1. Inspect the project

Before installing anything, check:

- The Vue version in `package.json`: 2.7, 3.2, or 3.3+
- The package manager: pnpm, npm, yarn or bun (look at the lockfile)
- The bundler: Vite, Rsbuild, webpack or something else
- The CSS setup: Tailwind CSS 4, or no CSS framework

Skip any step that is already configured. All examples below use pnpm and Vite.

## 2. Install pxd

```bash
pnpm install pxd
```

Use the project's own package manager (`npm install pxd`, `yarn add pxd`, `bun add pxd`).

## 3. Vue 2.7 / Vue 3.2 only: enable the defineOptions transform

PXD components declare their name and options with the `defineOptions()` macro, which Vue only compiles natively from 3.3. If the project runs Vue 2.7 or 3.2, install the transform plugin and register it in the bundler config. Vue 3.3+ needs nothing here.

```bash
# Vue 2.7
pnpm install -D unplugin-vue-define-options@1.5.5

# Vue 3.2
pnpm install -D unplugin-vue-define-options@3.1.2
```

```js
// vite.config.ts
import { defineConfig } from 'vite'
import defineOptions from 'unplugin-vue-define-options/vite'

export default defineConfig({
  plugins: [defineOptions()],
})
```

For Rsbuild, import from `unplugin-vue-define-options/rspack` and register it under `tools.rspack.plugins` instead.

## 4. Import the styles

Without a CSS framework, import the compiled stylesheet once in the entry file:

```js
// main.js
import 'pxd/styles.css'
```

With Tailwind CSS 4:

```css
/* src/styles/global.css */
@import 'tailwindcss';
@import 'pxd/tw.css';
```

Import that file once in the entry file as well.

## 5. Auto-import components with unplugin-vue-components

This is the recommended setup: components resolve straight from templates, no imports needed.

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

Components are used with the `P` prefix: `<PButton>`, `<PInput>`, `<PSelect>`.

Do not register the whole library globally unless the user asks for it — `app.use(PXD)` pulls every component into the bundle.

## 6. Global component types for the editor

To get completions for `P`-prefixed components without importing them:

```json
// tsconfig.json
{
  "compilerOptions": {
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

## 7. Ask about the icon library

PXD itself does not depend on an icon set. **Ask the user whether they want the companion icon library `@gdsicon/vue` installed** — it is maintained alongside PXD and shares its visual language.

If the user says yes:

```bash
pnpm install @gdsicon/vue
```

Add its resolver to the existing `unplugin-vue-components` config:

```js
// vite.config.ts
import GdsiResolver from '@gdsicon/vue/resolver'

Components({
  resolvers: [
    PxdResolver(),
    GdsiResolver({ prefix: 'IGds' }),
  ],
})
```

Icons then resolve on first use as `<IGdsAccessibility />`. Do not register icons globally — it would pull every icon into the bundle.

## 8. Verify

Run the project's build and type check, then confirm a component renders. Report what was installed, which files were changed, and which steps were skipped.

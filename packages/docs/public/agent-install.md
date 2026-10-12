# Install PXD

You are a coding agent. This guide tells you how to install the PXD component library into the user's project. Work through the steps in order, adapt every command to the project's package manager and bundler, and ask the user a question only where a step below explicitly says so.

PXD is a universal UI component library for Vue 2.7+ & Vue 3.2+: one codebase, no `vue-demi`, built-in light/dark themes, and components that resolve automatically through `unplugin-vue-components`.

One rule applies across every step: any package you install or import must be declared in the project's `package.json` — runtime packages under `dependencies`, build-time tools under `devDependencies`. Install through the package manager, never with `--no-save`, and do not rely on a package that is only present in `node_modules`. In this guide, `pxd` and `@gdsicon/vue` are runtime `dependencies`, while `unplugin-vue-components`, `unplugin-vue-define-options`, `tailwindcss` and `@tailwindcss/vite` are `devDependencies`.

Every snippet below shows only what PXD needs. Merge it into the config file the project already has; never replace that file with the snippet.

## 1. Inspect the project

Before installing anything, check:

- The Vue version in `package.json`. PXD declares `>=2.7.0 <3.0.0 || >=3.2.0` as its peer range — if the project runs Vue 2.6, 3.0 or 3.1, stop and tell the user PXD does not support it.
- The package manager: pnpm, npm, yarn or bun (look at the lockfile)
- The bundler: Vite, Rsbuild, webpack or something else
- The CSS setup: Tailwind CSS 4, no CSS framework, and whether the project brings its own CSS reset

Skip any step that is already configured. All examples below use pnpm and Vite. On Vue 2.7 the Vite plugin is the Vue 2 one (`@vitejs/plugin-vue2`), not `@vitejs/plugin-vue`.

## 2. Install pxd

```bash
pnpm install pxd
```

Use the project's own package manager (`npm install pxd`, `yarn add pxd`, `bun add pxd`).

If the bundler later fails with `Failed to resolve import` for a package that does exist in `node_modules`, the project runs a strict package manager: add `shamefully-hoist=true` to a `.npmrc` in the project root and reinstall.

## 3. Vue 2.7 / Vue 3.2 only: enable the defineOptions transform

PXD components declare their name and options with the `defineOptions()` macro, which Vue only compiles natively from 3.3. If the project runs Vue 2.7 or 3.2, install the transform plugin and register it in the bundler config, next to the plugins already there. Vue 3.3+ needs nothing here.

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
  plugins: [
    // ...keep the existing plugins
    defineOptions(),
  ],
})
```

For Rsbuild, import from `unplugin-vue-define-options/rspack` and register it under `tools.rspack.plugins` instead. Webpack uses `unplugin-vue-define-options/webpack`.

## 4. Choose the style setup

**Ask the user which style setup they want**, unless the project already dictates one: a project already on Tailwind CSS 4 takes the Tailwind route, and a project with no CSS framework takes the plain route. Tailwind CSS 3 and UnoCSS have no PXD preset — those projects take the plain route and keep their own framework for their own classes.

**Option A — No CSS framework (default).** The compiled stylesheet carries PXD's components and its theme variables only: no Tailwind preflight and no reset, so it neither replaces nor expects anything from the project's base styles. Import it once in the entry file:

```js
// main.js
import 'pxd/styles.css'
```

The project still needs its own reset (box sizing, default margins, form element styling). If it has none, say so in the final report instead of adding one silently.

**Option B — Tailwind CSS 4.** Import PXD's Tailwind entry next to Tailwind itself:

```css
/* src/styles/global.css */
@import 'tailwindcss';
@import 'pxd/tw.css';
```

`pxd/tw.css` registers PXD's own sources itself — do not add `@source` rules pointing at `node_modules/pxd`.

Import that global stylesheet once in the entry file as well. If the project has no Tailwind CSS 4 yet, install it first:

```bash
pnpm install -D tailwindcss @tailwindcss/vite
```

```js
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    // ...keep the existing plugins
    tailwindcss(),
  ],
})
```

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
    // ...keep the existing plugins
    Vue(),
    Components({
      dts: 'src/types/components.d.ts',
      resolvers: [PxdResolver()],
    }),
  ],
})
```

Components are used with the `P` prefix: `<PButton>`, `<PInput>`, `<PSelect>`. The resolver covers components only; composables, locales and utils come from their own entry points — `import { useMessage } from 'pxd'` (or `pxd/composables/*`), `pxd/locales/*`, `pxd/utils/*`.

`dts` makes `unplugin-vue-components` write `src/types/components.d.ts` the first time the dev server or a build runs. Type checking before that first run will report unresolved components.

Do not register the whole library globally unless the user asks for it — `app.use(PXD)` pulls every component into the bundle.

## 6. Configure code splitting

While you are in the bundler config, give third-party code a stable home. On Rolldown (`vite-plus`, or Vite 7+):

```js
// vite.config.ts
export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          minShareCount: 3,
          groups: [{ name: 'vendor', test: /node_modules/ }],
        },
      },
    },
  },
})
```

On Rollup-based Vite the equivalent is `manualChunks`, returning `'vendor'` for any id containing `node_modules`. Three settings carry the intent:

- **Do not add `entriesAware` to the vendor group.** It writes the participating entry names into the chunk filename, so adding or renaming a single route renames and re-hashes every vendor chunk — a cache that should be stable forever — and the names turn unreadable, e.g. `vendor~index~Layout~page~page~…-abc123.js`.
- **Leave `minShareCount` at 3** unless you have measured otherwise: lowering it pulls every shared module into its own chunk, raising it duplicates shared code into each route.
- **Treat `chunkSizeWarningLimit` as a budget for this project, not as the 500 kB default.** The limit is compared against the minified, uncompressed size and cannot tell a critical eager chunk from a lazy, page-scoped one. Once a large chunk is genuinely intentional and lazy, raise the limit just above it so the warning keeps flagging accidental growth.

Two rules matter as much as the config:

- **Never import a whole icon set, icon barrel or locale barrel statically from a module that the layout also imports.** A namespace import such as `import * as icons from '@gdsicon/vue'` binds every icon into one chunk, and any layout-level module that imports a single icon from the same package is then bundled to reference that chunk — putting the entire set on every page without anything in the page's own code saying so. Load the set with a dynamic `import()` from the page that needs it, and keep that import dynamic.
- **Leave `cssCodeSplit` alone unless every route draws on one shared design system.** In that case a single stylesheet (`cssCodeSplit: false`) beats per-route CSS that repeats the same custom properties.

## 7. Global component types for the editor

Once the dev server or a build has run, step 5 already types every component the project uses. To get completions for `P`-prefixed components before they are used anywhere, register PXD's own list instead, appending to whatever the project already has:

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": [
      // ...keep the entries already there, e.g. "vite/client"
      "pxd/volar"
    ]
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

## 8. App root: shell height, dark mode, locale and runtime mounts

Give `<html>`, `<body>` and the app's root element a full height, so PXD's full-height components (`PScrollable`, `PBacktop`) have something to fill. `<html>` also carries the font-smoothing and overscroll classes, `<body>` an empty touch handler, and the viewport meta the two flags PXD relies on:

```html
<!-- index.html -->
<html class="h-full overscroll-none">
  <head>
    <meta
      name="viewport"
      content="width=device-width,initial-scale=1.0,interactive-widget=resizes-content,viewport-fit=cover"
    />
  </head>
  <body class="h-full" ontouchstart="">
    <div id="app" class="h-full"></div>
  </body>
</html>
```

Three parts of that snippet are deliberate rather than decorative: `ontouchstart=""`, because mobile Safari skips `:active` until the document has handled a touch event; `interactive-widget=resizes-content`, so the on-screen keyboard resizes the layout viewport instead of overlaying the inputs; and `viewport-fit=cover`, so the layout extends under the notch and home indicator.

On a project without Tailwind, `h-full` means `height: 100%` on those same three elements.

PXD's theme switches on the `.dark` class on `<html>`, and nothing flips it on its own. Use `<PThemeSwitcher />` or the `useColorScheme()` composable — both set `document.documentElement.classList` and persist the choice in `localStorage`. A project that sees a light flash before hydration can inline the same check in `index.html`, ahead of the app bundle:

```html
<script>(()=>{if(typeof window==='undefined')return;let p=matchMedia('(prefers-color-scheme:dark)').matches;let s=localStorage.getItem('fe.system.color-scheme')||'auto';if(s==='dark'||(p&&s==='auto'))document.documentElement.classList.toggle('dark',true)})()</script>
```

Locale, size and the animation switches are read from an injected config that has defaults, so `<PConfigProvider>` is optional. Wrap the app root in it when the user needs a non-English locale or wants motion off:

```vue
<script setup>
import zhCN from 'pxd/locales/zh-cn'
</script>

<template>
  <PConfigProvider :locale="zhCN" :enter-motion="false" :leave-motion="false">
    <RouterView />
  </PConfigProvider>
</template>
```

Two APIs render nothing until their component is mounted somewhere in the tree: `useMessage()` needs a `<PMessage group="..." />`, and `useLoadingBar()` needs a `<PLoadingBar group="..." />`. Mount them at the app root when the user asks for toasts or a top loading bar.

## 9. Ask about view transitions

**Ask the user whether page navigations should animate.** Nothing in PXD requires it, so skip this step when they decline. The two setups below are independent: take the one that matches the project.

Multi-page navigations need no JavaScript and no router. Add this to the stylesheet the entry file imports from step 4 — create one and import it in the entry file if the project has none:

```css
/* src/styles/global.css */
@view-transition {
  navigation: auto;
}
```

SPA route changes need a router — vue-router **4** on Vue 3, **3.5+** on Vue 2.7 — PXD's optional peer. `useViewTransition()` takes the router instance and calls `router.beforeResolve`, `afterEach` and `onError`, all of which both lines provide; a project without a router only has the stylesheet form above. Do not add a router for this. When a router is installed, call it once, right after the router is created:

```ts
// src/router/index.ts
import { useViewTransition } from 'pxd'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

useViewTransition(router)
```

It registers navigation guards and returns a disposer; repeat calls for the same router share that one registration, which is torn down once every caller has disposed. Pass `shouldTransition` to keep some navigations unanimated — the first one after load (`from.matched.length === 0`) is the common case. Browsers without `document.startViewTransition` are detected internally and navigate unchanged. Leave the default cross-fade alone unless the user asks for something else — restyling it means overriding the `::view-transition-old(root)` and `::view-transition-new(root)` pseudo-elements.

## 10. Ask about the icon library

PXD's own components draw their icons from `@gdsicon/vue`, which PXD declares as a runtime dependency — installing `pxd` brings it along, and those icons need no extra step. **Ask the user whether their own code needs icons**; that is the case in which the project has to declare the package itself.

If the user says yes:

```bash
pnpm install @gdsicon/vue
```

Add its resolver to the existing `unplugin-vue-components` config:

```js
// vite.config.ts
import GdsiResolver from '@gdsicon/vue/resolver'

Components({
  dts: 'src/types/components.d.ts',
  resolvers: [
    PxdResolver(),
    GdsiResolver({ prefix: 'IGds' }),
  ],
})
```

The prefix is arbitrary — pick one that cannot collide with the project's own components (`IGds` and `Icon` are both in use in PXD's own code). Icons then resolve on first use as `<IGdsAccessibility />`. Do not register icons globally — it would pull every icon into the bundle.

## 11. Verify

Run the project's dev server or build once, so `components.d.ts` is generated, then run its type check and confirm a component renders.

Render a `<PButton>Click me</PButton>` and check it comes out with PXD's own height, radius and colours rather than the browser defaults — that also proves the stylesheet is loaded. Toggle `.dark` on `<html>` to check the dark theme.

Report what was installed, which files were changed, which steps were skipped, and anything the project still lacks (a reset, for instance).

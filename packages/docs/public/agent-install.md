# Install PXD

You are a coding agent. This guide tells you how to set up the PXD component library in a project. Work through the steps in order, ask the questions of step 3 — all of them, in one message — and then finish without further interruptions.

PXD is a universal UI component library for Vue 2.7+ & Vue 3.2+: one codebase, no `vue-demi`, built-in light/dark themes, and components that resolve automatically through `unplugin-vue-components`.

The project exists and runs — typically a Vite Vue template. Do not study or adapt to what it already contains, and do not skip a step because something similar looks present: every step below is written out as the complete form PXD needs, so write it as shown, starting from installing `pxd`.

Two things depend on the setup rather than on inspection:

- The package manager and bundler: examples use pnpm and Vite with a Vite + Vue entry (`src/main.js`, `src/App.vue`, `index.html`). Rsbuild and webpack variants are called out where the entry point differs.
- The Vue version. PXD declares `>=2.7.0 <3.0.0 || >=3.2.0` as its peer range — Vue 2.6, 3.0 and 3.1 are unsupported, so stop and tell the user if that is what the project runs. On Vue 2.7 the Vite plugin is the Vue 2 one (`@vitejs/plugin-vue2`), not `@vitejs/plugin-vue`.

One rule applies across every step: any package you install or import must be declared in the project's `package.json` — runtime packages under `dependencies`, build-time tools under `devDependencies`. Install through the package manager, never with `--no-save`, and do not rely on a package that is only present in `node_modules`. In this guide, `pxd` and `@gdsicon/vue` are runtime `dependencies`, while `unplugin-vue-components`, `unplugin-vue-define-options`, `tailwindcss` and `@tailwindcss/vite` are `devDependencies`.

## 1. Install pxd

```bash
pnpm install pxd
```

Use the project's own package manager (`npm install pxd`, `yarn add pxd`, `bun add pxd`).

If the bundler later fails with `Failed to resolve import` for a package that does exist in `node_modules`, the package manager is a strict one: add `shamefully-hoist=true` to a `.npmrc` in the project root and reinstall.

## 2. Vue 2.7 / Vue 3.2 only: enable the defineOptions transform

PXD components declare their name and options with the `defineOptions()` macro, which Vue only compiles natively from 3.3. On Vue 2.7 or 3.2, install the transform plugin and register it in the bundler config. Vue 3.3+ needs nothing here.

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
    defineOptions(),
  ],
})
```

For Rsbuild, import from `unplugin-vue-define-options/rspack` and register it under `tools.rspack.plugins` instead. Webpack uses `unplugin-vue-define-options/webpack`.

## 3. Ask the three questions

**Ask the user once, in a single message**, then act on the answers for the rest of the guide. The defaults in brackets stand when the user has no preference, so a single reply covers every case:

1. **Style setup** — plain stylesheet [default], or Tailwind CSS 4?
2. **Icons** — will their own code use icons from `@gdsicon/vue`? Default no; PXD's own components already bring the package and need nothing here.
3. **View transitions** — should page navigations animate? Default no.

Nothing else in this guide needs asking.

## 4. Style setup

Both routes end the same way: one project stylesheet, `src/styles/global.css`, imported once from the entry file. Later steps add to it.

**Option A — No CSS framework (default).** The compiled stylesheet carries PXD's components and its theme variables only: no Tailwind preflight and no reset, so the project's own base styles still have to be written in `global.css`. Import both once in the entry file:

```js
// main.js
import 'pxd/styles.css'
import './styles/global.css'
```

Leave `global.css` with the reset the project needs — box sizing, default margins, form element styling.

**Option B — Tailwind CSS 4.** Import PXD's Tailwind entry next to Tailwind itself; that is the whole stylesheet:

```css
/* src/styles/global.css */
@import 'tailwindcss';
@import 'pxd/tw.css';
```

`pxd/tw.css` registers PXD's own sources itself — do not add `@source` rules pointing at `node_modules/pxd`. Import `global.css` once in the entry file, and install Tailwind CSS 4:

```bash
pnpm install -D tailwindcss @tailwindcss/vite
```

```js
// vite.config.ts
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})
```

## 5. Auto-import components

Components resolve straight from templates, no imports needed.

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
      dts: 'src/types/components.d.ts',
      resolvers: [PxdResolver()],
    }),
  ],
})
```

Components are used with the `P` prefix: `<PButton>`, `<PInput>`, `<PSelect>`. The resolver covers components only; composables, locales and utils come from their own entry points — `import { useMessage } from 'pxd'` (or `pxd/composables/*`), `pxd/locales/*`, `pxd/utils/*`.

`dts` makes `unplugin-vue-components` write `src/types/components.d.ts` the first time the dev server or a build runs. Type checking before that first run will report unresolved components. **If the project has no `tsconfig.json`, drop the `dts` option — and with it step 8**, which has nothing to register.

Do not register the whole library globally unless the user asks for it — `app.use(PXD)` pulls every component into the bundle.

**If the user asked for icons**, install the package and add its resolver to the same config:

```bash
pnpm install @gdsicon/vue
```

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

## 6. View transitions

Skip this step unless the user asked for animated navigations.

Route down two facts before writing anything:

- **Has the project got a router?** Without one there is nothing for `useViewTransition()` to hook into, so write the stylesheet form and stop — do not add a router for this.
- **Does anything navigate as a full page load?** Only then add the stylesheet form; the SPA form alone covers route changes.

The SPA form needs a router — vue-router **4** on Vue 3, **3.5+** on Vue 2.7 — PXD's optional peer. `useViewTransition()` takes the router instance and calls `router.beforeResolve`, `afterEach` and `onError`, all of which both lines provide. Call it once, right after the router is created:

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

The stylesheet form covers navigation that reloads the document. Add it to the stylesheet written in step 4 when the app has any:

```css
/* src/styles/global.css */
@view-transition {
  navigation: auto;
}
```

For the SPA form, it registers navigation guards and returns a disposer; repeat calls for the same router share that one registration, which is torn down once every caller has disposed. Pass `shouldTransition` to keep some navigations unanimated — the first one after load (`from.matched.length === 0`) is the common case. Browsers without `document.startViewTransition` are detected internally and navigate unchanged. Leave the default cross-fade alone unless the user asks for something else — restyling it means overriding the `::view-transition-old(root)` and `::view-transition-new(root)` pseudo-elements.

## 7. Configure code splitting

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

## 8. Global component types for the editor

**Skip this step when the project has no `tsconfig.json`** — step 5 already dropped `dts`, and there is nothing to register here.

Once the dev server or a build has run, step 5 already types every component the project uses. To get completions for `P`-prefixed components before they are used anywhere, register PXD's own list:

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": [
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

## 9. App shell

Nothing here needs asking. This is the baseline PXD expects.

Give `<html>`, `<body>` and the app's root element a full height, so anything that fills the viewport has something to fill:

```css
/* src/styles/global.css */
html,
body,
#app {
  height: 100%;
}
```

Then add the viewport meta, the empty touch handler, the overscroll guard and the theme check to `index.html`, keeping whatever else is already in that file:

```html
<!-- index.html -->
<html class="overscroll-none">
  <head>
    <meta
      name="viewport"
      content="width=device-width,initial-scale=1.0,interactive-widget=resizes-content,viewport-fit=cover"
    />
    <script>(()=>{if(typeof window==='undefined')return;let p=matchMedia('(prefers-color-scheme:dark)').matches;let s=localStorage.getItem('fe.system.color-scheme')||'auto';if(s==='dark'||(p&&s==='auto'))document.documentElement.classList.toggle('dark',true)})()</script>
  </head>
  <body ontouchstart="">
    <div id="app"></div>
  </body>
</html>
```

Each of those lines earns its place: `height: 100%` on the three root elements for anything sized against the viewport; `interactive-widget=resizes-content` so the on-screen keyboard resizes the layout viewport instead of overlaying inputs; `viewport-fit=cover` so the layout extends under the notch and home indicator; `ontouchstart=""` because mobile Safari skips `:active` until the document has handled a touch event; `overscroll-none` (`overscroll-behavior: none` without Tailwind) against rubber-band scrolling; and the inline script re-applies the stored colour scheme — the `fe.system.color-scheme` key in `localStorage`, holding `'dark'`, `'light'` or `'auto'` — before the app bundle runs, so there is no light flash on load.

Finally, wrap the content of `src/App.vue` in a config provider, keeping whatever the file already renders inside it:

```vue
<!-- src/App.vue -->
<template>
  <PConfigProvider>
    <RouterView />
  </PConfigProvider>
</template>
```

Nothing forces this — PXD reads its defaults without it — but it is the injection point for locale, component size and the motion switches, and later steps and features expect a place to hang those. It renders one wrapper element (`as` changes the tag), so give it `class="h-full"` too when anything inside is sized against the viewport.

## 10. Point the project's agent at these docs

Write this block into the project's agent instructions file — an existing `AGENTS.md`, `CLAUDE.md` or `.cursor/rules/*.mdc`, or a new `AGENTS.md` in the project root if there is none. Append it; never replace what that file already says.

```md
## PXD
Docs index: __SITE_URL__/llms.txt
Any docs page is also served as raw Markdown: append `.md` to its URL.
Before using a PXD component, read __SITE_URL__/components/<kebab-name>.md
and take its props, slots, events and methods from the tables there — do not guess prop names.
```

This is the one step that outlives the session. Everything above is already done, so what is left to hand over is the part the next agent needs: without the block, that agent works from a half-remembered component and invents the prop names.

## 11. Verify and report

Run the dev server or a build once, so `components.d.ts` is generated, then run the type check and confirm a component renders.

Render a `<PButton>Click me</PButton>` and check it comes out with PXD's own height, radius and colours rather than the browser defaults — that also proves the stylesheet is loaded.

Report what was installed, which files were written and which options were skipped, then list what was applied silently and how to undo each — none of it is load-bearing, every item is one edit to remove:

- **`<PConfigProvider>`** around `src/App.vue` — unwrap the template; components fall back to built-in defaults.
- **Full-height rules on `html`, `body`, `#app` and the additions to `index.html`** — drop the lines; only components sized against the viewport lose something.
- **The reset written into `src/styles/global.css`** on the plain stylesheet route — delete it and supply your own.
- **The code splitting group** — remove the `output` block to go back to the bundler's default chunks.
- **The `components.d.ts` generation and the `types` entry in `tsconfig.json`** — drop the `dts` option and the `"pxd/volar"` entry; explicit imports still work.
- **Auto-import through the resolver** — swap it for explicit `import { Button } from 'pxd'`, or for `app.use(PXD)` if bundle size stops mattering.
- **`.npmrc` with `shamefully-hoist`**, if a strict package manager made it necessary — remove it and hoist `pxd`'s deps some other way.
- **The block written into the project's agent file in step 10** — delete it; the build does not care, the next agent simply stops knowing where the docs are.

Close with what PXD still offers beyond that. **Set none of it up unless asked:**

- **Dark theme**: PXD switches theme on a `.dark` class on `<html>` — `<PThemeSwitcher />` or the `useColorScheme()` composable flips it and writes `'dark'`, `'light'` or `'auto'` to the `fe.system.color-scheme` key in `localStorage`. Step 9 already reads that key early enough to avoid a flash.
- **Locale**: the provider from step 9 is already mounted, so switching language is one prop away — `<PConfigProvider :locale="zhCN">` with any locale from `pxd/locales/*`.
- **Runtime APIs**: `useMessage()` renders nothing until a `<PMessage group="..." />` is mounted in the tree, and `useLoadingBar()` likewise needs a `<PLoadingBar group="..." />`.

Finally, name where the docs live, for the user and for whatever agent opens this project next: `__SITE_URL__/llms.txt` indexes every page PXD documents, and `__SITE_URL__/agent-usage.md` is the guide to writing code against the library — how to read a component page, and the APIs that only work in pairs.

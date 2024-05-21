# PXD
A library of Vue3 components based on radix-vue and unocss. Everything is just right.

> [!IMPORTANT]
> The library is still under development and may undergo major changes at any time.

![](./res/preview.png)

## Install

```bash
pnpm i pxd
pnpm i -D animated-unocss
```

## Usage

### Styles

### uno.config.ts
```js
import transformerVariantGroup from '@unocss/transformer-variant-group'
import { animatedUno } from 'animated-unocss'
import { defineConfig, presetIcons, presetMini } from 'unocss'

export default defineConfig({
  content: {
    pipeline: {
      include: ['./src/**/*.{vue,tsx,ts}'],
    },
  },

  presets: [
    animatedUno({
      buildFullVersion: false,
    }),
    presetMini({
      variablePrefix: '',
    }),
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': '-2px',
      },
    }),
  ],

  shortcuts: {
    'flex-center': 'flex justify-center items-center',
    'flex-col-center': 'flex flex-col justify-center items-center',
    'fixed-center': 'fixed left-50% top-50% translate-x--50% translate-y--50%',
    'absolute-center': 'absolute left-50% top-50% translate-x--50% translate-y--50%',
  },

  rules: [
    // va--2px => vertical-align: -2px
    [/^va-(.+)$/, ([, v]: string[]) => ({ 'vertical-align': v })],
    [/^rotate-y-full$/, () => ({ transform: 'rotateY(180deg)' })],
    [/^rotate-x-full$/, () => ({ transform: 'rotateX(180deg)' })],
    [/^letter-spacing-(.+)$/, ([, d]: string[]) => ({ 'letter-spacing': d })],
  ],

  transformers: [
    // hover:(bg-gray-400 font-medium) font-(light mono) ↓
    // hover:bg-gray-400 hover:font-medium font-light font-mono
    transformerVariantGroup(),
  ],

  theme: {
    colors: {
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondary-foreground))',
      },
      danger: {
        DEFAULT: 'hsl(var(--danger) / <alpha-value>)',
        foreground: 'hsl(var(--danger-foreground) / <alpha-value>)',
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))',
      },
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))',
      },
      popover: {
        DEFAULT: 'hsl(var(--popover))',
        foreground: 'hsl(var(--popover-foreground))',
      },
      card: {
        DEFAULT: 'hsl(var(--card))',
        foreground: 'hsl(var(--card-foreground))',
      },
    },
    borderRadius: {
      xl: `calc(var(--radius) + 4px)`,
      lg: `var(--radius)`,
      md: `calc(var(--radius) - 2px)`,
      sm: 'calc(var(--radius) - 4px)',
    },
  },
})
```

### vars.css

This step can also be omitted if you have files with the following variable names.
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 47.4% 11.2%;

    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 47.4% 11.2%;

    --border: 240 5.9% 90%;
    --input: 220 13% 92%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 47.4% 11.2%;

    --primary: 0 0% 9.02%;
    --primary-foreground: 210 40% 98%;

    --secondary: 220 13.04% 95.49%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --accent: 210 4.8% 95.9%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --danger: 0 100% 57.45%;
    --danger-foreground: 210 40% 98%;

    --ring: 215 20.2% 65.1%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 224 71% 4%;
    --foreground: 213 31% 91%;

    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;

    --accent: 216 34% 17%;
    --accent-foreground: 210 40% 98%;

    --popover: 224 71% 4%;
    --popover-foreground: 215 20.2% 65.1%;

    --border: 216 34% 17%;
    --input: 240 3.7% 15.9%;

    --card: 224 71% 4%;
    --card-foreground: 213 31% 91%;

    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 1.2%;

    --secondary: 240 3.8% 15.49%;
    --secondary-foreground: 210 40% 98%;

    --danger: 0 73.62% 46.08%;
    --danger-foreground: 210 40% 98%;

    --ring: 216 34% 17%;

    --radius: 0.5rem;
  }
}
```

```js
import 'pxd/vars.css'
```

### Auto import

```js
// vite.config.js
import { defineConfig } from 'vite'
import VueComponents from 'unplugin-vue-components/vite'
import PxResolver from 'pxd/resolver'

export default defineConfig({
  plugins: [
    VueComponents({
      resolvers: [
        PxResolver({ ...options })
      ]
    })
  ]
})
```

#### Resolver Options
```ts
interface ResolverOptions {
  namespace: string
}
```
You can specify automatically imported component name prefixes by passing in the namespace parameter, such as:
```js
// vite.config.ts
{
  plugins: [
    VueComponents({
      resolvers: [
        resolver({ namespace: 'v' })
      ]
    })
  ]
}
```

```html
<!-- App.vue -->
<template>
  <!-- `px-button` -> `v-button` -->
  <v-button>Button</v-button>
</template>
```

### Global import
We strongly recommend using automatic import because it can significantly reduce the package size.

## Import Directly

```js
import Button from 'pxd/components/button/index.js'

// All components only need to import this style file.
import 'pxd/vars.css'
```

## Acknowledgement
rankings are in no particular order, they are all very important to this project.

- animate: https://animated-unocss.elonehoo.me/
- unocss: https://unocss.dev/
- radix-vue: https://www.radix-vue.com/
- vite: https://vitejs.dev/
- shadcn-ui: https://github.com/shadcn-ui/ui
- iconify: https://iconify.design/

# Code Block

Display multi-line source code with syntax highlighting, line numbers and a copy button. Highlighting uses the CSS Custom Highlight API, so unsupported browsers fall back to plain text; blocks over 20,000 characters always stay plain to keep the token scan cheap. In Vite, add `microlighter` to `optimizeDeps.exclude` — the dep optimizer cannot resolve the grammar loader's dynamic imports.

## Default

```vue demo
<script setup>
const code = [
  "import { ref } from 'vue'",
  '',
  'const count = ref(0)',
  'const increment = () => count.value++',
].join('\n')
</script>

<template>
  <PCodeBlock :code="code" language="ts" class="w-full max-w-[560px]" />
</template>
```

## Line numbers

```vue demo
<script setup>
const code = [
  'export function greet(name: string) {',
  '  return `Hello, ${name}`',
  '}',
].join('\n')
</script>

<template>
  <PCodeBlock
    :code="code"
    language="ts"
    title="greet.ts"
    line-numbers
    class="w-full max-w-[560px]"
  />
</template>
```

## Collapsible

```vue demo
<script setup>
const code = [
  'export interface Config {',
  '  host: string',
  '  port: number',
  '  retries?: number',
  '}',
  '',
  'export const defaults: Config = {',
  "  host: 'localhost',",
  '  port: 3000,',
  '  retries: 3,',
  '}',
  '',
  'export function resolve(config: Partial<Config>): Config {',
  '  return { ...defaults, ...config }',
  '}',
].join('\n')
</script>

<template>
  <PCodeBlock
    :code="code"
    language="ts"
    collapsible
    :max-height="160"
    class="w-full max-w-[560px]"
  />
</template>
```

## Theme

The palette reads `--syntax-*` variables, so a single token color can be overridden per block.

```vue demo
<script setup>
const code = ["const message = 'hello'", 'console.log(message)'].join('\n')
</script>

<template>
  <PCodeBlock
    :code="code"
    language="js"
    style="--syntax-keyword: hsl(var(--color-red-900-value))"
    class="w-full max-w-[560px]"
  />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| code | `string` | - | Source text, rendered verbatim into a single text node |
| language | `string` | - | Grammar name or alias, such as `ts`, `bash` or `vue` |
| title | `string` | - | Header text, ignored when the `header` slot is used |
| size | `'sm' \| 'md' \| 'lg'` | - | Font size, falls back to the config provider size |
| line-numbers | `boolean` | `false` | Show a line number gutter |
| max-height | `number \| string` | `20rem` | Height cap of the scroll area |
| collapsible | `boolean` | `false` | Clip the body at `max-height` and offer an expand toggle |
| copy-btn | `'always' \| 'hover' \| 'hidden'` | `always` | Display the copy button appropriately |

## Events

| Name | Type | Description |
| --- | --- | --- |
| copy | `(text: string) => void` | Emitted after the copy button has written the code to the clipboard. |

## Slots

| Name | Description |
| --- | --- |
| header | Header content, replaces the `title` text. |
| actions | Header content aligned to the end. |

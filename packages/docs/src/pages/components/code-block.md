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

Line numbers are clickable: pressing one puts a `#L` anchor for that line into the URL and marks the line as referenced, so a block can be linked to exact lines.

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

## Highlighted lines

Use `highlighted-lines` to mark the lines under discussion.

```vue demo
<script setup>
const code = [
  'function MyComponent(props) {',
  '  return (',
  '    <div>',
  '      <h1>Hello, {props.name}!</h1>',
  '      <p>This is an example component.</p>',
  '    </div>',
  '  )',
  '}',
].join('\n')
</script>

<template>
  <PCodeBlock
    :code="code"
    language="jsx"
    title="highlighted.jsx"
    :highlighted-lines="[1, 4]"
    line-numbers
    class="w-full max-w-[560px]"
  />
</template>
```

## Added and removed lines

`added-lines` and `removed-lines` render diff-style line backgrounds with `+` / `-` markers.

```vue demo
<script setup>
const code = [
  'module.exports = {',
  '  experimental: {',
  '    appDir: true,',
  '  },',
  '  appDir: true,',
  '}',
].join('\n')
</script>

<template>
  <PCodeBlock
    :code="code"
    language="js"
    title="next.config.js"
    :added-lines="[5]"
    :removed-lines="[2, 3, 4]"
    line-numbers
    class="w-full max-w-[560px]"
  />
</template>
```

## Language switcher

The `switcher` prop renders a select in the header; pair it with `switcher-change` to swap the displayed snippet.

```vue demo
<script setup>
import { ref } from 'vue'

const language = ref('js')

const snippets = {
  js: {
    code: "function greet(name) {\n  return `Hello, ${name}`\n}",
    title: 'greet.js',
  },
  ts: {
    code: 'function greet(name: string): string {\n  return `Hello, ${name}`\n}',
    title: 'greet.ts',
  },
  lua: {
    code: "function greet(name)\n  return 'Hello, ' .. name\nend",
    title: 'greet.lua',
  },
}

const options = [
  { label: 'JavaScript', value: 'js' },
  { label: 'TypeScript', value: 'ts' },
  { label: 'Lua', value: 'lua' },
]
</script>

<template>
  <PCodeBlock
    :code="snippets[language].code"
    :title="snippets[language].title"
    :language="language"
    line-numbers
    :switcher="{ options, value: language }"
    @switcher-change="language = $event"
    class="w-full max-w-[560px]"
  />
</template>
```

## Language switcher with tabs

Use the `tabs` prop for a tabbed language switcher above the header instead of the select.

```vue demo
<script setup>
import { ref } from 'vue'

const language = ref('js')

const snippets = {
  js: {
    code: "function greet(name) {\n  return `Hello, ${name}`\n}",
    title: 'greet.js',
  },
  ts: {
    code: 'function greet(name: string): string {\n  return `Hello, ${name}`\n}',
    title: 'greet.ts',
  },
  lua: {
    code: "function greet(name)\n  return 'Hello, ' .. name\nend",
    title: 'greet.lua',
  },
}

const options = [
  { label: 'JavaScript', value: 'js' },
  { label: 'TypeScript', value: 'ts' },
  { label: 'Lua', value: 'lua' },
]
</script>

<template>
  <PCodeBlock
    :code="snippets[language].code"
    :title="snippets[language].title"
    :language="language"
    line-numbers
    :tabs="{ options, value: language }"
    @tabs-change="language = $event"
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
| code | `string` | - | Source text, rendered verbatim into text nodes |
| language | `string` | - | Grammar name or alias, such as `ts`, `bash` or `vue` |
| title | `string` | - | Header filename, ignored when the `header` slot is used |
| size | `'sm' \| 'md' \| 'lg'` | - | Font size, falls back to the config provider size |
| line-numbers | `boolean` | `false` | Show a clickable line number gutter per line |
| highlighted-lines | `number[]` | - | One-based numbers of lines to highlight |
| added-lines | `number[]` | - | One-based numbers of lines rendered as diff additions |
| removed-lines | `number[]` | - | One-based numbers of lines rendered as diff removals |
| max-height | `number \| string` | `20rem` | Height cap of the scroll area |
| collapsible | `boolean` | `false` | Clip the body at `max-height` and offer an expand toggle |
| copy-btn | `'always' \| 'hover' \| 'hidden'` | `hover` | Display the copy button appropriately |
| switcher | `CodeBlockSwitcherProps` | - | Select in the header for switching between snippets |
| tabs | `CodeBlockSwitcherProps` | - | Tab bar above the header for switching between snippets |

`switcher` and `tabs` take `{ options: { label?, value }[], value?: string }`; the block is
controlled — swap the displayed snippet yourself when the matching change event fires.

## Events

| Name | Type | Description |
| --- | --- | --- |
| copy | `(text: string) => void` | Emitted after the copy button has written the code to the clipboard. |
| switcher-change | `(value: string) => void` | Emitted when the header switcher selects an option. |
| tabs-change | `(value: string) => void` | Emitted when a tab of the tab bar is selected. |

## Slots

| Name | Description |
| --- | --- |
| header | Header content, replaces the `title` text. |
| actions | Header content aligned to the end. |

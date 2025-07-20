# Snippet
Display a snippet of copyable code for the command line.

## Default

```vue demo
<script setup>
import confetti from 'canvas-confetti'

const onCopied = () => {
  confetti()
}
</script>

<template>
  <PStack direction="vertical">
    <PSnippet text="npm install pxd" @copy="onCopied" size="sm" />
    <PSnippet text="npm install pxd" @copy="onCopied" size="md" />
    <PSnippet text="npm install pxd" @copy="onCopied" size="lg" />
  </PStack>
</template>
```

## Multi line

```vue demo
<script setup>
const text = [
  'cd my-project',
  'npm install pxd',
  'npm run dev',
]
</script>

<template>
  <PSnippet :text="text" width="300px" />
</template>
```

## Prompt

```vue demo
<template>
  <PStack direction="vertical">
    <PSnippet text="npm install pxd" width="300px" :prompt="false" />
    <PSnippet text="npm install pxd" width="300px" prompt="# " />
    <PSnippet text="npm install pxd" width="300px" prompt="\ " />
  </PStack>
</template>
```

## Variants

```vue demo
<template>
  <PStack direction="vertical">
    <PSnippet text="npm install pxd" width="300px" variant="primary" />
    <PSnippet text="npm install pxd" width="300px" variant="success" />
    <PSnippet text="npm install pxd" width="300px" variant="error" />
    <PSnippet text="npm install pxd" width="300px" variant="warning" />
  </PStack>
</template>
```

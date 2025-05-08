# Snippet

## Default

```vue demo
<script setup>
import confetti from 'canvas-confetti'

const onCopied = () => {
  confetti()
}
</script>

<template>
  <PSnippet text="npm install pxd" @copy="onCopied" />
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

## No prompt

```vue demo
<template>
  <PSnippet text="npm install pxd" width="300px" :prompt="false" />
</template>
```

## Variants

```vue demo
<template>
  <PStack direction="col">
    <PSnippet text="npm install pxd" width="300px" variant="primary" />
    <PSnippet text="npm install pxd" width="300px" variant="success" />
    <PSnippet text="npm install pxd" width="300px" variant="error" />
    <PSnippet text="npm install pxd" width="300px" variant="warning" />
  </PStack>
</template>
```

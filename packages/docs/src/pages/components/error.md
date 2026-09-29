# Error

Good error design is clear, useful, and friendly. Designing concise and accurate error messages unblocks users and builds trust by meeting people where they are.

## Default

```vue demo
<template>
  <PError>This email address is already in use.</PError>
</template>
```

## Custom Label

```vue demo
<template>
  <PError label="Email Error">This email address is already in use.</PError>
</template>
```

## Sizes

```vue demo
<template>
  <PStack direction="vertical">
    <PError size="sm">This email is in use.</PError>
    <PError>This email is in use.</PError>
    <PError size="lg">This email is in use.</PError>
  </PStack>
</template>
```

## With an error property

```vue demo
<script setup>
import { ref } from 'vue'

const error = ref({
  message: 'The request failed.',
  action: 'Contact Us',
  label: 'Error',
  link: 'https://vercel.com/contact',
})
</script>

<template>
  <PError :error="error" />
</template>
```

## Card

```vue demo
<script setup>
import { ref } from 'vue'

const error = ref({
  message: 'The request failed.',
  action: 'Contact Us',
  label: 'Error',
  link: 'https://vercel.com/contact',
})
</script>

<template>
  <PError variant="card" :error="error" />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| size | `'xs' \| 'sm' \| 'md' \| 'lg'` | - | Font size of the message; falls back to the config provider size |
| label | `string \| number \| null` | - | Bold prefix rendered before the message |
| error | `ErrorType` | - | Object with `message` plus an optional `label`, `action` and `link` |
| variant | `default`\|`card` | `default` | `card` centres the message in a bordered red panel |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |

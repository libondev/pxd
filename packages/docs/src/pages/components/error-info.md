# Error Info

Good error design is clear, useful, and friendly. Designing concise and accurate error messages unblocks users and builds trust by meeting people where they are.

## Default

```vue demo
<template>
  <PErrorInfo>This email address is already in use.</PErrorInfo>
</template>
```

## Custom Label

```vue demo
<template>
  <PErrorInfo label="Email Error">This email address is already in use.</PErrorInfo>
</template>
```

## Sizes

```vue demo
<template>
  <PStack direction="vertical">
    <PErrorInfo size="sm">This email is in use.</PErrorInfo>
    <PErrorInfo>This email is in use.</PErrorInfo>
    <PErrorInfo size="lg">This email is in use.</PErrorInfo>
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
  <PErrorInfo :error="error" />
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
  <PErrorInfo variant="card" :error="error" />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| size | `'xs' \| 'sm' \| 'md' \| 'lg'` | - | Font size of the message; falls back to the config provider size |
| label | `string \| number \| null` | - | Bold prefix rendered before the message |
| error | `ErrorInfoType` | - | Object with `message` plus an optional `label`, `action` and `link` |
| variant | `default`\|`card` | `default` | `card` centres the message in a bordered red panel |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |

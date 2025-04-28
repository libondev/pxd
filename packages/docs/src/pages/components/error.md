<script setup>
import { ref } from 'vue'

const error = ref({
  message: 'The request failed.',
  action: 'Contact Us',
  label: 'Error',
  link: 'https://vercel.com/contact',
})
</script>

# Error
Good error design is clear, useful, and friendly. Designing concise and accurate error messages unblocks users and builds trust by meeting people where they are.

## Default

<PError>This email address is already in use.</PError>

```html
<PError>This email address is already in use.</PError>
```

## Custom Label

<PError label="Email Error">This email address is already in use.</PError>

```html
<PError label="Email Error">This email address is already in use.</PError>
```

## Sizes

<PStack gap="8">
  <PError size="sm">This email is in use.</PError>
  <PError size="md">This email is in use.</PError>
  <PError size="lg">This email is in use.</PError>
</PStack>

```html
<PError size="sm">This email is in use.</PError>
<PError size="md">This email is in use.</PError>
<PError size="lg">This email is in use.</PError>
```

## With an error property

<PError :error="error" />

```html
<script setup>
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

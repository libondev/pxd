# PinInput
Used to capture a pin code or otp from the user

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const code = ref('1234')
</script>

<template>
  <PPinInput v-model="code" />
</template>
```

## Disabled

```vue demo
<script setup>
import { ref } from 'vue'

const code = ref('12')
</script>

<template>
  <PPinInput v-model="code" disabled />
</template>
```

## Placeholder

```vue demo
<template>
  <PPinInput placeholder="🥳" />
</template>
```

## Types
Set the `type` attribute to limit what can be entered. (Default: `numeric`)

```vue demo
<template>
  <PStack direction="col" gap="4">
    <PPinInput type="numeric" />
    <PPinInput type="alphabetic" />
    <PPinInput type="alphanumeric" />
    <PPinInput type="numeric-password" />
    <PPinInput type="alphabetic-password" />
    <PPinInput type="alphanumeric-password" />
  </PStack>
</template>
```

## Length

```vue demo
<template>
  <PPinInput :length="6" />
</template>
```

## Error

```vue demo
<template>
  <PPinInput error="Invalid pin code" />
</template>
```

## Label

```vue demo
<template>
  <PPinInput label="Pin Code" />
</template>
```

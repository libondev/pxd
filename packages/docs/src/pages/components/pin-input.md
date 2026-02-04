# Pin Input

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
  <PStack direction="vertical">
    <PPinInput label="numeric" type="numeric" />
    <PPinInput label="alphabetic" type="alphabetic" />
    <PPinInput label="alphanumeric" type="alphanumeric" />
    <PPinInput label="numeric-password" type="numeric-password" />
    <PPinInput label="alphabetic-password" type="alphabetic-password" />
    <PPinInput label="alphanumeric-password" type="alphanumeric-password" />
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

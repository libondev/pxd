# Input

Retrieve text input from a user.

## Default

```vue demo
<template>
  <PStack gap="4" :direction="{ sm: 'col', md: 'row' }">
    <PInput size="sm" placeholder="sm" />
    <PInput placeholder="md(default)" />
    <PInput size="lg" placeholder="lg" />
  </PStack>
</template>
```

## Password

```vue demo
<script setup>
import { ref } from 'vue'

const password = ref('')
</script>

<template>
  <PStack>
    <PInput v-model="password" password placeholder="Enter your password" />
  </PStack>
</template>
```

## Prefix and suffix

```vue demo
<template>
  <PStack gap="6" direction="col">
    <PInput placeholder="Default">
      <template #prefix>
        <IconArrowCircleUp />
      </template>
    </PInput>

    <PInput placeholder="Default">
      <template #suffix>
        <IconArrowCircleUp />
      </template>
    </PInput>

    <PInput placeholder="Default">
      <template #prefix>
        https://
      </template>

      <template #suffix>
        .com
      </template>
    </PInput>

    <PInput placeholder="Default" :prefix-style="false" :suffix-style="false">
      <template #prefix>
        <IconArrowCircleUp />
      </template>

      <template #suffix>
        <IconArrowCircleUp />
      </template>
    </PInput>
  </PStack>
</template>
```

## Disabled

```vue demo
<template>
  <PStack gap="6" direction="col">
    <PInput disabled placeholder="Default">
      <template #prefix>
        <IconArrowCircleUp />
      </template>
    </PInput>

    <PInput disabled placeholder="Default">
      <template #suffix>
        <IconArrowCircleUp />
      </template>
    </PInput>

    <PInput disabled placeholder="Default">
      <template #prefix>
        https://
      </template>

      <template #suffix>
        .com
      </template>
    </PInput>

    <PInput disabled placeholder="Default" :prefix-style="false" :suffix-style="false">
      <template #prefix>
        <IconArrowCircleUp />
      </template>

      <template #suffix>
        <IconArrowCircleUp />
      </template>
    </PInput>
  </PStack>
</template>
```

## Error

```vue demo
<template>
  <PStack gap="8" direction="col" class="py-4">
    <PInput error="An error message." size="xs" placeholder="Default" />
    <PInput error="An error message." size="sm" placeholder="Default" />
    <PInput error="An error message." placeholder="Default" />
    <PInput error="An error message." size="lg" placeholder="Default" />
  </PStack>
</template>
```

## Label

```vue demo
<template>
  <PInput label="My Label"/>
</template>
```

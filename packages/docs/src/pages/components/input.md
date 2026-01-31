# Input
Retrieve text input from a user.

## Default

```vue demo
<template>
  <PInput class="max-w-sm" />
</template>
```

## Sizes

```vue demo
<template>
  <PStack class="max-w-sm" direction="vertical">
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
  <PStack class="max-w-sm">
    <PInput v-model="password" password placeholder="Enter your password" />
  </PStack>
</template>
```

## Clearable

```vue demo
<script setup>
import { ref } from 'vue'

const password = ref('')
</script>

<template>
  <PStack class="max-w-sm">
    <PInput v-model="password" clearable />
  </PStack>
</template>
```

## Prefix and suffix

```vue demo
<template>
  <PStack class="max-w-sm" gap="6" direction="vertical">
    <PInput>
      <template #prefix>
        <IconArrowCircleUp />
      </template>
    </PInput>

    <PInput>
      <template #suffix>
        <IconArrowCircleUp />
      </template>
    </PInput>

    <PInput>
      <template #prefix>
        https://
      </template>

      <template #suffix>
        .com
      </template>
    </PInput>

    <PInput :prefix-style="false" :suffix-style="false">
      <template #prefix>
        <IconArrowCircleUp class="ml-3" />
      </template>

      <template #suffix>
        <IconArrowCircleUp class="mr-3" />
      </template>
    </PInput>
  </PStack>
</template>
```

## Disabled

```vue demo
<template>
  <PStack class="max-w-sm" gap="6" direction="vertical">
    <PInput disabled>
      <template #prefix>
        <IconArrowCircleUp />
      </template>
    </PInput>

    <PInput disabled>
      <template #suffix>
        <IconArrowCircleUp />
      </template>
    </PInput>

    <PInput disabled>
      <template #prefix>
        https://
      </template>

      <template #suffix>
        .com
      </template>
    </PInput>

    <PInput disabled :prefix-style="false" :suffix-style="false">
      <template #prefix>
        <IconArrowCircleUp class="ml-3" />
      </template>

      <template #suffix>
        <IconArrowCircleUp class="mr-3" />
      </template>
    </PInput>
  </PStack>
</template>
```

## Error

```vue demo
<template>
  <PStack class="max-w-sm" gap="8" direction="vertical">
    <PInput error="An error message." size="sm" />
    <PInput error="An error message." />
    <PInput error="An error message." size="lg" />
  </PStack>
</template>
```

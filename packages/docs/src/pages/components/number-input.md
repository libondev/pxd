# NumberInput
Input box for entering numbers only.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const number = ref(0)
</script>

<template>
  <PNumberInput v-model="number" class="max-w-xs" />
</template>
```

## Sizes

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(0)
</script>

<template>
  <PStack direction="vertical">
    <PNumberInput v-model="value" size="sm" class="max-w-xs" />
    <PNumberInput v-model="value" size="md" class="max-w-xs" />
    <PNumberInput v-model="value" size="lg" class="max-w-xs" />
  </PStack>
</template>
```

## Step

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(0)
</script>

<template>
  <PNumberInput v-model="value" :step="2" class="max-w-xs" />
</template>
```

## Disabled

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(0)
</script>

<template>
  <PNumberInput v-model="value" disabled class="max-w-xs" />
</template>
```

## Prefix and Suffix
```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(0)
</script>

<template>
  <PNumberInput v-model="value" class="max-w-xs">
    <template #prefix>
      ￥
    </template>

    <template #suffix>
      RMB
    </template>
  </PNumberInput>
</template>
```

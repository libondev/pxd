# Number Input

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

const value = ref(1)
</script>

<template>
  <PStack direction="vertical">
    <PNumberInput v-model="value" size="sm" class="max-w-xs" />
    <PNumberInput v-model="value" size="md" class="max-w-xs" />
    <PNumberInput v-model="value" size="lg" class="max-w-xs" />
  </PStack>
</template>
```

## Disabled

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(2)
</script>

<template>
  <PNumberInput v-model="value" disabled class="max-w-xs" />
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

## Max/Min

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(0)
</script>

<template>
  <PNumberInput v-model="value" :min="0" :max="10" class="max-w-xs" />
</template>
```

## Precision

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(0)
</script>

<template>
  <PNumberInput v-model="value" :precision="2" :step="0.68" class="max-w-xs" />
</template>
```

## Thousands format

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(10000)
</script>

<template>
  <PStack direction="vertical">
    <PNumberInput v-model="value" thousands class="max-w-xs" />
    <PNumberInput v-model="value" thousands thousands-separator="_" class="max-w-xs" />
  </PStack>
</template>
```

## No controls

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(0)
</script>

<template>
  <PNumberInput v-model="value" :controls="false" class="max-w-xs" />
</template>
```

## Icons

```vue demo
<script setup>
import { ref } from 'vue'
import PlusCircleIcon from '@gdsicon/vue/plus-circle'
import MinusCircleIcon from '@gdsicon/vue/minus-circle'

const value = ref(0)
</script>

<template>
  <PNumberInput v-model="value" class="max-w-xs">
    <template #minusIcon>
      <MinusCircleIcon />
    </template>

    <template #plusIcon>
      <PlusCircleIcon />
    </template>
  </PNumberInput>
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
      <span class="pl-2">￥</span>
    </template>

    <template #suffix>
      <span class="pr-2">RMB</span>
    </template>
  </PNumberInput>
</template>
```

# Slider
Input to select a value from a given range.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(0)
</script>

<template>
  <PStack align="center" gap="3">
    <PSlider v-model="value" style="width: 200px;" />
    <span class="text-sm text-gray-900">{{ value }}</span>
  </PStack>
</template>
```

## Step
Set `step` size with the step attribute

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(0)
</script>

<template>
  <PStack align="center" gap="3">
    <PSlider v-model="value" :step="5" style="width: 200px;" />
    <span class="text-sm text-gray-900">{{ value }}</span>
  </PStack>
</template>
```

## Custom min/max

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(35)
</script>

<template>
  <PStack align="center" gap="3">
    <PSlider v-model="value" :min="30" :max="80" style="width: 200px;" />
    <span class="text-sm text-gray-900">{{ value }}</span>
  </PStack>
</template>
```

## Range

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref([30, 50])
</script>

<template>
  <PStack align="center" gap="3">
    <PSlider v-model="value" :min="10" :max="90" range style="width: 200px;" />
    <span class="text-sm text-gray-900">{{ value }}</span>
  </PStack>
</template>
```

# Slider

Input to select a value from a given range.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(30)
</script>

<template>
  <PStack direction="vertical" gap="3">
    <div class="flex items-center gap-3">
      <PSlider v-model="value" size="sm" style="width: 200px;" />
      <PText secondary>{{ value }}</PText>
    </div>

    <div class="flex items-center gap-3">
      <PSlider v-model="value" style="width: 200px;" />
      <PText secondary>{{ value }}</PText>
    </div>

    <div class="flex items-center gap-3">
      <PSlider v-model="value" size="lg" style="width: 200px;" />
      <PText secondary>{{ value }}</PText>
    </div>
  </PStack>
</template>
```

## Disabled

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(30)
</script>

<template>
  <PStack direction="vertical" gap="3">
    <PSlider v-model="value" size="sm" style="width: 200px;" disabled />
    <PSlider v-model="value" style="width: 200px;" disabled />
    <PSlider v-model="value" size="lg" style="width: 200px;" disabled />
  </PStack>
</template>
```

## Variants

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(35)
</script>

<template>
  <PStack direction="vertical" gap="6">
    <PSlider v-model="value" variant="primary" style="width: 200px;" />
    <PSlider v-model="value" variant="success" style="width: 200px;" />
    <PSlider v-model="value" variant="warning" style="width: 200px;" />
    <PSlider v-model="value" variant="error" style="width: 200px;" />
    <PSlider v-model="value" variant="secondary" style="width: 200px;" />
  </PStack>
</template>
```

## Step

Set `step` size with the step attribute

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(30)
</script>

<template>
  <PStack align="center" gap="3">
    <PSlider v-model="value" :step="5" style="width: 200px;" />
    <PText secondary>{{ value }}</PText>
  </PStack>
</template>
```

## Custom min/max

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(40)
</script>

<template>
  <PStack align="center" gap="3">
    <PSlider v-model="value" :min="30" :max="80" style="width: 200px;" />
    <PText secondary>{{ value }}</PText>
  </PStack>
</template>
```

## Range

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref([30, 60])
</script>

<template>
  <PStack align="center" gap="3">
    <PSlider v-model="value" :min="10" :max="90" range style="width: 200px;" />
    <PText secondary>{{ value }}</PText>
  </PStack>
</template>
```

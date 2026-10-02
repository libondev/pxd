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

## Discrete values

Pass an array to `step` to only allow the listed values, the initial value is snapped to the closest one on mount

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(20)
const step = [10, 30, 60, 100]
</script>

<template>
  <PStack align="center" gap="3">
    <PSlider v-model="value" :step="step" stops style="width: 200px;" />
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

## Stops

Set `stops` to display an interruption point at every interior step, `min` and `max` get none because the track ends already mark them

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(30)
const value2 = ref([20, 60])
</script>

<template>
  <PStack align="center" gap="3">
    <PSlider v-model="value" :step="20" stops size="sm" style="width: 200px;" />
    <PText secondary>{{ value }}</PText>
  </PStack>

  <PStack align="center" gap="3">
    <PSlider v-model="value2" range :step="20" stops size="sm" style="width: 200px;" />
    <PText secondary>{{ value2 }}</PText>
  </PStack>
</template>
```

## Marks

Display marks below the slider, click a mark to jump to its value, when the `step` prop is passed in, only the target value can be set.

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(40)

const marks = {
  0: 'Very poor',
  20: 'Poor',
  40: 'Normal',
  60: 'Good',
  80: 'Very good',
  100: 'Excellent',
}
const steps = Object.keys(marks).map(i => Number(i))
</script>

<template>
  <PSlider v-model="value" :marks="marks" :step="steps" />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| min | `number` | `0` | Lower bound of the value range |
| max | `number` | `100` | Upper bound of the value range |
| step | `number \| number[]` | `1` | Increment applied on drag and arrow keys, or the only selectable values when an array is passed |
| range | `boolean` | - | Render two thumbs and bind a `[start, end]` array |
| stops | `boolean` | - | Render a stop at every interior step position, `min` and `max` get none |
| marks | `Record<number, string>` | - | Marks below the slider, the key must be between `min` and `max`, click a mark to jump to its value |
| disabled | `boolean` | - | Disable dragging, pointer and keyboard interaction |
| size | `'sm' \| 'md' \| 'lg'` | - | Track and thumb size, falls back to the config provider |
| variant | `'primary' \| 'error' \| 'warning' \| 'success' \| 'secondary'` | `primary` | Track colour, e.g. `primary`, `success`, `secondary` |
| model-value | `number \| number[] \| null` | `0` | Current value, an array when `range` is enabled |

## Events

| Name | Type | Description |
| --- | --- | --- |
| change | `(value: number \| number[]) => void` | Emitted when a drag, an arrow key press, or a mark click settles on a new value. |
| update:modelValue | `(value: number \| number[]) => void` | Emitted whenever the value changes, including when the initial value is snapped to a valid step on mount. |

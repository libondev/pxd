# Select

Displays a list of options for the user to pick from—triggered by a button.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref('')

const options = [
  { label: 'One', value: 1 },
  { label: 'Two', value: 2 },
  { label: 'Three', value: 3 },
]
</script>

<template>
  <PSelect v-model="value" :options="options" placeholder="Please select"></PSelect>
</template>
```

## Multiple

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref([1, 2])

const options = [
  { label: 'One', value: 1 },
  { label: 'Two', value: 2 },
  { label: 'Three', value: 3 },
]
</script>

<template>
  <PSelect v-model="value" :options="options" multiple />
</template>
```

## Label format

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref([1, 2, 3])

const options = [
  { label: 'One', value: 1 },
  { label: 'Two', value: 2 },
  { label: 'Three', value: 3 },
]

function labelFormatter(valueList) {
  return valueList.map(i => i.label).join(' & ')
}
</script>

<template>
  <PSelect v-model="value" :options="options" multiple :label-format="labelFormatter" />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| model-value | `string \| number \| (string \| number)[] \| null` | - | - |
| variant | `ButtonVariant` | - | - |
| size | `'sm' \| 'md' \| 'lg'` | - | - |
| shape | `'default' \| 'square' \| 'rounded'` | - | - |
| options | `ListOptions` | - | - |
| disabled | `boolean` | - | - |
| multiple | `boolean` | - | - |
| placeholder | `string` | - | - |
| label-format | `(items: ListOption[]) => string` | - | - |
| close-on-press-escape | `boolean` | - | - |

## Events

| Name | Description |
| --- | --- |
| update:modelValue | Emitted whenever the selected value changes. In multiple mode this fires on every toggle. |
| change | Single: after an option is chosen. Multiple: when the menu closes after the selection changed. |

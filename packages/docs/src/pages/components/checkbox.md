# Checkbox

A control that toggles between two options, checked or unchecked.

## Default

```vue demo
<script setup>
const value = ref(false)
</script>

<template>
  <p>value: {{ value }}</p>
  <PCheckbox v-model="value" label="Checkbox" />
</template>
```

## Group

```vue demo
<script setup>
import { ref, nextTick } from 'vue'

const value = ref(['one'])

const options = [
  { label: 'Options 1', value: 'one' },
  { label: 'Options 2', value: 'two' },
  { label: 'Options 3', value: 'three' },
]
</script>

<template>
  <p>value: {{ value }}</p>

  <PCheckboxGroup
    v-model="value"
    gap="2"
    :options="options"
    direction="vertical"
    class="mt-2"
  >
    <PCheckbox v-for="item of options" :key="item.value" :label="item.label" :value="item.value" />
  </PCheckboxGroup>

  <PCheckboxGroup
    v-model="value"
    gap="2"
    :options="options"
    direction="vertical"
    class="mt-6"
    disabled
  />
</template>
```

## Indeterminate

```vue demo
<script setup>
const checked = ref(false)
</script>

<template>
  <PStack>
    <PCheckbox v-model="checked" label="Checkbox" indeterminate />
    <PCheckbox v-model="checked" label="Checkbox" indeterminate disabled />
  </PStack>
</template>
```

## Shape

```vue demo
<script setup>
const checked = ref(false)
</script>

<template>
  <PStack gap="6" :direction="{ xs: 'vertical', sm: 'horizontal' }">
    <PCheckbox v-model="checked" label="Checkbox" shape="default" />
    <PCheckbox v-model="checked" label="Checkbox" shape="square" />
    <PCheckbox v-model="checked" label="Checkbox" shape="rounded" />
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | `string \| number \| null` | - | Text shown next to the box, replaced by the default slot |
| value | `string \| number \| boolean` | `true` | Value stored in the model, used by `PCheckboxGroup` |
| shape | `'default' \| 'square' \| 'rounded'` | `default` | `rounded-sm` for `default`, sharp for `square`, circular for `rounded` |
| disabled | `boolean` | - | Disable the checkbox, also inherited from the group |
| model-value | `string \| number \| boolean \| (string \| number \| boolean)[]` | - | Checked state, or the array of values inside a group |
| indeterminate | `boolean` | - | Render a minus icon while the checkbox is unchecked |

## Events

| Name | Type | Description |
| --- | --- | --- |
| change | `(value: string \| number \| boolean) => void` | Emitted when the checkbox is toggled by a click. |
| update:modelValue | `(value: string \| number \| boolean) => void` | Emitted right after `change` with the same value. |

## CheckboxGroup Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| disabled | `boolean` | - | Disable every checkbox inside the group |
| options | `{ label, value, disabled? }[]` | `() => []` | Renders one `PCheckbox` per item when the default slot is empty |
| model-value | `string \| number \| boolean[]` | `() => []` | Values of the checked boxes, toggled on change |

## CheckboxGroup Events

| Name | Type | Description |
| --- | --- | --- |
| change | `(value: (string \| number \| boolean)[]) => void` | Emitted when a checkbox inside the group is checked or unchecked. |
| update:modelValue | `(value: (string \| number \| boolean)[]) => void` | Emitted right after `change` with the new list of checked values. |

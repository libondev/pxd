# Radio

Provides single user input from a selection of options.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref('one')
</script>

<template>
  <p>value: {{ value }}</p>

  <PStack direction="vertical" gap="2">
    <PRadio v-model="value" label="Option 1" value="one" />
    <PRadio v-model="value" value="two">Option 2</PRadio>
  </PStack>
</template>
```

## Group

Support all props of `stack` components

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref('one')
const options = [
  { label: 'Options 1', value: 'one' },
  { label: 'Options 2', value: 'tow' },
  { label: 'Options 3', value: 'three' },
]
</script>

<template>
  <p>value: {{ value }}</p>

  <PRadioGroup
    v-model="value"
    :options="options"
    gap="2"
    direction="vertical"
    class="mt-2"
  >
    <PRadio v-for="item of options" :key="item.value" :label="item.label" :value="item.value" />
  </PRadioGroup>

  <PRadioGroup
    v-model="value"
    :options="options"
    gap="2"
    disabled
    class="mt-6"
    direction="vertical"
  />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | `string \| number \| null` | - | - |
| value | `string \| number \| boolean` | - | - |
| disabled | `boolean` | - | - |
| model-value | `string \| number \| boolean` | - | - |

## RadioGroup Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| disabled | `boolean` | - | - |
| model-value | `string \| number \| boolean` | - | - |
| options | `{ label, value, disabled? }[]` | - | - |

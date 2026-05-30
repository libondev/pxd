# Switch

Choose between a set of options.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const modelValue = ref('1')
</script>

<template>
  <PStack align="center">
    <PSwitch v-model="modelValue" size="sm">
      <PSwitchItem value="1" label="Source" />
      <PSwitchItem value="2">Output</PSwitchItem>
    </PSwitch>

    <PSwitch v-model="modelValue" size="md">
      <PSwitchItem value="1" label="Source" />
      <PSwitchItem value="2">Output</PSwitchItem>
    </PSwitch>

    <PSwitch v-model="modelValue" size="lg">
      <PSwitchItem value="1" label="Source" />
      <PSwitchItem value="2">Output</PSwitchItem>
    </PSwitch>
  </PStack>
</template>
```

## Options

```vue demo
<script setup>
import { ref } from 'vue'

const modelValue = ref('1')

const options = [
  { label: 'Source', value: '1' },
  { label: 'Output', value: '2' },
]
</script>

<template>
  <PSwitch v-model="modelValue" :options="options" />
</template>
```

## Disabled

```vue demo
<script setup>
import { ref } from 'vue'

const modelValue = ref('1')

const options1 = [
  { label: 'Source', value: '1' },
  { label: 'Output', value: '2' },
]
const options2 = [
  { label: 'Source', value: '1' },
  { label: 'Output', value: '2', disabled: true },
]
</script>

<template>
  <PStack direction="vertical">
    <PSwitch v-model="modelValue" :options="options1" disabled />
    <PSwitch v-model="modelValue" :options="options2" />
  </PStack>
</template>
```

## Full width

```vue demo
<script setup>
import { ref } from 'vue'

const modelValue = ref('1')

const options = [
  { label: 'Source', value: '1' },
  { label: 'Output', value: '2' },
]
</script>

<template>
  <PSwitch v-model="modelValue" :options="options" full-width />
</template>
```

## Tooltip

```vue demo
<script setup>
import { ref } from 'vue'

const modelValue = ref('1')
</script>

<template>
  <PSwitch v-model="modelValue">
    <PTooltip content="View source" desktop-only>
      <PSwitchItem value="1" label="Source" />
    </PTooltip>

    <PTooltip content="View output" desktop-only>
      <PSwitchItem value="2" label="Output" />
    </PTooltip>
  </PSwitch>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| disabled | `boolean` | - | - |
| full-width | `boolean` | - | - |
| size | `'sm' \| 'md' \| 'lg'` | - | - |
| options | `{ label, value, disabled? }[]` | `() => []` | - |
| model-value | `string \| number` | `` | - |

## SwitchItem Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | `string \| number \| null` | - | - |
| value | `string \| number` | - | - |
| disabled | `boolean` | - | - |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |

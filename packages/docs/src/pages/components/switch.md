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
    <PSwitchGroup v-model="modelValue" size="sm">
      <PSwitch value="1" label="Source"></PSwitch>
      <PSwitch value="2">Output</PSwitch>
    </PSwitchGroup>

    <PSwitchGroup v-model="modelValue" size="md">
      <PSwitch value="1" label="Source"></PSwitch>
      <PSwitch value="2">Output</PSwitch>
    </PSwitchGroup>

    <PSwitchGroup v-model="modelValue" size="lg">
      <PSwitch value="1" label="Source"></PSwitch>
      <PSwitch value="2">Output</PSwitch>
    </PSwitchGroup>
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
  <PSwitchGroup v-model="modelValue" :options="options" />
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
    <PSwitchGroup v-model="modelValue" :options="options1" disabled />
    <PSwitchGroup v-model="modelValue" :options="options2" />
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
  <PSwitchGroup v-model="modelValue" :options="options" full-width />
</template>
```

## Tooltip

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
  <PSwitchGroup v-model="modelValue">
    <PTooltip content="View source" desktop-only>
      <PSwitch value="1" label="Source" />
    </PTooltip>

    <PTooltip content="View output" desktop-only>
      <PSwitch value="2" label="Output" />
    </PTooltip>
  </PSwitchGroup>
</template>
```

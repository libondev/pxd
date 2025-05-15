# Switch
Choose between a set of options.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const modelValue = ref('1')
</script>

<template>
  <PStack gap="6" align="center">
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

const options = [
  { label: 'Source', value: '1' },
  { label: 'Output', value: '2' },
]
</script>

<template>
  <PSwitchGroup v-model="modelValue" :options="options" />
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
  <PSwitchGroup v-model="modelValue" :options="options" block />
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

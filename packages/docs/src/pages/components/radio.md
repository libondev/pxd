# Radio

Provides single user input from a selection of options.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const modelValue = ref('one')
</script>

<template>
  <PStack direction="vertical">
    <PRadio v-model="modelValue" label="Option 1" value="one" />
    <PRadio v-model="modelValue" value="two">Option 2</PRadio>
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
  <PRadioGroup v-model="value" :options="options" gap="3" direction="vertical" />

  <PRadioGroup
    v-model="value"
    :options="options"
    gap="3"
    disabled
    class="mt-6"
    direction="vertical"
  />
</template>
```

## Radio standalone

Standalone unlabelled radio input for use in custom UI.

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref('one')
</script>

<template>
  <PStack align="center">
    <span>Option 1</span>
    <PRadio v-model="value" value="one" />
  </PStack>
</template>
```

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

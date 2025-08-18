# Checkbox
A control that toggles between two options, checked or unchecked.

## Default

```vue demo
<script setup>
const checked = ref(false)
</script>

<template>
  <div>isChecked: {{ checked }}</div>
  <PCheckbox v-model="checked" label="Checkbox" />
</template>
```

## Group

```vue demo
<script setup>
import { shallowRef, nextTick } from 'vue'

const value = shallowRef(['one'])
const checkboxGroupRef = shallowRef()

const options = [
  { label: 'Options 1', value: 'one' },
  { label: 'Options 2', value: 'two' },
  { label: 'Options 3', value: 'three' },
]

const isCheckedAll = shallowRef(false)
const isCheckedPartial = shallowRef(false)

watch(
  () => value.value,
  (v) => {
    if (!checkboxGroupRef.value) {
      return
    }

    nextTick(() => {
      isCheckedAll.value = checkboxGroupRef.value.isCheckedAll()
      isCheckedPartial.value = checkboxGroupRef.value.isCheckedPartial()
    })
  },
  { deep: 1, immediate: true }
)
</script>

<template>
  <div class="mb-2">checkedValues: {{ value }}</div>
  <div class="mb-2">isCheckedAll: {{ isCheckedAll }}</div>
  <div class="mb-2">isCheckedPartial: {{ isCheckedPartial }}</div>

  <PCheckboxGroup
    ref="checkboxGroupRef"
    v-model="value"
    :options="options"
    gap="3"
    direction="vertical"
  />

  <PCheckboxGroup
    v-model="value"
    :options="options"
    gap="3"
    disabled
    direction="vertical"
    class="mt-6"
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

## Checkbox standalone
Standalone unlabelled checkbox input for use in custom UI.

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(false)
</script>

<template>
  <PStack align="center">
    <span>Option 1</span>
    <PCheckbox v-model="value" />
  </PStack>
</template>
```

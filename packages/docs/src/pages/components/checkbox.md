# Checkbox
A control that toggles between two options, checked or unchecked.

## Default

```vue demo
<script setup>
const checked = ref(false)
</script>

<template>
  <PCheckbox v-model="checked" label="Checkbox" />
</template>
```

## Indeterminate

```vue demo
<script setup>
const checked = ref(false)
</script>

<template>
  <PCheckbox v-model="checked" label="Checkbox" indeterminate />
</template>
```

## Disabled

```vue demo
<script setup>
const checked = ref(false)
const checked2 = ref(true)
</script>

<template>
  <PStack direction="col">
    <PCheckbox v-model="checked" label="Disabled" disabled />
    <PCheckbox v-model="checked2" label="Disabled Checked" disabled />
    <PCheckbox v-model="checked" label="Disabled Indeterminate" disabled indeterminate />
  </PStack>
</template>
```

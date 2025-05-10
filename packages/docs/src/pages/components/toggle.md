# Toggle
Switch between two values

## Default

```vue demo
<script setup>
  import { ref } from 'vue'

  const isChecked = ref(false)
</script>

<template>
  <PToggle v-model="isChecked" />
</template>
```

## Sizes

```vue demo
<script setup>
  import { ref } from 'vue'

  const isChecked = ref(false)
</script>

<template>
  <PStack gap="8">
    <PToggle v-model="isChecked" size="sm" />
    <PToggle v-model="isChecked" />
    <PToggle v-model="isChecked" size="lg" />
  </PStack>
</template>
```

## Custom Color

```vue demo
<script setup>
  import { ref } from 'vue'

  const isChecked = ref(false)
</script>

<template>
  <PToggle
    v-model="isChecked"
    inactive-bg-color="var(--color-red-700)"
    active-bg-color="var(--color-green-700)"
  />
</template>
```

## With Label

```vue demo
<script setup>
  import { ref } from 'vue'

  const isChecked = ref(false)
</script>

<template>
  <PToggle
    v-model="isChecked"
    inactive-label="Uncheck"
    active-label="Checked"
  />
</template>
```

## Custom checked value
You can customize the selected and unselected values.

```vue demo
<script setup>
  import { ref } from 'vue'

  const customValue = ref(false)
</script>

<template>
  <PToggle
    v-model="customValue"
    inactive-label="Closed"
    active-label="Opened"
    inactive-value="closed"
    active-value="opened"
  />
</template>
```

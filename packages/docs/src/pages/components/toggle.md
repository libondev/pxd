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
  <PStack align="center">
    <PToggle v-model="isChecked" size="sm" />
    <PToggle v-model="isChecked" />
    <PToggle v-model="isChecked" size="lg" />
  </PStack>
</template>
```

## Loading/Disabled

```vue demo
<script setup>
import { ref } from 'vue'

const isChecked1 = ref(false)
const isChecked2 = ref(true)
</script>

<template>
  <PStack direction="vertical">
    <PToggle v-model="isChecked1" loading />
    <PToggle v-model="isChecked2" loading />
    <PToggle v-model="isChecked1" disabled />
    <PToggle v-model="isChecked2" disabled />
  </PStack>
</template>
```

## Async

Set an asynchronous or synchronous function to decide whether to allow this modification.

```vue demo
<script setup>
import { ref } from 'vue'

const isChecked = ref(false)
const isLoading = ref(false)

function onBeforeChange(v) {
  return new Promise((resolve) => {
    isLoading.value = true
    setTimeout(() => {
      resolve(true)
    }, 500)
  }).finally(() => {
    isLoading.value = false
  })
}
</script>

<template>
  <PToggle v-model="isChecked" :loading="isLoading" :before-change="onBeforeChange" />
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
    active-color="var(--color-green-700)"
    inactive-color="var(--color-red-700)"
  />
</template>
```

## Icons

```vue demo
<script setup>
import { ref } from 'vue'
import LockOpenIcon from '@gdsicon/vue/lock-open'
import LockClosedIcon from '@gdsicon/vue/lock-closed'

const isChecked1 = ref(false)
const isChecked2 = ref(true)
</script>

<template>
  <PStack>
    <PToggle v-model="isChecked1">
      <template #checked>
        <LockClosedIcon />
      </template>

      <template #unchecked>
        <LockOpenIcon />
      </template>
    </PToggle>

    <PToggle v-model="isChecked2">
      <template #checked>
        <LockClosedIcon />
      </template>

      <template #unchecked>
        <LockOpenIcon />
      </template>
    </PToggle>
  </PStack>
</template>
```

## With Label

```vue demo
<script setup>
import { ref } from 'vue'

const isChecked = ref(false)
</script>

<template>
  <PToggle v-model="isChecked" inactive-label="Uncheck" active-label="Checked" />
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

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| size | `'sm' \| 'md' \| 'lg'` | - | Track size of the switch, falls back to the config provider size |
| loading | `boolean` | - | Show a spinner in the handle and ignore user input |
| disabled | `boolean` | - | Disable the switch and dim the handle |
| model-value | `boolean \| number \| string \| undefined` | - | Current value, checked against `active-value` |
| active-value | `boolean \| number \| string \| undefined` | `true` | Value emitted when the switch is turned on |
| inactive-value | `boolean \| number \| string \| undefined` | `false` | Value emitted when the switch is turned off |
| before-change | `ComponentBeforeChange<ValueType>` | - | Sync or async guard, a falsy result rejects the change |
| active-color | `string` | - | Track color when checked, accepts any CSS color |
| inactive-color | `string` | - | Track color when unchecked, accepts any CSS color |
| active-label | `string` | - | Text shown beside the switch when it is on |
| inactive-label | `string` | - | Text shown beside the switch when it is off |

## Events

| Name | Type | Description |
| --- | --- | --- |
| change | `(value: boolean \| number \| string) => void` | Emitted when the switch is toggled and the `before-change` guard allows it. |
| update:modelValue | `(value: boolean \| number \| string) => void` | Emitted when the active or inactive value is written to the model. |

# Fader

Indicates that there is still something to show in a certain direction.

## Default

```vue demo
<script setup>
import { shallowRef } from 'vue'

const containerRef = shallowRef()
const direction = shallowRef('both')

const options = [
  { label: 'Both', value: 'both' },
  { label: 'Only Horizontal', value: 'horizontal' },
  { label: 'Only Vertical', value: 'vertical' },
]
</script>

<template>
  <PStack direction="vertical">
    <PSwitch v-model="direction" :options="options" />

    <div class="relative size-50 max-w-full rounded-lg border border-dashed">
      <div ref="containerRef" class="size-full overflow-scroll">
        <div class="size-100"></div>
      </div>

      <PFader :direction="direction" :container="containerRef" />
    </div>
  </PStack>
</template>
```

## Stylize

```vue demo
<script setup>
import { shallowRef } from 'vue'

const containerRef = shallowRef()
</script>

<template>
  <div class="relative size-50 max-w-full rounded-lg border border-dashed">
    <div ref="containerRef" class="size-full overflow-scroll">
      <div class="size-100"></div>
    </div>

    <PFader :size="50" color="var(--color-blue-300)" :container="containerRef" />
  </div>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| size | `number` | - | - |
| color | `string` | - | - |
| container | `string \| object` | - | - |
| direction | `'horizontal' \| 'vertical' \| 'both'` | `both` | - |

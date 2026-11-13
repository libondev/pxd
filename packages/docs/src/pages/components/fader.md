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

      <PFader :direction="direction" :scroll-target="containerRef" />
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

    <PFader :size="50" color="var(--color-blue-300)" :scroll-target="containerRef" />
  </div>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| size | `number` | `16` | Gradient width in `px` |
| color | `string` | - | CSS color the gradient fades into |
| threshold | `number` | `16` | Distance in `px` from the end at which the fader is hidden |
| scroll-target | `string \| HTMLElement \| ComponentPublicInstance \| null` | - | Scrollable container to watch: a CSS selector, an element, or a component instance |
| direction | `'horizontal' \| 'vertical' \| 'both'` | `both` | Edges that can show a fader: `horizontal`, `vertical` or `both` |

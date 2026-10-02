# Rolling Number

Display a number with a rolling animation effect, supporting decimals and thousands separators.

## Default

```vue demo
<template>
  <PRollingNumber :value="999" />
</template>
```

## Thousands

```vue demo
<template>
  <PRollingNumber :value="1000" thousands />
</template>
```

## Durations

```vue demo
<template>
  <PRollingNumber :value="999" :durations="5000" />
</template>
```

## With suffix

Numbers between different fonts may shake when they change, and `tabular-nums` class can be added to reduce the jitter.

```vue demo
<template>
  <PRollingNumber value="999+ Users" class="tabular-nums" :durations="5000" />
</template>
```

## Scroll mode

Per-digit reel that rolls from bottom to top.

```vue demo
<script setup>
import { ref } from 'vue'

const number = ref(1234)

function changeValue() {
  number.value += Math.floor(Math.random() * 900) + 100
}
</script>

<template>
  <PStack direction="vertical">
    <PButton @click="changeValue">Change</PButton>

    <PRollingNumber :value="number" mode="scroll" thousands class="text-2xl tabular-nums" />
  </PStack>
</template>
```

## Without mount animation

```vue demo
<script setup>
import { ref } from 'vue'

const number = ref(999)

function changeValue() {
  number.value += 999
}
</script>

<template>
  <PStack direction="vertical">
    <PButton @click="changeValue">Change</PButton>

    <PRollingNumber :value="number" :animate-on-mount="false" class="block" />
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| value | `number \| string` | `0` | Target number. A string may include a numeric prefix plus unit/suffix (e.g. `"999+ Users"`). |
| durations | `number` | `2000` | Animation duration in milliseconds. |
| animateOnMount | `boolean` | `true` | Whether to play the animation on first mount. When `false`, the initial value is shown as-is; later value changes still animate. |
| thousands | `boolean` | `false` | Format the integer part with thousand separators. |
| mode | `'tween' \| 'scroll'` | `'tween'` | `tween` interpolates the value; `scroll` rolls each digit |

## Events

| Name | Type | Description |
| --- | --- | --- |
| finish | `() => void` | Emitted when the animation finishes on the target value. |

## Methods

| Name | Type | Description |
| --- | --- | --- |
| displayValue | `number` | The value the running animation is currently displaying. |
| formattedValue | `string` | `displayValue` formatted with the current decimal places and thousands setting. |

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

## No immediate

```vue demo
<script setup>
import { ref } from 'vue'

const number = ref(999)

function changeValue() {
  number.value += 999
}
</script>

<template>
  <PButton @click="changeValue">Change</PButton>

  <PRollingNumber :value="number" :immediate="false" class="block" />
</template>
```

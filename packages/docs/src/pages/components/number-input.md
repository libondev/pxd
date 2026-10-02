# Number Input

Input box for entering numbers only.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const number = ref(0)
</script>

<template>
  <PNumberInput v-model="number" class="max-w-xs" />
</template>
```

## Sizes

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(1)
</script>

<template>
  <PStack direction="vertical">
    <PNumberInput v-model="value" size="sm" class="max-w-xs" />
    <PNumberInput v-model="value" size="md" class="max-w-xs" />
    <PNumberInput v-model="value" size="lg" class="max-w-xs" />
  </PStack>
</template>
```

## Disabled

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(2)
</script>

<template>
  <PNumberInput v-model="value" disabled class="max-w-xs" />
</template>
```

## Step

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(0)
</script>

<template>
  <PNumberInput v-model="value" :step="2" class="max-w-xs" />
</template>
```

## Max/Min

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(0)
</script>

<template>
  <PNumberInput v-model="value" :min="0" :max="10" class="max-w-xs" />
</template>
```

## Precision

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(0)
</script>

<template>
  <PNumberInput v-model="value" :precision="2" :step="0.68" class="max-w-xs" />
</template>
```

## Thousands format

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(10000)
</script>

<template>
  <PStack direction="vertical">
    <PNumberInput v-model="value" thousands class="max-w-xs" />
    <PNumberInput v-model="value" thousands thousands-separator="_" class="max-w-xs" />
  </PStack>
</template>
```

## No controls

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(0)
</script>

<template>
  <PNumberInput v-model="value" :controls="false" class="max-w-xs" />
</template>
```

## Icons

```vue demo
<script setup>
import { ref } from 'vue'
import PlusCircleIcon from '@gdsicon/vue/plus-circle'
import MinusCircleIcon from '@gdsicon/vue/minus-circle'

const value = ref(0)
</script>

<template>
  <PNumberInput v-model="value" class="max-w-xs">
    <template #minusIcon>
      <MinusCircleIcon />
    </template>

    <template #plusIcon>
      <PlusCircleIcon />
    </template>
  </PNumberInput>
</template>
```

## Prefix and Suffix

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(0)
</script>

<template>
  <PNumberInput v-model="value" class="max-w-xs">
    <template #prefix>
      <span class="pl-2">￥</span>
    </template>

    <template #suffix>
      <span class="pr-2">RMB</span>
    </template>
  </PNumberInput>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| min | `number` | `Number.MIN_SAFE_INTEGER` | Lowest value the control accepts |
| max | `number` | `Number.MAX_SAFE_INTEGER` | Highest value the control accepts |
| step | `number` | `1` | Amount added or removed per step, also drives `ArrowUp` and `ArrowDown` |
| readonly | `boolean` | - | Accept focus but block editing and the step controls |
| disabled | `boolean` | - | Block all interaction and grey out the control |
| controls | `boolean` | `true` | Show the plus and minus buttons |
| precision | `number` | - | Fixed number of decimal places, inferred from `step` when omitted |
| thousands | `boolean` | - | Group the integer part with the separator while the input is not focused |
| thousands-separator | `string` | `','` | Character placed between each group of three digits |
| scientific | `boolean` | `true` | Allow `e` and `E` so users can type scientific notation |
| clear-value | `number \| null` | `null` | Value restored by the built-in clear button |
| model-value | `number \| null` | - | Current value, `null` when the field is empty |

## Events

| Name | Type | Description |
| --- | --- | --- |
| blur | `(event: FocusEvent) => void` | Emitted when the input loses focus, after the value has been clamped back into range. |
| focus | `(event: FocusEvent) => void` | Emitted when the input gains focus. |
| change | `(value: number \| null, event: Event) => void` | Emitted when the inner input reports a committed change, on blur after an edit, on Enter, or when the clear button is used. |
| update:modelValue | `(value: number \| null) => void` | Emitted whenever the component writes a new value, from typing, the step controls, the arrow keys, or blur clamping. |

## Slots

| Name | Description |
| --- | --- |
| minusIcon | minusIcon slot |
| plusIcon | plusIcon slot |
| prefix | Prefix slot |
| suffix | Suffix slot |

# Steps

Guide the user to complete tasks in accordance with the process.

Steps are driven by the `options` prop; the indicators and labels are rendered by
`PSteps` itself, so the markup also exists in server-rendered HTML.

Use `v-model` to control the current step index (starting from `0`).

```vue demo
<script setup>
import { ref } from 'vue'

const current = ref(1)

const options = [
  { description: 'Review items in your cart', title: 'Cart' },
  { description: 'Choose a payment method', title: 'Payment' },
  { description: 'Order confirmed', title: 'Done' },
]
</script>

<template>
  <PSteps v-model="current" :options="options" />
</template>
```

## Clickable

Set `clickable` to allow switching steps by clicking.

```vue demo
<script setup>
import { ref } from 'vue'

const current = ref(1)

const options = [
  { description: 'Review items in your cart', title: 'Cart' },
  { description: 'Choose a payment method', title: 'Payment' },
  { description: 'Order confirmed', title: 'Done' },
]
</script>

<template>
  <PSteps v-model="current" clickable :options="options" />
</template>
```

## Uncontrolled

Without `v-model` the steps keep their own state, and `default-value` picks the current step.

```vue demo
<script setup>
import { ref } from 'vue'

const options = [
  { title: 'Cart' },
  { title: 'Payment' },
  { title: 'Done' },
]
</script>

<template>
  <PSteps clickable default-value="1" :options="options" />
</template>
```

## Vertical

Set `direction` to `vertical` to lay steps out vertically.

```vue demo
<script setup>
import { ref } from 'vue'

const current = ref(1)

const options = [
  { description: 'Review items in your cart', title: 'Cart' },
  { description: 'Choose a payment method', title: 'Payment' },
  { description: 'Order confirmed', title: 'Done' },
]
</script>

<template>
  <PSteps v-model="current" direction="vertical" clickable :options="options" />
</template>
```

## Status

Set `status` on `PSteps` to control the current step's status. Set `status` on an option to
override the derived status.

```vue demo
<script setup>
import { ref } from 'vue'

const current = ref(1)

const options = [
  { description: 'Review items in your cart', title: 'Cart' },
  { description: 'Payment failed, please retry', title: 'Payment' },
  { description: 'Order confirmed', title: 'Done' },
]
</script>

<template>
  <PSteps v-model="current" status="error" :options="options" />
</template>
```

## Size

```vue demo
<script setup>
import { ref } from 'vue'

const current = ref(1)

const options = [{ title: 'Cart' }, { title: 'Payment' }, { title: 'Done' }]
</script>

<template>
  <div class="flex flex-col gap-8">
    <PSteps v-model="current" size="sm" :options="options" />
    <PSteps v-model="current" size="md" :options="options" />
    <PSteps v-model="current" size="lg" :options="options" />
  </div>
</template>
```

## Disabled

Set `disabled` on an option to make it unclickable.

```vue demo
<script setup>
import { ref } from 'vue'

const current = ref(0)

const options = [
  { title: 'Cart' },
  { disabled: true, title: 'Payment' },
  { disabled: true, title: 'Done' },
]
</script>

<template>
  <PSteps v-model="current" clickable :options="options" />
</template>
```

## Custom step

The `item` slot replaces the default indicator and labels. It receives the option, its index
and the resolved status.

```vue demo
<script setup>
import { ref } from 'vue'

const current = ref(1)

const options = [{ title: 'Cart' }, { title: 'Payment' }, { title: 'Done' }]
</script>

<template>
  <PSteps v-model="current" clickable :options="options">
    <template #item="{ item, status }">
      <strong>{{ item.title }}</strong>
      <span class="text-gray-600">({{ status }})</span>
    </template>
  </PSteps>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| model-value | `number` | - | Index of the current step, starting from `0`. |
| default-value | `number` | `0` | Step selected before the consumer binds `v-model`. |
| direction | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction of steps. |
| status | `'process' \| 'finish' \| 'error' \| 'wait'` | `'process'` | Status of the current step. |
| size | `'sm' \| 'md' \| 'lg'` | `configProvider.size` | Size of indicators and text. |
| clickable | `boolean` | `false` | Allow switching steps by clicking. |
| options | `StepsOption[]` | `[]` | Steps to render; each entry is `{ title?, description?, status?, disabled? }`. |

## Events

| Name | Type | Description |
| --- | --- | --- |
| change | `(value: number) => void` | Emitted when the current step changes. |
| update:modelValue | `(value: number) => void` | Emitted together with `change`. |

## Slots

| Name | Scope | Description |
| --- | --- | --- |
| item | `{ item, index, status }` | Replaces the indicator and labels of a step. |

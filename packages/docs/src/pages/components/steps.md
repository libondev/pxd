# Steps

Guide the user to complete tasks in accordance with the process.

## Default

Use `v-model` to control the current step index (starting from `0`).

```vue demo
<script setup>
import { ref } from 'vue'

const current = ref(1)
</script>

<template>
  <PSteps v-model="current">
    <PStepsItem title="Cart" description="Review items in your cart" />
    <PStepsItem title="Payment" description="Choose a payment method" />
    <PStepsItem title="Done" description="Order confirmed" />
  </PSteps>
</template>
```

## Clickable

Set `clickable` to allow switching steps by clicking.

```vue demo
<script setup>
import { ref } from 'vue'

const current = ref(1)
</script>

<template>
  <PSteps v-model="current" clickable>
    <PStepsItem title="Cart" description="Review items in your cart" />
    <PStepsItem title="Payment" description="Choose a payment method" />
    <PStepsItem title="Done" description="Order confirmed" />
  </PSteps>
</template>
```

## Vertical

Set `direction` to `vertical` to lay steps out vertically.

```vue demo
<script setup>
import { ref } from 'vue'

const current = ref(1)
</script>

<template>
  <PSteps v-model="current" direction="vertical" clickable>
    <PStepsItem title="Cart" description="Review items in your cart" />
    <PStepsItem title="Payment" description="Choose a payment method" />
    <PStepsItem title="Done" description="Order confirmed" />
  </PSteps>
</template>
```

## Status

Set `status` on `PSteps` to control the current step's status. Set `status` on a `PStepsItem` to override the derived status.

```vue demo
<script setup>
import { ref } from 'vue'

const current = ref(1)
</script>

<template>
  <PSteps v-model="current" status="error">
    <PStepsItem title="Cart" description="Review items in your cart" />
    <PStepsItem title="Payment" description="Payment failed, please retry" />
    <PStepsItem title="Done" description="Order confirmed" />
  </PSteps>
</template>
```

## Size

```vue demo
<script setup>
import { ref } from 'vue'

const current = ref(1)
</script>

<template>
  <div class="flex flex-col gap-8">
    <PSteps v-model="current" size="sm">
      <PStepsItem title="Cart" />
      <PStepsItem title="Payment" />
      <PStepsItem title="Done" />
    </PSteps>

    <PSteps v-model="current" size="md">
      <PStepsItem title="Cart" />
      <PStepsItem title="Payment" />
      <PStepsItem title="Done" />
    </PSteps>

    <PSteps v-model="current" size="lg">
      <PStepsItem title="Cart" />
      <PStepsItem title="Payment" />
      <PStepsItem title="Done" />
    </PSteps>
  </div>
</template>
```

## Disabled

Set `disabled` on a `PStepsItem` to make it unclickable.

```vue demo
<script setup>
import { ref } from 'vue'

const current = ref(0)
</script>

<template>
  <PSteps v-model="current">
    <PStepsItem title="Cart" />
    <PStepsItem title="Payment" disabled />
    <PStepsItem title="Done" disabled />
  </PSteps>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| model-value | `number` | - | Index of the current step, starting from `0`. |
| direction | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction of steps. |
| status | `'process' \| 'finish' \| 'error' \| 'wait'` | `'process'` | Status of the current step. |
| size | `'sm' \| 'md' \| 'lg'` | `configProvider.size` | Size of indicators and text. |
| clickable | `boolean` | `false` | Allow switching steps by clicking. |

## StepsItem Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| title | `string` | - | Step title. |
| description | `string` | - | Step description. |
| status | `'process' \| 'finish' \| 'error' \| 'wait'` | - | Overrides the derived status. |
| disabled | `boolean` | `false` | Makes the step unclickable. |

## Events

| Name | Payload | Description |
| --- | --- | --- |
| change | `number` | Emitted when the current step changes. |
| update:model-value | `number` | Emitted when the current step changes. |

## StepsItem Slots

| Name | Description |
| --- | --- |
| title | Custom title content. |
| description | Custom description content. |

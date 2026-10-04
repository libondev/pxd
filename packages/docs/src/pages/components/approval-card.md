# Approval Card

Inline confirmation card for agent workflows. It shows the command an agent wants to run and waits for the user to allow or skip it, reporting the decision back through events.

## Default

```vue demo
<template>
  <PApprovalCard command="pnpm db:migrate && pnpm build" @decide="onDecide" />
</template>

<script setup>
import { ref } from 'vue'

const result = ref(null)

function onDecide(value) {
  result.value = value
}
</script>
```

## Command lines

An array renders one command per line.

```vue demo
<template>
  <PStack direction="vertical" class="gap-3">
    <PApprovalCard
      title="Run these migrations?"
      :command="['pnpm db:migrate', 'pnpm build']"
      variant="error"
    />

    <PApprovalCard title="Install dependencies?" command="pnpm install" />
  </PStack>
</template>
```

## Variants

`variant` tints the leading icon.

```vue demo
<template>
  <PStack direction="vertical" class="gap-3">
    <PApprovalCard variant="primary" command="pnpm lint" />
    <PApprovalCard variant="success" command="pnpm test" />
    <PApprovalCard variant="warning" command="pnpm build" />
    <PApprovalCard variant="error" command="rm -rf dist" />
  </PStack>
</template>
```

## Always allow

`rememberable` adds a checkbox whose state is carried into the `approve` result.

```vue demo
<template>
  <PApprovalCard rememberable command="pnpm db:migrate" @approve="onApprove" />
</template>

<script setup>
function onApprove(result) {
  console.log(result.remember)
}
</script>
```

## Timeout

`timeout` dismisses an undecided card after the given milliseconds. The result carries `cause: 'timeout'`, so the host can tell an expired wait from an active skip.

```vue demo
<template>
  <PApprovalCard :timeout="10000" command="pnpm deploy" @decide="onDecide" />
</template>

<script setup>
function onDecide(result) {
  console.log(result)
}
</script>
```

## Controlled

`v-model` owns the status, so the host can swap the card for a running state once the command is allowed.

```vue demo
<script setup>
import { ref } from 'vue'

const status = ref('pending')
const isRunning = ref(false)

function onApprove() {
  status.value = 'approved'
  isRunning.value = true

  setTimeout(() => {
    status.value = 'pending'
    isRunning.value = false
  }, 1500)
}

function onReset() {
  status.value = 'pending'
}
</script>

<template>
  <PStack direction="vertical" class="gap-3">
    <PApprovalCard v-model="status" :loading="isRunning" command="pnpm build" @approve="onApprove" />

    <PButton @click="onReset">Reset</PButton>
  </PStack>
</template>
```

## Imperative

The card exposes its decisions through a template `ref`, so a host can settle the request itself.

```vue demo
<template>
  <PStack direction="vertical" class="gap-3">
    <PApprovalCard ref="card" command="pnpm build" />

    <PButton @click="approveAll">Always allow</PButton>
  </PStack>
</template>

<script setup>
import { ref } from 'vue'

const card = ref(null)

function approveAll() {
  card.value.approve()
}
</script>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| modelValue | `'pending' \| 'approved' \| 'rejected' \| 'dismissed'` | - | Controlled status; the card manages its own status when omitted |
| title | `ComponentLabel` | `'Run this command?'` | Card heading |
| description | `ComponentLabel` | - | Secondary line under the title |
| command | `string \| string[]` | - | Command text; an array renders one command per line |
| variant | `'primary' \| 'error' \| 'warning' \| 'success'` | `'warning'` | Risk level, tints the leading icon |
| loading | `boolean` | `false` | Disables the actions and spins the approve button |
| timeout | `number` | `0` | Milliseconds before an undecided card dismisses itself; `0` never times out |
| rememberable | `boolean` | `false` | Shows the "Always allow" checkbox |
| closeOnPressEscape | `boolean` | `true` | Dismisses the card when Escape is pressed while focus is inside it |
| disabled | `boolean` | `false` | Disables the actions |

## Events

| Name | Type | Description |
| --- | --- | --- |
| update:modelValue | `(status: ApprovalStatus) => void` | Emitted when the card settles on a decision. |
| decide | `(result: ApprovalResult) => void` | Emitted on every decision, whichever way it went. |
| approve | `(result: ApprovalResult) => void` | Emitted when the command is allowed. |
| reject | `(result: ApprovalResult) => void` | Emitted when the command is refused. |

```ts
interface ApprovalResult {
  status: 'approved' | 'rejected' | 'dismissed'
  /** Only set on `dismissed`: separates an active skip from the timeout that ends the wait. */
  cause?: 'escape' | 'close' | 'timeout'
  reason?: string
  remember?: boolean
}
```

## Methods

| Name | Type | Description |
| --- | --- | --- |
| status | `ApprovalStatus` | Current status of the card. |
| approve | `(reason?: string) => void` | Allow the command imperatively. |
| reject | `(reason?: string) => void` | Refuse the command imperatively. |
| dismiss | `(cause?: ApprovalCause) => void` | End the request without allowing or refusing it. |
| reset | `() => void` | Return the card to `pending` and restart the timeout. |

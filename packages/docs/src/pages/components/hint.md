# Hint

Display a transient hint above the element that was interacted with, closed automatically after a delay.

## Default


```vue demo
<script setup>
import { ref } from 'vue'

const savePromise = ref()

function save() {
  savePromise.value = new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.5) {
        resolve()
      } else {
        reject(new Error('The request failed, try again.'))
      }
    }, 1200)
  })
}
</script>

<template>
  <PHint :promise="savePromise">
    <template #default="{ status }">
      <PButton :loading="status === 'pending'" @click="save">Save</PButton>
    </template>

    <template #content="{ status, error }">
      <span v-if="status === 'pending'">Saving...</span>
      <span v-else-if="status === 'error'">{{ error.message }}</span>
      <span v-else>Saved</span>
    </template>
  </PHint>
</template>
```

## Status

```vue demo
<script setup>
import { ref } from 'vue'

const successPromise = ref()
const errorPromise = ref()

function createRequest(shouldFail) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('The request failed, try again.'))
      } else {
        resolve('Saved')
      }
    }, 1200)
  })
}
</script>

<template>
  <PStack>
    <PHint :promise="successPromise">
      <template #default="{ status }">
        <PButton :loading="status === 'pending'" @click="successPromise = createRequest(false)">
          Succeed
        </PButton>
      </template>

      <template #content="{ status, value }">
        <span v-if="status === 'pending'">Saving...</span>
        <span v-else>{{ value }}</span>
      </template>
    </PHint>

    <PHint :promise="errorPromise">
      <template #default="{ status }">
        <PButton :loading="status === 'pending'" @click="errorPromise = createRequest(true)">
          Fail
        </PButton>
      </template>

      <template #content="{ status, error }">
        <span v-if="status === 'pending'">Saving...</span>
        <span v-else>{{ error.message }}</span>
      </template>
    </PHint>
  </PStack>
</template>
```

## Duration

Set `duration` to control how long the hint stays open once the request has settled — a pending `promise` keeps it open for as long as it takes. `0` keeps it open until something else closes it.

```vue demo
<template>
  <PStack>
    <PHint :duration="500" content="Closed after 0.5s">
      <PButton>500ms</PButton>
    </PHint>

    <PHint content="Closed after 1s(default)">
      <PButton>1000ms(default)</PButton>
    </PHint>

    <PHint :duration="0" closeable content="Until you shut it down manually">
      <PButton>0ms</PButton>
    </PHint>
  </PStack>
</template>
```

## Closeable

Set `closeable` to render a button that closes the hint by hand.

```vue demo
<template>
  <PHint closeable content="The Evil Rabbit Jumped over the Fence">
    <PButton>Click me</PButton>
  </PHint>
</template>
```

## Pause on hover

By default the countdown pauses while the pointer is inside the hint and resumes with the remaining time, so pointing at it — or reaching for the close button — cannot make it disappear mid-gesture.

```vue demo
<template>
  <PHint closeable :duration="5000" content="Hover me to pause the countdown">
    <PButton>Click me</PButton>
  </PHint>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| content | `string` | - | Plain text content, overridable by the `content` slot |
| promise | `Promise<unknown>` | - | Request the hint reports on: it stays open until it settles, then the countdown runs and the outcome picks the colors |
| position | `'top' \| 'right' \| 'bottom' \| 'left' \| ...` | `top` | Preferred placement, flipped when there is no room; `-start` and `-end` align to the edge |
| duration | `number` | `1000` | Delay in `ms` before the hint closes itself, counted once the promise has settled or when `content` changes while it is open; `0` never closes it |
| closeable | `boolean` | `false` | Render a button that closes the hint |
| pause-on-hover | `boolean` | `true` | Pause the countdown while the pointer is inside the hint |
| content-class | `string \| any[] \| object` | - | Extra class merged into the hint content element |

## Events

| Name | Type | Description |
| --- | --- | --- |
| close | `() => void` | Emitted when the hint closes, whether by its own countdown or the close button. |

## Slots

| Name | Description |
| --- | --- |
| default | Trigger content. Slot props: `status`. |
| content | Custom content of the hint. Slot props: `status`, `value`, `error`, `activeTrigger`, `activeTriggerIndex`. |

# Hold Button

Press and hold the button to trigger some logic (such as delete).

## Default

HoldButton extends the [Button component](/components/button).

```vue demo
<script setup>
import confetti from 'canvas-confetti'

function onConfirm() {
  confetti()
}

function onFinished(isFinished) {
  if (!isFinished) {
    return
  }

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.7 },
  })
}
</script>

<template>
  <PHoldButton @confirm="onConfirm" @release="onFinished"> Hole me </PHoldButton>
</template>
```

## Durations

Set the `durations` property to determine how long it will trigger.

It receives a number or a number of string type (if it cannot be converted by `Number()`, the default value will be 2000).

```vue demo
<template>
  <PHoldButton :durations="1000"> Lasts one second </PHoldButton>
</template>
```

## Variants

You can set the same `variant` property as the button.

```vue demo
<template>
  <PStack>
    <PHoldButton>default</PHoldButton>
    <PHoldButton variant="ghost">ghost</PHoldButton>
    <PHoldButton variant="error">error</PHoldButton>
    <PHoldButton variant="primary" progress-color="var(--color-background-100)">primary</PHoldButton>
    <PHoldButton variant="success">success</PHoldButton>
    <PHoldButton disabled>disabled</PHoldButton>
    <PHoldButton loading>loading</PHoldButton>
  </PStack>
</template>
```

## Colors

Set `progress-color` to modify the color of the progress bar.

```vue demo
<template>
  <PHoldButton durations="1000" progress-color="var(--color-red-500)"> Lasts one second </PHoldButton>
</template>
```

## Cancelable

After `cancelable` is set, the process can be cancelled while mouse is holding and leaving the button. At the same time, you can listen to the `cancel` event to know when it has been cancelled.

```vue demo
<script setup>
import confetti from 'canvas-confetti'

function onCanceled() {
  alert('canceled')
}

function onFinished(isFinished) {
  if (isFinished) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.7 },
    })
  }
}
</script>

<template>
  <PHoldButton durations="1000" cancelable @cancel="onCanceled" @release="onFinished">
    Lasts one second
  </PHoldButton>
</template>
```

## Scalable

Set `scalable="false"` to disable zooming when pressed.

```vue demo
<template>
  <PHoldButton durations="1000" :scalable="false"> Lasts one second </PHoldButton>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| vibrate | `boolean` | `true` | Vibrate the device for 100 ms after release |
| disabled | `boolean` | - | Disable the button and ignore pointer interaction |
| scalable | `boolean` | `true` | Scale the button down while it is pressed |
| durations | `number \| string` | - | Hold time in `ms` before confirm, defaults to `2000` |
| cancelable | `boolean` | - | Allow cancelling by moving the pointer off the button |
| progress-color | `string` | - | CSS colour used for the filling progress overlay |

## Events

| Name | Type | Description |
| --- | --- | --- |
| cancel | `() => void` | Emitted when a holding pointer leaves the button while `cancelable` is set. |
| confirm | `() => void` | Emitted when the progress overlay has fully filled up. |
| release | `(confirmed: boolean) => void` | Emitted when the pointer is released or cancelled after a press. |
| pointerup | `(ev: PointerEvent) => void` | Emitted together with `release` when the document receives a pointer release after a press. |
| pointerdown | `(ev: PointerEvent) => void` | Emitted when the button is pressed. |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |

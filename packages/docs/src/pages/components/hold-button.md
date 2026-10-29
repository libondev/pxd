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
</script>

<template>
  <PHoldButton @confirm="onConfirm"> Hole me </PHoldButton>
</template>
```

## Duration

Set the `duration` property to determine how long it will trigger.

```vue demo
<template>
  <PHoldButton ::duration="1000"> Lasts one second </PHoldButton>
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
  <PHoldButton :duration="1000" progress-color="var(--color-red-500)"> Lasts one second </PHoldButton>
</template>
```

## Cancel

Releasing the button before the hold completes emits `cancel` with the progress reached at that moment (from `0` to `1`).

```vue demo
<script setup>
import confetti from 'canvas-confetti'

function onCanceled(progress) {
  alert(`canceled at ${Math.round(progress * 100)}%`)
}
</script>

<template>
  <PHoldButton :duration="1000" @confirm="confetti" @cancel="onCanceled">
    Lasts one second
  </PHoldButton>
</template>
```

Moving the pointer off the button pauses the hold; moving it back resumes from where it stopped.

## Scalable

Set `scalable="false"` to disable zooming when pressed.

```vue demo
<template>
  <PHoldButton :duration="1000" :scalable="false"> Lasts one second </PHoldButton>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| vibrate | `boolean` | `true` | Vibrate the device for 100 ms when the hold completes |
| disabled | `boolean` | - | Disable the button and ignore pointer interaction |
| scalable | `boolean` | `true` | Scale the button down while it is pressed |
| duration | `number` | - | Hold time in `ms` before confirm, defaults to `2000` |
| progress-color | `string` | - | CSS colour used for the filling progress overlay |

## Events

| Name | Type | Description |
| --- | --- | --- |
| cancel | `(progress: number) => void` | Emitted when the pointer is released before the hold completes. |
| confirm | `() => void` | Emitted when the progress overlay has fully filled up. |
| pointerup | `(ev: PointerEvent) => void` | Emitted when the button receives a pointer release after a press. |
| pointerdown | `(ev: PointerEvent) => void` | Emitted when the button is pressed. |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |

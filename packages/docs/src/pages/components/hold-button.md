# HoldButton

Press and hold the button to trigger some logic (such as delete).

## Default

```vue demo
<script setup>
import confetti from 'canvas-confetti'

function onConfirm() {
  confetti()
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
  <PStack>
    <PHoldButton size="sm" @confirm="onConfirm" @finished="onFinished"> Hole me </PHoldButton>
    <PHoldButton @confirm="onConfirm" @finished="onFinished"> Hole me </PHoldButton>
    <PHoldButton size="lg" @confirm="onConfirm" @finished="onFinished"> Hole me </PHoldButton>
  </PStack>
</template>
```

## Shape

```vue demo
<template>
  <PStack>
    <PHoldButton> Hole me </PHoldButton>
    <PHoldButton shape="rounded"> Hole me </PHoldButton>
    <PHoldButton shape="square"> Hole me </PHoldButton>
  </PStack>
</template>
```

## Durations

Set the `durations` property to determine how long it will trigger. (Unit: second)

```vue demo
<template>
  <PHoldButton durations="1"> Lasts one second </PHoldButton>
</template>
```

## Variants

You can set the same `variant` property as the button.

```vue demo
<template>
  <PStack>
    <PHoldButton durations="1">default</PHoldButton>
    <PHoldButton durations="1" variant="ghost">ghost</PHoldButton>
    <PHoldButton durations="1" variant="error">error</PHoldButton>
    <PHoldButton durations="1" variant="primary" mask-color="var(--color-background)"
      >primary</PHoldButton
    >
    <PHoldButton durations="1" variant="success">success</PHoldButton>
    <PHoldButton durations="1" disabled>disabled</PHoldButton>
    <PHoldButton durations="1" loading>loading</PHoldButton>
  </PStack>
</template>
```

## Colors

Set `mask-color` to modify the color of the progress bar.

```vue demo
<template>
  <PHoldButton durations="1" mask-color="var(--color-red-500)"> Lasts one second </PHoldButton>
</template>
```

## Cancelable

After `cancelable` is set, the process can be cancelled by pressing and leaving the button on time. At the same time, you can listen to the `cancelled` event to know when it has been cancelled.

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
  <PHoldButton durations="1" cancelable @canceled="onCanceled" @finished="onFinished">
    Lasts one second
  </PHoldButton>
</template>
```

## Scalable

Set `scalable="false"` to disable zooming when pressed.

```vue demo
<template>
  <PHoldButton durations="1" :scalable="false"> Lasts one second </PHoldButton>
</template>
```

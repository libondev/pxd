# HoldButton

Press and hold the button to trigger some logic (such as delete).

## Default

```vue demo
<script setup>
function onConfirm() {
  alert('onConfirm')
}

function onFinished(isFinished) {
  alert(`isFinished: ${isFinished}`)
}
</script>

<template>
  <PStack>
    <PHoldButton v-on:confirm="onConfirm" v-on:finished="onFinished">
      Hole me
    </PHoldButton>

    <PHoldButton shape="rounded" v-on:confirm="onConfirm" v-on:finished="onFinished">
      Hole me
    </PHoldButton>

    <PHoldButton shape="square" v-on:confirm="onConfirm" v-on:finished="onFinished">
      Hole me
    </PHoldButton>
  </PStack>
</template>
```

## Variants

You can set the same `variant` property as the button.

```vue demo
<template>
  <PStack>
    <PHoldButton> default </PHoldButton>
    <PHoldButton variant="ghost"> ghost </PHoldButton>
    <PHoldButton variant="error"> error </PHoldButton>
    <PHoldButton variant="primary" mask-color="var(--background-100)"> primary </PHoldButton>
    <PHoldButton variant="success"> success </PHoldButton>
    <PHoldButton disabled> disabled </PHoldButton>
    <PHoldButton loading> loading </PHoldButton>
  </PStack>
</template>
```

## Colors

Set `mask-color` to modify the color of the progress bar.

```vue demo
<template>
  <PHoldButton mask-color="hsl(var(--red-500-value))">
    Lasts one second
  </PHoldButton>
</template>
```

## Durations

Set the `durations` property to determine how long it will trigger.

```vue demo
<template>
  <PHoldButton durations="1">
    Lasts one second
  </PHoldButton>
</template>
```

## Cancelable

After `cancelable` is set, the process can be cancelled by pressing and leaving the button on time. At the same time, you can listen to the `cancelled` event to know when it has been cancelled.

```vue demo
<script setup>
  function onCanceled() {
    alert('canceled')
  }
</script>

<template>
  <PHoldButton durations="1" cancelable @canceled="onCanceled">
    Lasts one second
  </PHoldButton>
</template>
```

## Scalable

Set `scalable="false"` to disable zooming when pressed.

<PHoldButton :scalable="false">
  Lasts one second
</PHoldButton>

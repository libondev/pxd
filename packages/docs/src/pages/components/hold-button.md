# HoldButton
Press and hold the button to trigger some logic (such as delete).

<script setup>
function onConfirm() {
  alert('onConfirm')
}

function onFinished(isFinished) {
  alert(`isFinished: ${isFinished}`)
}

function onCanceled() {
  alert('canceled')
}
</script>

## Basic
<div class="space-x-2">
  <PHoldButton v-on:confirm="onConfirm" v-on:finished="onFinished">
    Hole me
  </PHoldButton>

  <PHoldButton shape="rounded" v-on:confirm="onConfirm" v-on:finished="onFinished">
    Hole me
  </PHoldButton>

  <PHoldButton shape="square" v-on:confirm="onConfirm" v-on:finished="onFinished">
    Hole me
  </PHoldButton>
</div>

```html
<PHoldButton>
  Hole me
</PHoldButton>

<PHoldButton shape="rounded">
  Hole me
</PHoldButton>

<PHoldButton shape="square">
  Hole me
</PHoldButton>
```

## Variants
You can set the same `variant` property as the button.

<div class="space-x-2">
  <PHoldButton> default </PHoldButton>
  <PHoldButton variant="ghost"> ghost </PHoldButton>
  <PHoldButton variant="error"> error </PHoldButton>
  <PHoldButton variant="primary" mask-color="var(--background-100)"> primary </PHoldButton>
  <PHoldButton variant="success"> success </PHoldButton>
  <PHoldButton disabled> disabled </PHoldButton>
  <PHoldButton loading> loading </PHoldButton>
</div>

```html
<PHoldButton> default(outline) </PHoldButton>
<PHoldButton variant="ghost"> ghost </PHoldButton>
<PHoldButton variant="error"> error </PHoldButton>
<PHoldButton variant="primary" mask-color="var(--background-100)"> primary </PHoldButton>
<PHoldButton variant="success"> success </PHoldButton>
<PHoldButton disabled> disabled </PHoldButton>
<PHoldButton loading> loading </PHoldButton>
```

## Colors
Set `mask-color` to modify the color of the progress bar.

<PHoldButton mask-color="hsl(var(--red-500-value))">
  Lasts one second
</PHoldButton>

```html
<PHoldButton durations="1" mask-color="hsl(var(--red-500-value))">
  Lasts one second
</PHoldButton>
```

## Durations
Set the `durations` property to determine how long it will trigger.

<PHoldButton durations="1">
  Lasts one second
</PHoldButton>

```html
<PHoldButton durations="1">
  Lasts one second
</PHoldButton>
```

## Cancelable
After `cancelable` is set, the process can be cancelled by pressing and leaving the button on time. At the same time, you can listen to the `cancelled` event to know when it has been cancelled.

<PHoldButton durations="1" cancelable v-on:canceled="onCanceled">
  Lasts one second
</PHoldButton>

```html
<script setup>
function onCanceled() {
  alert('canceled')
}
</script>

<PHoldButton durations="1" cancelable @canceled="onCanceled">
  Lasts one second
</PHoldButton>
```

## Scalable
Set `scalable="false"` to disable zooming when pressed.

<PHoldButton :scalable="false">
  Lasts one second
</PHoldButton>

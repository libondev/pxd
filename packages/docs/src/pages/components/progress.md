

# Progress

Display progress relative to a limit or related to a task.

## Default

```vue demo
<template>
  <PProgress :model-value="30" />
</template>
```

## Custom max

```vue demo
<script setup>
  const value = ref(30)
</script>

<template>
  <PProgress v-model="value" :max="40" />
</template>
```

## Dynamic colors
Customize the colors of the display at different stages.

```vue demo
<script setup>
  const progressValue = ref(0)

  const colors = {
    0: 'var(--color-foreground)',
    25: 'var(--color-danger)',
    50: 'var(--color-amber)',
    75: 'var(--color-pink-700)',
    100: 'var(--color-accent)'
  }

  function increase() {
    console.log('🎡progress.md:40/(progressValue.value):\n', progressValue.value)
    if (progressValue.value < 100) {
      progressValue.value += 10
    }
  }

  function decrease() {
    if (progressValue.value > 0) {
      progressValue.value -= 10
    }
  }
</script>

<template>
  <PProgress v-model="progressValue" :colors="colors" />
  <PStack class="mt-4">
    <PButton variant="primary" @click="increase">Increase</PButton>
    <PButton @click="decrease">Decrease</PButton>
  </PStack>
</template>
```

## Themed

```vue demo
<template>
  <PStack gap="6">
    <PProgress :model-value="80" type="success" />
    <PProgress :model-value="10" type="error" />
    <PProgress :model-value="40" type="warning" />
    <PProgress :model-value="70" type="secondary" />
  </PStack>
</template>
```

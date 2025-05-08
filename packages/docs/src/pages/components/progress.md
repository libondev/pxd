

# Progress

Display progress relative to a limit or related to a task.

## Default

```vue demo
<script setup>
  const value = ref(30)
</script>

<template>
  <PStack gap="4">
    <PProgress v-model="value" size="sm" />
    <PProgress v-model="value" size="md" />
    <PProgress v-model="value" size="lg" />
  </PStack>
</template>
```

## Custom min/max

```vue demo
<script setup>
  const value = ref(30)
</script>

<template>
  <PProgress v-model="value" :min="20" :max="40" />
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
  <PProgress v-model="progressValue" :colors="colors" label />
  <PProgress v-model="progressValue" :colors="colors">
    {{ progressValue }} / 100
  </PProgress>

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
    <PProgress :model-value="80" variant="success" />
    <PProgress :model-value="10" variant="error" />
    <PProgress :model-value="40" variant="warning" />
    <PProgress :model-value="70" variant="secondary" />
  </PStack>
</template>
```

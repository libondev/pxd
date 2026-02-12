# Toggle Button

A two-state button that can be either on or off.

## Default

```vue demo
<script setup>
import TextBoldIcon from '@gdsicon/vue/text-bold'
import { ref } from 'vue'

const isChecked = ref(false)
</script>

<template>
  <PToggleButton v-model="isChecked" aria-label="Toggle bold">
    <TextBoldIcon />
  </PToggleButton>
</template>
```

## Sizes

```vue demo
<script setup>
import TextBoldIcon from '@gdsicon/vue/text-bold'
import { ref } from 'vue'

const isChecked = ref(false)
</script>

<template>
  <PStack align="center">
    <PToggleButton v-model="isChecked" size="sm" aria-label="Toggle bold">
      <TextBoldIcon />
    </PToggleButton>
    
    <PToggleButton v-model="isChecked" size="md" aria-label="Toggle bold">
      <TextBoldIcon />
    </PToggleButton>
    
    <PToggleButton v-model="isChecked" size="lg" aria-label="Toggle bold">
      <TextBoldIcon />
    </PToggleButton>
  </PStack>
</template>
```

## Outline

```vue demo
<script setup>
import TextBoldIcon from '@gdsicon/vue/text-bold'
import { ref } from 'vue'

const checked = ref(false)
</script>

<template>
  <PToggleButton v-model="checked" variant="outline" aria-label="Toggle bold">
    <TextBoldIcon />
  </PToggleButton>
</template>
```

## Disabled

```vue demo
<script setup>
import TextBoldIcon from '@gdsicon/vue/text-bold'
import { ref } from 'vue'

const uncheck = ref(false)
const checked = ref(true)
</script>

<template>
  <PStack align="center" class="pxd-toggle-button-group">
    <PToggleButton v-model="uncheck" disabled aria-label="Toggle bold">
      <TextBoldIcon />
    </PToggleButton>
    
    <PToggleButton v-model="uncheck" disabled variant="outline" aria-label="Toggle bold">
      <TextBoldIcon />
    </PToggleButton>
    
    <PToggleButton v-model="checked" disabled aria-label="Toggle bold">
      <TextBoldIcon />
    </PToggleButton>
    
    <PToggleButton v-model="checked" disabled variant="outline" aria-label="Toggle bold">
      <TextBoldIcon />
    </PToggleButton>
  </PStack>
</template>
```

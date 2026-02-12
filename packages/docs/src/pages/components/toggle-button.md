# Toggle Button

A two-state button that can be either on or off.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const isChecked = ref(false)
</script>

<template>
  <PToggleButton v-model="isChecked" aria-label="Toggle bold" label="Bold" />
</template>
```

## Sizes

```vue demo
<script setup>
import { ref } from 'vue'

const isChecked = ref(false)
</script>

<template>
  <PStack align="center">
    <PToggleButton v-model="isChecked" size="sm" aria-label="Toggle bold" label="Bold" />

    <PToggleButton v-model="isChecked" size="md" aria-label="Toggle bold" label="Bold" />

    <PToggleButton v-model="isChecked" size="lg" aria-label="Toggle bold" label="Bold" />
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

## Group

```vue demo
<script setup>
import { ref } from 'vue'

const functions = ref([])

const toggleButtonOptions = [
  { label: 'Bold', value: 'bold' },
  { label: 'Italic', value: 'italic' },
  { label: 'Underline', value: 'underline' },
]
</script>

<template>
  <PToggleButtonGroup
    v-model="functions"
    variant="outline"
    :options="toggleButtonOptions"
  />
</template>
```

## Sizes

```vue demo
<script setup>
import { ref } from 'vue'

const functions = ref([])

const toggleButtonOptions = [
  { label: 'Bold', value: 'bold' },
  { label: 'Italic', value: 'italic' },
  { label: 'Underline', value: 'underline' },
]
</script>

<template>
  <PToggleButtonGroup
    v-model="functions"
    size="sm"
    :options="toggleButtonOptions"
  />
</template>
```

## Gap

ToggleButtonGroup extends the [Stack component](/components/stack){class="font-medium underline"}, But the gap attribute only supports attribute values ​​of type `string` | `number`

```vue demo
<script setup>
import { ref } from 'vue'

const functions = ref([])

const toggleButtonOptions = [
  { label: 'Bold', value: 'bold' },
  { label: 'Italic', value: 'italic' },
  { label: 'Underline', value: 'underline' },
]
</script>

<template>
  <PToggleButtonGroup
    v-model="functions"
    gap="2"
    variant="outline"
    :options="toggleButtonOptions"
  />
</template>
```

## Vertical

```vue demo
<script setup>
import TextBoldIcon from '@gdsicon/vue/text-bold'
import TextItalicIcon from '@gdsicon/vue/text-italic'
import { ref } from 'vue'

const functions = ref(['bold'])
</script>

<template>
  <PToggleButtonGroup
    v-model="functions"
    gap="1"
    direction="vertical"
  >
    <PToggleButton value="bold">
      <TextBoldIcon />
    </PToggleButton>

    <PToggleButton value="italic">
      <TextItalicIcon />
    </PToggleButton>
  </PToggleButtonGroup>
</template>
```

## Disabled

```vue demo
<script setup>
import { ref } from 'vue'

const functions = ref([])

const toggleButtonOptions = [
  { label: 'Bold', value: 'bold' },
  { label: 'Italic', value: 'italic' },
  { label: 'Underline', value: 'underline' },
]
</script>

<template>
  <PToggleButtonGroup
    v-model="functions"
    disabled
    :options="toggleButtonOptions"
  />
</template>
```

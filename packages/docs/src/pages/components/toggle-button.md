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

## Single

```vue demo
<script setup>
import { ref } from 'vue'

const functions = ref('bold')

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
    :multiple="false"
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
    variant="outline"
    :options="toggleButtonOptions"
  />
</template>
```

## Gap

ToggleButtonGroup extends the [Stack component](/components/stack){class="font-medium underline"}, However, the border will only be merged if gap is set to `0` of `string` | `number` type. (e.g. `gap="0"`)

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
  <PStack direction="vertical">
    <PToggleButtonGroup
      v-model="functions"
      gap="0"
      variant="outline"
      :options="toggleButtonOptions"
    />

    <PToggleButtonGroup
      v-model="functions"
      :gap="{ xs: 1, sm: 2, md: 4 }"
      variant="outline"
      :options="toggleButtonOptions"
    />
  </PStack>
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

const functions = ref(['italic'])

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
    variant="outline"
    :options="toggleButtonOptions"
  />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| variant | `'ghost' \| 'outline'` | - | - |
| disabled | `boolean` | - | - |
| label | `string \| number \| null` | - | - |
| size | `'sm' \| 'md' \| 'lg'` | - | - |
| value | `string \| number \| boolean` | `true` | - |
| model-value | `string \| number \| boolean \| string \| number \| boolean[]` | - | - |

## ToggleButtonGroup Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| gap | `ResponsiveValue<string \| number>` | `0` | - |
| size | `'sm' \| 'md' \| 'lg'` | - | - |
| disabled | `boolean` | - | - |
| multiple | `boolean` | `true` | - |
| options | `{ label, value, disabled? }[]` | - | - |
| variant | `'ghost' \| 'outline'` | - | - |
| model-value | `string \| number \| boolean \| string \| number \| boolean[]` | `() => []` | - |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |

## ToggleButtonGroup Slots

| Name | Description |
| --- | --- |
| default | Default slot |

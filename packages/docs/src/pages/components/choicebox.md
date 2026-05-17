# Choicebox

A larger form of Radio or Checkbox, where the user has a larger tap target and more details.

## Single-select

```vue demo
<script setup>
import { ref } from 'vue'

const modelValue = ref('trial')
</script>

<template>
  <PChoicebox v-model="modelValue">
    <PChoiceboxItem label="Pro trial" value="trial" description="Free for two weeks" />
    <PChoiceboxItem label="Pro" value="pro" description="Get started now" />
  </PChoicebox>
</template>
```

## Multi-select

```vue demo
<script setup>
import { ref } from 'vue'

const modelValue = ref(['trial'])

const options = [
  {
    label: 'Pro trial',
    value: 'trial',
    description: 'Free for two weeks',
  },
  {
    label: 'Pro',
    value: 'pro',
    description: 'Get started now',
  },
]
</script>

<template>
  <PChoicebox
    v-model="modelValue"
    :options="options"
    multiple
  />
</template>
```

## Disabled

```vue demo
<script setup>
import { ref } from 'vue'

const modelValue1 = ref('trial')
const modelValue2 = ref(['trial'])

const options = [
  {
    disabled: true,
    label: 'Pro trial',
    value: 'trial',
    description: 'Free for two weeks',
  },
  {
    disabled: true,
    label: 'Pro',
    value: 'pro',
    description: 'Get started now',
  },
]
</script>

<template>
  <PStack direction="vertical" gap="6">
    <PChoicebox
      v-model="modelValue1"
    >
      <PChoiceboxItem v-for="item of options" :key="item.value" v-bind="item" />
    </PChoicebox>

    <PChoicebox
      v-model="modelValue2"
      :options="options"
      multiple
    />
  </PStack>
</template>
```

## Custom content

Custom content is displayed when selecting the option.

```vue demo
<script setup>
import { ref } from 'vue'

const modelValue = ref('trial')
</script>

<template>
  <PChoicebox v-model="modelValue">
    <PChoiceboxItem label="Pro trial" value="trial" description="Free for two weeks">
      <div className="flex justify-center p-2">
        <PBadge variant="trial">Trial</PBadge>
      </div>
    </PChoiceboxItem>

    <PChoiceboxItem label="Pro" value="pro" description="Get started now">
      <div className="flex justify-center p-2">
        <PBadge variant="blue">Pro</PBadge>
      </div>
    </PChoiceboxItem>
  </PChoicebox>
</template>
```

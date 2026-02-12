# Choicebox

A larger form of Radio or Checkbox, where the user has a larger tap target and more details.

## Single-select

```vue demo
<script setup>
import { ref } from 'vue'

const modelValue = ref('trial')
</script>

<template>
  <PChoiceboxGroup v-model="modelValue" :direction="{ xs: 'vertical', sm: 'horizontal' }">
    <PChoicebox label="Pro trial" value="trial" description="Free for two weeks" />
    <PChoicebox label="Pro" value="pro" description="Get started now" />
  </PChoiceboxGroup>
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
  <PChoiceboxGroup
    v-model="modelValue"
    :options="options"
    multiple
    :direction="{ xs: 'vertical', sm: 'horizontal' }"
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
    <PChoiceboxGroup
      v-model="modelValue1"
      :direction="{ xs: 'vertical', sm: 'horizontal' }"
    >
      <PChoicebox v-for="item of options" :key="item.value" v-bind="item" />
    </PChoiceboxGroup>

    <PChoiceboxGroup
      v-model="modelValue2"
      :options="options"
      :direction="{ xs: 'vertical', sm: 'horizontal' }"
      multiple
    />
  </PStack>
</template>
```

# Radio

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const modelValue = ref('')
</script>

<template>
  <PStack direction="col">
    <PRadio v-model="modelValue" label="Option 1" value="one" />
    <PRadio v-model="modelValue" value="two">Option 2</PRadio>
  </PStack>
</template>
```

## Disabled

```vue demo
<script setup>
import { ref } from 'vue'

const modelValue = ref('one')
</script>

<template>
  <PStack direction="col">
    <PRadio v-model="modelValue" disabled label="Option 1" value="one" />
    <PRadio v-model="modelValue" disabled value="two">Option 2</PRadio>
  </PStack>
</template>
```

## Radio standalone
Standalone unlabelled radio input for use in custom UI.

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref('one')
</script>

<template>
  <PStack align="center">
    <span>Option 1</span>
    <PRadio v-model="value" value="one" />
  </PStack>
</template>
```

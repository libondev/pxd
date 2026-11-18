# Search Input

Pre-configured search input with a magnifying glass icon and clear button.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const val = ref('')
</script>

<template>
  <PSearchInput v-model="val" placeholder="Enter some text..." />
</template>
```

## Disabled

```vue demo
<script setup>
import { ref } from 'vue'

const val = ref('')
</script>

<template>
  <PSearchInput v-model="val" disabled placeholder="Enter some text..." />
</template>
```

## Loading

```vue demo
<script setup>
import { ref } from 'vue'

const val = ref('')
const loading = ref(false)

function handleSearch() {
  loading.value = true

  setTimeout(() => {
    loading.value = false
  }, 2000)
}
</script>

<template>
  <PSearchInput v-model="val" :loading="loading" placeholder="Enter some text..." @search="handleSearch" />
</template>
```

## Custom Prefix

```vue demo
<script setup>
import { ref } from 'vue'
import SparklesIcon from '@gdsicon/vue/sparkles'

const val = ref('')
</script>

<template>
  <PSearchInput v-model="val" placeholder="Enter some text...">
    <template #prefix>
      <SparklesIcon />
    </template>
  </PSearchInput>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| loading | `boolean` | `false` | Replaces the prefix with a loading icon. |

SearchInput extends the [Input component](/components/input): every other prop and event — `v-model`,
`size`, `disabled`, `clearable`, `@focus`, `@click`, the native `input` event — is forwarded to
`PInput` unchanged.

## Events

| Name | Type | Description |
| --- | --- | --- |
| search | `(value: string) => void` | Emitted when Enter is pressed with a non-empty value while not loading. |
| update:model-value | `(value: string) => void` | Emitted when the query changes, forwarded from `PInput`. |

## Slots

| Name | Description |
| --- | --- |
| prefix | Custom prefix content. The loading icon replaces this slot while `loading` is `true`. |
| suffix | Custom suffix content, forwarded to `PInput`. |

## Methods

| Name | Type | Description |
| --- | --- | --- |
| blur | `() => void` | Blur the underlying input. |
| clear | `(event?: Event) => void` | Clear the underlying input and emit `change`. |
| focus | `() => void` | Focus the underlying input. |
| select | `() => void` | Select the text of the underlying input. |

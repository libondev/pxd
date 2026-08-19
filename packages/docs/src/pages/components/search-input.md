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

`SearchInput` forwards the input props below to `PInput`.

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| loading | `boolean` | `false` | Replaces the prefix with a loading icon. |
| size | `'xs' \| 'sm' \| 'md' \| 'lg'` | - | Input size. |
| error | `boolean \| string` | - | Error state. |
| min | `number \| string` | - | Minimum value. |
| max | `number \| string` | - | Maximum value. |
| align | `'left' \| 'center' \| 'right'` | `left` | Text alignment. |
| readonly | `boolean` | - | Makes the input read-only. |
| disabled | `boolean` | - | Disables the input. |
| password | `boolean` | - | Enables password input mode. |
| autofocus | `boolean` | - | Focuses the input automatically. |
| input-type | `string` | - | Native input type. |
| inputmode | `'none' \| 'text' \| 'tel' \| 'url' \| 'email' \| 'numeric' \| 'decimal' \| 'search'` | - | Preferred virtual keyboard. |
| minlength | `number \| string` | - | Minimum input length. |
| maxlength | `number \| string` | - | Maximum input length. |
| trim-overflow | `boolean` | `false` | Trims overflow after composition ends when `maxlength` is set. |
| clearable | `boolean` | - | Shows a clear button when the input has a value. |
| clear-value | `string \| number \| null` | - | Value used after clearing. |
| model-value | `string \| number \| null` | - | Current input value. Use `v-model` for two-way binding. |
| placeholder | `string` | - | Placeholder text. |
| prefix-class | `string \| any[] \| object` | - | Additional prefix classes. |
| suffix-class | `string \| any[] \| object` | - | Additional suffix classes. |
| select-on-focus | `boolean` | - | Selects the input value on focus. |
| show-word-limit | `boolean \| string` | - | Shows the current word count. |
| word-limit-position | `'inside' \| 'outside'` | `inside` | Word count position. |
| clear-on-press-escape | `boolean` | `true` | Clears the input when Escape is pressed. |
| default-prefix-style | `boolean` | `false` | Controls the prefix container style. |
| default-suffix-style | `boolean` | `true` | Controls the suffix container style. |

## Events

| Name | Payload | Description |
| --- | --- | --- |
| search | `value: string` | Emitted when Enter is pressed with a non-empty value while not loading. |
| update:model-value | `value: string` | Emitted when the input value changes. Used by `v-model`. |
| input | `value: string` | Emitted when the input value changes. |
| change | `value: string, event: Event` | Emitted when the input value changes. |
| focus | `event: FocusEvent` | Emitted when the input gains focus. |
| blur | `event: FocusEvent` | Emitted when the input loses focus. |
| click | `event: MouseEvent` | Emitted when the input container is clicked. |
| keydown | `event: KeyboardEvent` | Emitted when a key is pressed. |
| compositionstart | `event: CompositionEvent` | Emitted when text composition starts. |
| compositionupdate | `event: CompositionEvent` | Emitted when text composition updates. |
| compositionend | `event: CompositionEvent` | Emitted when text composition ends. |

## Slots

| Name | Description |
| --- | --- |
| prefix | Custom prefix content. The loading icon replaces this slot while `loading` is `true`. |
| suffix | Custom suffix content, forwarded to `PInput`. |

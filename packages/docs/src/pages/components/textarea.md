# Textarea

Retrieve multi-line user input.

## Default

```vue demo
<template>
  <PTextarea
    rows="4"
    placeholder="Please enter your text here..."
  />
</template>
```

## Disabled

```vue demo
<template>
  <PTextarea
    disabled
    rows="4"
    placeholder="Please enter your text here..."
  />
</template>
```

## Error

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
)
</script>

<template>
  <PStack gap="12" direction="vertical">
    <PTextarea v-model="value" size="xs" error="There has been an error." />
    <PTextarea v-model="value" size="sm" error="There has been an error." />
    <PTextarea v-model="value" size="md" error="There has been an error." />
    <PTextarea v-model="value" size="lg" error="There has been an error." />
  </PStack>
</template>
```

## Word Limit

```vue demo
<script setup>
import { ref } from 'vue'

const insideValue = ref('Hello')
const outsideValue = ref('Hello')
</script>

<template>
  <PStack direction="vertical">
    <PTextarea
      v-model="insideValue"
      rows="4"
      max-length="100"
      show-word-limit
      placeholder="Word limit inside"
    />
    <PTextarea
      v-model="outsideValue"
      rows="4"
      max-length="100"
      show-word-limit
      word-limit-position="outside"
      placeholder="Word limit outside"
    />
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| rows | `string \| number` | - | Visible height in text rows |
| cols | `string \| number` | - | Visible width in characters |
| size | `'xs' \| 'sm' \| 'md' \| 'lg'` | - | Font size, falls back to the `ConfigProvider` size |
| error | `boolean \| string` | - | Show the error style, also applied when the word limit is exceeded |
| readonly | `boolean` | - | Native `readonly` attribute, the value stays selectable |
| disabled | `boolean` | - | Native `disabled` attribute, blocks editing and focus |
| autofocus | `boolean` | - | Focus the field as soon as it is mounted |
| min-length | `number \| string` | - | Native `minlength` attribute, validated by the browser |
| max-length | `number \| string` | - | Native `maxlength`, lifted while composing and shown by the word limit |
| trim-overflow | `boolean` | `false` | Trim overflow value after composition ends when `max-length` is set. |
| model-value | `string \| number \| null` | `` | Bound value, emitted on every keystroke |
| placeholder | `string` | - | Placeholder text shown while the value is empty |
| show-word-limit | `boolean \| string` | - | Show the character counter, `count / max` when `max-length` is set |
| word-limit-position | `'inside' \| 'outside'` | `inside` | Place the counter inside the field or below it |

## Events

| Name | Type | Description |
| --- | --- | --- |
| update:modelValue | `(value: string \| number) => void` | Emitted on every keystroke that changes the text. |
| change | `(value: string \| number) => void` | Emitted when the field is committed, as the browser fires its native `change` event. |
| focus | `(event: FocusEvent) => void` | Emitted when the textarea gains focus. |
| blur | `(event: FocusEvent) => void` | Emitted when the textarea loses focus. |

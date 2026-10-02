# Input

Retrieve text input from a user.

## Default

```vue demo
<template>
  <PInput class="max-w-sm" />
</template>
```

## Sizes

```vue demo
<template>
  <PStack class="max-w-sm" direction="vertical">
    <PInput size="sm" placeholder="sm" />
    <PInput placeholder="md(default)" />
    <PInput size="lg" placeholder="lg" />
  </PStack>
</template>
```

## Password

```vue demo
<script setup>
import { ref } from 'vue'

const password = ref('')
</script>

<template>
  <PInput class="max-w-sm" v-model="password" password placeholder="Enter your password" />
</template>
```

## Clearable

```vue demo
<script setup>
import { ref } from 'vue'

const password = ref('')
</script>

<template>
  <PInput class="max-w-sm" v-model="password" clearable />
</template>
```

## Min/Max length

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref('')
</script>

<template>
  <PInput class="max-w-sm" v-model="value" min-length="2" max-length="10" clearable show-word-limit />
</template>
```

## Prefix and suffix

```vue demo
<template>
  <PStack class="max-w-sm" gap="6" direction="vertical">
    <PInput>
      <template #prefix>
        <IconArrowCircleUp />
      </template>
    </PInput>

    <PInput>
      <template #suffix>
        <IconArrowCircleUp />
      </template>
    </PInput>

    <PInput>
      <template #prefix> https:// </template>

      <template #suffix> .com </template>
    </PInput>

    <PInput :default-prefix-style="false" :default-suffix-style="false">
      <template #prefix>
        <IconArrowCircleUp class="ml-3" />
      </template>

      <template #suffix>
        <IconArrowCircleUp class="mr-3" />
      </template>
    </PInput>
  </PStack>
</template>
```

## Disabled

```vue demo
<template>
  <PStack class="max-w-sm" gap="6" direction="vertical">
    <PInput disabled>
      <template #prefix>
        <IconArrowCircleUp />
      </template>
    </PInput>

    <PInput disabled>
      <template #suffix>
        <IconArrowCircleUp />
      </template>
    </PInput>

    <PInput disabled>
      <template #prefix> https:// </template>

      <template #suffix> .com </template>
    </PInput>

    <PInput disabled :default-prefix-style="false" :default-suffix-style="false">
      <template #prefix>
        <IconArrowCircleUp class="ml-3" />
      </template>

      <template #suffix>
        <IconArrowCircleUp class="mr-3" />
      </template>
    </PInput>
  </PStack>
</template>
```

## Error

```vue demo
<template>
  <PStack class="max-w-sm" gap="8" direction="vertical">
    <PInput error="An error message." size="sm" />
    <PInput error="An error message." />
    <PInput error="An error message." size="lg" />
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| size | `'xs' \| 'sm' \| 'md' \| 'lg'` | - | Height, padding and font size, falling back to the config provider size |
| error | `boolean \| string` | - | Show the error style, also applied when the word limit is exceeded |
| min | `number \| string` | - | Native `min` attribute of the underlying `input` |
| max | `number \| string` | - | Native `max` attribute of the underlying `input` |
| align | `'left' \| 'center' \| 'right'` | `left` | Horizontal text alignment inside the field |
| readonly | `boolean` | - | Native `readonly` attribute, the value stays selectable |
| disabled | `boolean` | - | Native `disabled` attribute, blocks editing and focus |
| password | `boolean` | - | Mask the value and add a button to reveal it |
| autofocus | `boolean` | - | Focus the input as soon as it is mounted |
| input-type | `string` | - | Native `type` attribute, when set it wins over `password` masking |
| input-mode | `'none' \| 'text' \| 'tel' \| 'url' \| 'email' \| 'numeric' \| 'decimal' \| 'search'` | - | Native `inputmode` attribute, drives the virtual keyboard |
| min-length | `number \| string` | - | Native `minlength` attribute, validated by the browser |
| max-length | `number \| string` | - | Native `maxlength`, lifted while composing and shown by the word limit |
| trim-overflow | `boolean` | `false` | Trim overflow value after composition ends when `max-length` is set. |
| clearable | `boolean` | - | Show a clear button once the field holds a value |
| clear-value | `string \| number \| null` | - | Value written back when clearing, an empty string by default |
| clear-on-press-escape | `boolean` | `true` | Clear the field when the `Escape` key is pressed |
| model-value | `string \| number \| null` | - | Current input value, use `v-model` for two-way binding |
| placeholder | `string` | - | Placeholder text shown while the value is empty |
| prefix-class | `string \| any[] \| object` | - | Additional classes merged onto the prefix container |
| suffix-class | `string \| any[] \| object` | - | Additional classes merged onto the suffix container |
| select-on-focus | `boolean` | - | Select the whole value when the field gains focus |
| default-prefix-style | `boolean` | `true` | Apply the default padding, background and divider to the prefix container |
| default-suffix-style | `boolean` | `true` | Apply the default padding, background and divider to the suffix container |
| show-word-limit | `boolean \| string` | - | Show the character counter, `count / max` when `max-length` is set |
| word-limit-position | `'inside' \| 'outside'` | `inside` | Place the counter inside the field or below it |

## Events

| Name | Type | Description |
| --- | --- | --- |
| click | `(ev: MouseEvent) => void` | Emitted when the field is clicked. |
| change | `(value: string, ev: Event) => void` | Emitted when the value is committed by pressing `Enter`, by the native change event, or by clearing the field. |
| focus | `(ev: FocusEvent) => void` | Emitted when the field gains focus. |
| blur | `(ev: FocusEvent) => void` | Emitted when the field loses focus. |
| keydown | `(ev: KeyboardEvent) => void` | Emitted when a key is pressed while the field is neither readonly nor disabled. |
| update:modelValue | `(value: string) => void` | Emitted on every input that is not part of an IME composition, and when a composition ends. |
| compositionstart | `(ev: CompositionEvent) => void` | Emitted when an IME composition starts. |
| compositionupdate | `(ev: CompositionEvent) => void` | Emitted while an IME composition is in progress. |
| compositionend | `(ev: CompositionEvent) => void` | Emitted when an IME composition ends. |

## Slots

| Name | Description |
| --- | --- |
| prefix | Prefix slot |
| suffix | Suffix slot |

## Methods

| Name | Type | Description |
| --- | --- | --- |
| blur | `() => void` | Remove focus from the input element. |
| clear | `(ev: Event) => void` | Reset the value to `clear-value` and emit `change` with an empty string. |
| focus | `() => void` | Move focus to the input element. |
| select | `() => void` | Select the whole value of the input element. |

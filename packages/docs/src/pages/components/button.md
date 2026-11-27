# Button

One of the most basic components, it will help you complete the interaction.

## Sizes

```vue demo
<template>
  <PStack align="center">
    <PButton size="xs">Small</PButton>
    <PButton size="sm">Small</PButton>
    <PButton size="md">Medium</PButton>
    <PButton size="lg">Large</PButton>
  </PStack>
</template>
```

## Shape

```vue demo
<template>
  <PStack>
    <PButton shape="default"> click me </PButton>
    <PButton shape="rounded"> click me </PButton>
    <PButton shape="square"> click me </PButton>
  </PStack>
</template>
```

## Variants

```vue demo
<template>
  <PStack>
    <PButton variant="default">default</PButton>
    <PButton variant="primary">primary</PButton>
    <PButton variant="success">success</PButton>
    <PButton variant="warning">warning</PButton>
    <PButton variant="error">error</PButton>
    <PButton variant="ghost">ghost</PButton>
  </PStack>
</template>
```

## Disabled/Loading

```vue demo
<script setup>
import HeartIcon from '@gdsicon/vue/heart-fill'
</script>

<template>
  <PStack>
    <PButton disabled>disabled</PButton>
    <PButton loading>loading</PButton>
    <PButton loading icon-only>
      <HeartIcon />
    </PButton>
  </PStack>
</template>
```

## Icon

```vue demo
<script setup>
import HeartIcon from '@gdsicon/vue/heart-fill'
</script>

<template>
  <PStack>
    <PButton icon-only><HeartIcon /></PButton>
    <PButton icon-only variant="primary"><HeartIcon /></PButton>
    <PButton icon-only variant="success"><HeartIcon /></PButton>
    <PButton icon-only variant="error"><HeartIcon /></PButton>
    <PButton icon-only variant="ghost"><HeartIcon /></PButton>
  </PStack>
</template>
```

## Full width

Set the `full-width` property to make the button exclusive to one line.

```vue demo
<template>
  <PButton full-width>Block Button </PButton>
</template>
```

## Group

```vue demo
<script setup>
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
</script>

<template>
  <PStack direction="vertical">
    <PButtonGroup class="w-md">
      <PButton>Previous Page</PButton>
      <PButton>Next Page</PButton>
    </PButtonGroup>

    <PButtonGroup variant="primary" align="right" class="w-md">
      <PButton>Previous Page</PButton>
      <PButton>Next Page</PButton>
    </PButtonGroup>

    <PButtonGroup size="sm" disabled align="left" class="w-md">
      <PButton full-width>Previous Page</PButton>
      <PButton full-width>Next Page</PButton>
    </PButtonGroup>
  </PStack>
</template>
```

## Native type

A button rendered inside a `<form>` defaults to `type="button"`, so it never submits by accident.
Pass the native `type` through when you need one; undeclared attributes land on the rendered
element.

```vue demo
<script setup>
import { ref } from 'vue'

const submitted = ref(false)
</script>

<template>
  <form class="gap-3 flex flex-col" @submit.prevent="submitted = true">
    <PStack>
      <PButton type="submit">Submit</PButton>
      <PButton type="reset" @click="submitted = false">Reset</PButton>
    </PStack>
    <span v-if="submitted" class="text-sm text-foreground-secondary">Submitted</span>
  </form>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| as | `string \| object` | `button` | Element or component rendered instead of a native `button` |
| variant | `'default' \| 'primary' \| 'error' \| 'warning' \| 'success' \| 'ghost' \| 'simple' \| 'link'` | - | Colour scheme, one of `primary`, `error`, `warning`, `success`, `ghost`, `simple` or `link` |
| size | `'xs' \| 'sm' \| 'md' \| 'lg'` | - | Size preset controlling height, padding and font size |
| shape | `'default' \| 'square' \| 'rounded'` | `default` | Corner radius, `square` removes it and `rounded` makes it fully round |
| align | `'left' \| 'center' \| 'right' \| 'between'` | - | Content alignment, `between` spreads the content to both ends, forced to `center` when `icon-only` is set |
| icon-only | `boolean` | `false` | Render as a square icon-only button with centered content |
| text | `string` | - | Text rendered when the default slot is empty |
| loading | `boolean` | - | Show a spinner and treat the button as disabled |
| disabled | `boolean` | - | Disable the button, also implied by `loading` or a disabled group |
| full-width | `boolean` | - | Stretch the button to fill the whole line |

## ButtonGroup Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| size | `'xs' \| 'sm' \| 'md' \| 'lg'` | - | Default size applied to child buttons |
| align | `'left' \| 'center' \| 'right' \| 'between'` | - | Default content alignment for child buttons, `between` spreads the content to both ends |
| variant | `ButtonVariant` | - | Default variant applied to child buttons |
| disabled | `boolean` | - | Disable every child button at once |

## Slots

| Name | Description |
| --- | --- |
| default | Button label, falls back to the `text` prop. |
| prefix | Leading content, replaced by the spinner while `loading` is `true`. |
| suffix | Trailing content. |

## ButtonGroup Slots

| Name | Description |
| --- | --- |
| default | Buttons rendered inside the group |

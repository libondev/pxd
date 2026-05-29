# Ellipsis Text

Display ellipsis for long text and support for expanding or collapsing text.

## Default

```vue demo
<template>
  <PEllipsisText
    text="Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum doloremque et debitis natus quas praesentium inventore! Numquam facilis expedita, sequi alias esse natus, modi nesciunt doloremque, optio dolorem vel et."
  />
</template>
```

## Action

```vue demo
<script setup>
import { shallowRef, computed } from 'vue'

const ellipsisTextRef = shallowRef()

const isEllipsis = computed(() => {
  return ellipsisTextRef.value?.isOverflow && !ellipsisTextRef.value?.isExpanded
})
</script>

<template>
  <PText secondary>isEllipsis: {{ isEllipsis }}</PText>

  <PEllipsisText
    ref="ellipsisTextRef"
    action
    more-text="Read more"
    less-text="Read less"
    more-action-class="text-red-900"
    less-action-class="text-teal-900"
    text="Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum doloremque et debitis natus quas praesentium inventore! Numquam facilis expedita, sequi alias esse natus, modi nesciunt doloremque, optio dolorem vel et."
  />
</template>
```

## Rows

```vue demo
<template>
  <PEllipsisText
    :rows="2"
    action
    text="Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum doloremque et debitis natus quas praesentium inventore! Numquam facilis expedita, sequi alias esse natus, modi nesciunt doloremque, optio dolorem vel et. Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum doloremque et debitis natus quas praesentium inventore! Numquam facilis expedita, sequi alias esse natus, modi nesciunt doloremque, optio dolorem vel et."
  />
</template>
```

## Position

```vue demo
<script setup>

const text = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum doloremque et debitis natus quas praesentium inventore! Numquam facilis expedita, sequi alias esse natus, modi nesciunt doloremque, optio dolorem vel et.'
</script>

<template>
  <PStack>
    <div>
      <PText secondary>start</PText>
      <PEllipsisText
        action
        :text="text"
        position="start"
      />
    </div>

    <div>
      <PText secondary>middle</PText>
      <PEllipsisText
        action
        :text="text"
        position="middle"
      />
    </div>

    <div>
      <PText secondary>end</PText>
      <PEllipsisText
        action
        :text="text"
        position="end"
      />
    </div>
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| text | `string` | - | - |
| dots | `string` | `...` | - |
| rows | `number` | `1` | - |
| action | `boolean` | - | - |
| position | `'start' \| 'middle' \| 'end'` | `end` | - |
| more-text | `string` | `Expand` | - |
| less-text | `string` | `Collapse` | - |
| more-action-class | `string` | - | - |
| less-action-class | `string` | - | - |

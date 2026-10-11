# Hue Text

Colors text deterministically from its own content. The same string always resolves to the same
color, so a name, an ID or a tag keeps a stable identity across renders and across pages.

## Default

```vue demo
<template>
  <PStack direction="vertical" :gap="2">
    <PHueText text="Anthropic" />
    <PHueText text="Geist" />
    <PHueText text="Vercel" />
    <PHueText text="Linear" />
  </PStack>
</template>
```

## Tinted

Add `tinted` to place the text on a soft background derived from the same color.

```vue demo
<template>
  <PStack direction="vertical" :gap="2">
    <PHueText text="Anthropic" tinted class="p-1 rounded-sm" />
    <PHueText text="Geist" tinted class="p-1 rounded-sm" />
    <PHueText text="Vercel" tinted class="p-1 rounded-sm" />
    <PHueText text="Linear" tinted class="p-1 rounded-sm" />
  </PStack>
</template>
```

## Affixes

Use the `prefix` and `suffix` slots to attach an icon or any small mark beside the text. The color
is inherited from the text, so affixes stay in the same tint.

```vue demo
<script setup>
import ArrowUpRightIcon from '@gdsicon/vue/arrow-up-right'
import CheckCircleFillIcon from '@gdsicon/vue/check-circle-fill'
</script>

<template>
  <PStack direction="vertical" :gap="2">
    <PHueText text="OpenAI" tinted class="p-1 rounded-sm">
      <template #prefix>
        <CheckCircleFillIcon />
      </template>
    </PHueText>
    <PHueText text="DeepSeek" tinted class="p-1 rounded-sm">
      <template #suffix>
        <ArrowUpRightIcon />
      </template>
    </PHueText>
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| text | `string` | - | Text content, and the source of the color. |
| tinted | `boolean` | `false` | Paint a soft background derived from the text color. |

## Slots

| Name | Description |
| --- | --- |
| prefix | Leading affix, rendered before the text. |
| suffix | Trailing affix, rendered after the text. |

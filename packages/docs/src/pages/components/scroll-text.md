# Scroll Text

Inline text that scrolls on hover only when content overflows. Leaves idle truncated; mouse leave resets to the start. Built for dense lists (e.g. sidebar items) with CSS-driven motion.

## Default

```vue demo
<template>
  <PStack direction="vertical">
    <div class="w-48 rounded-md border p-2">
      <PScrollText text="A short label" />
    </div>

    <div class="w-48 rounded-md border p-2">
      <PScrollText text="This is a very long sidebar label that will scroll when you hover it" />
    </div>
  </PStack>
</template>
```

## Sidebar List

```vue demo
<template>
  <div class="w-52 rounded-lg border p-1">
    <PScrollText
      v-for="item in items"
      :key="item"
      as="button"
      :text="item"
      class="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm hover:bg-gray-100"
    />
  </div>
</template>

<script setup>
const items = [
  'Inbox',
  'Projects / Design System / Tokens / Color Palette Review',
  'Settings',
  'Documentation / Components / ScrollText / Hover Overflow Behavior',
]
</script>
```

## Speed

`speed` is pixels per second. Slower values are easier to read in narrow sidebars.

```vue demo
<template>
  <PStack direction="vertical" class="w-56">
    <PScrollText
      :speed="24"
      text="Slow scroll for long sidebar titles that need careful reading"
    />
    <PScrollText
      :speed="80"
      text="Faster scroll when you just need to glance the full path"
    />
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| as | `string \| object` | `span` | Root element |
| text | `string` | `` | Fallback content when default slot is empty |
| speed | `number \| string` | `40` | Scroll speed in px/s |

## Slots

| Name | Description |
| --- | --- |
| default | Text content |

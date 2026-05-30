# Marquee

Scrolling text notification bar for displaying long messages.

## Default

Use `text` prop or default slot to set the content.

```vue demo
<template>
  <PStack direction="vertical">
    <PMarquee text="The quick brown fox jumps over the lazy dog. This is a long text that will scroll automatically when it overflows the container." />

    <PMarquee>
      <span>The quick brown fox jumps over the lazy dog. This is a long text that will scroll automatically when it overflows the container. This content is provided via the default slot.</span>
    </PMarquee>
  </PStack>
</template>
```

## Custom Colors

Use `color` and `background` to customize the appearance.

```vue demo
<template>
  <PStack direction="vertical">
    <PMarquee text="Default style with orange text on yellow background." />

    <PMarquee
      text="Blue text on light blue background."
      color="var(--color-blue-900)"
      background="var(--color-blue-100)"
    />

    <PMarquee
      text="Red text on light red background."
      color="var(--color-red-900)"
      background="var(--color-red-100)"
    />
  </PStack>
</template>
```

## Prefix

Use the `prefix` slot to add a custom icon on the left.

```vue demo
<script setup>
import InformationFillIcon from '@gdsicon/vue/information-fill'
import SpeakerVolumeLoudIcon from '@gdsicon/vue/speaker-volume-loud'
</script>

<template>
  <PStack direction="vertical">
    <PMarquee text="Notice with an information icon on the left side.">
      <template #prefix>
        <InformationFillIcon />
      </template>
    </PMarquee>

    <PMarquee text="Notice with a volume icon on the left side.">
      <template #prefix>
        <SpeakerVolumeLoudIcon />
      </template>
    </PMarquee>
  </PStack>
</template>
```

## Suffix

Use the `suffix` slot to add actions on the right.

```vue demo
<script setup>
import CrossIcon from '@gdsicon/vue/cross'
</script>

<template>
  <PStack direction="vertical">
    <PMarquee text="This notice has a close button on the right side. Click the X to dismiss.">
      <template #prefix>
        <span class="text-xs">📢</span>
      </template>

      <template #suffix>
        <PButton icon size="xs" variant="ghost">
          <CrossIcon />
        </PButton>
      </template>
    </PMarquee>
  </PStack>
</template>
```

## Speed and Delay

Control the scrolling speed with `speed` (px/s) and the initial delay with `delay` (seconds).

```vue demo
<template>
  <PStack direction="vertical">
    <PMarquee
      text="Slow scrolling speed at 30px/s with 2 seconds delay."
      :speed="30"
      :delay="2"
    />

    <PMarquee
      text="Default speed at 60px/s with 1 second delay."
    />

    <PMarquee
      text="Fast scrolling speed at 120px/s with no delay."
      :speed="120"
      :delay="0"
    />
  </PStack>
</template>
```

## Disable Scrolling

Set `scrollable` to `false` to disable the scrolling animation.

```vue demo
<template>
  <PStack direction="vertical">
    <PMarquee
      text="Short text that fits."
      :scrollable="false"
    />

    <PMarquee
      text="This is a long text that will not scroll because scrollable is set to false. The text will be truncated with ellipsis."
      :scrollable="false"
    />
  </PStack>
</template>
```

## Wrapable

Set `wrapable` to `true` to wrap the text to the next line.

```vue demo
<template>
  <PMarquee
    text="This is a long text that will not scroll because scrollable is set to false. The text will be truncated with ellipsis."
    :scrollable="false"
    wrapable
  />
</template>
```

## Replay

Use `ref` to access the `reset()` method, which restarts the scrolling animation and emits the `replay` event.

```vue demo
<script setup>
import { shallowRef } from 'vue'

const marqueeRef = shallowRef()
</script>

<template>
  <PStack direction="vertical">
    <PMarquee
      ref="marqueeRef"
      text="Click the button below to reset and replay this scrolling animation."
    />

    <PButton size="sm" @click="marqueeRef?.reset()">Reset Animation</PButton>
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| as | `string \| object` | `div` | - |
| text | `string` | `` | - |
| color | `string` | `var(--color-amber-900)` | - |
| background | `string` | `var(--color-amber-100)` | - |
| delay | `number \| string` | `1` | - |
| speed | `number \| string` | `60` | - |
| scrollable | `boolean` | `true` | - |
| wrapable | `boolean` | `false` | - |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |

# Timeline

Display a series of events in chronological order.

## Default

```vue demo
<template>
  <PTimeline>
    <PTimelineItem timestamp="2026-08-03">Released version 1.0</PTimelineItem>
    <PTimelineItem timestamp="2026-07-28">Approved for release</PTimelineItem>
    <PTimelineItem timestamp="2026-07-21">Created release candidate</PTimelineItem>
  </PTimeline>
</template>
```

## Mode

Use `mode` to position content relative to the timeline.

```vue demo
<script setup>
import { ref } from 'vue'

const mode = ref('alternate')
</script>

<template>
  <PStack direction="vertical" gap="4">
    <PRadioGroup v-model="mode" variant="button">
      <PRadio value="start">Start</PRadio>
      <PRadio value="alternate">Alternate</PRadio>
      <PRadio value="alternate-reverse">Alternate reverse</PRadio>
      <PRadio value="end">End</PRadio>
      <PRadio value="horizontal">Horizontal</PRadio>
    </PRadioGroup>

    <PTimeline :mode="mode">
      <PTimelineItem timestamp="2026-08-03">Released version 1.0</PTimelineItem>
      <PTimelineItem timestamp="2026-07-28">Approved for release</PTimelineItem>
      <PTimelineItem timestamp="2026-07-21">Created release candidate</PTimelineItem>
    </PTimeline>
  </PStack>
</template>
```

## Horizontal

Horizontal timelines retain readable item widths and can be scrolled when space is limited.

```vue demo
<template>
  <PTimeline mode="horizontal">
    <PTimelineItem timestamp="2026-08-03">Released version 1.0</PTimelineItem>
    <PTimelineItem timestamp="2026-07-28">Approved for release</PTimelineItem>
    <PTimelineItem timestamp="2026-07-21">Created release candidate</PTimelineItem>
    <PTimelineItem timestamp="2026-07-14">Started development</PTimelineItem>
  </PTimeline>
</template>
```

## Custom Node

Node color, size, type, icon, and appearance can be customized.

```vue demo
<script setup>
import CheckCircleIcon from '@gdsicon/vue/check-circle'
</script>

<template>
  <PTimeline>
    <PTimelineItem :icon="CheckCircleIcon" size="large" type="primary">
      Custom icon
    </PTimelineItem>
    <PTimelineItem color="#7928ca">Custom color</PTimelineItem>
    <PTimelineItem type="success" hollow>Hollow node</PTimelineItem>
    <PTimelineItem>
      <template #dot>
        <PStatusDot state="READY" />
      </template>
      Custom dot
    </PTimelineItem>
  </PTimeline>
</template>
```

## Timestamp Placement

```vue demo
<template>
  <PTimeline>
    <PTimelineItem timestamp="2026-08-03" placement="top">
      Timestamp above the content
    </PTimelineItem>
    <PTimelineItem timestamp="2026-07-28">Timestamp below the content</PTimelineItem>
    <PTimelineItem timestamp="2026-07-21" hide-timestamp>Hidden timestamp</PTimelineItem>
  </PTimeline>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| mode | `'start' \| 'alternate' \| 'alternate-reverse' \| 'end' \| 'horizontal'` | `start` | Position and direction of the timeline |
| reverse | `boolean` | `false` | Reverse the order of timeline items |

## Timeline Item Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| timestamp | `string` | `''` | Timestamp content |
| hide-timestamp | `boolean` | `false` | Hide the timestamp |
| placement | `'top' \| 'bottom'` | `bottom` | Timestamp position |
| type | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info' \| ''` | `''` | Node type |
| color | `string` | `''` | Custom node color |
| size | `'normal' \| 'large'` | `normal` | Node size |
| icon | `string \| Component` | - | Node icon component |
| hollow | `boolean` | `false` | Render a hollow node |

## Slots

| Name | Description |
| --- | --- |
| default | Timeline items |

## Timeline Item Slots

| Name | Description |
| --- | --- |
| default | Timeline item content |
| dot | Custom timeline node |

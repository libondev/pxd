# Tour

Guide users through a product by highlighting a target element step by step.

## Default

```vue demo
<script setup>
import { ref } from "vue"

const current = ref(0)
const isVisible = ref(false)

const steps = [
  {
    target: () => document.querySelector("[data-demo-tour-target]"),
    title: "Search anything",
    description: "Find components, tokens and guidance from here.",
  },
  {
    target: () => document.querySelector("[data-demo-tour-target-2]"),
    title: "Copy the snippet",
    description: "Every demo ships with copy-ready code.",
    position: "top",
  },
]

function openTour() {
  current.value = 0
  isVisible.value = true
}
</script>

<template>
  <PStack gap="2">
    <PButton @click="openTour">Start tour</PButton>

    <PButton data-demo-tour-target>Search</PButton>
    <PButton data-demo-tour-target-2 variant="primary">Copy</PButton>

    <PTour v-model="isVisible" v-model:current="current" :steps="steps" />
  </PStack>
</template>
```

## Props

| Name                   | Type         | Default | Description                                                       |
| ---------------------- | ------------ | ------- | ----------------------------------------------------------------- |
| model-value            | `boolean`    | `false` | Whether the tour is visible                                       |
| current                | `number`     | `0`     | Index of the active step, supports `v-model:current`              |
| steps                  | `TourStep[]` | -       | Steps to walk through                                             |
| z-index                | `number`     | `10`    | Stacking order of the overlay, highlight frame and bubble         |
| show-skip              | `boolean`    | `true`  | Show the skip button in the bubble                                |
| show-progress          | `boolean`    | `true`  | Show the `current / total` counter in the bubble                  |

### TourStep

| Name         | Type                                                                | Description                                                                |
| ------------ | ------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| target       | `string \| HTMLElement \| (() => HTMLElement \| null)`              | Element to highlight; omitting it shows a centred intro panel              |
| title        | `string`                                                            | Bubble title                                                               |
| description  | `string`                                                            | Bubble description                                                         |
| position     | `ComponentPosition`                                                 | Placement of the bubble relative to the target                             |
| next-text    | `string`                                                            | Label of the next button                                                   |
| prev-text    | `string`                                                            | Label of the previous button                                               |
| before-enter | `(ctx: { index: number, step: TourStep }) => void \| Promise<void>` | Runs before the step target is resolved, awaited when it returns a promise |

## Events

| Name              | Type                                      | Description                                                            |
| ----------------- | ----------------------------------------- | ---------------------------------------------------------------------- |
| update:model-value | `(value: boolean) => void`                | Emitted when the visibility changes.                                   |
| update:current    | `(value: number) => void`                 | Emitted when the active step index changes.                            |
| change            | `(index: number, step: TourStep) => void` | Emitted when the tour moves to another step.                           |
| finish            | `() => void`                              | Emitted when the last step is completed or the tour is closed from it. |
| skip              | `() => void`                              | Emitted when the skip button is pressed.                               |
| error             | `(error: unknown, index: number) => void` | Emitted when a step target cannot be resolved or `beforeEnter` throws. |

## Methods

| Name  | Type                      | Description                                                    |
| ----- | ------------------------- | -------------------------------------------------------------- |
| next  | `() => void`              | Advance to the next step, or finish the tour on the last step. |
| prev  | `() => void`              | Go back to the previous step.                                  |
| goTo  | `(index: number) => void` | Jump to the step at the given index.                           |
| close | `() => void`              | Close the tour.                                                |

# Image Generate

Show an AI image generation request: an empty frame with a generate action, progress while it runs, the result, and a retry state.

## Default

Press Generate to start a simulated run. The previous result stays in the frame and clears as progress climbs. Once an image is present the action becomes Regenerate and steps aside until you hover or focus the card.

```vue demo
<script setup>
import ImageGenerationIcon from '@gdsicon/vue/image-generation'
import { onBeforeUnmount, ref } from 'vue'

const scene = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="640" height="853" viewBox="0 0 640 853">
    <rect width="640" height="853" fill="#bae6fd" />
    <circle cx="470" cy="190" r="72" fill="#fef3c7" />
    <path d="M0 520 140 350l120 110 140-180 160 190 80-70v453H0z" fill="#34d399" />
    <path d="M0 650q160-50 320-15t320-25v243H0z" fill="#1e293b" />
  </svg>
`)}`

const src = ref('')
const status = ref('idle')
const progress = ref(0)

let timer = 0
let hold = 0

function stop() {
  window.clearInterval(timer)
  window.clearTimeout(hold)
}

function generate() {
  stop()
  status.value = 'generating'
  progress.value = 0
  timer = window.setInterval(() => {
    progress.value = Math.min(100, progress.value + 4)

    if (progress.value === 100) {
      window.clearInterval(timer)
      hold = window.setTimeout(() => {
        src.value = scene
        status.value = 'done'
      }, 450)
    }
  }, 120)
}

onBeforeUnmount(stop)
</script>

<template>
  <PImageGenerate
    class="w-full max-w-[270px]"
    :src="src"
    :status="status"
    :progress="progress"
    alt="A generated mountain landscape"
    @generate="generate"
  >
    <template #placeholder>
      <div class="p-6 pt-8 flex justify-center text-foreground-secondary">
        <ImageGenerationIcon class="size-8" />
      </div>
    </template>
  </PImageGenerate>
</template>
```

## Error

`status="error"` shows the message slot and keeps the retry action available. The result image stays in the frame, dimmed under the error overlay.

```vue demo
<script setup>
import { ref } from 'vue'

const src = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="640" height="853" viewBox="0 0 640 853">
    <rect width="640" height="853" fill="#bae6fd" />
    <circle cx="470" cy="190" r="72" fill="#fef3c7" />
    <path d="M0 520 140 350l120 110 140-180 160 190 80-70v453H0z" fill="#34d399" />
    <path d="M0 650q160-50 320-15t320-25v243H0z" fill="#1e293b" />
  </svg>
`)}`

const status = ref('error')
</script>

<template>
  <PImageGenerate
    class="w-full max-w-[270px]"
    :src="src"
    :status="status"
    alt="A generated mountain landscape"
    @generate="status = 'done'"
  />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| src | `string \| null` | - | Generated image URL |
| alt | `string` | `''` | Alternative text for the result image |
| status | `'idle' \| 'generating' \| 'done' \| 'error'` | - | Current state; falls back to `done` when `src` is set, otherwise `idle` |
| progress | `number \| null` | - | Generation progress from 0 to 100; omit it for an indeterminate indicator |
| disabled | `boolean` | `false` | Stops the generate and retry actions |

## Events

| Name | Type | Description |
| --- | --- | --- |
| generate | `() => void` | Emitted when the generate or retry action is pressed. |

## Slots

| Name | Description |
| --- | --- |
| placeholder | Content behind the action while no image exists. |
| generating | Overlay while generating; replaces the default haze. |
| error | Error message; the retry action remains below it. |

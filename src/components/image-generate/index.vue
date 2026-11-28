<script lang="ts" setup>
import type { ImageGenerateEmits, ImageGenerateProps, ImageGenerateStatus } from './types'
import { computed } from 'vue'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { clampValue } from '../../utils/format.js'
import PLoadingDots from '../loading-dots/index.vue'

defineOptions({
  name: 'PImageGenerate',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ImageGenerateProps>(), {
  alt: '',
  disabled: false,
})

const emits = defineEmits<ImageGenerateEmits>()

const ACTION_CLASS =
  'pxd-image-generate--action inline-flex h-10 shrink-0 cursor-pointer touch-manipulation items-center justify-center whitespace-nowrap px-5 text-sm font-medium select-none rounded-full border border-gray-alpha-300 bg-background-100/90 text-foreground shadow-medium backdrop-blur-sm self-focus-ring outline-none hover:bg-gray-100 active:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 motion-safe:transition-appearance motion-safe:hover:scale-[0.97] motion-safe:active:scale-[0.96]'

const hasImage = computed(() => Boolean(props.src))
const status = computed<ImageGenerateStatus>(
  () => props.status ?? (hasImage.value ? 'done' : 'idle'),
)
const isGenerating = computed(() => status.value === 'generating')
const isError = computed(() => status.value === 'error')
const progressValue = computed(() => {
  const progress = props.progress

  return typeof progress === 'number' && Number.isFinite(progress)
    ? clampValue(progress, 0, 100)
    : null
})
const progressNow = computed(() =>
  progressValue.value === null ? undefined : Math.round(progressValue.value),
)
const imageStyle = computed(() => {
  const remaining = isGenerating.value ? 1 - (progressValue.value ?? 0) / 100 : 0
  const blur = remaining > 0 ? 1.6 + remaining * 10.4 : 0
  const scale = 1 + remaining * 0.04

  return {
    filter: `blur(${blur.toFixed(2)}px)`,
    opacity: isError.value ? '0.6' : '1',
    scale: scale.toFixed(3),
  }
})

const configProvider = useConfigProvider()

const actionLabel = computed(() => {
  if (isError.value) {
    return configProvider.locale.imageGenerate.retry
  }

  return hasImage.value
    ? configProvider.locale.imageGenerate.regenerate
    : configProvider.locale.imageGenerate.generate
})

function onGenerate() {
  if (props.disabled) {
    return
  }

  emits('generate')
}
</script>

<template>
  <div
    data-image-generate
    :data-status="status"
    :data-has-image="hasImage || undefined"
    :data-disabled="disabled || undefined"
    :aria-busy="isGenerating || undefined"
    class="pxd-image-generate group relative isolate aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-200"
    v-bind="$attrs"
  >
    <slot v-if="!hasImage" name="placeholder" />

    <img
      v-if="hasImage"
      data-image-generate-print
      :src="src ?? undefined"
      :alt="alt"
      draggable="false"
      class="pxd-image-generate--image inset-0 absolute size-full object-cover select-none"
      :style="imageStyle"
    />

    <div v-if="isGenerating" class="pxd-image-generate--generating inset-0 absolute z-1">
      <slot name="generating">
        <span class="pxd-image-generate--haze inset-0 absolute" />
      </slot>
    </div>

    <div
      v-if="isError"
      role="alert"
      class="pxd-image-generate--error inset-0 gap-3 p-4 backdrop-blur-sm absolute z-2 flex flex-col items-center justify-center bg-background-100/85 text-center"
    >
      <slot name="error">
        <span class="text-sm text-foreground-secondary">
          {{ configProvider.locale.imageGenerate.failed }}
        </span>
      </slot>

      <button type="button" :disabled="disabled" :class="ACTION_CLASS" @click="onGenerate">
        {{ configProvider.locale.imageGenerate.retry }}
      </button>
    </div>

    <button
      v-else-if="!isGenerating"
      type="button"
      :disabled="disabled"
      :class="ACTION_CLASS"
      class="absolute top-1/2 left-1/2 z-2 -translate-x-1/2 -translate-y-1/2"
      @click="onGenerate"
    >
      {{ actionLabel }}
    </button>

    <span
      v-if="isGenerating"
      role="progressbar"
      :aria-label="configProvider.locale.imageGenerate.progress"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="progressNow"
      aria-live="off"
      class="pxd-image-generate--progress bottom-2.5 left-2.5 h-5.5 min-w-7 px-2 font-medium backdrop-blur-sm pointer-events-none absolute z-2 inline-flex items-center justify-center rounded-full bg-background-100/80 text-[11px] text-foreground tabular-nums"
    >
      <template v-if="progressNow !== undefined">{{ progressNow }}%</template>
      <PLoadingDots v-else />
    </span>
  </div>
</template>

<style lang="postcss">
.pxd-image-generate--image {
  transition:
    filter 500ms var(--timing-function),
    opacity 500ms var(--timing-function),
    scale 500ms var(--timing-function);
}

.pxd-image-generate--haze {
  background-image: linear-gradient(
    110deg,
    transparent 30%,
    rgb(255 255 255 / 0.4) 50%,
    transparent 70%
  );
  background-size: 220% 100%;
  animation: pxd-image-generate-haze 1.8s linear infinite;
}

.pxd-image-generate[data-status='done'][data-has-image] .pxd-image-generate--action {
  opacity: 0;
  pointer-events: none;
}

.pxd-image-generate[data-status='done'][data-has-image]:hover .pxd-image-generate--action,
.pxd-image-generate[data-status='done'][data-has-image]:focus-within .pxd-image-generate--action {
  opacity: 1;
  pointer-events: auto;
}

@keyframes pxd-image-generate-haze {
  from {
    background-position: 120% 0;
  }

  to {
    background-position: -120% 0;
  }
}

@media (hover: none) {
  .pxd-image-generate[data-status='done'][data-has-image] .pxd-image-generate--action {
    opacity: 1;
    pointer-events: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pxd-image-generate--image {
    transition: none;
  }

  .pxd-image-generate--haze {
    animation: none;
  }
}
</style>

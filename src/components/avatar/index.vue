<script lang="ts" setup>
import { computed, shallowRef } from 'vue'
import { useAvatarGroupContext } from '../../contexts/avatar'
import { getCssUnitValue } from '../../utils/format'

interface Props {
  src?: string
  alt?: string
  size?: number | string
  loading?: boolean
  placeholder?: boolean
}

defineOptions({
  name: 'PAvatar',
})

const props = defineProps<Props>()

const emits = defineEmits<{
  load: [Event]
  error: [Event]
  loadstart: [Event]
}>()

type LoadingStatus = 'idle' | 'loading' | 'loaded' | 'error'

const loadingStatus = shallowRef<LoadingStatus>('idle')

const avatarGroupContext = useAvatarGroupContext()

const computedSize = computed(() => getCssUnitValue(props.size || avatarGroupContext?.size, '32px'))

const hideAvatar = computed(() => !props.src || props.placeholder || loadingStatus.value === 'error')

function onLoadError(event: Event) {
  loadingStatus.value = 'error'
  emits('error', event)
}

function onLoadSuccess(event: Event) {
  loadingStatus.value = 'loaded'
  emits('load', event)
}

function onLoadStart(event: Event) {
  loadingStatus.value = 'loading'
  emits('loadstart', event)
}

function getLoadingStatus() {
  return loadingStatus.value
}

defineExpose({
  getLoadingStatus,
})
</script>

<template>
  <div
    class="pxd-avatar relative inline-flex items-center justify-center rounded-full border border-background select-none"
    :style="{ '--size': computedSize }"
  >
    <slot>
      <img
        v-if="!hideAvatar"
        :src="src"
        :alt="alt"
        loading="lazy"
        decoding="async"
        aria-hidden="true"
        fetchpriority="low"
        crossorigin="anonymous"
        class="relative block size-full overflow-hidden rounded-inherit"
        @load="onLoadSuccess"
        @loadstart="onLoadStart"
        @abort="onLoadError"
        @error="onLoadError"
      >
    </slot>

    <div v-if="loading" class="pxd-avatar--loading" />

    <div
      v-if="$slots.icon"
      class="-bottom-1 -left-1 absolute z-10 flex size-1/2 items-center overflow-hidden rounded-full border border-background bg-background"
    >
      <slot name="icon" />
    </div>
  </div>
</template>

<style lang="postcss">
.pxd-avatar {
  width: var(--size);
  height: var(--size);

  &::before,
  &::after {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
    border-radius: inherit;
  }

  &::before {
    background-image: linear-gradient(270deg, var(--color-gray-alpha-100), var(--color-gray-alpha-400), var(--color-gray-alpha-400), var(--color-gray-alpha-100));
    background-size: 400% 100%;
  }

  &::after {
    border: 1px solid var(--color-gray-alpha-400)
  }
}

.pxd-avatar--loading {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  backdrop-filter: blur(1px);
  z-index: 1;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    border-style: solid;
    border-width: 2px 2px 1px 0;
    border-color: var(--color-primary) var(--color-primary) transparent transparent;
  }
}

@keyframes placeholder {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .pxd-avatar::before {
    animation: placeholder 8s var(--default-transition-timing-function) infinite;
  }

  .pxd-avatar--loading::after {
    animation: var(--animate-spin);
  }
}
</style>

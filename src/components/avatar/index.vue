<script lang="ts" setup>
import { computed, shallowRef } from 'vue'
import { useAvatarGroupContext } from '../../contexts/avatar'
import { getCssUnitValue } from '../../utils/format'
import type { AvatarStatus, AvatarProps, AvatarEmits } from './types'

defineOptions({
  name: 'PAvatar',
  inheritAttrs: false,
})

const props = defineProps<AvatarProps>()

const emits = defineEmits<AvatarEmits>()

const loadingStatus = shallowRef<AvatarStatus>('idle')

const avatarGroupContext = useAvatarGroupContext()

const computedSize = computed(() => getCssUnitValue(props.size || avatarGroupContext?.size, '32px'))

const hideAvatar = computed(
  () => !props.src || props.placeholder || loadingStatus.value === 'error',
)

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
    class="pxd-avatar relative inline-flex size-(--avatar-size) items-center justify-center rounded-full border border-background-100 select-none before:default-animation-timing-function! motion-safe:before:animate-[placeholder_8s_infinite]"
    :style="{ '--avatar-size': computedSize }"
    v-bind="$attrs"
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
      />
    </slot>

    <div
      v-if="loading"
      class="pxd-avatar--loading inset-0 backdrop-blur-xs motion-safe:after:animate-spin absolute z-1 rounded-inherit"
    />

    <div
      v-if="$slots.icon"
      class="-bottom-1 -left-1 absolute z-1 flex size-1/2 items-center overflow-hidden rounded-full border border-background-100 bg-background-100"
    >
      <slot name="icon" />
    </div>
  </div>
</template>

<style lang="postcss">
.pxd-avatar {
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
    background-image: linear-gradient(
      270deg,
      var(--color-gray-alpha-100),
      var(--color-gray-alpha-300),
      var(--color-gray-alpha-300),
      var(--color-gray-alpha-100)
    );
    background-size: 400% 100%;
  }

  &::after {
    border: 1px solid var(--color-gray-alpha-400);
  }
}

.pxd-avatar--loading::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border-style: solid;
  border-width: 2px 2px 1px 0;
  border-color: var(--color-primary) var(--color-primary) transparent transparent;
}

@keyframes placeholder {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>

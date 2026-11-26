<script lang="ts" setup>
import type { AvatarStatus, AvatarProps, AvatarEmits } from './types'
import { computed, shallowRef } from 'vue'
import { useAvatarGroupContext } from '../../contexts/avatar.js'
import { getCssUnitValue } from '../../utils/format.js'

defineOptions({
  name: 'PAvatar',
  inheritAttrs: false,
})

const props = defineProps<AvatarProps>()

const emits = defineEmits<AvatarEmits>()

const loadingStatus = shallowRef<AvatarStatus>('idle')
const isHideAvatar = computed(
  () => !props.src || props.placeholder || loadingStatus.value === 'error',
)

const avatarGroupContext = useAvatarGroupContext()

const computedSize = computed(() => getCssUnitValue(props.size || avatarGroupContext?.props.size))

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
    data-avatar
    class="pxd-avatar text-xs after:inset-0 relative inline-flex size-(--avatar-size) items-center justify-center rounded-full bg-background-100 select-none after:absolute after:rounded-inherit after:border after:border-gray-alpha-300"
    :style="{ '--avatar-size': computedSize }"
    :data-placeholder="placeholder"
    v-bind="$attrs"
  >
    <span
      v-if="placeholder"
      aria-hidden="true"
      class="pxd-avatar--placeholder inset-0 pointer-events-none absolute overflow-hidden rounded-inherit"
    >
      <span class="pxd-avatar--placeholder-fill absolute motion-reduce:animate-none!" />
    </span>

    <slot>
      <span
        v-if="isHideAvatar"
        class="font-medium px-1 relative flex size-full items-center justify-center overflow-hidden rounded-inherit uppercase"
      >
        {{ alt?.slice(0, 2) }}
      </span>
      <img
        v-else
        :src="src"
        :alt="alt"
        loading="lazy"
        decoding="async"
        aria-hidden="true"
        fetchpriority="low"
        crossorigin="anonymous"
        class="relative block size-full overflow-hidden rounded-inherit bg-gray-100"
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
      class="bottom-0 left-0 text-xs absolute z-1 flex w-max items-center justify-center overflow-hidden rounded-full bg-background-100 ring-1 ring-background-100"
    >
      <slot name="icon" />
    </div>
  </div>
</template>

<style lang="postcss">
.pxd-avatar--placeholder-fill {
  inset: 0 0 0 -700%;
  background-image: linear-gradient(
    270deg,
    var(--color-gray-alpha-100),
    var(--color-gray-alpha-300),
    var(--color-gray-alpha-300),
    var(--color-gray-alpha-100)
  );
  background-size: 50% 100%;
  animation: pxd-animation-placeholder 2.67s linear infinite;
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

@keyframes pxd-animation-placeholder {
  from {
    transform: translate3d(0, 0, 0);
  }

  to {
    transform: translate3d(50%, 0, 0);
  }
}
</style>

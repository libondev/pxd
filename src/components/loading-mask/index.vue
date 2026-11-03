<script lang="ts" setup>
import type { LoadingMaskProps } from './types'
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { useLockScroll } from '../../composables/_internal/use-lock-scroll.js'
import PSpinner from '../spinner/index.vue'

defineOptions({
  name: 'PLoadingMask',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<LoadingMaskProps>(), {
  text: 'Loading...',
})

const maskRef = shallowRef<HTMLElement>()

const { lockScroll, unlockScroll } = useLockScroll(() => maskRef.value?.parentElement)

onMounted(lockScroll)
onBeforeUnmount(unlockScroll)
</script>

<template>
  <Transition name="pxd-transition--fade" mode="out-in" appear>
    <div
      ref="maskRef"
      aria-hidden="true"
      data-loading-mask
      class="pxd-loading-mask inset-0 gap-2 backdrop-blur-md text-sm absolute flex items-center justify-center bg-background-100 text-foreground-secondary"
      v-bind="$attrs"
    >
      <slot>
        <PSpinner class="text-base" />
        <span>{{ text }}</span>
      </slot>
    </div>
  </Transition>
</template>

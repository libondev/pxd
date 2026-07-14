<script lang="ts" setup>
import PSpinner from '../spinner/index.vue'

defineOptions({
  name: 'PLoadingMask',
  inheritAttrs: false,
})

interface LoadingMaskProps {
  text?: string
}

const props = withDefaults(defineProps<LoadingMaskProps>(), {
  text: 'Loading...',
})
</script>

<template>
  <Transition name="pxd-transition--fade" mode="out-in" appear>
    <div
      class="pxd-loading-mask inset-0 gap-2 absolute flex items-center justify-center bg-background-100/80 text-foreground-secondary"
      v-bind="$attrs"
    >
      <PSpinner class="text-base" />
      <span class="text-sm">{{ text }}</span>
    </div>
  </Transition>
</template>

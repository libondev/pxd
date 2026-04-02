<script lang="ts" setup>
import type { BasePosition } from '../../types/shared'
import { shallowRef, computed } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
import { useSwipeGesture } from '../../composables/use-swipe-gesture'

interface Props {
  disabled?: boolean
  position?: BasePosition
  modelValue?: boolean
}

interface Emits {
  change?: [value: boolean]
  'update:modelValue': [value: boolean]
}

defineOptions({
  name: 'PDismissContainer',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom',
})
const emits = defineEmits<Emits>()

const modelValue = useModelValue(props, emits)

const containerRef = shallowRef<HTMLElement>()
const gestureMoveOffset = shallowRef(0)

const isHorizontal = computed(() => ['left', 'right'].includes(props.position))
const gestureDirection = computed(() => (isHorizontal.value ? 'horizontal' : 'vertical'))

const computedStyle = computed(() => {
  return {
    transform: `translate${isHorizontal.value ? 'X' : 'Y'}(${gestureMoveOffset.value}px)`,
  }
})

const dampingFactor = 2
let maxDamped = 0

useSwipeGesture(containerRef, {
  swipeThreshold: 0,
  disabled: computed(() => props.disabled),
  direction: gestureDirection,
  onPress: () => {
    const el = containerRef.value
    maxDamped = el ? (isHorizontal.value ? el.offsetWidth : el.offsetHeight) / dampingFactor : 0

    gestureMoveOffset.value = 0
  },
  onFollow: ({ displacement }) => {
    const pos = props.position
    const isDismissDirection =
      pos === 'bottom' || pos === 'right' ? displacement > 0 : displacement < 0

    if (isDismissDirection) {
      gestureMoveOffset.value = displacement
    } else {
      const rubberBand = maxDamped * Math.sign(displacement)
      const damping = 1 - Math.exp(-Math.abs(displacement) / maxDamped)
      gestureMoveOffset.value = rubberBand * damping
    }
  },
  onRelease: ({ swiped, direction }) => {
    gestureMoveOffset.value = 0

    if (!swiped || direction !== props.position) {
      return
    }

    modelValue.value = false
  },
})
</script>

<template>
  <div ref="containerRef" class="pxd-dismiss-container" :style="computedStyle" v-bind="$attrs">
    <slot />
  </div>
</template>

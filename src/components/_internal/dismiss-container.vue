<script lang="ts" setup>
import type { ComponentPosition } from '../../types/shared'
import { shallowRef, computed } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
import { useSwipeGesture } from '../../composables/use-swipe-gesture'

interface Props {
  disabled?: boolean
  position?: ComponentPosition
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
  disabled: false,
  position: 'bottom',
})
const emits = defineEmits<Emits>()

const modelValue = useModelValue(props, emits)

const containerRef = shallowRef<HTMLElement>()

const gestureMoveOffset = shallowRef(0)

const isHorizontal = computed(() => ['left', 'right'].find((d) => props.position.startsWith(d)))
const gestureDirection = computed(() => (isHorizontal.value ? 'horizontal' : 'vertical'))

const computedStyle = computed(() => {
  return {
    transform: gestureMoveOffset.value
      ? `translate${isHorizontal.value ? 'X' : 'Y'}(${gestureMoveOffset.value}px) !important`
      : '',
  }
})

const dampingFactor = 9
let maxSwipedDamped = 0
let hasDraggedInDismissDirection = false
let releaseAnimationId = 0

function animateRelease(from: number, decayRate = 0.88) {
  cancelAnimationFrame(releaseAnimationId)

  const step = () => {
    const next = from * decayRate
    if (Math.abs(next) < 0.5) {
      gestureMoveOffset.value = 0
      return
    }
    from = next
    gestureMoveOffset.value = from
    releaseAnimationId = requestAnimationFrame(step)
  }

  releaseAnimationId = requestAnimationFrame(step)
}

useSwipeGesture(containerRef, {
  handleSelector: '.pxd-dismiss-container--handle',
  swipeThreshold: 0,
  disabled: computed(() => props.disabled),
  direction: gestureDirection,
  onPress: ({ size }) => {
    cancelAnimationFrame(releaseAnimationId)
    maxSwipedDamped = size / dampingFactor
    hasDraggedInDismissDirection = false

    gestureMoveOffset.value = 0
  },
  onFollow: ({ displacement }) => {
    const pos = props.position
    const dismissDirection = pos.startsWith('bottom') || pos.startsWith('right')
    const isDismissDirection = dismissDirection ? displacement > 0 : displacement < 0

    if (isDismissDirection) {
      hasDraggedInDismissDirection = true
      gestureMoveOffset.value = displacement
    } else if (hasDraggedInDismissDirection) {
      const rubberBand = maxSwipedDamped * Math.sign(displacement)
      const damping = 1 - Math.exp(-Math.abs(displacement) / maxSwipedDamped)
      gestureMoveOffset.value = rubberBand * damping
    }
  },
  onRelease: async ({ swiped, direction }) => {
    if (swiped && direction === props.position) {
      modelValue.value = false
      gestureMoveOffset.value = 0
      return
    }

    animateRelease(gestureMoveOffset.value)
  },
})
</script>

<template>
  <div
    ref="containerRef"
    class="pxd-dismiss-container relative"
    :data-disabled="disabled"
    :data-position="position"
    :style="computedStyle"
    v-bind="$attrs"
  >
    <div
      v-if="!disabled"
      class="pxd-dismiss-container--handle absolute rounded-full bg-gray-200"
    ></div>

    <slot />
  </div>
</template>

<style lang="postcss">
.pxd-dismiss-container {
  --dismiss-handle-x: 3rem;
  --dismiss-handle-y: 0.4rem;

  &::after {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    background: #fff;
    z-index: -1;
  }

  &[data-position^='top'][data-disabled='false'] {
    padding-bottom: 1rem;

    &::after {
      top: -50%;
    }
  }
  &[data-position^='bottom'][data-disabled='false'] {
    padding-top: 1rem;

    &::after {
      bottom: -50%;
    }
  }
  &[data-position^='left'][data-disabled='false'] {
    padding-right: 1rem;

    &::after {
      left: -50%;
    }
  }
  &[data-position^='right'][data-disabled='false'] {
    padding-left: 1rem;

    &::after {
      right: -50%;
    }
  }

  &[data-position^='top'],
  &[data-position^='bottom'] {
    .pxd-dismiss-container--handle {
      left: 50%;
      top: 0.3rem;
      transform: translateX(-50%);
      width: var(--dismiss-handle-x);
      height: var(--dismiss-handle-y);
    }
  }

  &[data-position^='left'],
  &[data-position^='right'] {
    .pxd-dismiss-container--handle {
      left: 0.3rem;
      top: 50%;
      transform: translateY(-50%);
      width: var(--dismiss-handle-y);
      height: var(--dismiss-handle-x);
    }
  }
}
</style>

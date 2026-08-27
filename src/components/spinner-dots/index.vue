<script lang="ts" setup>
import type { SpinnerDotsProps } from './types'
import { computed } from 'vue'

defineOptions({
  name: 'PSpinnerDots',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SpinnerDotsProps>(), {
  variant: 'dots0',
  interval: 100,
})

const spinnerPresets = {
  dots0: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  dots1: ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'],
  dots2: ['⠋', '⠙', '⠚', '⠞', '⠖', '⠦', '⠴', '⠲', '⠳', '⠓'],
  dots3: ['⠄', '⠆', '⠇', '⠋', '⠙', '⠸', '⠰', '⠠', '⠰', '⠸', '⠙', '⠋', '⠇', '⠆'],
  dots4: ['⠋', '⠙', '⠚', '⠒', '⠂', '⠂', '⠒', '⠲', '⠴', '⠦', '⠖', '⠒', '⠐', '⠐', '⠒', '⠓', '⠋'],
  dots5: ['⢹', '⢺', '⢼', '⣸', '⣇', '⡧', '⡗', '⡏'],
  dots6: ['⢄', '⢂', '⢁', '⡁', '⡈', '⡐', '⡠'],
  dots7: ['⣼', '⣹', '⢻', '⠿', '⡟', '⣏', '⣧', '⣶'],
  dots8: [
    '⠁',
    '⠉',
    '⠙',
    '⠚',
    '⠒',
    '⠂',
    '⠂',
    '⠒',
    '⠲',
    '⠴',
    '⠤',
    '⠄',
    '⠄',
    '⠤',
    '⠴',
    '⠲',
    '⠒',
    '⠂',
    '⠂',
    '⠒',
    '⠚',
    '⠙',
    '⠉',
    '⠁',
  ],
  dots9: [
    '⠁',
    '⠂',
    '⠄',
    '⡀',
    '⡈',
    '⡐',
    '⡠',
    '⣀',
    '⣁',
    '⣂',
    '⣄',
    '⣌',
    '⣔',
    '⣤',
    '⣥',
    '⣦',
    '⣮',
    '⣶',
    '⣷',
    '⣿',
    '⡿',
    '⠿',
    '⢟',
    '⠟',
    '⡛',
    '⠛',
    '⠫',
    '⢋',
    '⠋',
    '⠍',
    '⡉',
    '⠉',
    '⠑',
    '⠡',
    '⢁',
  ],
}

const spinners = computed(() => {
  if (props.data?.length) {
    return props.data
  }

  return spinnerPresets[props.variant as keyof typeof spinnerPresets] || spinnerPresets.dots0
})

const spinnerStyle = computed(() => {
  const frames = spinners.value.length

  return {
    '--spinner-dots-frames': frames,
    '--spinner-dots-duration': `${frames * props.interval}ms`,
  }
})
</script>

<template>
  <span
    class="pxd-spinner-dots inline-block h-lh overflow-hidden align-baseline"
    :style="spinnerStyle"
    v-bind="$attrs"
  >
    <span class="pxd-spinner-dots--track block motion-reduce:animate-none!" aria-hidden="true">
      <span v-for="(char, index) in spinners" :key="index" class="pxd-spinner-dots--frame block">
        {{ char }}
      </span>
    </span>
  </span>
</template>

<style>
.pxd-spinner-dots--track {
  animation: pxd-animation-spinner-dots var(--spinner-dots-duration, 1s)
    steps(var(--spinner-dots-frames, 10)) infinite;
}

@keyframes pxd-animation-spinner-dots {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(-100%);
  }
}
</style>

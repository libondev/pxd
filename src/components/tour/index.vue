<script lang="ts" setup>
import type { TourEmits, TourProps } from './types'
import type { CSSProperties } from 'vue'
import { computed, shallowRef, watch } from 'vue'
import { useMotionReduced } from '../../composables/_internal/use-motion-reduce.js'
import { useTourTarget } from '../../composables/_internal/use-tour-target.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { cachedOff, cachedOn } from '../../utils/event.js'
import { isServer } from '../../utils/is.js'
import PButton from '../button/index.vue'
import POverlay from '../overlay/index.vue'
import PPopover from '../popover/index.vue'

defineOptions({
  name: 'PTour',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<TourProps>(), {
  modelValue: false,
  current: 0,
  zIndex: 10,
  showSkip: true,
  showProgress: true,
})

const emits = defineEmits<TourEmits>()

const configProvider = useConfigProvider()
const motionReduced = useMotionReduced()

const popoverVisible = shallowRef(false)

const activeStep = computed(() => props.steps[props.current])
const isLastStep = computed(() => props.current >= props.steps.length - 1)

const currentPosition = computed(() => activeStep.value?.position ?? 'bottom')

const maskStyle = computed<CSSProperties>(() => {
  return {
    top: `${rect.value.top}px`,
    left: `${rect.value.left}px`,
    width: `${rect.value.width}px`,
    height: `${rect.value.height}px`,
    borderRadius: targetRadius.value || '0px',
  }
})

const tourStyle = computed<CSSProperties>(() => ({
  '--tour-index': props.zIndex,
}))

const nextText = computed(() => {
  const { nextText: customNextText } = activeStep.value ?? {}

  if (customNextText) {
    return customNextText
  }

  return isLastStep.value ? configProvider.locale.tour.done : configProvider.locale.tour.next
})

const prevText = computed(() => activeStep.value?.prevText || configProvider.locale.tour.prev)

function onMissingTarget(index: number) {
  emits('error', new Error(`[PTour] target not found for step ${index}`), index)

  if (index >= props.steps.length - 1) {
    close()
    emits('finish')

    return
  }

  goToStep(index + 1)
}

const { rect, targetRadius, isCentered, isLoading, goTo } = useTourTarget({
  step: activeStep,
  motionReduced,
  onMissingTarget,
  onError: (error: unknown, index: number) => {
    emits('error', error, index)
  },
  onResolved: () => {
    popoverVisible.value = true
  },
})

function goToStep(index: number) {
  if (index < 0 || index >= props.steps.length) {
    return
  }

  if (index === props.current) {
    goTo(index)

    return
  }

  emits('update:current', index)
  emits('change', index, props.steps[index]!)
}

function next() {
  if (isLastStep.value) {
    close()
    emits('finish')

    return
  }

  goToStep(props.current + 1)
}

function prev() {
  goToStep(props.current - 1)
}

function skip() {
  emits('skip')
  close()
}

function close() {
  emits('update:modelValue', false)
}

function onKeydown(ev: KeyboardEvent) {
  if (ev.key === 'ArrowRight') {
    ev.preventDefault()
    next()

    return
  }

  if (ev.key === 'ArrowLeft') {
    ev.preventDefault()
    prev()
  }
}

watch(
  () => props.modelValue,
  (visible) => {
    if (isServer()) {
      return
    }

    popoverVisible.value = visible

    if (!visible) {
      cachedOff(window, 'keydown', onKeydown)

      return
    }

    cachedOn(window, 'keydown', onKeydown)
    goTo(props.current)
  },
  { immediate: true },
)

watch(
  () => props.current,
  (index, previousIndex) => {
    if (!props.modelValue || index === previousIndex) {
      return
    }

    goTo(index)
  },
)

watch(
  () => props.steps,
  () => {
    if (props.modelValue) {
      goTo(props.current)
    }
  },
)

defineExpose({
  next,
  prev,
  goTo: goToStep,
  close,
})
</script>

<template>
  <POverlay
    :z-index="zIndex"
    :show-overlay="false"
    :model-value="modelValue"
    :close-on-press-escape="false"
    :close-on-click-overlay="false"
  >
    <div
      v-if="modelValue"
      data-tour
      role="dialog"
      aria-modal="true"
      :data-centered="isCentered"
      :data-loading="isLoading"
      class="pxd-tour inset-0 pointer-events-auto fixed z-(--tour-index) select-none"
      :style="tourStyle"
      v-bind="$attrs"
    >
      <div class="pxd-tour--mask pointer-events-none fixed" :style="maskStyle" />

      <PPopover
        :model-value="popoverVisible && !isLoading"
        trigger="manual"
        trigger-selector="[data-tour-anchor]"
        :position="currentPosition"
        :interactive="false"
        :fill-trigger-width="false"
        :close-on-outside-click="false"
        :close-on-invisible="false"
        :close-on-press-escape="false"
        :return-focus-on-deactivate="false"
        :auto-focus-element="true"
        :z-index="zIndex + 1"
        class="pxd-tour--popover pointer-events-auto"
        content-class="pxd-tour--content bg-background-100 p-3 shadow-border-menu rounded-xl"
      >
        <span
          data-tour-anchor
          class="pxd-tour--anchor pointer-events-none absolute"
          :style="maskStyle"
        />

        <template #content>
          <h4 v-if="activeStep?.title" class="font-medium m-0 text-15">
            {{ activeStep.title }}
          </h4>

          <p v-if="activeStep?.description" class="text-sm m-0 text-foreground-secondary">
            {{ activeStep.description }}
          </p>

          <div class="gap-2 mbs-2.5 flex items-center justify-between">
            <span
              v-if="showProgress"
              class="text-xs mr-4 flex-1 text-foreground-secondary tabular-nums"
            >
              {{ current + 1 }}/{{ steps.length }}
            </span>

            <PButton v-if="showSkip && !isLastStep" variant="ghost" size="sm" @click="skip">
              {{ configProvider.locale.tour.skip }}
            </PButton>

            <PButton v-if="current > 0" variant="ghost" size="sm" @click="prev">
              {{ prevText }}
            </PButton>

            <PButton variant="primary" size="sm" @click="next">
              {{ nextText }}
            </PButton>
          </div>
        </template>
      </PPopover>
    </div>
  </POverlay>
</template>

<style lang="postcss">
.pxd-tour--mask {
  box-shadow: 0 0 0 9999px rgb(0 0 0 / 0.6);
}
</style>

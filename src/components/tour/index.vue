<script lang="ts" setup>
import type { TourEmits, TourProps } from './types'
import type { CSSProperties } from 'vue'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { useTourTarget } from '../../composables/_internal/use-tour-target.js'
import { useMotionReduced } from '../../composables/use-motion-reduce.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { cachedOff, cachedOn, isCompositionKeydown } from '../../utils/event.js'
import { getUniqueId } from '../../utils/helper.js'
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

const titleId = getUniqueId('pxd-tour-title')

const popoverVisible = shallowRef(false)
const localCurrent = shallowRef(normalizeCurrent(props.current))

const activeStep = computed(() => props.steps[localCurrent.value])
const isLastStep = computed(() => localCurrent.value >= props.steps.length - 1)

const currentPosition = computed(() => activeStep.value?.position ?? 'bottom')
const tourStyle = computed<CSSProperties>(() => ({
  '--tour-index': props.zIndex,
}))

const configProvider = useConfigProvider()

const nextText = computed(() => {
  const { nextText: customNextText } = activeStep.value ?? {}

  if (customNextText) {
    return customNextText
  }

  return isLastStep.value ? configProvider.locale.tour.done : configProvider.locale.tour.next
})

const prevText = computed(() => activeStep.value?.prevText || configProvider.locale.tour.prev)

const motionReduced = useMotionReduced()
const { rect, targetRadius, isCentered, isLoading, goTo, cancel } = useTourTarget({
  step: activeStep,
  motionReduced,
  onMissingTarget,
  onError: onStepError,
  onResolved: () => {
    popoverVisible.value = true
  },
})

const maskStyle = computed<CSSProperties>(() => {
  return {
    top: `${rect.value.top}px`,
    left: `${rect.value.left}px`,
    width: `${rect.value.width}px`,
    height: `${rect.value.height}px`,
    borderRadius: targetRadius.value || '0px',
  }
})

function normalizeCurrent(index: number) {
  if (props.steps.length === 0) {
    return 0
  }

  return Math.min(Math.max(index, 0), props.steps.length - 1)
}

function onStepError(error: unknown, index: number) {
  emits('error', error, index)
  popoverVisible.value = false

  if (index >= props.steps.length - 1) {
    close()
    emits('finish')

    return
  }

  goToStep(index + 1)
}

function onMissingTarget(index: number) {
  onStepError(new Error(`[PTour] target not found for step ${index}`), index)
}
function goToStep(index: number) {
  if (props.steps.length === 0 || index < 0 || index >= props.steps.length) {
    return
  }

  const nextIndex = normalizeCurrent(index)

  if (nextIndex === localCurrent.value) {
    goTo(nextIndex)

    return
  }

  localCurrent.value = nextIndex
  emits('update:current', nextIndex)
  emits('change', nextIndex, props.steps[nextIndex]!)
  goTo(nextIndex)
}

function next() {
  if (isLastStep.value) {
    close()
    emits('finish')

    return
  }

  goToStep(localCurrent.value + 1)
}

function prev() {
  goToStep(localCurrent.value - 1)
}

function skip() {
  emits('skip')
  close()
}

function close() {
  emits('update:modelValue', false)
}

function onKeydown(ev: KeyboardEvent) {
  if (
    ev.defaultPrevented ||
    ev.ctrlKey ||
    ev.metaKey ||
    ev.altKey ||
    ev.shiftKey ||
    isCompositionKeydown(ev)
  ) {
    return
  }

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
      cancel()

      return
    }

    localCurrent.value = normalizeCurrent(props.current)

    if (props.steps.length === 0) {
      popoverVisible.value = false
      close()

      return
    }

    cachedOn(window, 'keydown', onKeydown)
    goTo(localCurrent.value)
  },
  { immediate: true },
)

watch(
  () => props.current,
  (index) => {
    const nextIndex = normalizeCurrent(index)

    if (nextIndex === localCurrent.value) {
      return
    }

    localCurrent.value = nextIndex

    if (!props.modelValue) {
      return
    }

    if (props.steps.length === 0) {
      popoverVisible.value = false
      close()

      return
    }

    goTo(nextIndex)
  },
)

watch(
  () => props.steps,
  () => {
    if (props.steps.length === 0) {
      localCurrent.value = 0
      popoverVisible.value = false

      if (props.modelValue) {
        close()
      }

      return
    }

    const nextIndex = normalizeCurrent(localCurrent.value)

    if (nextIndex !== localCurrent.value) {
      localCurrent.value = nextIndex
      emits('update:current', nextIndex)
    }

    if (props.modelValue) {
      goTo(nextIndex)
    }
  },
)

onBeforeUnmount(() => {
  cachedOff(window, 'keydown', onKeydown)
})

defineExpose({
  next,
  prev,
  goTo: goToStep,
  close,
})
</script>

<template>
  <POverlay
    variant="none"
    :z-index="zIndex"
    :model-value="modelValue"
    :close-on-press-escape="false"
    :close-on-click-overlay="false"
  >
    <div
      v-if="modelValue"
      data-tour
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
        :aria-labelledby="activeStep?.title ? titleId : undefined"
        :auto-focus-element="true"
        :wrapper-class="isCentered ? 'pxd-tour--popover-centered' : undefined"
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
          <h4 v-if="activeStep?.title" :id="titleId" class="font-medium m-0 text-15px">
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
              {{ localCurrent + 1 }}/{{ steps.length }}
            </span>

            <PButton v-if="showSkip && !isLastStep" variant="ghost" size="sm" @click="skip">
              {{ configProvider.locale.tour.skip }}
            </PButton>

            <PButton v-if="localCurrent > 0" variant="ghost" size="sm" @click="prev">
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

.pxd-tour--popover-centered {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
}
</style>

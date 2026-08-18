<script lang="ts" setup>
import type { OverlayEmits, OverlayProps } from './types'
import { computed, nextTick, onBeforeUnmount, shallowRef, watch } from 'vue'
import { useLockScroll } from '../../composables/use-lock-scroll.js'
import { useOverlayManager } from '../../composables/use-overlay-manager.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { getElement } from '../../utils/dom.js'
import { NOOP } from '../../utils/event.js'
import { isServer } from '../../utils/is.js'
import PTeleport from '../teleport/index.vue'

defineOptions({
  name: 'POverlay',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<OverlayProps>(), {
  modelValue: false,
  showOverlay: true,
  appendToBody: true,
  closeOnPressEscape: true,
  lockScrollOnVisible: true,
  closeOnClickOverlay: false,
})

const emits = defineEmits<OverlayEmits>()

const configProvider = useConfigProvider()

const clipPath = shallowRef('')
const computedStyle = computed(() => ({
  '--overlay-index': props.zIndex,
  'clip-path': clipPath.value,
}))

let cacheShownElement: HTMLElement | null = null

const { lockScroll, unlockScroll } = useLockScroll()

const { registerOverlay, unregisterOverlay } = useOverlayManager({
  enabled: () => props.modelValue,
  lockScrollOnVisible: () => props.lockScrollOnVisible,
  lockScroll,
  unlockScroll,
  onPressEscape: (ev: KeyboardEvent) => {
    if (!props.closeOnPressEscape) {
      return
    }

    emits('escape', ev)
    emits('update:modelValue', false)
  },
})

function getShownElementClipPath(el: HTMLElement) {
  const { top, left, right, bottom } = el.getBoundingClientRect()

  clipPath.value = `polygon(
    0% 0%,
    0% 100%,
    ${left}px 100%,
    ${left}px ${top}px,
    ${right}px ${top}px,
    ${right}px ${bottom}px,
    ${left}px ${bottom}px,
    ${left}px 100%,
    100% 100%,
    100% 0%
  )`
}

async function getShownElementIfNeed() {
  const { shownElement, modelValue } = props

  if (!modelValue || !shownElement) {
    toggleShownElementClasses()
    clipPath.value = ''
    return
  }

  await nextTick()

  const el = getElement(shownElement)

  if (!el) {
    return
  }

  cacheShownElement = el
  getShownElementClipPath(el)
  toggleShownElementClasses(true)
}

function toggleShownElementClasses(force: boolean = false) {
  cacheShownElement?.classList.toggle('pointer-events-auto!', force)
}

function onOverlayVisibleChange(visible: boolean) {
  if (isServer()) {
    return
  }

  if (visible) {
    registerOverlay()
    getShownElementIfNeed()

    return
  }

  unregisterOverlay()
  toggleShownElementClasses()
}

function onOverlayClick(ev: PointerEvent) {
  emits('click', ev)

  if (!props.closeOnClickOverlay) {
    return
  }

  emits('update:modelValue', false)
}

watch(() => props.modelValue, onOverlayVisibleChange, { immediate: true })

watch(() => props.shownElement, getShownElementIfNeed)

onBeforeUnmount(() => {
  toggleShownElementClasses()
  cacheShownElement = null
})
</script>

<template>
  <PTeleport :disabled="!appendToBody">
    <Transition name="pxd-transition--fade" mode="out-in" appear>
      <div
        v-if="showOverlay && modelValue"
        role="presentation"
        aria-hidden="true"
        :data-variant="variant"
        :data-enter-motion="configProvider.enterMotion"
        :data-leave-motion="configProvider.leaveMotion"
        class="pxd-overlay inset-0 bg-black/60 sm:bg-background-100/80 data-[variant='blurred']:backdrop-blur-sm pointer-events-auto fixed z-(--overlay-index) select-none data-[variant='transparent']:opacity-0 motion-safe:transition-colors"
        :style="computedStyle"
        v-bind="$attrs"
        @click="onOverlayClick"
        @touchmove.prevent.stop="NOOP"
      />
    </Transition>

    <slot />
  </PTeleport>
</template>

<script lang="ts" setup>
import type { MaybeElementRef } from '../../types/shared/utils'
import type { OverlayEmits, OverlayProps } from './types'
import { computed, nextTick, onBeforeUnmount, shallowRef, watch } from 'vue'
import { useLockScroll } from '../../composables/use-lock-scroll'
import { useOverlayManager } from '../../composables/use-overlay-manager'
import { NOOP } from '../../utils/event'
import { isServer } from '../../utils/is'
import { unrefElement } from '../../utils/ref'
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
  appendToBody: true,
  closeOnPressEscape: true,
  lockScrollOnVisible: true,
  closeOnClickOverlay: false,
})

const emits = defineEmits<OverlayEmits>()

const { lockScroll, unlockScroll } = useLockScroll()

const clipPath = shallowRef('')
const computedStyle = computed(() => ({
  '--overlay-index': props.zIndex,
  'clip-path': clipPath.value,
}))

let isLockedScroll = false
let cacheShownElement: HTMLElement | null = null

const { dispatchClickOutside } = useOverlayManager(
  computed(() => ({
    enabled: props.modelValue,
    closeOnPressEscape: props.closeOnPressEscape,
    closeOnClickOutside: props.closeOnClickOverlay,
    onPressEscape: (ev: KeyboardEvent) => emits('escape', ev),
    onClickOutside: (ev: PointerEvent) => emits('click', ev),
    onClose: () => emits('update:modelValue', false),
  })),
)

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

function toggleViewportScroll(lock: boolean) {
  if (!props.lockScrollOnVisible) {
    return
  }

  if (lock && !isLockedScroll) {
    isLockedScroll = true
    lockScroll()
    return
  }

  if (isLockedScroll) {
    isLockedScroll = false
    unlockScroll()
    return
  }
}

async function tryGetShownElementIfNeed() {
  const { shownElement, modelValue } = props

  if (!modelValue || !shownElement) {
    toggleShownElementClasses()
    clipPath.value = ''
    return
  }

  await nextTick()

  const el =
    typeof shownElement === 'string'
      ? document.querySelector<HTMLElement>(shownElement)
      : unrefElement(shownElement as MaybeElementRef<HTMLElement>)

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
    toggleViewportScroll(true)
    tryGetShownElementIfNeed()

    return
  }

  toggleViewportScroll(false)
  toggleShownElementClasses()
}

watch(() => props.modelValue, onOverlayVisibleChange, { immediate: true })

watch(() => props.shownElement, tryGetShownElementIfNeed)

onBeforeUnmount(() => {
  toggleViewportScroll(false)
  toggleShownElementClasses()
  cacheShownElement = null
})
</script>

<template>
  <PTeleport :disabled="!appendToBody">
    <Transition name="pxd-transition--fade" mode="out-in" appear>
      <div
        v-if="modelValue"
        role="presentation"
        aria-hidden="true"
        :data-variant="variant"
        class="pxd-overlay inset-0 bg-black/40 sm:bg-background-100/80 data-[variant='blurred']:backdrop-blur-sm pointer-events-auto fixed z-(--overlay-index) select-none data-[variant='transparent']:opacity-0 motion-safe:transition-colors"
        :style="computedStyle"
        v-bind="$attrs"
        @click="dispatchClickOutside"
        @touchmove.prevent.stop="NOOP"
      />
    </Transition>

    <slot />
  </PTeleport>
</template>

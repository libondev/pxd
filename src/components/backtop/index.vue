<script lang="ts" setup>
import type { BacktopProps, BacktopEmits } from './types'
import ArrowUpIcon from '@gdsicon/vue/arrow-up'
import { tv } from 'tailwind-variants'
import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { getScrollTarget, getScrollElement } from '../../utils/dom'
import { cachedOff, cachedOn } from '../../utils/event'
import PButton from '../button/index.vue'
import PTeleport from '../teleport/index.vue'

defineOptions({
  name: 'PBacktop',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<BacktopProps>(), {
  visibleThreshold: 30,
  appendToBody: true,
  scrollTarget: 'top',
})

const emits = defineEmits<BacktopEmits>()

let scrollContainer: ReturnType<typeof getScrollTarget> | null
let scrollContainerEl: ReturnType<typeof getScrollElement> | null

const backtopVariants = tv({
  base: 'pxd-backtop will-change-transform',
  variants: {
    appendToBody: {
      true: 'fixed',
      false: 'absolute',
    },
  },
  defaultVariants: {
    appendToBody: true,
  },
})

const scrollTop = shallowRef(0)
const maxScrollTop = shallowRef(0)
const wrapperRef = shallowRef<HTMLElement>()

const computedClasses = computed(() => {
  return backtopVariants({ appendToBody: props.appendToBody })
})

const isVisible = computed(() => {
  if (props.scrollTarget === 'top') {
    return scrollTop.value >= props.visibleThreshold
  }

  return maxScrollTop.value - scrollTop.value >= props.visibleThreshold
})

function updateScrollTop() {
  if (!scrollContainerEl) {
    return
  }

  scrollTop.value = scrollContainerEl.scrollTop
  maxScrollTop.value = Math.max(0, scrollContainerEl.scrollHeight - scrollContainerEl.clientHeight)
}

function onActionClick(ev: PointerEvent) {
  emits('click', ev)

  if (!scrollContainer || !scrollContainerEl) {
    return
  }

  const top =
    props.scrollTarget === 'bottom'
      ? Math.max(0, scrollContainerEl.scrollHeight - scrollContainerEl.clientHeight)
      : 0

  scrollContainer.scrollTo({
    top,
    left: 0,
    behavior: 'smooth',
  })
}

onMounted(() => {
  scrollContainer = getScrollTarget(wrapperRef.value!)
  scrollContainerEl = getScrollElement(scrollContainer)

  updateScrollTop()
  cachedOn(scrollContainer, 'scroll', updateScrollTop, { passive: true })
})

onBeforeUnmount(() => {
  cachedOff(scrollContainer, 'scroll', updateScrollTop, { passive: true })

  scrollContainer = null
  scrollContainerEl = null
})
</script>

<template>
  <PTeleport :disabled="!appendToBody">
    <Transition name="pxd-transition--fade-scale" mode="out-in" appear>
      <div
        v-show="isVisible"
        ref="wrapperRef"
        :class="computedClasses"
        v-bind="$attrs"
        @click="onActionClick"
      >
        <slot>
          <PButton class="" shape="rounded" icon>
            <ArrowUpIcon
              class="pointer-events-none"
              :class="{ 'rotate-180': scrollTarget === 'bottom' }"
            />
          </PButton>
        </slot>
      </div>
    </Transition>
  </PTeleport>
</template>

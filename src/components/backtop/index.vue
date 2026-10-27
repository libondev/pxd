<script lang="ts" setup>
import type { BacktopProps, BacktopEmits } from './types'
import ArrowUpIcon from '@gdsicon/vue/arrow-up'
import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { useMotionReduced } from '../../composables/use-motion-reduce.js'
import { useResizeObserver } from '../../composables/use-resize-observer.js'
import { getScrollTarget, getScrollElement, resolveScrollBehavior } from '../../utils/dom.js'
import { cachedOff, cachedOn, throttleByRaf } from '../../utils/event.js'
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
  scrollBehavior: 'auto',
})

const emits = defineEmits<BacktopEmits>()

let scrollContainer: ReturnType<typeof getScrollTarget> | null

const scrollTop = shallowRef(0)
const maxScrollTop = shallowRef(0)
const scrollContainerEl = shallowRef<HTMLElement | null>(null)
const isMeasured = shallowRef(false)

const updateScrollTop = throttleByRaf(() => {
  const el = scrollContainerEl.value

  if (!el) {
    return
  }

  isMeasured.value = true
  scrollTop.value = el.scrollTop
  maxScrollTop.value = Math.max(0, el.scrollHeight - el.clientHeight)
})

const wrapperRef = shallowRef<HTMLElement>()

const isVisible = computed(() => {
  if (!isMeasured.value) {
    return false
  }

  if (props.scrollTarget === 'top') {
    return scrollTop.value >= props.visibleThreshold
  }

  return maxScrollTop.value - scrollTop.value >= props.visibleThreshold
})

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-backtop',
    variants: {
      appendToBody: {
        true: 'fixed',
        false: 'absolute',
      },
      visible: {
        true: 'will-change-transform',
      },
    },
  },
  {
    selection: () => ({ appendToBody: props.appendToBody, visible: isVisible.value }),
  },
)

const motionReduce = useMotionReduced()

// 内容/布局变化不触发 scroll 事件，靠 RO 重新校验，避免页面切换后残留过期状态
useResizeObserver(() => scrollContainerEl.value, updateScrollTop)

function onActionClick(ev: PointerEvent) {
  emits('click', ev)

  if (!scrollContainer || !scrollContainerEl.value) {
    return
  }

  const top =
    props.scrollTarget === 'bottom'
      ? Math.max(0, scrollContainerEl.value.scrollHeight - scrollContainerEl.value.clientHeight)
      : 0

  scrollContainer.scrollTo({
    top,
    left: 0,
    behavior: resolveScrollBehavior(props.scrollBehavior, motionReduce),
  })
}

onMounted(() => {
  scrollContainer = getScrollTarget(wrapperRef.value!)
  scrollContainerEl.value = getScrollElement(scrollContainer)

  updateScrollTop()
  cachedOn(scrollContainer, 'scroll', updateScrollTop, { passive: true })
})

onBeforeUnmount(() => {
  cachedOff(scrollContainer, 'scroll', updateScrollTop, { passive: true })
  updateScrollTop.cancel()

  scrollContainer = null
  scrollContainerEl.value = null
})
</script>

<template>
  <PTeleport :disabled="!appendToBody">
    <Transition name="pxd-transition--fade-scale" mode="out-in" appear>
      <div
        data-backtop
        v-show="isVisible"
        ref="wrapperRef"
        :class="classes"
        v-bind="attrs"
        @click="onActionClick"
      >
        <slot>
          <PButton :size="size" shape="rounded" icon>
            <ArrowUpIcon :class="{ 'rotate-180': scrollTarget === 'bottom' }" />
          </PButton>
        </slot>
      </div>
    </Transition>
  </PTeleport>
</template>

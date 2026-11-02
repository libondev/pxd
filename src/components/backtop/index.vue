<script lang="ts" setup>
import type { BacktopProps, BacktopEmits } from './types'
import ArrowUpIcon from '@gdsicon/vue/arrow-up'
import { onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { useMotionReduced } from '../../composables/use-motion-reduce.js'
import { useMutationObserver } from '../../composables/use-mutation-observer.js'
import { useResizeObserver } from '../../composables/use-resize-observer.js'
import {
  getScrollTarget,
  getScrollElement,
  isViewportScroll,
  resolveScrollBehavior,
} from '../../utils/dom.js'
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

let scrollHost: ReturnType<typeof getScrollTarget> | null

let scrollTop = 0
let maxScrollTop = 0
let measured = false
let offsetDirty = false
let rangeDirty = false

const scrollContainerEl = shallowRef<HTMLElement | null>(null)

const update = throttleByRaf(() => {
  const el = scrollContainerEl.value

  if (!el) {
    return
  }

  if (rangeDirty) {
    rangeDirty = false
    maxScrollTop = Math.max(0, el.scrollHeight - el.clientHeight)
    measured = true
  }

  if (offsetDirty) {
    offsetDirty = false
    scrollTop = el.scrollTop
  }

  refreshVisible()
})

const wrapperRef = shallowRef<HTMLElement>()
const isVisible = shallowRef(false)

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

useResizeObserver(() => scrollContainerEl.value, scheduleRange)

useMutationObserver(getRangeTargets, scheduleRange, {
  attributes: true,
  attributeFilter: ['style', 'class', 'hidden'],
})

useMutationObserver(
  () => {
    const el = scrollContainerEl.value

    return el && !isViewportScroll(el) ? el : null
  },
  scheduleRange,
  {
    childList: true,
    subtree: true,
  },
)

function refreshVisible() {
  const next =
    measured &&
    (props.scrollTarget === 'top'
      ? scrollTop >= props.visibleThreshold
      : maxScrollTop - scrollTop >= props.visibleThreshold)

  if (next !== isVisible.value) {
    isVisible.value = next
  }
}

function scheduleOffset() {
  offsetDirty = true
  update()
}

function scheduleRange() {
  rangeDirty = true
  offsetDirty = true
  update()
}

function resolveScrollHost(): ReturnType<typeof getScrollTarget> | null {
  if (props.scrollContainer) {
    return props.scrollContainer
  }

  const wrapper = wrapperRef.value

  return wrapper ? getScrollTarget(wrapper) : null
}

function bindScrollHost() {
  const host = resolveScrollHost()
  const el = host ? getScrollElement(host) : null

  if (host === scrollHost && el === scrollContainerEl.value) {
    return
  }

  update.cancel()

  if (scrollHost) {
    cachedOff(scrollHost, 'scroll', scheduleOffset, { passive: true })
  }

  scrollHost = host
  scrollContainerEl.value = el

  if (host) {
    cachedOn(host, 'scroll', scheduleOffset, { passive: true })
  } else {
    measured = false
    isVisible.value = false
  }

  scheduleRange()
}

function getRangeTargets(): HTMLElement[] {
  const el = scrollContainerEl.value

  if (!el || isViewportScroll(el)) {
    return []
  }

  return [el, ...Array.from(el.children)] as HTMLElement[]
}

function onActionClick(ev: PointerEvent) {
  emits('click', ev)

  if (!scrollHost || !scrollContainerEl.value) {
    return
  }

  const top =
    props.scrollTarget === 'bottom'
      ? Math.max(0, scrollContainerEl.value.scrollHeight - scrollContainerEl.value.clientHeight)
      : 0

  scrollHost.scrollTo({
    top,
    left: 0,
    behavior: resolveScrollBehavior(props.scrollBehavior, motionReduce),
  })
}

watch([() => props.scrollTarget, () => props.visibleThreshold], refreshVisible)

watch(() => props.scrollContainer, bindScrollHost, { flush: 'post' })

onMounted(bindScrollHost)

onBeforeUnmount(() => {
  update.cancel()

  if (scrollHost) {
    cachedOff(scrollHost, 'scroll', scheduleOffset, { passive: true })
  }

  scrollHost = null
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

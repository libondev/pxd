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

let maxScrollTop = 0
// Starts stale, so the first evaluation reads the range off the element
let rangeDirty = true

const scrollContainerEl = shallowRef<HTMLElement | null>(null)
const contentVersion = shallowRef(0)
const wrapperRef = shallowRef<HTMLElement>()
const isVisible = shallowRef(false)

const update = throttleByRaf(() => {
  const el = scrollContainerEl.value

  if (!el) {
    return
  }

  if (rangeDirty) {
    rangeDirty = false
    maxScrollTop = Math.max(0, el.scrollHeight - el.clientHeight)
  }

  const distance = props.scrollTarget === 'top' ? el.scrollTop : maxScrollTop - el.scrollTop

  isVisible.value = distance >= props.visibleThreshold
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

// An expanding panel moves a content root's box, while the container box and the node tree stay
// as they were
useResizeObserver(getContentTargets, invalidateRange)

useMutationObserver(
  () => {
    const el = scrollContainerEl.value

    return el && !isViewportScroll(el) ? el : null
  },
  () => {
    contentVersion.value++
    invalidateRange()
  },
  {
    childList: true,
    subtree: true,
  },
)

function invalidateRange() {
  rangeDirty = true
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
    cachedOff(scrollHost, 'scroll', update, { passive: true })
  }

  scrollHost = host
  scrollContainerEl.value = el

  if (host) {
    cachedOn(host, 'scroll', update, { passive: true })
  } else {
    isVisible.value = false
  }

  invalidateRange()
}

function getContentTargets(): HTMLElement[] {
  void contentVersion.value

  const el = scrollContainerEl.value

  return el ? ([el, ...Array.from(el.children)] as HTMLElement[]) : []
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

watch(() => [props.scrollTarget, props.visibleThreshold], update)

watch(() => props.scrollContainer, bindScrollHost, { flush: 'post' })

onMounted(bindScrollHost)

onBeforeUnmount(() => {
  update.cancel()

  if (scrollHost) {
    cachedOff(scrollHost, 'scroll', update, { passive: true })
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

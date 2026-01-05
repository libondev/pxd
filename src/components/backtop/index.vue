<script lang="ts" setup>
import ArrowIcon from '@gdsicon/vue/arrow-up'
import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { getScrollContainer, getScrollElByContainer } from '../../utils/dom'
import { cachedOff, cachedOn } from '../../utils/event'
import { getCssUnitValue } from '../../utils/format'
import PButton from '../button/index.vue'

interface Props {
  right?: string | number
  bottom?: string | number
  zIndex?: string | number
  visibleThreshold?: number
}

defineOptions({
  name: 'PBacktop',
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<Props>(),
  {
    visibleThreshold: 30,
  },
)

let scrollContainer: ReturnType<typeof getScrollContainer> | null
let scrollContainerEl: ReturnType<typeof getScrollElByContainer> | null

const scrollTop = shallowRef(0)
const wrapperRef = shallowRef<HTMLElement>()

const computedStyle = computed(() => {
  return {
    zIndex: props.zIndex,
    right: getCssUnitValue(props.right),
    bottom: getCssUnitValue(props.bottom),
  }
})

function updateScrollTop() {
  if (!scrollContainerEl) {
    return
  }

  scrollTop.value = scrollContainerEl.scrollTop
}

function onBacktopClick() {
  if (!scrollContainer) {
    return
  }

  scrollContainer.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  })
}

onMounted(() => {
  scrollContainer = getScrollContainer(wrapperRef.value!)
  scrollContainerEl = getScrollElByContainer(scrollContainer)

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
  <Transition name="pxd-transition--fade-scale" appear>
    <div
      v-show="scrollTop >= visibleThreshold"
      ref="wrapperRef"
      class="right-6 bottom-6 fixed z-10"
      :style="computedStyle"
      v-bind="$attrs"
      @click="onBacktopClick"
    >
      <slot>
        <PButton class="shadow-sm" shape="rounded" icon>
          <ArrowIcon />
        </PButton>
      </slot>
    </div>
  </Transition>
</template>

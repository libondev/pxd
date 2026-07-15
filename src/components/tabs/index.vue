<script lang="ts" setup>
import type { TabsItemState } from '../../contexts/tabs'
import type { TabsProps, TabsEmits } from './types'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import { nextTick, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
import { provideTabsContext } from '../../contexts/tabs'

defineOptions({
  name: 'PTabs',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<TabsProps>(), {
  variant: 'default',
})
const emits = defineEmits<TabsEmits>()

const BORDER_WIDTH = 2

const modelValue = useModelValue(props, emits)
const items = shallowRef<TabsItemState[]>([])

const scrollRef = shallowRef<HTMLElement>()
const innerNavRef = shallowRef<HTMLElement>()
const overflowing = shallowRef(false)
const canScrollLeft = shallowRef(false)
const canScrollRight = shallowRef(false)

let resizeObserver: ResizeObserver | null = null

function registerItem(item: TabsItemState) {
  items.value = [...items.value, item]
}

function unregisterItem(id: string) {
  items.value = items.value.filter((item) => item.id !== id)
}

function updateItem(item: TabsItemState) {
  items.value = items.value.map((current) => (current.id === item.id ? item : current))
}

provideTabsContext({
  props,
  emits,
  registerItem,
  unregisterItem,
  updateItem,
})

function isActiveTab(item: TabsItemState) {
  return modelValue.value === item.value
}

function updateScrollState() {
  const el = scrollRef.value

  if (!el) {
    overflowing.value = false
    canScrollLeft.value = false
    canScrollRight.value = false

    return
  }

  const { scrollLeft, scrollWidth, clientWidth } = el

  overflowing.value = scrollWidth > clientWidth + BORDER_WIDTH
  canScrollLeft.value = scrollLeft > BORDER_WIDTH
  canScrollRight.value = scrollLeft + clientWidth < scrollWidth - BORDER_WIDTH
}

function scrollTabs(direction: 'prev' | 'next') {
  const el = scrollRef.value

  if (!el) {
    return
  }

  const delta = Math.max(Math.floor(el.clientWidth * 0.65), 96)

  el.scrollBy({
    left: direction === 'next' ? delta : -delta,
    behavior: 'smooth',
  })
}

function scrollActiveTabIntoView() {
  const wrap = scrollRef.value
  const nav = innerNavRef.value

  if (!wrap || !nav || !overflowing.value) {
    return
  }

  const active = nav.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')

  if (!active) {
    return
  }

  const tabLeft = active.offsetLeft
  const tabRight = tabLeft + active.offsetWidth
  const viewLeft = wrap.scrollLeft
  const viewRight = viewLeft + wrap.clientWidth

  if (tabLeft < viewLeft) {
    wrap.scrollTo({ left: tabLeft, behavior: 'smooth' })
  } else if (tabRight > viewRight) {
    wrap.scrollTo({ left: tabRight - wrap.clientWidth, behavior: 'smooth' })
  }
}

function teardownScrollObservers() {
  resizeObserver?.disconnect()
  resizeObserver = null
}

function setupScrollObservers() {
  teardownScrollObservers()

  const scrollEl = scrollRef.value
  const navEl = innerNavRef.value

  if (typeof ResizeObserver === 'undefined' || !scrollEl) {
    updateScrollState()

    return
  }

  resizeObserver = new ResizeObserver(() => {
    updateScrollState()
  })
  resizeObserver.observe(scrollEl)

  if (navEl) {
    resizeObserver.observe(navEl)
  }

  updateScrollState()
}

function onTabClick(item: TabsItemState) {
  if (item.disabled) {
    return
  }

  modelValue.value = item.value
  emits('change', item.value)
}

watch(
  items,
  () => {
    nextTick(() => {
      setupScrollObservers()
    })
  },
  { flush: 'post' },
)

watch(
  modelValue,
  async () => {
    await nextTick()

    updateScrollState()
    scrollActiveTabIntoView()
  },
  { flush: 'post' },
)

onMounted(() => {
  nextTick(setupScrollObservers)
})

onBeforeUnmount(() => {
  teardownScrollObservers()
})
</script>

<template>
  <div class="pxd-tabs" v-bind="$attrs">
    <slot />

    <div
      class="pxd-tabs--header min-w-0 text-sm relative flex items-stretch"
      :data-variant="variant"
    >
      <button
        v-if="overflowing"
        type="button"
        class="pxd-tabs--arrow px-1.5 inline-flex shrink-0 items-center justify-center self-stretch border-r border-border text-foreground-secondary self-focus-ring outline-none hover:text-foreground enabled:cursor-pointer disabled:pointer-events-none disabled:border-transparent disabled:opacity-35 motion-safe:transition-colors"
        :disabled="!canScrollLeft"
        aria-label="Scroll tabs left"
        @click="scrollTabs('prev')"
      >
        <ChevronRightIcon class="size-4 rotate-180" aria-hidden="true" />
      </button>

      <div
        ref="scrollRef"
        class="pxd-tabs--scroll min-h-0 min-w-0 scrollbar-none flex-1 overflow-x-auto overscroll-x-contain has-focus-visible:overflow-x-visible"
        @scroll.passive="updateScrollState"
      >
        <div ref="innerNavRef" role="tablist" class="pxd-tabs--nav inline-flex flex-nowrap">
          <template v-for="item in items" :key="item.id">
            <button
              role="tab"
              :id="`tab-${item.value}`"
              :value="item.value"
              :disabled="item.disabled"
              :tabindex="isActiveTab(item) ? 0 : -1"
              :aria-controls="`tab-panel-${item.value}`"
              :aria-selected="isActiveTab(item)"
              class="pxd-tabs--nav-item flex cursor-pointer items-center justify-center self-focus-ring outline-none enabled:hover:text-foreground disabled:cursor-not-allowed disabled:text-foreground-secondary motion-safe:transition-colors"
              @click="onTabClick(item)"
            >
              <template v-if="item.slots.label">
                <Component :is="item.slots.label" />
              </template>
              <template v-else>
                {{ item.label }}
              </template>
            </button>
          </template>
        </div>
      </div>

      <button
        v-if="overflowing"
        type="button"
        class="pxd-tabs--arrow px-1.5 inline-flex shrink-0 items-center justify-center self-stretch border-l border-border text-foreground-secondary self-focus-ring outline-none hover:text-foreground enabled:cursor-pointer disabled:pointer-events-none disabled:border-transparent disabled:opacity-35 motion-safe:transition-colors"
        :disabled="!canScrollRight"
        aria-label="Scroll tabs right"
        @click="scrollTabs('next')"
      >
        <ChevronRightIcon class="size-4" aria-hidden="true" />
      </button>
    </div>

    <div role="tabpanel" class="pxd-tabs--content">
      <template v-for="item in items" :key="item.id">
        <div
          class="pxd-tabs--panel"
          :id="`tab-panel-${item.value}`"
          :aria-labelledby="`tab-${item.value}`"
        >
          <KeepAlive v-if="keepAlive">
            <Component v-if="isActiveTab(item)" :is="item.slots.default" />
          </KeepAlive>
          <Component :is="item.slots.default" v-else-if="isActiveTab(item)" />
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="postcss">
.pxd-tabs--header {
  &[data-variant='default'] {
    padding-bottom: 1px;
    box-shadow: 0 -1px 0 0 var(--color-border) inset;

    & + .pxd-tabs--content {
      padding-top: 0.75rem;
    }

    .pxd-tabs--scroll {
      margin-bottom: -1px;
    }

    .pxd-tabs--nav {
      gap: 1.5rem;
    }

    .pxd-tabs--nav-item {
      border-bottom: 2px solid transparent;
      padding: 0.875rem 0.375rem;

      &:not(:disabled) {
        color: var(--color-gray-900);
      }

      &[aria-selected='true'] {
        border-color: currentColor;
        color: var(--color-primary);
      }
    }
  }

  &[data-variant='secondary'] {
    & + .pxd-tabs--content {
      padding-top: 0.5rem;
    }

    .pxd-tabs--nav {
      gap: 0.5rem;
    }

    .pxd-tabs--nav-item {
      height: 1.5rem;
      padding: 0 0.375rem;
      border-radius: var(--radius-md);
      font-size: var(--text-13);
      background-color: var(--color-gray-alpha-200);

      &:disabled {
        background-color: var(--color-gray-100);
      }

      &[aria-selected='true'] {
        background-color: var(--color-primary);
        color: var(--color-gray-100);
      }
    }
  }
}
</style>

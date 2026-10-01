<script lang="ts" setup>
import type { ComponentOption, ComponentValue } from '../../types/shared'
import type { TabsEmits, TabsProps } from './types'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, useSlots, watch } from 'vue'
import { useListKeyboardController } from '../../composables/_internal/use-list-keyboard-controller.js'
import { useListNavigation } from '../../composables/_internal/use-list-navigation.js'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { getUniqueId } from '../../utils/helper.js'
import { PTabSlot } from './tab-slot.js'

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
  options: () => [],
})
const emits = defineEmits<TabsEmits>()

const BORDER_WIDTH = 2
const SCROLL_EPSILON = 2

const modelValue = useModelValue(props, emits, { withChange: false })
/** Uncontrolled fallback: a bound `modelValue` always wins. */
const innerValue = shallowRef<ComponentValue | undefined>(props.defaultValue)
const activeValue = computed(() =>
  props.modelValue === undefined ? innerValue.value : props.modelValue,
)

const slots = useSlots()
const uid = getUniqueId('pxd-tabs')

const scrollRef = shallowRef<HTMLElement>()
const innerNavRef = shallowRef<HTMLElement>()
const overflowing = shallowRef(false)
const canScrollLeft = shallowRef(false)
const canScrollRight = shallowRef(false)

let resizeObserver: ResizeObserver | null = null

function tabId(index: number) {
  return `${uid}-tab-${index}`
}

function panelId(index: number) {
  return `${uid}-panel-${index}`
}

function isActiveOption(option: ComponentOption) {
  return activeValue.value === option.value
}

function select(value: ComponentValue) {
  const option = props.options.find((entry) => entry.value === value)

  if (!option || option.disabled || isActiveOption(option)) {
    return
  }

  innerValue.value = value
  modelValue.value = value
  emits('change', value)
}

/**
 * Values whose panel was already activated. Kept as a plain array because
 * reactive collections are banned here, and pruned so dynamic option lists
 * cannot grow it without bound.
 */
const activatedValues = shallowRef<ComponentValue[]>([])

watch(
  activeValue,
  (value) => {
    if (value !== undefined && !activatedValues.value.includes(value)) {
      activatedValues.value = [...activatedValues.value, value]
    }
  },
  { immediate: true, flush: 'sync' },
)

watch(
  () => props.options.map((option) => option.value),
  (values) => {
    const kept = activatedValues.value.filter((value) => values.includes(value))

    if (kept.length !== activatedValues.value.length) {
      activatedValues.value = kept
    }
  },
)

function isActivated(option: ComponentOption) {
  return isActiveOption(option) || activatedValues.value.includes(option.value)
}

function renderLabel(option: ComponentOption) {
  return slots.label?.({ active: isActiveOption(option), option })
}

function renderItem(option: ComponentOption) {
  return slots.item?.({ active: isActiveOption(option), option })
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
  canScrollLeft.value = scrollLeft > SCROLL_EPSILON
  canScrollRight.value = scrollLeft + clientWidth < scrollWidth - SCROLL_EPSILON
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

  const wrapRect = wrap.getBoundingClientRect()
  const tabRect = active.getBoundingClientRect()

  if (tabRect.left < wrapRect.left) {
    wrap.scrollBy({
      left: tabRect.left - wrapRect.left - SCROLL_EPSILON,
      behavior: 'smooth',
    })
  } else if (tabRect.right > wrapRect.right) {
    wrap.scrollBy({
      left: tabRect.right - wrapRect.right + SCROLL_EPSILON,
      behavior: 'smooth',
    })
  }
}

function focusTab(index: number) {
  const tab = innerNavRef.value?.querySelectorAll<HTMLElement>('[role="tab"]')[index]

  tab?.focus()
  scrollActiveTabIntoView()
}

/** Roving tabindex: arrow keys move focus and activate, matching the APG tabs pattern. */
const navigation = useListNavigation({
  count: () => props.options.length,
  isDisabled: (index) => !!props.options[index]?.disabled,
  scrollToIndex: (index) => focusTab(index),
})

const { onKeydown: onNavKeydown } = useListKeyboardController({
  keymap: {
    ArrowRight: 'next',
    ArrowLeft: 'previous',
    Home: 'first',
    End: 'last',
  },
  onCommand: (command) => {
    if (!navigation.dispatch(command)) {
      return false
    }

    const option = props.options[navigation.activeIndex.value]

    if (option) {
      select(option.value)
    }

    return true
  },
})

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

watch(
  () => props.options.length,
  () => {
    nextTick(setupScrollObservers)
  },
  { flush: 'post' },
)

watch(
  activeValue,
  async () => {
    await nextTick()

    updateScrollState()
    scrollActiveTabIntoView()
  },
  { flush: 'post' },
)

watch(
  () => [activeValue.value, props.options.length],
  () => {
    const index = props.options.findIndex((option) => isActiveOption(option))

    if (index >= 0) {
      navigation.setActiveIndex(index)
    }

    if (import.meta.env?.DEV && activeValue.value !== undefined && index < 0) {
      console.warn(`[pxd] PTabs: active value "${String(activeValue.value)}" matches no option.`)
    }
  },
  { immediate: true, flush: 'post' },
)

onMounted(() => {
  nextTick(setupScrollObservers)
})

onBeforeUnmount(() => {
  teardownScrollObservers()
})
</script>

<template>
  <div class="pxd-tabs" :data-variant="variant" v-bind="$attrs">
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
        <div
          ref="innerNavRef"
          role="tablist"
          class="pxd-tabs--nav inline-flex flex-nowrap"
          @keydown="onNavKeydown"
        >
          <button
            v-for="(option, index) in options"
            :key="option.value"
            role="tab"
            :id="tabId(index)"
            :disabled="option.disabled"
            :tabindex="isActiveOption(option) ? 0 : -1"
            :aria-controls="panelId(index)"
            :aria-selected="isActiveOption(option)"
            class="pxd-tabs--nav-item flex cursor-pointer items-center justify-center self-focus-ring outline-none enabled:hover:text-foreground disabled:cursor-not-allowed disabled:text-foreground-secondary motion-safe:transition-colors"
            @click="select(option.value)"
          >
            <PTabSlot v-if="slots.label" :render="() => renderLabel(option)" />
            <template v-else>
              {{ option.label }}
            </template>
          </button>
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

    <div class="pxd-tabs--content">
      <div
        v-for="(option, index) in options"
        :key="option.value"
        :id="panelId(index)"
        role="tabpanel"
        :aria-labelledby="tabId(index)"
        :hidden="!isActiveOption(option)"
        class="pxd-tabs--panel"
      >
        <KeepAlive v-if="keepAlive">
          <PTabSlot v-if="isActivated(option)" :render="() => renderItem(option)" />
        </KeepAlive>
        <PTabSlot v-else-if="isActiveOption(option)" :render="() => renderItem(option)" />
      </div>
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

  &[data-variant='segmented'] {
    padding: 0.25rem;
    width: max-content;
    border-radius: var(--radius-md);
    background-color: var(--color-gray-alpha-200);
    color: var(--color-gray-800);

    & + .pxd-tabs--content {
      padding-top: 0.75rem;
    }

    .pxd-tabs--arrow {
      border-width: 0;
    }

    .pxd-tabs--nav {
      gap: 0.25rem;
    }

    .pxd-tabs--nav-item {
      height: 1.5rem;
      padding: 0 0.5rem;
      border-radius: var(--radius-sm);

      &:hover {
        color: var(--color-foreground);
      }

      &:disabled {
        color: var(--color-gray-500);
      }

      &[aria-selected='true'] {
        background-color: var(--color-background-100);
        color: var(--color-foreground);
        box-shadow: var(--shadow-small);
      }
    }
  }
}
</style>

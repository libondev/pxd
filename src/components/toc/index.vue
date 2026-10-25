<script lang="ts" setup>
import type { TocEmits, TocItem, TocProps } from './types'
import { computed, ref, shallowRef, watch } from 'vue'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { useMotionReduced } from '../../composables/use-motion-reduce.js'
import { useMutationObserver } from '../../composables/use-mutation-observer.js'
import { useScrollspy } from '../../composables/use-scrollspy.js'
import { getScrollElement, isViewportScroll, resolveScrollBehavior } from '../../utils/dom.js'
import { scheduleByRaf } from '../../utils/event.js'
import { isServer } from '../../utils/is.js'

defineOptions({
  name: 'PToc',
  inheritAttrs: false,
})

const INDENT_BASE = 8
const INDENT_STEP = 14
const BOTTOM_TOLERANCE = 2

const ITEM_ACTIVE_CLASS = 'pxd-toc--item_active bg-gray-200 text-primary'
const ITEM_IDLE_CLASS = 'text-foreground-secondary hover:bg-gray-100 hover:text-gray-900'

interface TocEntry {
  el: HTMLElement
  item: TocItem
}

const props = withDefaults(defineProps<TocProps>(), {
  data: null,
  selector: '',
  source: null,
  offset: 0,
  scrollBehavior: 'auto',
  scrollTarget: null,
  scrollActiveIntoView: true,
})

const emit = defineEmits<TocEmits>()

const motionReduce = useMotionReduced()

const { attrs, classes } = useTailwindVariant({
  base: 'pxd-toc text-sm w-full max-w-full',
})

const listEl = ref<HTMLElement | null>(null)

const entries = shallowRef<TocEntry[]>([])

const isDataMode = computed(() => props.data != null)

function outlineRoot(): HTMLElement {
  return props.scrollTarget ?? document.body
}

function isSameOutline(next: TocEntry[], current: TocEntry[]): boolean {
  return (
    next.length === current.length &&
    next.every((entry, index) => {
      const previous = current[index]!

      return (
        entry.el === previous.el &&
        entry.item.label === previous.item.label &&
        entry.item.level === previous.item.level
      )
    })
  )
}

function readOutline(): void {
  if (isDataMode.value || !props.selector) {
    if (entries.value.length) {
      entries.value = []
    }

    return
  }

  const next = Array.from(outlineRoot().querySelectorAll<HTMLElement>(props.selector))
    .filter((el) => el.id)
    .map<TocEntry>((el) => ({
      el,
      item: {
        id: el.id,
        // Heading plugins append a `#` permalink.
        label: el.textContent?.trim().replace(/^#\s*/, '') || '',
        // A non-heading match would make the indent `NaNpx`; level 1 keeps it finite.
        level: Number.parseInt(el.tagName.slice(1), 10) || 1,
      },
    }))

  if (isSameOutline(next, entries.value)) {
    return
  }

  entries.value = next
}

const scheduleRead = scheduleByRaf(readOutline)

const { activeIndex: spyActiveIndex, update } = useScrollspy(
  computed(() => (isDataMode.value ? [] : entries.value.map((entry) => entry.el))),
  {
    scrollTarget: () => props.scrollTarget,
    topOffset: () => props.offset,
  },
)

const items = computed<TocItem[]>(() =>
  isDataMode.value ? props.data! : entries.value.map((entry) => entry.item),
)

// Data mode bisects the source's cached offsets instead of DOM rects: the active entry sits at
// the probe line, where the owning list has it rendered and measured; distant entries may be
// estimates, which only ever shifts the jump target, never the highlight.
const activeIndex = computed(() => {
  const source = props.source
  const count = items.value.length

  if (!isDataMode.value || !source || !count) {
    return spyActiveIndex.value
  }

  const scrollOffset = source.getScrollOffset()

  if (scrollOffset == null) {
    return -1
  }

  const maxScroll = source.getMaxScrollOffset()

  // A short trailing entry can never be scrolled up to the probe line.
  if (maxScroll > 1 && scrollOffset >= maxScroll - BOTTOM_TOLERANCE) {
    return count - 1
  }

  let low = 0
  let high = count

  while (low < high) {
    const mid = (low + high) >> 1
    const start = source.getOffsetForIndex(mid)

    if (start == null || start - props.offset > scrollOffset) {
      high = mid
    } else {
      low = mid + 1
    }
  }

  return Math.max(low - 1, 0)
})

const activeId = computed(() => items.value[activeIndex.value]?.id ?? null)

const tocItems = computed(() => {
  if (!items.value.length) {
    return []
  }

  // Depth is measured against the shallowest heading present, not `h1`.
  const minLevel = items.value.reduce((min, item) => Math.min(min, item.level), Infinity)

  return items.value.map((item, index) => ({
    item,
    index,
    depth: item.level - minLevel,
  }))
})

function getScrollTop(target: HTMLElement, container: HTMLElement): number {
  const top = target.getBoundingClientRect().top

  if (isViewportScroll(container)) {
    return top + window.scrollY - props.offset
  }

  return top - container.getBoundingClientRect().top + container.scrollTop - props.offset
}

function scrollTo(id: string): boolean {
  const index = items.value.findIndex((item) => item.id === id)

  if (index >= 0 && isDataMode.value && props.source) {
    props.source.scrollToIndex(index, {
      behavior: resolveScrollBehavior(props.scrollBehavior, motionReduce),
    })

    return true
  }

  const target = document.getElementById(id)

  if (!target) {
    return false
  }

  const container = getScrollElement(props.scrollTarget)
  const scroller = isViewportScroll(container) ? window : container

  scroller.scrollTo({
    top: Math.max(getScrollTop(target, container), 0),
    behavior: resolveScrollBehavior(props.scrollBehavior, motionReduce),
  })

  return true
}

function onItemClick(item: TocItem, event: MouseEvent): void {
  emit('item-click', item, event)

  // Modified and non-primary clicks keep the browser's native jump (scroll-margin-top).
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return
  }

  event.preventDefault()

  scrollTo(item.id)
}

function keepActiveVisible(): void {
  const list = listEl.value
  const index = activeIndex.value

  if (!props.scrollActiveIntoView || !list || index < 0) {
    return
  }

  const row = list.children[index] as HTMLElement | undefined

  if (!row) {
    return
  }

  const listRect = list.getBoundingClientRect()
  const rowRect = row.getBoundingClientRect()

  if (rowRect.top < listRect.top) {
    list.scrollTop -= listRect.top - rowRect.top
  } else if (rowRect.bottom > listRect.bottom) {
    list.scrollTop += rowRect.bottom - listRect.bottom
  }
}

if (!isServer()) {
  useMutationObserver(outlineRoot, scheduleRead, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['id'],
  })

  watch(() => [props.selector, props.scrollTarget, props.data], scheduleRead, {
    immediate: true,
    flush: 'post',
  })

  watch(
    () => activeId.value,
    (id) => {
      emit('active-change', items.value.find((item) => item.id === id) ?? null)

      keepActiveVisible()
    },
    { flush: 'post' },
  )
}

defineExpose({
  activeId,
  items,
  scrollTo,
  update,
})
</script>

<template>
  <nav data-toc v-if="tocItems.length" :class="classes" v-bind="attrs">
    <ol ref="listEl" class="m-0 p-0 list-none">
      <li
        v-for="row in tocItems"
        :key="row.item.id"
        data-toc-item
        class="pxd-toc--item m-0 flex list-none"
      >
        <slot
          v-if="$slots.item"
          name="item"
          v-bind="row"
          :active="row.item.id === activeId"
          :select="(event: PointerEvent) => onItemClick(row.item, event)"
        />
        <a
          v-else
          :href="`#${row.item.id}`"
          class="pxd-toc--item-label py-1.5 pe-2 block w-full max-w-full cursor-pointer truncate rounded-md text-start no-underline self-focus-ring outline-none motion-safe:transition-[color,background,border-radius]"
          :class="row.item.id === activeId ? ITEM_ACTIVE_CLASS : ITEM_IDLE_CLASS"
          :style="{ paddingInlineStart: `${row.depth * INDENT_STEP + INDENT_BASE}px` }"
          :aria-current="row.item.id === activeId ? 'location' : undefined"
          @click="onItemClick(row.item, $event)"
        >
          {{ row.item.label }}
        </a>
      </li>
    </ol>
  </nav>
</template>

<style>
@media (hover: hover) {
  [data-toc-item]:has(> .pxd-toc--item_active):has(+ [data-toc-item] > .pxd-toc--item-label:hover)
    > .pxd-toc--item_active,
  [data-toc-item]:has(> .pxd-toc--item-label:hover):has(+ [data-toc-item] > .pxd-toc--item_active)
    > .pxd-toc--item-label:hover {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  [data-toc-item]:has(> .pxd-toc--item_active) + [data-toc-item] > .pxd-toc--item-label:hover,
  [data-toc-item]:has(> .pxd-toc--item-label:hover) + [data-toc-item] > .pxd-toc--item_active {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
}
</style>

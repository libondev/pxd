<script lang="ts" setup>
import type { TocEmits, TocItem, TocProps, TocScrollBehavior } from './types'
import { computed, ref, shallowRef, watch } from 'vue'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { useResizeObserver } from '../../composables/use-resize-observer.js'
import { useScrollspy } from '../../composables/use-scrollspy.js'
import { getScrollElement } from '../../utils/dom.js'
import { scheduleByRaf } from '../../utils/event.js'
import { isServer } from '../../utils/is.js'

defineOptions({
  name: 'PToc',
  inheritAttrs: false,
})

const INDENT_BASE = 8
const INDENT_STEP = 14

const ITEM_ACTIVE_CLASS = 'bg-gray-alpha-100 font-medium text-primary'
const ITEM_IDLE_CLASS = 'text-foreground-secondary hover:bg-gray-alpha-100 hover:text-gray-900'

/** A heading that is resolved once, so tracking it never re-queries the DOM. */
interface TocEntry {
  el: HTMLElement
  item: TocItem
}

const props = withDefaults(defineProps<TocProps>(), {
  scrollTarget: null,
  offset: 0,
  scrollBehavior: 'smooth',
  scrollActiveIntoView: true,
})

const emit = defineEmits<TocEmits>()

const { attrs, classes } = useTailwindVariant({
  base: 'pxd-toc text-sm w-full max-w-full',
})

const listEl = ref<HTMLElement | null>(null)

const entries = shallowRef<TocEntry[]>([])

function readOutline(selector: string): void {
  const next = Array.from(document.querySelectorAll<HTMLElement>(selector))
    // Without an id there is nothing to link to or to scroll to.
    .filter((el) => el.id)
    .map<TocEntry>((el) => ({
      el,
      item: {
        id: el.id,
        // Heading plugins append a `#` permalink to the text content.
        label: el.textContent?.trim().replace(/^#\s*/, '') || '',
        // A selector may match something that is not a heading; `h1` keeps the
        // indent arithmetic finite instead of writing `NaNpx`.
        level: Number.parseInt(el.tagName.slice(1), 10) || 1,
      },
    }))

  // Content settles constantly — images, fonts, async blocks — and a fresh
  // array would hand the spy a new target list every time for nothing.
  if (
    next.length === entries.value.length &&
    next.every((entry, index) => {
      const previous = entries.value[index]!
      return (
        entry.el === previous.el &&
        entry.item.label === previous.item.label &&
        entry.item.level === previous.item.level
      )
    })
  ) {
    return
  }

  entries.value = next
}

const scheduleRead = scheduleByRaf(() => readOutline(props.selector))

if (!isServer()) {
  // Content can change without any reactive input changing. Growth of the
  // document is the one cheap signal that covers images settling, async blocks
  // arriving and fonts swapping, which is what a stale outline actually is.
  useResizeObserver(() => document.body, scheduleRead)

  // `post` so the first pass runs against a rendered document.
  watch(() => props.selector, scheduleRead, { immediate: true, flush: 'post' })
}

// --- Track the reader -----------------------------------------------------

const { activeEl, update } = useScrollspy(
  computed(() => entries.value.map((entry) => entry.el)),
  {
    scrollTarget: () => props.scrollTarget,
    topOffset: () => props.offset,
  },
)

const items = computed(() => entries.value.map((entry) => entry.item))
const activeId = computed(() => activeEl.value?.id ?? null)

// Deliberately free of `activeId`: a row's identity is its heading, and folding
// the highlight in would hand the whole list new objects on every scroll step.
const rows = computed(() => {
  if (!items.value.length) {
    return []
  }

  // A toc that only collects `h3`+ has no top level entry to sit under, so the
  // depth is measured against the shallowest heading that is actually present.
  const minLevel = items.value.reduce((min, item) => Math.min(min, item.level), Infinity)

  return items.value.map((item, index) => ({
    item,
    index,
    depth: item.level - minLevel,
  }))
})

// Indexed by the outline, not by the spy's target list: an entry can lose its
// element between passes, which would shift every later row.
const activeRowIndex = computed(() => items.value.findIndex((item) => item.id === activeId.value))

// --- Behaviours -----------------------------------------------------------

function scrollTo(id: string, behavior: TocScrollBehavior = props.scrollBehavior): boolean {
  const target = document.getElementById(id)

  if (!target) {
    return false
  }

  // `scrollIntoView` has no offset argument, so a sticky header would swallow
  // the heading. The offset is computed here instead, and the same number is
  // what the spy uses as its probe line.
  const metricsEl = getScrollElement(props.scrollTarget)
  const isWindowScroll = metricsEl === document.documentElement
  const scroller = isWindowScroll ? window : metricsEl

  const top = isWindowScroll
    ? target.getBoundingClientRect().top + window.scrollY - props.offset
    : target.getBoundingClientRect().top -
      metricsEl.getBoundingClientRect().top +
      metricsEl.scrollTop -
      props.offset

  scroller.scrollTo({ top: Math.max(top, 0), behavior })

  return true
}

function onItemClick(item: TocItem, event: MouseEvent) {
  emit('item-click', item, event)

  // Modified and non-primary clicks belong to the browser — new tab, download,
  // copy link — and the native fragment jump already honours the page's own
  // `scroll-margin-top` rules.
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return
  }

  event.preventDefault()

  scrollTo(item.id)
}

function keepActiveVisible() {
  if (!props.scrollActiveIntoView) {
    return
  }

  const list = listEl.value

  if (!list || activeRowIndex.value < 0) {
    return
  }

  const row = list.children[activeRowIndex.value] as HTMLElement | undefined

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

// Watching the id rather than the item keeps a re-read outline from
// re-announcing an active heading the reader did not move away from. `post` runs
// once the list is patched, so the row is already measurable here.
watch(
  activeId,
  (id) => {
    emit('active-change', items.value.find((item) => item.id === id) ?? null)

    keepActiveVisible()
  },
  { flush: 'post' },
)

defineExpose({
  activeId,
  items,
  scrollTo,
  update,
})
</script>

<template>
  <nav v-if="rows.length" :class="classes" v-bind="attrs">
    <ol ref="listEl" class="m-0 p-0 list-none">
      <li v-for="row in rows" :key="row.item.id" class="m-0 list-none">
        <slot
          name="item"
          v-bind="row"
          :active="row.item.id === activeId"
          :select="(event: MouseEvent) => onItemClick(row.item, event)"
        >
          <a
            :href="`#${row.item.id}`"
            class="pxd-toc-item py-1.5 pe-2 block w-full max-w-full cursor-pointer truncate rounded-md text-start no-underline self-focus-ring outline-none motion-safe:transition-colors"
            :class="row.item.id === activeId ? ITEM_ACTIVE_CLASS : ITEM_IDLE_CLASS"
            :style="{ paddingInlineStart: `${row.depth * INDENT_STEP + INDENT_BASE}px` }"
            :aria-current="row.item.id === activeId ? 'location' : undefined"
            @click="onItemClick(row.item, $event)"
          >
            {{ row.item.label }}
          </a>
        </slot>
      </li>
    </ol>
  </nav>
</template>

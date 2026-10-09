<script lang="ts" setup>
import type { TocEmits, TocItem, TocProps } from './types'
import { computed, ref, shallowRef, watch } from 'vue'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { PRESET_MEDIA_QUERIES, useMediaQuery } from '../../composables/use-media-query.js'
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

const ITEM_ACTIVE_CLASS = 'pxd-toc--item_active bg-gray-200 text-primary'
const ITEM_IDLE_CLASS = 'text-foreground-secondary hover:bg-gray-100 hover:text-gray-900'

interface TocEntry {
  el: HTMLElement
  item: TocItem
}

const props = withDefaults(defineProps<TocProps>(), {
  offset: 0,
  scrollBehavior: 'auto',
  scrollTarget: null,
  scrollActiveIntoView: true,
})

const emit = defineEmits<TocEmits>()

const prefersReducedMotion = useMediaQuery(PRESET_MEDIA_QUERIES.MOTION_REDUCE)

const { attrs, classes } = useTailwindVariant({
  base: 'pxd-toc text-sm w-full max-w-full',
})

const listEl = ref<HTMLElement | null>(null)

const entries = shallowRef<TocEntry[]>([])

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

  // An identical outline would hand the spy a new target list for nothing.
  if (isSameOutline(next, entries.value)) {
    return
  }

  entries.value = next
}

const scheduleRead = scheduleByRaf(readOutline)

if (!isServer()) {
  // Watch structure, text and ids — what the outline reads — not reflow geometry.
  useMutationObserver(outlineRoot, scheduleRead, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['id'],
  })

  watch([() => props.selector, () => props.scrollTarget], scheduleRead, {
    immediate: true,
    flush: 'post',
  })
}

const { activeEl, update } = useScrollspy(
  computed(() => entries.value.map((entry) => entry.el)),
  {
    scrollTarget: () => props.scrollTarget,
    topOffset: () => props.offset,
  },
)

const items = computed(() => entries.value.map((entry) => entry.item))
const activeId = computed(() => activeEl.value?.id ?? null)

// Kept free of `activeId`, so the list keeps stable identities across scroll steps.
const rows = computed(() => {
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

// Indexed by the outline, not the spy's targets, so a dropped element can't shift later rows.
const activeRowIndex = computed(() => items.value.findIndex((item) => item.id === activeId.value))

function getScrollTop(target: HTMLElement, container: HTMLElement): number {
  const top = target.getBoundingClientRect().top

  if (isViewportScroll(container)) {
    return top + window.scrollY - props.offset
  }

  return top - container.getBoundingClientRect().top + container.scrollTop - props.offset
}

function scrollTo(id: string): boolean {
  const target = document.getElementById(id)

  if (!target) {
    return false
  }

  const container = getScrollElement(props.scrollTarget)
  const scroller = isViewportScroll(container) ? window : container

  scroller.scrollTo({
    top: Math.max(getScrollTop(target, container), 0),
    behavior: resolveScrollBehavior(props.scrollBehavior, prefersReducedMotion),
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
  const index = activeRowIndex.value

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

watch(
  () => activeId.value,
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
      <li v-for="row in rows" :key="row.item.id" data-toc-item class="pxd-toc--item m-0 list-none">
        <slot
          v-if="$slots.item"
          name="item"
          :item="row"
          :active="row.item.id === activeId"
          :select="(event: PointerEvent) => onItemClick(row.item, event)"
        >
        </slot>
        <a
          v-else
          :href="`#${row.item.id}`"
          class="pxd-toc--item-label py-1.5 pe-2 block w-full max-w-full cursor-pointer truncate rounded-md text-start no-underline self-focus-ring outline-none motion-safe:transition-colors"
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

<style lang="postcss">
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

<script lang="ts" setup>
import { on, off } from 'pxd/utils/event'
import { isServer } from 'pxd/utils/is'
import { shallowRef, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

interface TocItem {
  id: string
  text: string
  level: number
}

interface Props {
  containerSelector?: string
  levels?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  containerSelector: '.prose',
  levels: () => [2, 3],
})

const route = useRoute()
const activeId = shallowRef<string>('')
const tocItems = shallowRef<TocItem[]>([])

async function extractHeadings() {
  await nextTick()
  const container = document.querySelector(props.containerSelector)

  if (!container) {
    tocItems.value = []
    return
  }

  const selector = props.levels.map((l) => `h${l}[id]`).join(', ')
  const headings = container.querySelectorAll<HTMLElement>(selector)

  tocItems.value = Array.from(headings).map((heading) => ({
    id: heading.id,
    text: heading.textContent?.replace(/^#\s*/, '') || '',
    level: Number.parseInt(heading.tagName.substring(1), 10),
  }))

  if (tocItems.value.length > 0 && !activeId.value) {
    activeId.value = tocItems.value[0]?.id || ''
  }
}

function scrollToHeading(id: string) {
  if (activeId.value === id) {
    return
  }

  const element = document.getElementById(id)

  if (!element) {
    return
  }

  activeId.value = id
  element.scrollIntoView()
  window.history.replaceState(history.state, route.path, `#${id}`)
}

const TOP_OFFSET = 80

function updateActiveHeading() {
  const scrollTop = window.scrollY

  // at the very top: user is in the h1 area, no heading should be highlighted
  if (scrollTop <= 0) {
    activeId.value = ''
    return
  }

  const items = tocItems.value
  if (items.length === 0) {
    return
  }

  // at the very bottom: always highlight the last heading
  if (window.innerHeight + scrollTop >= document.documentElement.scrollHeight - 1) {
    activeId.value = items[items.length - 1]!.id
    return
  }

  // find the last heading that has scrolled past the top offset
  let current = ''
  for (const item of items) {
    const el = document.getElementById(item.id)
    if (el && el.getBoundingClientRect().top <= TOP_OFFSET) {
      current = item.id
    }
  }

  activeId.value = current
}

if (!isServer()) {
  watch(
    () => route.path,
    () => {
      activeId.value = ''
      extractHeadings()
    },
    { immediate: true },
  )

  on(window, 'scroll', updateActiveHeading, { passive: true })
  onBeforeUnmount(() => {
    off(window, 'scroll', updateActiveHeading)
  })
}
</script>

<template>
  <nav v-if="tocItems.length > 0" class="pr-2">
    <div class="p-2 text-xs font-bold uppercase">On this page</div>

    <ul class="pl-0! text-sm">
      <li
        v-for="item in tocItems"
        :key="item.id"
        class="toc-item px-2.5 py-2 mb-0.5 flex cursor-pointer items-center rounded-md border-transparent text-foreground-secondary hover:bg-gray-alpha-100 hover:text-gray-900 motion-safe:transition-appearance"
        :class="[
          `toc-level-${item.level}`,
          {
            'is-active pointer-events-none bg-primary/10 text-primary!': activeId === item.id,
          },
        ]"
        @click="scrollToHeading(item.id)"
      >
        <span class="truncate">{{ item.text }}</span>
      </li>
    </ul>
  </nav>
</template>

<style lang="postcss">
.toc-level-3 {
  padding-left: 0.75rem;
}

.toc-level-4 {
  padding-left: 1.5rem;
}
</style>

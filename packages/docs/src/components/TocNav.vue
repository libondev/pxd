<script lang="ts" setup>
import { useIntersectionObserver } from 'pxd/composables/use-browser-observer'
import { onMounted, ref, shallowRef, watch } from 'vue'
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
const activeId = ref<string>('')
const tocItems = shallowRef<TocItem[]>([])
const headingElements = shallowRef<HTMLElement[]>([])

function extractHeadings() {
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

  headingElements.value = Array.from(headings)

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

useIntersectionObserver(
  headingElements,
  (entries) => {
    const visibleEntries = entries.filter((entry) => entry.isIntersecting)

    // find the topmost visible entry
    if (visibleEntries.length > 0) {
      const topEntry = visibleEntries.reduce((prev, curr) =>
        prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr,
      )
      activeId.value = topEntry.target.id
    }
  },
  {
    rootMargin: '-60px 0px -80% 0px',
    threshold: 0,
  },
)

watch(
  () => route.path,
  () => {
    activeId.value = ''
    setTimeout(extractHeadings, 100)
  },
)

onMounted(() => {
  setTimeout(extractHeadings, 100)
})
</script>

<template>
  <nav v-if="tocItems.length > 0" class="text-sm">
    <div class="p-2 font-medium border-b">On this page</div>

    <ul class="-ml-px">
      <li
        v-for="item in tocItems"
        :key="item.id"
        class="toc-item p-2 flex cursor-pointer items-center border-l-2 border-transparent text-foreground-secondary hover:bg-gray-alpha-100 hover:text-gray-900 motion-safe:transition-appearance"
        :class="[
          `toc-level-${item.level}`,
          { 'is-active border-l-primary bg-primary/10 text-primary!': activeId === item.id },
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

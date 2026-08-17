<script lang="ts" setup>
import { useScrollspy } from 'pxd/composables/use-scrollspy'
import { shallowRef, watch, nextTick, computed } from 'vue'
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
const headingEls = shallowRef<HTMLElement[]>([])
const tocHeaders = computed<TocItem[]>(
  () =>
    headingEls.value?.map((h) => {
      return {
        id: h.id,
        text: h.textContent?.replace(/^#\s*/, '') || '',
        level: Number.parseInt(h.tagName.substring(1), 10),
      }
    }) ?? [],
)

const { activeEl, update } = useScrollspy(headingEls)

const activeId = computed(() => activeEl.value?.id)

async function extractHeadings() {
  await nextTick()
  const container = document.querySelector(props.containerSelector)

  if (!container) {
    headingEls.value = []
    return
  }

  const selector = props.levels.map((l) => `h${l}[id]`).join(', ')
  const headings = Array.from(container.querySelectorAll<HTMLElement>(selector))

  headingEls.value = headings

  update()
}

function scrollToHeading(id: string) {
  const element = document.getElementById(id)

  if (!element) {
    return
  }

  element.scrollIntoView()
  window.history.replaceState(history.state, route.path, `#${id}`)
}

watch(
  () => route.path,
  () => {
    extractHeadings()
  },
  { immediate: true },
)
</script>

<template>
  <nav v-if="tocHeaders.length > 0" class="p-2">
    <div class="p-2 text-xs font-bold uppercase">On this page</div>

    <ul class="ps-0! text-sm">
      <li
        v-for="item in tocHeaders"
        :key="item.id"
        class="toc-item px-2.5 py-2 mbe-0.5 flex cursor-pointer items-center rounded-md border-transparent text-foreground-secondary hover:bg-gray-alpha-100 hover:text-gray-900 motion-safe:transition-appearance"
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

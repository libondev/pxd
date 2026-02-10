<script setup lang="ts">
import { useIntersectionObserver } from 'pxd/composables/use-browser-observer'
import { onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'

interface TocItem {
  id: string
  text: string
  level: number
}

interface Props {
  /**
   * 监听的容器选择器
   */
  containerSelector?: string
  /**
   * 要提取的标题级别
   */
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
  const element = document.getElementById(id)

  if (element) {
    activeId.value = id
  }
}

// 监听标题元素的可见性
useIntersectionObserver(
  headingElements,
  (entries) => {
    // 找到最上方可见的标题
    const visibleEntries = entries.filter((entry) => entry.isIntersecting)

    if (visibleEntries.length > 0) {
      // 取最靠近顶部的那个
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

// 路由变化时重新提取标题
watch(
  () => route.path,
  () => {
    activeId.value = ''
    // 延迟执行等待 DOM 更新
    setTimeout(extractHeadings, 100)
  },
)

onMounted(() => {
  // 初始化时提取标题
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
        class="toc-item border-l-2 border-transparent text-foreground-secondary"
        :class="[
          `toc-level-${item.level}`,
          { 'is-active border-l-primary bg-primary/10 text-primary': activeId === item.id },
        ]"
      >
        <a
          :href="`#${item.id}`"
          class="toc-link min-w-0 p-2 flex items-center truncate hover:bg-gray-alpha-100 hover:text-foreground motion-safe:transition-all"
          @click="scrollToHeading(item.id)"
        >
          {{ item.text }}
        </a>
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

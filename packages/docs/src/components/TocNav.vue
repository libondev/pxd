<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

interface Props {
  /**
   * Headings that make up the page outline, as a CSS selector.
   *
   * `vite-vue-md` wraps a page's markdown in `<div class="markdown-body">`, so the
   * `>` combinator is what keeps demo headings out: a `vue demo` block renders
   * inside `.code-block`, one level deeper. `BasicLayout` draws the same boundary
   * with `.markdown-body > :is(h1, h2, h3, h4)`.
   */
  selector?: string
}

withDefaults(defineProps<Props>(), {
  selector: '.markdown-body > h2[id], .markdown-body > h3[id]',
})

const route = useRoute()
const toc = ref<{ items?: unknown[] }>()

// The outline is read by the component, so whether there is one to show is read
// back off it. The header is hidden rather than left stranded above nothing.
const hasOutline = computed(() => (toc.value?.items?.length ?? 0) > 0)

function onItemClick(item: { id: string }) {
  // `PToc` owns the scroll; keeping the fragment in the URL is the router's job.
  window.history.replaceState(window.history.state, route.path, `#${item.id}`)
}
</script>

<template>
  <div class="p-2">
    <div v-if="hasOutline" id="docs-toc-title" class="p-2 text-xs font-bold uppercase">
      On this page
    </div>

    <PToc
      ref="toc"
      :selector="selector"
      :aria-labelledby="hasOutline ? 'docs-toc-title' : undefined"
      @item-click="onItemClick"
    />
  </div>
</template>

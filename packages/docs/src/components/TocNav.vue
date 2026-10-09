<script lang="ts" setup>
import { useRoute } from 'vue-router'

const route = useRoute()

function onItemClick(item: { id: string }) {
  window.history.replaceState(window.history.state, route.path, `#${item.id}`)
}
</script>

<template>
  <div class="p-2">
    <div id="docs-toc-title" class="p-2 text-xs font-bold uppercase">On this page</div>

    <PToc
      :offset="50"
      selector=".markdown-body > h2[id], .markdown-body > h3[id]"
      @item-click="onItemClick"
    />
  </div>
</template>

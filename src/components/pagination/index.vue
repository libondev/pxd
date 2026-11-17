<script lang="ts" setup>
import type { PaginationProps } from './types'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import { shallowRef } from 'vue'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { useConfigProvider } from '../../contexts/config-provider.js'

defineOptions({
  name: 'PPagination',
  inheritAttrs: false,
})

defineProps<PaginationProps>()

const rootRef = shallowRef<HTMLElement>()

const configProvider = useConfigProvider()

useAgentNode({
  name: 'pagination',
  el: () => rootRef.value,
  actions: {},
})
</script>

<template>
  <nav
    ref="rootRef"
    data-pagination
    :aria-label="configProvider.locale.pagination.label"
    class="pxd-pagination relative flex w-full flex-wrap items-start justify-between"
    v-bind="$attrs"
  >
    <RouterLink
      v-if="prev"
      :to="prev.href"
      class="pxd-pagination--prev group py-1 pe-2 ps-6 rounded-md no-underline! self-focus-ring outline-none"
    >
      <span
        class="text-xs text-foreground-secondary group-hover:text-foreground motion-safe:transition-colors"
      >
        {{ configProvider.locale.pagination.prev }}
      </span>

      <div class="pxd-pagination--label prev relative flex items-center text-foreground">
        <span class="font-medium text-foreground">{{ prev.label }}</span>
        <ChevronRightIcon class="-left-5 absolute rotate-180 text-foreground-secondary" />
      </div>
    </RouterLink>

    <div class="pxd-pagination--children">
      <slot />
    </div>

    <RouterLink
      v-if="next"
      :to="next.href"
      class="pxd-pagination--next group py-1 ps-2 pe-6 rounded-md text-right no-underline! self-focus-ring outline-none"
    >
      <span
        class="text-xs text-foreground-secondary group-hover:text-foreground motion-safe:transition-colors"
      >
        {{ configProvider.locale.pagination.next }}
      </span>

      <div class="pxd-pagination--label next relative flex items-center text-foreground">
        <span class="font-medium text-foreground">{{ next.label }}</span>
        <ChevronRightIcon class="-right-5 absolute text-foreground-secondary" />
      </div>
    </RouterLink>
  </nav>
</template>

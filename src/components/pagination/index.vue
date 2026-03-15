<script lang="ts" setup>
import type { PaginationProps } from './types'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import { useConfigProvider } from '../../contexts/config-provider'

defineOptions({
  name: 'PPagination',
  inheritAttrs: false,
})

defineProps<PaginationProps>()

const configProvider = useConfigProvider()
</script>

<template>
  <nav
    aria-label="pagination"
    class="pxd-pagination relative flex w-full flex-wrap items-start justify-between"
    v-bind="$attrs"
  >
    <RouterLink
      v-if="prev"
      :to="prev.href"
      class="pxd-pagination--prev min-h-13 group py-1 pr-2 pl-6 rounded-md no-underline! self-focus-ring outline-none"
    >
      <span
        secondary
        class="text-13px text-foreground-secondary group-hover:text-foreground motion-safe:transition-colors"
      >
        {{ configProvider.locale.compare.prev }}
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
      class="pxd-pagination--next min-h-13 group py-1 pl-2 pr-6 rounded-md text-right no-underline! self-focus-ring outline-none"
    >
      <span
        secondary
        class="text-13px text-foreground-secondary group-hover:text-foreground motion-safe:transition-colors"
      >
        {{ configProvider.locale.compare.next }}
      </span>

      <div class="pxd-pagination--label next relative flex items-center text-foreground">
        <span class="font-medium text-foreground">{{ next.label }}</span>
        <ChevronRightIcon class="-right-5 absolute text-foreground-secondary" />
      </div>
    </RouterLink>
  </nav>
</template>

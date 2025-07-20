<script lang="ts" setup>
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import { useConfigProvider } from '../../composables/useConfigProviderContext'
import PText from '../text/index.vue'

interface Page {
  label: string
  href: string
}

interface Props {
  prev?: Page
  next?: Page
}

defineOptions({
  name: 'PPagination',
})

defineProps<Props>()

const config = useConfigProvider()
</script>

<template>
  <nav aria-label="pagination" class="pxd-pagination flex flex-wrap w-full relative justify-between items-start">
    <RouterLink v-if="prev" :to="prev.href" class="pxd-pagination--prev min-h-13 group py-1 pl-2 pl-6 !no-underline">
      <PText secondary class="text-[13px] group-hover:text-foreground">
        {{ config.locale.compare.prev }}
      </PText>

      <div class="pxd-pagination--label prev text-foreground relative flex items-center">
        <span class="text-foreground font-medium">{{ prev.label }}</span>
        <ChevronRightIcon class="absolute text-foreground-secondary -left-5 rotate-180" />
      </div>
    </RouterLink>

    <div class="pxd-pagination--children">
      <slot />
    </div>

    <RouterLink v-if="next" :to="next.href" class="pxd-pagination--next min-h-13 group py-1 pl-2 pr-6 !no-underline">
      <PText secondary class="text-[13px] group-hover:text-foreground">
        {{ config.locale.compare.next }}
      </PText>

      <div class="pxd-pagination--label next text-foreground relative flex items-center">
        <span class="text-foreground font-medium">{{ next.label }}</span>
        <ChevronRightIcon class="absolute text-foreground-secondary -right-5" />
      </div>
    </RouterLink>
  </nav>
</template>

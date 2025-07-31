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
  <nav aria-label="pagination" class="pxd-pagination relative flex w-full flex-wrap items-start justify-between">
    <RouterLink v-if="prev" :to="prev.href" class="pxd-pagination--prev min-h-13 group py-1 pr-2 pl-6 no-underline!">
      <PText secondary class="text-[13px] group-hover:text-foreground">
        {{ config.locale.compare.prev }}
      </PText>

      <div class="pxd-pagination--label prev relative flex items-center text-foreground">
        <span class="font-medium text-foreground">{{ prev.label }}</span>
        <ChevronRightIcon class="-left-5 absolute rotate-180 text-foreground-secondary" />
      </div>
    </RouterLink>

    <div class="pxd-pagination--children">
      <slot />
    </div>

    <RouterLink v-if="next" :to="next.href" class="pxd-pagination--next min-h-13 group py-1 pl-2 pr-6 no-underline!">
      <PText secondary class="text-[13px] group-hover:text-foreground">
        {{ config.locale.compare.next }}
      </PText>

      <div class="pxd-pagination--label next relative flex items-center text-foreground">
        <span class="font-medium text-foreground">{{ next.label }}</span>
        <ChevronRightIcon class="-right-5 absolute text-foreground-secondary" />
      </div>
    </RouterLink>
  </nav>
</template>

<script lang="ts" setup>
import type { BreadcrumbItemProps } from './types'
import { useBreadcrumbContext } from '../../contexts/breadcrumb.js'

defineOptions({
  name: 'PBreadcrumbItem',
  inheritAttrs: false,
})

defineProps<BreadcrumbItemProps>()

const breadcrumbContext = useBreadcrumbContext()
</script>

<template>
  <li
    class="pxd-breadcrumb-item group/breadcrumb-item flex list-none items-center text-foreground-secondary last:text-foreground hover:text-foreground"
    v-bind="$attrs"
  >
    <RouterLink
      v-if="to"
      :to="to"
      :replace="replace"
      class="rounded-sm text-inherit no-underline self-focus-ring outline-none hover:text-foreground motion-safe:transition-colors"
    >
      <slot />
    </RouterLink>
    <span v-else class="text-inherit">
      <slot />
    </span>

    <span
      class="pxd-breadcrumb-item--separator mx-2 inline-flex items-center text-foreground-secondary group-last/breadcrumb-item:hidden"
      aria-hidden="true"
    >
      <Component
        v-if="breadcrumbContext.separatorIcon"
        :is="breadcrumbContext.separatorIcon"
        class="size-3"
      />
      <template v-else>{{ breadcrumbContext.separator }}</template>
    </span>
  </li>
</template>

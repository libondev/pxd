<script lang="ts" setup>
import type { BreadcrumbProps } from './types'
import { provideBreadcrumbContext } from '../../contexts/breadcrumb'

defineOptions({
  name: 'PBreadcrumb',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<BreadcrumbProps>(), {
  separator: '/',
})

provideBreadcrumbContext(props)
</script>

<template>
  <nav aria-label="breadcrumb" class="pxd-breadcrumb w-full max-w-full" v-bind="$attrs">
    <ol class="gap-y-1 text-sm flex list-none flex-wrap items-center">
      <slot />
    </ol>
  </nav>
</template>

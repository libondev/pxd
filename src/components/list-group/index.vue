<script lang="ts" setup>
import type { ListGroupProps } from './types'
import { computed } from 'vue'
import { provideListFilterGroupId, useListFilterContext } from '../../contexts/list'
import { getUniqueId } from '../../utils/helper'

defineOptions({
  name: 'PListGroup',
  inheritAttrs: false,
})

defineProps<ListGroupProps>()

const groupId = getUniqueId('list-group')
const filterCtx = useListFilterContext(null)

const isHidden = computed(() => {
  if (!filterCtx || !filterCtx.searchValue.value.trim()) {
    return false
  }

  return !filterCtx.isGroupVisible(groupId)
})

provideListFilterGroupId(groupId)
</script>

<template>
  <div class="pxd-list-group" role="presentation" :hidden="isHidden" v-bind="$attrs">
    <div aria-hidden="true" class="h-10 px-2 py-1 flex items-center text-13 text-gray-900">
      <slot name="label">{{ label }}</slot>
    </div>

    <slot />
  </div>
</template>

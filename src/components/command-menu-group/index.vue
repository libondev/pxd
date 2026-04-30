<script lang="ts" setup>
import type { CommandMenuGroupProps } from './types'
import { computed } from 'vue'
import { provideListFilterGroupId, useListFilterContext } from '../../contexts/list'
import { getUniqueId } from '../../utils/uid'

defineOptions({
  name: 'PCommandMenuGroup',
  inheritAttrs: false,
})

defineProps<CommandMenuGroupProps>()

const groupId = getUniqueId('list-group')

const listFilterContext = useListFilterContext(null)

const isHidden = computed(() => {
  if (!listFilterContext || !listFilterContext.searchValue.value.trim()) {
    return false
  }

  return !listFilterContext.isGroupVisible(groupId)
})

provideListFilterGroupId(groupId)
</script>

<template>
  <div class="pxd-command-menu-group" role="presentation" :hidden="isHidden" v-bind="$attrs">
    <div aria-hidden="true" class="h-10 px-2 flex items-center text-13 text-gray-900">
      {{ label }}
    </div>

    <slot />
  </div>
</template>

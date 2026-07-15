<script lang="ts" setup>
import type { TabsItemProps, TabsItemEmits } from './types'
import { onBeforeUnmount, onMounted, useSlots, watch } from 'vue'
import { useTabsContext } from '../../contexts/tabs'
import { getUniqueId } from '../../utils/helper'

defineOptions({
  name: 'PTabsItem',
  inheritAttrs: false,
})

const props = defineProps<TabsItemProps>()
defineEmits<TabsItemEmits>()

const slots = useSlots()
const tabsContext = useTabsContext()
const id = getUniqueId('tabs-item')

function getItemState() {
  return {
    id,
    value: props.value,
    label: props.label,
    disabled: props.disabled,
    slots,
  }
}

watch(
  () => [props.value, props.label, props.disabled],
  () => {
    tabsContext.updateItem(getItemState())
  },
  { flush: 'post' },
)

onMounted(() => {
  tabsContext.registerItem(getItemState())
})

onBeforeUnmount(() => {
  tabsContext.unregisterItem(id)
})
</script>

<template></template>

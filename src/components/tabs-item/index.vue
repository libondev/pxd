<script lang="ts" setup>
import type { TabsItemProps, TabsItemEmits } from './types'
import { onBeforeUnmount, onMounted, shallowRef, useSlots, watch } from 'vue'
import { useTabsContext } from '../../contexts/tabs.js'
import { getUniqueId } from '../../utils/helper.js'

defineOptions({
  name: 'PTabsItem',
  inheritAttrs: false,
})

const props = defineProps<TabsItemProps>()
defineEmits<TabsItemEmits>()

const slots = useSlots()
const tabsContext = useTabsContext()
const key = getUniqueId('tabs-item')
const elRef = shallowRef<HTMLElement>()

function getItemState() {
  return {
    id: key,
    value: props.value,
    label: props.label,
    disabled: props.disabled,
    slots,
  }
}

function sync(node?: HTMLElement | null) {
  tabsContext.registerItem(key, getItemState(), node)
}

sync()

onMounted(() => {
  sync(elRef.value ?? null)
})

watch(
  () => [props.value, props.label, props.disabled],
  () => {
    sync(elRef.value)
  },
  { flush: 'post' },
)

onBeforeUnmount(() => {
  tabsContext.unregisterItem(key)
})
</script>

<template>
  <span ref="elRef" hidden />
</template>

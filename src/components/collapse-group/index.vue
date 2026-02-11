<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useConfigProvider } from '../../contexts/config-provider'
import { provideCollapseGroupContext } from '../../contexts/collapse'
import { getFallbackValue } from '../../utils/get'
import type { CollapseGroupProps } from '../collapse/types'

defineOptions({
  name: 'PCollapseGroup',
})

const props = withDefaults(defineProps<CollapseGroupProps>(), { multiple: false })

const SIZES = {
  sm: {
    padding: '12px',
    fontSize: '16px',
    fontWeight: '500',
  },
  md: {
    padding: '24px',
    fontSize: '24px',
    fontWeight: '600',
  },
  lg: {
    padding: '30px',
    fontSize: '28px',
    fontWeight: '600',
  },
}

const configProvider = useConfigProvider()
const expandedItemIds = ref<string[]>([])

const computedStyle = computed(() => {
  const { padding, fontSize, fontWeight } = getFallbackValue(props.size, SIZES, configProvider.size)

  return {
    '--collapse-padding': padding,
    '--collapse-font-size': fontSize,
    '--collapse-font-weight': fontWeight,
  }
})

function toggleItem(id: string, expanded: boolean) {
  if (expanded) {
    if (props.multiple) {
      expandedItemIds.value.push(id)
    } else {
      expandedItemIds.value = [id]
    }

    return
  }

  expandedItemIds.value = expandedItemIds.value.filter((item) => item !== id)
}

const isExpanded = (id: string) => expandedItemIds.value.includes(id)

provideCollapseGroupContext({
  multiple: computed(() => props.multiple),
  isExpanded,
  toggleItem,
})
</script>

<template>
  <div class="pxd-collapse-group w-full max-w-full border-t" :style="computedStyle">
    <slot />
  </div>
</template>

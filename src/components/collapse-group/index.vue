<script lang="ts" setup>
import type { ComponentSize } from '../../types/components'
import { computed, provide, ref } from 'vue'
import { useConfigProviderSize } from '../../composables/useConfigProviderContext'

interface Props {
  multiple?: boolean
  size?: ComponentSize
}

defineOptions({
  name: 'PCollapseGroup',
})

const props = withDefaults(
  defineProps<Props>(),
  { multiple: false },
)

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

const expandedItems = ref<string[]>([])

const computedSize = useConfigProviderSize(props.size, SIZES)

const computedStyle = computed(() => {
  const { padding, fontSize, fontWeight } = computedSize.value

  return {
    '--size': padding,
    '--font-size': fontSize,
    '--font-weight': fontWeight,
  }
})

function toggleItem(id: string, expanded: boolean) {
  if (expanded) {
    if (props.multiple) {
      expandedItems.value.push(id)
    } else {
      expandedItems.value = [id]
    }

    return
  }

  expandedItems.value = expandedItems.value.filter(item => item !== id)
}

const isExpanded = (id: string) => expandedItems.value.includes(id)

provide('pxdCollapseGroup', {
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

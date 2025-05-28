<script lang="ts" setup>
import type { ComponentSize } from '../../types/components'
import { computed, provide, ref } from 'vue'
import { useComputedSize } from '../../composables/useFallbackProps'

interface Props {
  multiple?: boolean
  size?: ComponentSize
}

defineOptions({
  name: 'PCollapseGroup',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    multiple: false,
  },
)

const SIZES = {
  sm: {
    padding: '12px',
    fontSize: '16px',
    fontWidth: '500',
  },
  md: {
    padding: '24px',
    fontSize: '24px',
    fontWidth: '600',
  },
  lg: {
    padding: '30px',
    fontSize: '28px',
    fontWidth: '600',
  },
}

const computedSize = useComputedSize(props.size, SIZES)

const computedStyle = computed(() => {
  return {
    '--size': computedSize.value.padding,
    '--font-size': computedSize.value.fontSize,
    '--font-weight': computedSize.value.fontWidth,
  }
})

const expandedItems = ref<string[]>([])

function toggleItem(id: string, expanded: boolean) {
  if (expanded) {
    if (props.multiple) {
      expandedItems.value.push(id)
    } else {
      expandedItems.value = [id]
    }
  } else {
    expandedItems.value = expandedItems.value.filter(item => item !== id)
  }
}

const isExpanded = (id: string) => expandedItems.value.includes(id)

provide('collapseGroup', {
  multiple: computed(() => props.multiple),
  toggleItem,
  isExpanded,
})
</script>

<template>
  <div class="pxd-collapse-group w-full max-w-full border-t" :style="computedStyle">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import type { CollapseGroupProps } from './types'
import { computed, ref } from 'vue'
import { provideCollapseGroupContext } from '../../contexts/collapse'
import { useConfigProvider } from '../../contexts/config-provider'
import { getFallbackValue } from '../../utils/get'

defineOptions({
  name: 'PCollapseGroup',
  inheritAttrs: false,
})

const props = defineProps<CollapseGroupProps>()

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
const expandedIds = ref<Set<string>>(new Set())

const computedStyle = computed(() => {
  const { padding, fontSize, fontWeight } = getFallbackValue(props.size, SIZES, configProvider.size)

  return {
    '--collapse-padding': padding,
    '--collapse-font-size': fontSize,
    '--collapse-font-weight': fontWeight,
  }
})

provideCollapseGroupContext({
  expandedIds,
  props,
})
</script>

<template>
  <div class="pxd-collapse-group w-full max-w-full border-t" :style="computedStyle" v-bind="$attrs">
    <slot />
  </div>
</template>

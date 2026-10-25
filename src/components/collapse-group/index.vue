<script lang="ts" setup>
import type { CollapseGroupProps } from './types'
import { computed, shallowRef } from 'vue'
import { provideCollapseGroupContext } from '../../contexts/collapse.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { getFallbackValue } from '../../utils/helper.js'

defineOptions({
  name: 'PCollapseGroup',
  inheritAttrs: false,
})

const props = defineProps<CollapseGroupProps>()

const SIZES = {
  sm: {
    padding: '0.75rem',
    fontSize: '1rem',
    fontWeight: '500',
  },
  md: {
    padding: '1.5rem',
    fontSize: '1.5rem',
    fontWeight: '600',
  },
  lg: {
    padding: '1.875rem',
    fontSize: '1.75rem',
    fontWeight: '600',
  },
}

const openUid = shallowRef('')

const configProvider = useConfigProvider()

const computedStyle = computed(() => {
  const { padding, fontSize, fontWeight } = getFallbackValue(props.size, SIZES, configProvider.size)

  return {
    '--collapse-padding': padding,
    '--collapse-font-size': fontSize,
    '--collapse-font-weight': fontWeight,
  }
})

provideCollapseGroupContext({
  openUid,
  props,
})
</script>

<template>
  <div
    data-collapse-group
    class="pxd-collapse-group w-full max-w-full border-t"
    :style="computedStyle"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import type { ButtonProps } from '../../types/components/button'
import { computed } from 'vue'
import { useConfigProvider } from '../../composables/use-config-provider-context'
import { isTruthyProp } from '../../utils/format'
import PSpinner from '../spinner/index.vue'
import { buttonVariants } from './cn'

defineOptions({
  name: 'PButton',
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<ButtonProps>(),
  {
    icon: false,
    as: 'button',
    align: 'center',
    variant: 'default',
  },
)

const config = useConfigProvider()
const computedDisabled = computed<boolean>(() => isTruthyProp(props.disabled) || isTruthyProp(props.loading))

const buttonClasses = computed(() => {
  const { size = config.size, shape, align, variant, fullWidth, icon } = props

  return buttonVariants({
    icon,
    size,
    shape,
    align,
    variant,
    fullWidth,
    disabled: computedDisabled.value,
  })
})
</script>

<template>
  <Component
    :is="as"
    role="button"
    :class="buttonClasses"
    :disabled="computedDisabled"
    v-bind="$attrs"
  >
    <PSpinner v-if="loading" />

    <slot name="prefix" />

    <span class="inline-flex items-center truncate" :class="{ 'px-1.5': !icon }">
      <slot />
    </span>

    <slot name="suffix" />
  </Component>
</template>

<script lang="ts" setup>
import type { ComponentSize } from '../../types/shared'
import CheckCircleIcon from '@gdsicon/vue/check-circle'
import InformationIcon from '@gdsicon/vue/information'
import StopIcon from '@gdsicon/vue/stop'
import WarningIcon from '@gdsicon/vue/warning'
import { computed, h } from 'vue'
import { useConfigProvider } from '../../composables/use-config-provider-context'
import { isTruthyProp } from '../../utils/format'
import { getFallbackValue } from '../../utils/value'

interface Props {
  variant?: keyof typeof VARIANTS
  size?: ComponentSize
  fill?: boolean
  label?: boolean | string
}

defineOptions({
  name: 'PNote',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    label: true,
    variant: 'default',
  },
)

const SIZES = {
  sm: 'px-2 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base',
}

const VARIANTS = {
  success: {
    icon: CheckCircleIcon,
    fill: 'text-blue-900 bg-blue-200 border-blue-100',
    basic: 'text-blue-900 border-blue-500',
  },
  error: {
    icon: StopIcon,
    fill: 'text-red-900 bg-red-200 border-red-100',
    basic: 'text-red-900 border-red-500',
  },
  warning: {
    icon: WarningIcon,
    fill: 'text-amber-900 bg-amber-200 border-amber-100',
    basic: 'text-amber-900 border-amber-500',
  },
  default: {
    icon: InformationIcon,
    fill: 'text-foreground-secondary bg-gray-200 border-gray-100',
    basic: 'text-foreground-secondary border-input',
  },
  primary: {
    icon: InformationIcon,
    fill: 'text-gray-100 bg-primary border-gray-100',
    basic: 'text-primary border-gray-alpha-400',
  },
  violet: {
    icon: InformationIcon,
    fill: 'text-violet-900 bg-violet-200 border-violet-100',
    basic: 'text-violet-900 border-violet-400',
  },
  cyan: {
    icon: InformationIcon,
    fill: 'text-teal-900 bg-teal-200 border-teal-100',
    basic: 'text-teal-900 border-teal-400',
  },
}

const config = useConfigProvider()

const computedLabel = computed(() => {
  const { label } = props

  if (isTruthyProp(label)) {
    return getFallbackValue(props.variant, VARIANTS).icon
  }

  if (typeof label === 'string' && label) {
    return h('span', null, label)
  }

  return false
})

const computedClass = computed(() => {
  const classes = ['pxd-note sm:flex-row sm:items-center gap-2 flex w-max max-w-full flex-col rounded-md border']

  classes.push(getFallbackValue(props.size, SIZES, config.size))

  const { fill, basic } = getFallbackValue(props.variant, VARIANTS)

  classes.push(props.fill ? fill : basic)

  return classes.join(' ')
})
</script>

<template>
  <div :class="computedClass">
    <div class="gap-3 flex items-center">
      <slot v-if="computedLabel" name="label">
        <Component :is="computedLabel" class="font-medium shrink-0" />
      </slot>

      <span class="flex-1">
        <slot />
      </span>
    </div>

    <div v-if="$slots.action" class="pxd-note--action">
      <slot name="action" />
    </div>
  </div>
</template>

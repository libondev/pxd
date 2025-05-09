<script lang="ts" setup>
import type { ComponentSize } from '../../types/components'
import { CheckCircleIcon, InformationIcon, StopIcon, WarningIcon } from 'gdsi/vue'
import { twMerge } from 'tailwind-merge'
import { computed, h } from 'vue'
import { useComputedSize } from '../../composables/useComputedSize'

interface Props {
  variant?: keyof typeof VARIANTS
  size?: ComponentSize
  fill?: boolean
  label?: string | boolean
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
    classes: 'text-blue-900 border-blue-500',
  },
  error: {
    icon: StopIcon,
    fill: 'text-red-900 bg-red-200 border-red-100',
    classes: 'text-red-900 border-red-500',
  },
  warning: {
    icon: WarningIcon,
    fill: 'text-amber-900 bg-amber-200 border-amber-100',
    classes: 'text-amber-900 border-amber-500',
  },
  default: {
    icon: InformationIcon,
    fill: 'text-gray-900 bg-gray-200 border-gray-100',
    classes: 'text-gray-900 border-input',
  },
  primary: {
    icon: InformationIcon,
    fill: 'text-gray-100 bg-gray-1000 border-gray-100',
    classes: 'text-gray-1000 border-gray-900',
  },
  violet: {
    icon: InformationIcon,
    fill: 'text-violet-900 bg-violet-200 border-violet-100',
    classes: 'text-violet-900 border-violet-400',
  },
  cyan: {
    icon: InformationIcon,
    fill: 'text-teal-900 bg-teal-200 border-teal-100',
    classes: 'text-teal-900 border-teal-400',
  },
}

const computedLabel = computed(() => {
  const { label } = props

  // hack vue2 boolean value
  if (label === true || label === '') {
    return (VARIANTS[props.variant] || VARIANTS.default).icon
  }

  if (typeof label === 'string' && label) {
    return h('span', null, label)
  }

  return false
})

const computedClasses = computed(() => {
  const basic = ['pxd-note flex items-center gap-3 border rounded-md w-max']

  basic.push(useComputedSize(props.size, SIZES))

  if (props.fill) {
    basic.push((VARIANTS[props.variant] || VARIANTS.default)?.fill)
  }
  else {
    basic.push((VARIANTS[props.variant] || VARIANTS.default).classes)
  }

  return twMerge(basic)
})
</script>

<template>
  <div :class="computedClasses">
    <slot v-if="computedLabel" name="label">
      <component :is="computedLabel" class="font-medium" />
    </slot>

    <slot />

    <div v-if="$slots.action" class="pxd-note--action ml-2">
      <slot name="action" />
    </div>
  </div>
</template>

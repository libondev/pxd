<script lang="ts" setup>
import type { NoteProps } from './types'
import CheckCircleIcon from '@gdsicon/vue/check-circle'
import InformationIcon from '@gdsicon/vue/information'
import StopIcon from '@gdsicon/vue/stop'
import WarningIcon from '@gdsicon/vue/warning'
import { computed, h } from 'vue'
import { useTailwindVariant } from '../../composables/use-tailwind-variant'
import { useConfigProvider } from '../../contexts/config-provider'
import { isTruthyProp } from '../../utils/format'

defineOptions({
  name: 'PNote',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<NoteProps>(), {
  label: true,
  variant: 'default',
})

const configProvider = useConfigProvider()

const VARIANTS_ICON = {
  success: CheckCircleIcon,
  error: StopIcon,
  warning: WarningIcon,
  default: InformationIcon,
  primary: InformationIcon,
  violet: InformationIcon,
  cyan: InformationIcon,
} as const

const computedLabel = computed(() => {
  const { label } = props

  if (isTruthyProp(label)) {
    return VARIANTS_ICON[props.variant as keyof typeof VARIANTS_ICON] || InformationIcon
  }

  if (typeof label === 'string' && label) {
    return h('span', null, label)
  }

  return false
})

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-note gap-2 sm:items-center max-sm:flex-col flex max-w-full rounded-md border',
    variants: {
      size: {
        sm: 'px-2 py-1.5 text-xs',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-2.5 text-base',
      },
      variant: {
        success: 'border-blue-500 text-blue-900',
        error: 'border-red-500 text-red-900',
        warning: 'border-amber-500 text-amber-900',
        default: 'text-gray-900',
        primary: 'border-gray-alpha-400 text-primary',
        violet: 'text-violet-900 border-violet-400',
        cyan: 'border-teal-400 text-teal-900',
      },
      fill: {},
    },
    compoundVariants: [
      { variant: 'success', fill: true, class: 'border-blue-100 bg-blue-200' },
      { variant: 'error', fill: true, class: 'border-red-100 bg-red-200' },
      { variant: 'warning', fill: true, class: 'border-amber-100 bg-amber-200' },
      { variant: 'default', fill: true, class: 'border-gray-100 bg-gray-200' },
      {
        variant: 'primary',
        fill: true,
        class: 'border-gray-100 bg-primary text-primary-foreground',
      },
      { variant: 'violet', fill: true, class: 'bg-violet-200 border-violet-100' },
      { variant: 'cyan', fill: true, class: 'border-teal-100 bg-teal-200' },
    ],
  },
  {
    selection: () => ({
      fill: props.fill,
      size: props.size || configProvider.size,
      variant: props.variant,
    }),
  },
)
</script>

<template>
  <div :class="classes" :data-variant="variant" v-bind="attrs">
    <div class="gap-3 flex flex-1 shrink-0">
      <slot v-if="computedLabel" name="label">
        <Component :is="computedLabel" class="size-4 font-medium h-lh shrink-0" />
      </slot>

      <span class="flex-1 shrink-0">
        <slot />
      </span>
    </div>

    <div v-if="$slots.action" class="pxd-note--action max-sm:ps-7 shrink-0">
      <slot name="action" />
    </div>
  </div>
</template>

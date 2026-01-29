<script lang="ts" setup>
import type { ComponentLabel, ComponentSize } from '../../types/shared'
import CheckCircleIcon from '@gdsicon/vue/check-circle'
import InformationIcon from '@gdsicon/vue/information'
import StopIcon from '@gdsicon/vue/stop'
import WarningIcon from '@gdsicon/vue/warning'
import { computed, h } from 'vue'
import { useConfigProvider } from '../../composables/use-config-provider-context'
import { isTruthyProp } from '../../utils/format'
import { noteVariant } from './cn'

interface Props {
  variant?: keyof typeof noteVariant.variants.variant
  size?: ComponentSize
  fill?: boolean
  label?: boolean | ComponentLabel
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

const config = useConfigProvider()

const VARIANTS = {
  success: {
    icon: CheckCircleIcon,
  },
  error: {
    icon: StopIcon,
  },
  warning: {
    icon: WarningIcon,
  },
  default: {
    icon: InformationIcon,
  },
  primary: {
    icon: InformationIcon,
  },
  violet: {
    icon: InformationIcon,
  },
  cyan: {
    icon: InformationIcon,
  },
}

const computedLabel = computed(() => {
  const { label } = props

  if (isTruthyProp(label)) {
    return VARIANTS[props.variant]?.icon || InformationIcon
  }

  if (typeof label === 'string' && label) {
    return h('span', null, label)
  }

  return false
})

const computedClasses = computed(() => {
  return noteVariant({
    fill: props.fill,
    size: props.size || config.size,
    variant: props.variant,
  })
})
</script>

<template>
  <div :class="computedClasses">
    <div class="gap-3 flex flex-1">
      <slot v-if="computedLabel" name="label">
        <Component :is="computedLabel" class="size-4 font-medium h-lh shrink-0" />
      </slot>

      <span class="flex-1 shrink-0">
        <slot />
      </span>
    </div>

    <div v-if="$slots.action" class="pxd-note--action">
      <slot name="action" />
    </div>
  </div>
</template>

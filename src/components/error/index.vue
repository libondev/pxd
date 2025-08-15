<script lang="ts" setup>
import type { ErrorType } from '../../types/components/error'
import type { ComponentSizeWithXs } from '../../types/shared'
import ExternalIcon from '@gdsicon/vue/external'
import StopIcon from '@gdsicon/vue/stop'
import { computed } from 'vue'
import { useConfigProvider } from '../../composables/use-config-provider-context'
import { isExternalLink } from '../../utils/format'
import { getFallbackValue } from '../../utils/get'

interface Props {
  size?: ComponentSizeWithXs
  label?: string
  error?: ErrorType
}

defineOptions({
  name: 'PError',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    size: 'md',
  },
)

const SIZES = {
  xs: 'text-xs [--mt:2px]',
  sm: 'text-[13px] [--mt:2px]',
  md: 'text-sm [--mt:2px]',
  lg: 'text-base [--mt:4px]',
}

const config = useConfigProvider()

const computedClass = computed(() => {
  const classes = ['pxd-error flex text-red-900', getFallbackValue(props.size, SIZES, config.size)]

  return classes.join(' ')
})
</script>

<template>
  <div :class="computedClass">
    <StopIcon class="size-4 mr-2 mt-(--mt) shrink-0" />

    <div class="flex-1">
      <b v-if="label || error?.label" class="font-medium whitespace-nowrap">{{ label || error?.label }}:</b>

      <slot>
        {{ error?.message }}

        <span v-if="error?.action && error?.link">
          <a :href="error.link" class="font-medium gap-1 inline-flex items-center text-red-900 underline" :target="isExternalLink(error.link) ? '_blank' : '_self'">
            {{ error.action }}

            <ExternalIcon v-if="isExternalLink(error.link)" class="text-sm" />
          </a>
        </span>
      </slot>
    </div>
  </div>
</template>

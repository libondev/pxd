<script lang="ts" setup>
import type { ErrorProps } from './types'
import ExternalIcon from '@gdsicon/vue/external'
import StopIcon from '@gdsicon/vue/stop'
import { computed } from 'vue'
import { useConfigProvider } from '../../contexts/config-provider'
import { isExternalLink } from '../../utils/format'
import { tv } from 'tailwind-variants'

defineOptions({
  name: 'PError',
})

const props = defineProps<ErrorProps>()

const errorVariant = tv({
  base: 'pxd-error flex text-red-900',
  variants: {
    size: {
      xs: 'text-xs [--mt:2px]',
      sm: 'text-13px [--mt:2px]',
      md: 'text-sm [--mt:2px]',
      lg: 'text-base [--mt:4px]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const configProvider = useConfigProvider()

const computedClasses = computed(() => {
  return errorVariant({ size: props.size || configProvider.size })
})
</script>

<template>
  <div :class="computedClasses">
    <StopIcon class="size-4 mr-2 mt-(--mt) shrink-0" />

    <div class="flex-1 shrink-0">
      <b v-if="label || error?.label" class="font-medium whitespace-nowrap"
        >{{ label || error?.label }}:</b
      >

      <slot>
        {{ error?.message }}

        <span v-if="error?.action && error?.link">
          <a
            :href="error.link"
            class="font-medium gap-1 inline-flex items-center text-red-900 underline"
            :target="isExternalLink(error.link) ? '_blank' : '_self'"
          >
            {{ error.action }}

            <ExternalIcon v-if="isExternalLink(error.link)" class="text-sm" />
          </a>
        </span>
      </slot>
    </div>
  </div>
</template>

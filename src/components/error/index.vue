<script lang="ts" setup>
import type { ErrorProps } from './types'
import ExternalIcon from '@gdsicon/vue/external'
import StopIcon from '@gdsicon/vue/stop'
import { computed } from 'vue'
import { useTailwindVariant } from '../../composables/use-tailwind-variant'
import { useConfigProvider } from '../../contexts/config-provider'
import { isExternalLink } from '../../utils/format'

defineOptions({
  name: 'PError',
  inheritAttrs: false,
})

const props = defineProps<ErrorProps>()

const { attrs, classes: errorClasses } = useTailwindVariant({
  base: 'pxd-error flex text-red-900',
  variants: {
    size: {
      xs: 'text-xs [--mt:0.125rem]',
      sm: 'text-13 [--mt:0.125rem]',
      md: 'text-sm [--mt:0.125rem]',
      lg: 'text-base [--mt:0.25rem]',
    },
  },
})

const configProvider = useConfigProvider()

const computedClasses = computed(() => {
  return errorClasses({ size: props.size || configProvider.size })
})
</script>

<template>
  <div :class="computedClasses" v-bind="attrs">
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

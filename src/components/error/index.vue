<script lang="ts" setup>
import type { ErrorProps } from './types'
import ExternalIcon from '@gdsicon/vue/external'
import StopIcon from '@gdsicon/vue/stop'
import { useTailwindVariant } from '../../composables/use-tailwind-variant.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { isExternalLink } from '../../utils/format.js'

defineOptions({
  name: 'PError',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ErrorProps>(), {
  variant: 'default',
})

const configProvider = useConfigProvider()

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-error flex text-red-900',
    variants: {
      variant: {
        default: '',
        card: 'p-4 gap-2 w-full max-w-full flex-col items-center rounded-lg border border-red-400 bg-red-200 empty:hidden',
      },
      size: {
        xs: 'text-xs [--mt:0.125rem]',
        sm: 'text-13 [--mt:0.125rem]',
        md: 'text-sm [--mt:0.125rem]',
        lg: 'text-base [--mt:0.25rem]',
      },
    },
  },
  {
    selection: () => ({
      size: props.size || configProvider.size,
      variant: props.variant,
    }),
  },
)
</script>

<template>
  <div :class="classes" :data-variant="variant" v-bind="attrs">
    <StopIcon class="size-4 me-2 mbs-(--mt) shrink-0" />

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

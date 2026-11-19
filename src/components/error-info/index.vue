<script lang="ts" setup>
import type { ErrorInfoProps } from './types'
import ExternalIcon from '@gdsicon/vue/external'
import StopIcon from '@gdsicon/vue/stop'
import { computed } from 'vue'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { SIZE_TEXT_CLASS } from '../../constants/size.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { isExternalLink } from '../../utils/format.js'

defineOptions({
  name: 'PErrorInfo',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ErrorInfoProps>(), {
  variant: 'default',
})

const isExternal = computed(() => {
  const link = props.error?.link
  return link ? isExternalLink(link) : false
})

const resolvedLabel = computed(() => props.label || props.error?.label)

const configProvider = useConfigProvider()

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-error-info flex text-red-900',
    variants: {
      variant: {
        default: '',
        card: 'p-3 gap-2 w-full max-w-full flex-col items-center rounded-lg border border-red-400 bg-red-200 empty:hidden',
      },
      size: {
        xs: `${SIZE_TEXT_CLASS.xs} [--mt:0.125rem]`,
        sm: `${SIZE_TEXT_CLASS.sm} [--mt:0.125rem]`,
        md: `${SIZE_TEXT_CLASS.md} [--mt:0.125rem]`,
        lg: `${SIZE_TEXT_CLASS.lg} [--mt:0.25rem]`,
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
  <div data-error-info :class="classes" :data-variant="variant" v-bind="attrs">
    <StopIcon class="me-2 mbs-(--mt) size-em shrink-0" />

    <div class="flex-1 shrink-0">
      <b v-if="resolvedLabel" class="font-medium whitespace-nowrap">{{ resolvedLabel }}:</b>

      <slot>
        {{ error?.message }}

        <span v-if="error?.action && error?.link">
          <a
            :href="error.link"
            class="font-medium gap-1 inline-flex items-center text-red-900 underline"
            :target="isExternal ? '_blank' : '_self'"
          >
            {{ error.action }}

            <ExternalIcon v-if="isExternal" class="text-sm" />
          </a>
        </span>
      </slot>
    </div>
  </div>
</template>

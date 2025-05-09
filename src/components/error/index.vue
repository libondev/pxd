<script lang="ts" setup>
import type { ComponentSizeWithXs, ErrorType } from '../../types/components'
import { ExternalIcon, StopIcon } from 'gdsi/vue'
import { useConfigProvider } from '../../composables/useConfigProviderContext'
import { isExternalLink } from '../../utils/format'

interface Props {
  size?: ComponentSizeWithXs
  label?: string
  error?: ErrorType
}

defineOptions({
  name: 'PError',
})

defineProps<Props>()

const config = useConfigProvider()

const SIZES = {
  xs: 'text-xs',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}
</script>

<template>
  <div class="pxd-error flex items-center gap-1.5 text-red-900" :class="SIZES[size || config.size]">
    <StopIcon class="size-4" />
    <b v-if="label || error?.label" class="font-medium">{{ label || error?.label }}:</b>

    <slot>
      {{ error?.message }}

      <span v-if="error?.action && error?.link">
        <a :href="error.link" class="text-red-900 font-medium inline-flex items-center gap-1 underline" :target="isExternalLink(error.link) ? '_blank' : '_self'">
          {{ error.action }}

          <ExternalIcon v-if="isExternalLink(error.link)" class="text-sm" />
        </a>
      </span>
    </slot>
  </div>
</template>

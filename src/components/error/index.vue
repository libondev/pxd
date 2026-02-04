<script lang="ts" setup>
import type { ErrorType } from '../../types/components/error'
import type { ComponentLabel, ComponentSizeWithXs } from '../../types/shared'
import ExternalIcon from '@gdsicon/vue/external'
import StopIcon from '@gdsicon/vue/stop'
import { computed } from 'vue'
import { useConfigProvider } from '../../composables/use-config-provider-context'
import { isExternalLink } from '../../utils/format'
import { errorVariant } from './cn'

interface Props {
  size?: ComponentSizeWithXs
  label?: ComponentLabel
  error?: ErrorType
}

defineOptions({
  name: 'PError',
})

const props = withDefaults(defineProps<Props>(), { size: 'md' })

const config = useConfigProvider()

const computedClasses = computed(() => {
  return errorVariant({ size: props.size || config.size })
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

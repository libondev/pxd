<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface ErrorErrorProp {
  message: string
  action?: string
  link?: string
}

interface ErrorProps {
  size?: keyof typeof SIZES
  label?: string
  error?: ErrorErrorProp
}

defineOptions({
  name: 'PError',
})

withDefaults(
  defineProps<ErrorProps>(),
  {
    size: 'default',
  },
)

const SIZES = {
  small: 'text-xs',
  default: 'text-sm',
  large: 'text-lg',
}
</script>

<template>
  <div class="pxd-error flex items-start text-red-900 text-sm" :class="SIZES[size]">
    <div aria-hidden="true" class="inline-flex items-center mr-2 mt-[3px]">
      <Icon icon="carbon:warning-hex" />
    </div>

    <div class="pxd-error--text">
      <template v-if="error">
        <span class="mr-1">{{ error.message }}</span>
        <a v-if="error.link" rel="noopener" target="_blank" class="inline-flex items-center font-medium underline underline-offset-2 pxd-error--link" :href="error.link">
          {{ error.action }}
          <Icon icon="carbon:launch" />
        </a>
      </template>
      <template v-else>
        <span v-if="label" class="font-medium mr-1">{{ label }}:</span>
        <slot />
      </template>
    </div>
  </div>
</template>

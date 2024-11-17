<script setup lang="ts">
import type { StandardError, StandardErrorObject, StandardSize } from '#types'
import Link from '~/link/index.js'
import { ExclamationTriangleIcon } from '@radix-icons/vue'

interface ErrorProps {
  size?: StandardSize
  label?: string
  error?: StandardError
}

defineOptions({
  name: 'PError',
})

const {
  size = 'default',
  error,
} = defineProps<ErrorProps>()

const SIZES = {
  small: 'text-xs',
  default: 'text-sm',
  large: 'text-lg',
}
</script>

<template>
  <div class="pxd-error flex items-start text-red-900 text-sm" :class="SIZES[size]">
    <div aria-hidden="true" class="inline-flex items-center mr-1 mt-[3px]">
      <ExclamationTriangleIcon />
    </div>

    <div class="pxd-error--text">
      <template v-if="typeof error === 'object'">
        <span class="mr-1">{{ error.message }}</span>

        <Link v-if="error.link" :href="error.link" underline>
          {{ error.action }}
        </Link>
      </template>
      <template v-else>
        <span v-if="label" class="font-medium mr-1">{{ label }}:</span>
        <slot>{{ error }}</slot>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StandardError, StandardErrorObject, StandardSize } from '#types'
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
  error = '',
} = defineProps<ErrorProps>()

const SIZES = {
  small: 'text-xs',
  default: 'text-sm',
  large: 'text-lg',
}

const isObjectTypeError = computed(() => typeof error === 'object' && 'message' in error)
</script>

<template>
  <div class="pxd-error flex items-start text-red-900 text-sm" :class="SIZES[size]">
    <div aria-hidden="true" class="inline-flex items-center mr-1 mt-[3px]">
      <ExclamationTriangleIcon />
    </div>

    <div class="pxd-error--text">
      <template v-if="isObjectTypeError">
        <span class="mr-1">{{ (error as StandardErrorObject).message }}</span>

        <PLink v-if="error.link" :href="error.link" underline>
          {{ (error as StandardErrorObject).action }}
        </PLink>
      </template>
      <template v-else>
        <span v-if="label" class="font-medium mr-1">{{ label }}:</span>
        <slot>{{ error }}</slot>
      </template>
    </div>
  </div>
</template>

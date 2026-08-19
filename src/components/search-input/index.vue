<script lang="ts" setup>
import type { SearchInputEmits, SearchInputProps } from './types'
import LoaderCircleIcon from '@gdsicon/vue/loader-circle'
import MagnifyingGlassIcon from '@gdsicon/vue/magnifying-glass'
import { shallowRef } from 'vue'
import { useForwardRefExpose } from '../../composables/use-forward-ref-expose.js'
import PInput from '../input/index.vue'

defineOptions({
  name: 'PSearchInput',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = defineProps<SearchInputProps>()
const emits = defineEmits<SearchInputEmits>()

const inputRef = shallowRef<InstanceType<typeof PInput>>()

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' || props.loading) {
    return
  }

  const value = (event.target as HTMLInputElement).value

  if (!value) {
    return
  }

  emits('search', value)
}

defineExpose(useForwardRefExpose(inputRef))
</script>

<template>
  <PInput ref="inputRef" :default-prefix-style="false" v-bind="$attrs" @keydown="onKeydown">
    <template #prefix>
      <div class="pxd-search-input--prefix-icon ps-3">
        <LoaderCircleIcon v-if="loading" class="size-4 motion-safe:animate-spin" />
        <slot v-else name="prefix">
          <MagnifyingGlassIcon class="size-4" />
        </slot>
      </div>
    </template>

    <template v-if="$slots.suffix" #suffix>
      <slot name="suffix" />
    </template>
  </PInput>
</template>

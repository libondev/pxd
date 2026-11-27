<script lang="ts" setup>
import type { AvatarGroupProps } from './types'
import { computed } from 'vue'
import { provideAvatarGroupContext } from '../../contexts/avatar.js'
import PAvatar from '../avatar/index.vue'

defineOptions({
  name: 'PAvatarGroup',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<AvatarGroupProps>(), {
  maxCount: 5,
  options: () => [],
})

const slicedOptions = computed(() => {
  const { maxCount, options } = props
  const visibleCount = Math.max(Math.min(maxCount, options.length), 1)

  return options.slice(0, visibleCount)
})

provideAvatarGroupContext({ props })
</script>

<template>
  <div data-avatar-group class="pxd-avatar-group flex flex-wrap items-center" v-bind="$attrs">
    <div
      v-for="(option, index) in slicedOptions"
      :key="`${option.src}-${index}`"
      class="group nth-[n+2]:-ms-2.5"
    >
      <PAvatar
        :dimension="dimension"
        :src="option.src"
        :alt="option.alt"
        :loading="option.loading"
        class="group-hover:-translate-y-1 group-hover:shadow-lg ring-2 ring-background-100 group-hover:z-1 group-hover:scale-110 motion-safe:transition-appearance"
      />
    </div>

    <div class="group -ms-3">
      <PAvatar
        v-if="slicedOptions.length < options.length"
        class="text-xs group-hover:-translate-y-1 group-hover:shadow-lg bg-gray-1000 text-gray-100 ring-2 ring-background-100 group-hover:z-1 group-hover:scale-110 motion-safe:transition-appearance"
      >
        +{{ options.length - slicedOptions.length }}
      </PAvatar>
    </div>
  </div>
</template>

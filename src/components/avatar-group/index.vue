<script lang="ts" setup>
import type { AvatarGroupProps } from './types'
import { computed } from 'vue'
import { provideAvatarGroupContext } from '../../contexts/avatar'
import PAvatar from '../avatar/index.vue'

defineOptions({
  name: 'PAvatarGroup',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<AvatarGroupProps>(), {
  max: 5,
  options: () => [],
})

const slicedOptions = computed(() => {
  const { max, options = [] } = props
  const maxCount = Math.max(Math.min(max, options.length), 1)

  return options.slice(0, maxCount)
})

provideAvatarGroupContext({ props })
</script>

<template>
  <div class="pxd-avatar-group flex flex-wrap items-center" v-bind="$attrs">
    <div v-for="(option, index) in slicedOptions" :key="index" class="group nth-[n+2]:-ml-2.5">
      <PAvatar
        :size="size"
        :src="option.src"
        :alt="option.alt"
        :loading="option.loading"
        class="group-hover:-translate-y-1 group-hover:shadow-lg ring-2 ring-background-100 group-hover:z-1 group-hover:scale-110 motion-safe:transition-appearance"
      />
    </div>

    <div class="group -ml-3">
      <PAvatar
        v-if="slicedOptions.length < options.length"
        class="text-xs group-hover:-translate-y-1 group-hover:shadow-lg bg-gray-1000 text-gray-100 ring-2 ring-background-100 group-hover:z-1 group-hover:scale-110 motion-safe:transition-appearance"
      >
        +{{ options.length - slicedOptions.length }}
      </PAvatar>
    </div>
  </div>
</template>

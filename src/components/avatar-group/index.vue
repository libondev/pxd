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
  size: 32,
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
    <PAvatar
      v-for="(option, index) in slicedOptions"
      :key="index"
      :size="size"
      :src="option.src"
      :alt="option.alt"
      :loading="option.loading"
      class="nth-[n+2]:-ml-2.5 hover:z-1"
    />

    <PAvatar
      v-if="slicedOptions.length < options.length"
      class="text-xs -ml-3 bg-gray-1000 text-gray-100"
    >
      +{{ options.length - slicedOptions.length }}
    </PAvatar>
  </div>
</template>

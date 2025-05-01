<script lang="ts" setup>
import { computed, provide } from 'vue'
import Avatar from '../avatar/index.vue'

interface AvatarGroupOptions {
  src?: string
  loading?: boolean
}

interface Props {
  max?: number
  size?: number | string
  options?: AvatarGroupOptions[]
}

defineOptions({
  name: 'PAvatarGroup',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    max: 5,
    size: 32,
    options: () => [],
  },
)

const slicedOptions = computed(() => props.options?.slice(0, props.max))

provide('groupSize', props.size)
</script>

<template>
  <div class="pxd-avatar-group flex flex-wrap items-center">
    <Avatar
      v-for="(option, index) in slicedOptions"
      :key="index"
      :size="size"
      :src="option.src"
      :loading="option.loading"
      class="[&:nth-child(n+2)]:-ml-3"
    />

    <Avatar v-if="slicedOptions.length < options.length" class="text-md bg-gray-1000 text-gray-100 -ml-3">
      +{{ options.length - slicedOptions.length }}
    </Avatar>
  </div>
</template>

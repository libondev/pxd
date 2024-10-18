<script setup lang="ts">
import type { AvatarGroupProps } from '..'
import { computed } from 'vue'

defineOptions({
  name: 'PAvatarGroup',
})

const props = withDefaults(
  defineProps<AvatarGroupProps>(),
  {
    max: 5,
    gap: 10,
    size: 32,
    members: () => [],
  },
)

const maxedMembers = computed(() => props.members.slice(0, props.max))

provide('avatarGroupProvider', { size: props.size })
</script>

<template>
  <div class="flex flex-wrap items-center">
    <PAvatar
      v-for="member, i of maxedMembers"
      :key="i"
      :size="size"
      :src="member.src"
      :placeholder="member.placeholder"
      class="[&:nth-child(n+2)]:-ml-3"
    />

    <PAvatar v-if="members.length > max" :size="size" class="-ml-3">
      <div class="relative w-full h-full flex items-center justify-center font-bold text-sm rounded-full bg-gray-1000 text-gray-100 font-mono">
        +{{ members.length - max }}
      </div>
    </PAvatar>
  </div>
</template>

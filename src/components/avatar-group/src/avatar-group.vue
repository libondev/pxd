<script setup lang="ts">
import type { AvatarGroupProps } from '../index.js'
import Avatar from '~/avatar/index.js'

defineOptions({
  name: 'PAvatarGroup',
})

const {
  max = 5,
  size = 32,
  members = [],
} = defineProps<AvatarGroupProps>()

const maxedMembers = computed(() => members.slice(0, max))

provide('avatarGroupProvider', { size })
</script>

<template>
  <div class="flex flex-wrap items-center">
    <Avatar
      v-for="member, i of maxedMembers"
      :key="i"
      :size="size"
      :src="member.src"
      :placeholder="member.placeholder"
      class="[&:nth-child(n+2)]:-ml-3"
    />

    <Avatar v-if="members.length > max" :size="size" class="-ml-3">
      <div class="relative w-full h-full flex items-center justify-center font-bold text-sm rounded-full bg-gray-1000 text-gray-100 font-mono">
        +{{ members.length - max }}
      </div>
    </Avatar>
  </div>
</template>

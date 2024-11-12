<script setup lang="ts">
interface OverlayProps {
  visible: boolean
}

defineOptions({
  name: 'POverlay',
})

defineProps<OverlayProps>()
</script>

<template>
  <Teleport to="body">
    <Transition name="transition-fade">
      <div v-if="visible" class="bg-gray-alpha-500 backdrop-blur-sm fixed left-0 top-0 w-full h-full z-50" />
    </Transition>
  </Teleport>
</template>

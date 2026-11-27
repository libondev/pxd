<script lang="ts" setup>
import { onMounted, shallowRef } from 'vue'

interface Props {
  to?: string | object
  disabled?: boolean
}

defineOptions({
  name: 'PClientTeleport',
  inheritAttrs: false,
})

withDefaults(defineProps<Props>(), {
  to: 'body',
  disabled: false,
})

const isMounted = shallowRef(false)

onMounted(() => {
  isMounted.value = true
})
</script>

<template>
  <Teleport v-if="disabled || isMounted" :to="to" :disabled="disabled">
    <slot />
  </Teleport>
</template>

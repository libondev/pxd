<script lang="ts" setup>
import { TabsContent } from 'radix-vue'

import { TriggerSymbol } from '../../tabs'

const triggers = inject(TriggerSymbol)

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  }
})

watch(
  () => props.value,
  (newValue, oldValue) => {
    if (!triggers) {
      return
    }

    if (newValue === oldValue) {
      return
    } else {
      triggers.value[newValue] = props.label
      oldValue && delete triggers[oldValue]
    }
  },
  { immediate: true, flush: 'pre' }
)
</script>

<template>
  <TabsContent
    class="mt-2 p-2 b-(1 solid input) shadow-sm rounded-md bg-background"
    :value="value"
  >
    <slot />
  </TabsContent>
</template>

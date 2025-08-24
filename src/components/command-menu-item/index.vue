<script lang="ts" setup>
import type { ListOption } from '../../types/components/list'
import { computed } from 'vue'
import { useCommandMenuContext } from '../../contexts/command-menu'
import PListItem from '../list-item/index.vue'

interface Props {
  as?: ListOption['as']
  type?: ListOption['type']
  label?: ListOption['label']
  disabled?: ListOption['disabled']
  description?: ListOption['description']
}

defineOptions({
  name: 'PCommandMenuItem',
})

const props = defineProps<Props>()

const commandMenuContext = useCommandMenuContext()

const isVisible = computed(() => {
  return !commandMenuContext?.filterKeyword.value
    || commandMenuContext?.filterKeywordRegex.value?.test(String(props.label))
})
</script>

<template>
  <PListItem v-if="isVisible" v-bind="props">
    <slot />
  </PListItem>
</template>

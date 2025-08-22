<script lang="ts" setup>
import type { ListOption } from '../../types/components/list'
import { onBeforeUnmount, onMounted } from 'vue'
import { useCommandMenuContext } from '../../contexts/command-menu'

interface Props {
  as?: ListOption['as']
  type?: ListOption['type']
  label?: ListOption['label']
  value?: ListOption['value']
  disabled?: ListOption['disabled']
  description?: ListOption['description']
}

defineOptions({
  name: 'PCommandMenuItem',
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<Props>(),
  {
    as: 'li',
    type: 'default',
    disabled: false,
  },
)

const {
  registerCommandMenuItem,
  unregisterCommandMenuItem,
} = useCommandMenuContext()

onMounted(() => {
  registerCommandMenuItem(props)
})

onBeforeUnmount(() => {
  unregisterCommandMenuItem(props)
})
</script>

<!-- eslint-disable-next-line vue/valid-template-root -->
<template />

<template>
  <i role='img' aria-label='icon' aria-hidden='true' :style="inlineStyles" class='c-icon carbons-vertical-middle'>
    <slot />
  </i>
</template>

<script lang="ts" setup>
import { useIcon } from './composables/use-icon'
import { iconProps } from '../../icon/src/constraints'

const props = defineProps(iconProps)
const inlineStyles = useIcon(props)
</script>

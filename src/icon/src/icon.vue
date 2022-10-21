<template>
  <i
    role="img"
    class="px-icon px-empty-hidden"
    aria-label="icon"
    aria-hidden="true"
    :style="inlineStyles"
  >
    <slot />
  </i>
</template>

<script lang="ts" setup name="PxIcon">
import { useIcon } from './composables/use-icon'
import { iconProps } from '../../icon/src/constraints'

const props = defineProps(iconProps)
const inlineStyles = useIcon(props)
</script>

<template>
  <i
    role="img"
    class="c-icon"
    aria-label="icon"
    aria-hidden="true"
    :style="inlineStyles"
  >
    <slot />
  </i>
</template>

<script lang="ts" setup name="CIcon">
import { useIcon } from './composables/use-icon'
import { iconProps } from '../../icon/src/constraints'

const props = defineProps(iconProps)
const inlineStyles = useIcon(props)
</script>

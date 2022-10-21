<template>
  <slot />
</template>

<script lang="ts" setup name="CProvider">
import { providerProps } from './constraints'
import { globalSymbol } from '../../_internal'

const props = defineProps(providerProps)

provide(globalSymbol, props)
</script>

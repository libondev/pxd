<template>
  <button
    :type="type"
    class="carbons-transition carbons-relative"
    :class="className"
    :disabled="disabled"
    @click="onButtonClick"
  >
    <loading-spinner
      v-if="loading"
      class="c-button--loading-icon"
    />
    <slot />
  </button>
</template>

<script lang="ts" setup name="CButton">
import { buttonProps } from './constraints'
import { useDisabled, useSize } from '../../_hooks'
import { VARIANTS } from '../../_internal'

const LoadingSpinner = defineAsyncComponent(() => import('../../spinner'))

const emits = defineEmits(['click'])
const props = defineProps(buttonProps)

const size = useSize(props)
const disabled = useDisabled(props)

const NAMESPACE = 'c-button'
const className = computed(() => {
  const { plain, ghost, status, loading } = props
  let className = `${NAMESPACE} `

  if (plain) {
    className += `${NAMESPACE}--${status}-plain`
  } else if (ghost) {
    className += `${NAMESPACE}--${status}-ghost`
  } else {
    className += `${NAMESPACE}--${VARIANTS.includes(status) ? status : 'default'}`
  }

  return [className, `carbons-size-${size.value}`, loading && `${NAMESPACE}--loading`]
})

function onButtonClick (event: MouseEvent): void {
  if (props.loading) return
  emits('click', event)
}
</script>

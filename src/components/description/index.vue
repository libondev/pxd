<script lang="ts" setup>
import InformationFillSmallIcon from '@gdsicon/vue/information-fill-small'

interface Props {
  title?: string
  content?: string
  tooltip?: string
}

defineOptions({
  name: 'PDescription',
})

defineProps<Props>()
</script>

<template>
  <dl class="pxd-description">
    <dt data-pxd-description-title class="flex items-center text-sm text-foreground-secondary leading-none mb-2 min-h-3.5 capitalize text-nowrap">
      <slot name="title">
        {{ title }}
      </slot>

      <InformationFillSmallIcon v-if="tooltip" class="ml-1" />
    </dt>
    <dd data-pxd-description-content class="text-sm text-foreground font-medium leading-4">
      <slot name="content">
        {{ content }}
      </slot>
    </dd>
  </dl>
</template>

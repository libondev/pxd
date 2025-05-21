<script lang="ts" setup>
import InformationIcon from '@gdsicon/vue/information-fill-small'
import PTooltip from '../tooltip/index.vue'

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
    <dt data-pxd-description-title class="flex gap-1 items-center text-sm text-foreground-secondary leading-none mb-2 min-h-3.5 capitalize text-nowrap">
      <slot name="title">
        {{ title }}
      </slot>

      <PTooltip v-if="tooltip" :content="tooltip" enterable>
        <InformationIcon class="text-base" />
      </PTooltip>
    </dt>
    <dd data-pxd-description-content class="text-sm text-foreground font-medium leading-4">
      <slot name="content">
        {{ content }}
      </slot>
    </dd>
  </dl>
</template>

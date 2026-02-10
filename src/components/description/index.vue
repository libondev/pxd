<script lang="ts" setup>
import InformationIcon from '@gdsicon/vue/information-fill-small'
import PTooltip from '../tooltip/index.vue'
import type { DescriptionProps } from './types'

defineOptions({
  name: 'PDescription',
})

defineProps<DescriptionProps>()
</script>

<template>
  <dl class="pxd-description">
    <dt
      class="pxd-description--title gap-1 text-sm mb-2 min-h-3.5 flex items-center leading-none text-nowrap text-foreground-secondary capitalize"
    >
      <slot name="title">
        {{ title }}
      </slot>

      <PTooltip v-if="tooltip" :content="tooltip">
        <InformationIcon class="text-base scale-125" />
      </PTooltip>
    </dt>
    <dd class="pxd-description--content text-sm font-medium leading-4 text-foreground">
      <slot name="content">
        {{ content }}
      </slot>
    </dd>
  </dl>
</template>

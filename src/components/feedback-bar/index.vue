<script lang="ts" setup>
import type { FeedbackBarEmits, FeedbackBarProps } from './types'
import CrossIcon from '@gdsicon/vue/cross'
import InformationIcon from '@gdsicon/vue/information'
import ThumbDownIcon from '@gdsicon/vue/thumb-down'
import ThumbUpIcon from '@gdsicon/vue/thumb-up'
import { useConfigProvider } from '../../contexts/config-provider.js'
import PButton from '../button/index.vue'

defineOptions({
  name: 'PFeedbackBar',
  inheritAttrs: false,
})

const props = defineProps<FeedbackBarProps>()
const emits = defineEmits<FeedbackBarEmits>()

const configProvider = useConfigProvider()

function handleClose() {
  emits('close')
}

function handleThumbUp() {
  emits('thumbUp')
}

function handleThumbDown() {
  emits('thumbDown')
}
</script>

<template>
  <div
    data-feedback-bar
    class="pxd-feedback-bar p-1.5 gap-1 flex w-full max-w-full items-center overflow-hidden rounded-xl border bg-background-100"
    v-bind="$attrs"
  >
    <InformationIcon aria-hidden="true" class="size-3 ms-2.5 me-1 shrink-0 text-gray-900" />

    <span class="pxd-feedback-bar--label text-sm flex-1 shrink-0 text-foreground">
      {{ label }}
    </span>

    <PButton
      variant="ghost"
      size="sm"
      icon
      class="text-gray-900"
      :aria-label="configProvider.locale.feedback.thumbUp"
      :title="configProvider.locale.feedback.thumbUp"
      @click="handleThumbUp"
    >
      <ThumbUpIcon class="size-3" />
    </PButton>

    <PButton
      variant="ghost"
      size="sm"
      icon
      class="text-gray-900"
      :aria-label="configProvider.locale.feedback.thumbDown"
      :title="configProvider.locale.feedback.thumbDown"
      @click="handleThumbDown"
    >
      <ThumbDownIcon class="size-3" />
    </PButton>

    <PButton
      variant="ghost"
      size="sm"
      icon
      class="text-gray-900"
      :aria-label="configProvider.locale.feedback.close"
      :title="configProvider.locale.feedback.close"
      @click="handleClose"
    >
      <CrossIcon class="size-3" />
    </PButton>
  </div>
</template>

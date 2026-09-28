<script lang="ts" setup>
import type { FeedbackBarEmits, FeedbackBarProps } from './types'
import CrossIcon from '@gdsicon/vue/cross'
import InformationIcon from '@gdsicon/vue/information'
import ThumbDownIcon from '@gdsicon/vue/thumb-down'
import ThumbUpIcon from '@gdsicon/vue/thumb-up'
import PButton from '../button/index.vue'

defineOptions({
  name: 'PFeedbackBar',
  inheritAttrs: false,
})

const props = defineProps<FeedbackBarProps>()
const emits = defineEmits<FeedbackBarEmits>()

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
    class="pxd-feedback-bar p-1.5 gap-1 flex w-full max-w-full items-center overflow-hidden rounded-xl border bg-background-100"
    v-bind="$attrs"
  >
    <InformationIcon class="size-3 ms-2.5 me-1 shrink-0 text-gray-900" />

    <span class="pxd-feedback-bar--label text-sm flex-1 shrink-0 text-foreground">
      {{ label }}
    </span>

    <PButton variant="ghost" size="sm" icon class="text-gray-900" @click="handleThumbUp">
      <ThumbUpIcon class="size-3" />
    </PButton>

    <PButton variant="ghost" size="sm" icon class="text-gray-900" @click="handleThumbDown">
      <ThumbDownIcon class="size-3" />
    </PButton>

    <PButton variant="ghost" size="sm" icon class="text-gray-900" @click="handleClose">
      <CrossIcon class="size-3" />
    </PButton>
  </div>
</template>

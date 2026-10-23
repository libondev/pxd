<script lang="ts" setup>
import type { ToolCallProps, ToolCallStatus } from './types'
import CheckCircleFillIcon from '@gdsicon/vue/check-circle-fill'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import ClockIcon from '@gdsicon/vue/clock'
import CrossCircleFillIcon from '@gdsicon/vue/cross-circle-fill'
import LoaderCircleIcon from '@gdsicon/vue/loader-circle'
import { computed, shallowRef } from 'vue'
import { useDetailsCollapse } from '../../composables/_internal/use-details-collapse.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import PCodeBlock from '../code-block/index.vue'

defineOptions({
  name: 'PToolCall',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ToolCallProps>(), {
  variant: 'default',
  status: 'pending',
  expand: true,
})

const STATUS_ICON: Record<ToolCallStatus, typeof ClockIcon> = {
  pending: ClockIcon,
  running: LoaderCircleIcon,
  completed: CheckCircleFillIcon,
  error: CrossCircleFillIcon,
}

const contentRef = shallowRef<HTMLElement>()

const inputText = computed(() => formatPayload(props.input))
const outputText = computed(() => formatPayload(props.output))

const configProvider = useConfigProvider()

const { isOpen, detailsOpen, isLeaving, onToggleClick, onDetailsToggle } = useDetailsCollapse(
  contentRef,
  () => props.expand,
)

function formatPayload(value: unknown) {
  if (value === undefined) {
    return ''
  }

  if (typeof value === 'string') {
    try {
      return JSON.stringify(JSON.parse(value), null, 2)
    } catch {
      return value
    }
  }

  try {
    return JSON.stringify(value, null, 2) ?? ''
  } catch {
    return String(value)
  }
}
</script>

<template>
  <details
    data-tool-call
    class="pxd-tool-call w-full max-w-full"
    :class="{ 'rounded-xl border bg-background-100': variant === 'default' }"
    v-bind="$attrs"
    :open="detailsOpen"
    @toggle="onDetailsToggle"
  >
    <summary
      class="pxd-tool-call--trigger gap-2 text-sm flex w-full cursor-pointer touch-manipulation list-none appearance-none items-center self-focus-ring outline-none select-none"
      :class="{
        'p-3 font-medium text-foreground': variant === 'default',
        'text-foreground-secondary hover:text-foreground motion-safe:transition-colors':
          variant === 'simple',
      }"
      @click.prevent="onToggleClick"
    >
      <Component
        :is="STATUS_ICON[status]"
        class="size-3 shrink-0"
        :class="{ 'motion-safe:animate-spin': status === 'running' }"
      />

      <span class="pxd-tool-call--name min-w-0 truncate">
        {{ name }}
      </span>

      <ChevronRightIcon
        class="size-3 shrink-0 text-foreground-secondary motion-safe:transition-transform-opacity"
        :class="{
          'rotate-90 opacity-100': isOpen,
          'ml-auto': variant === 'default',
          'opacity-0 group-hover:opacity-100': variant === 'simple',
        }"
      />
    </summary>

    <div
      ref="contentRef"
      class="pxd-tool-call--content overflow-hidden"
      :class="{
        'border-t': variant === 'default',
        'ms-1.5 mbs-1.5 border-l': variant === 'simple',
        'motion-safe:transition-[height]': isOpen || isLeaving,
      }"
    >
      <div class="gap-4 p-3 flex flex-col">
        <div v-if="inputText" class="pxd-tool-call--section gap-2 flex flex-col">
          <div
            class="pxd-tool-call--label text-xs font-medium tracking-wide text-foreground-secondary uppercase"
          >
            {{ configProvider.locale.toolCall.input }}
          </div>
          <PCodeBlock
            class="pxd-tool-call--code bg-gray-100"
            :code="inputText"
            language="json"
            size="sm"
            copy-btn="hidden"
          />
        </div>

        <div v-if="outputText" class="pxd-tool-call--section gap-2 flex flex-col">
          <div
            class="pxd-tool-call--label text-xs font-medium tracking-wide text-foreground-secondary uppercase"
          >
            {{ configProvider.locale.toolCall.output }}
          </div>
          <PCodeBlock
            class="pxd-tool-call--code bg-gray-100"
            :code="outputText"
            language="json"
            size="sm"
            copy-btn="hidden"
          />
        </div>
      </div>
    </div>
  </details>
</template>

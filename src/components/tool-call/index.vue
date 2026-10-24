<script lang="ts" setup>
import type { ToolCallProps, ToolCallStatus } from './types'
import CheckCircleIcon from '@gdsicon/vue/check-circle'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import ClockIcon from '@gdsicon/vue/clock'
import CrossCircleIcon from '@gdsicon/vue/cross-circle'
import LoaderCircleIcon from '@gdsicon/vue/loader-circle'
import { computed, shallowRef } from 'vue'
import { useDetailsCollapse } from '../../composables/_internal/use-details-collapse.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { isNil } from '../../utils/is.ts'
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
  completed: CheckCircleIcon,
  error: CrossCircleIcon,
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
  if (isNil(value) || !value) {
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
    return JSON.stringify(value) ?? ''
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
        :class="{
          'text-red-900': status === 'error',
          'text-green-900': status === 'completed',
          'motion-safe:animate-spin text-blue-900': status === 'running',
        }"
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
            class="pxd-tool-call--code"
            :code="inputText"
            copy-btn="hidden"
            language="json"
            size="sm"
          />
        </div>

        <div v-if="outputText" class="pxd-tool-call--section gap-2 flex flex-col">
          <div
            class="pxd-tool-call--label text-xs font-medium tracking-wide text-foreground-secondary uppercase"
          >
            {{ configProvider.locale.toolCall.output }}
          </div>
          <PCodeBlock
            class="pxd-tool-call--code"
            :code="outputText"
            copy-btn="hidden"
            language="json"
            size="sm"
          />
        </div>
      </div>
    </div>
  </details>
</template>

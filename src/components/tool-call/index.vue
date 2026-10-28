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
import { isNil } from '../../utils/is.js'
import PCodeBlock from '../code-block/index.vue'

interface PayloadView {
  text: string
  isJson: boolean
}

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

const inputPayload = computed(() => formatPayload(props.input))
const outputPayload = computed(() => formatPayload(props.output))

const configProvider = useConfigProvider()

const { isOpen, detailsOpen, onToggleClick, onDetailsToggle } = useDetailsCollapse(
  contentRef,
  () => props.expand,
)

function formatPayload(value: unknown): PayloadView {
  if (isNil(value) || !value) {
    return { text: '', isJson: false }
  }

  const blockText = formatContentBlocks(value)

  if (blockText !== undefined) {
    return { text: blockText, isJson: false }
  }

  if (typeof value === 'string') {
    try {
      return { text: JSON.stringify(JSON.parse(value), null, 2), isJson: true }
    } catch {
      return { text: value, isJson: false }
    }
  }

  try {
    return { text: JSON.stringify(value, null, 2) ?? '', isJson: true }
  } catch {
    return { text: String(value), isJson: false }
  }
}

function formatContentBlocks(value: unknown): string | undefined {
  if (!Array.isArray(value)) {
    return undefined
  }

  const lines: string[] = []

  for (const item of value) {
    if (isTextBlock(item)) {
      lines.push(item.text)
    } else if (isImageBlock(item)) {
      lines.push('[image]')
    } else {
      return undefined
    }
  }

  return lines.length > 0 ? lines.join('\n') : undefined
}

function isTextBlock(value: unknown): value is { type: 'text'; text: string } {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const { type, text } = value as Record<string, unknown>

  return type === 'text' && typeof text === 'string'
}

function isImageBlock(value: unknown): value is { type: 'image' } {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  return (value as Record<string, unknown>).type === 'image'
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
      class="pxd-tool-call--trigger group gap-2 text-sm flex w-full cursor-pointer touch-manipulation list-none appearance-none items-center self-focus-ring outline-none select-none"
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

      <span class="pxd-tool-call--title min-w-0 truncate">
        {{ title }}
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
      class="grid-template-cols-1fr grid overflow-hidden motion-safe:transition-[grid-template-rows]"
      :class="isOpen ? 'grid-template-rows-1fr' : 'grid-template-rows-0fr'"
    >
      <div
        class="pxd-tool-call--content gap-4 flex flex-col"
        :class="{
          'p-3 border-t': variant === 'default',
          'ms-1.5 mbs-1.5 ps-3 py-1 border-l': variant === 'simple',
        }"
      >
        <div v-if="inputPayload.text" class="pxd-tool-call--section gap-2 flex flex-col">
          <div
            class="pxd-tool-call--label text-xs font-medium tracking-wide text-foreground-secondary uppercase"
          >
            {{ configProvider.locale.toolCall.input }}
          </div>
          <PCodeBlock
            class="pxd-tool-call--code"
            :code="inputPayload.text"
            :language="inputPayload.isJson ? 'json' : undefined"
            copy-btn="hidden"
            size="sm"
          />
        </div>

        <div v-if="outputPayload.text" class="pxd-tool-call--section gap-2 flex flex-col">
          <div
            class="pxd-tool-call--label text-xs font-medium tracking-wide text-foreground-secondary uppercase"
          >
            {{ configProvider.locale.toolCall.output }}
          </div>
          <PCodeBlock
            class="pxd-tool-call--code"
            :code="outputPayload.text"
            :language="outputPayload.isJson ? 'json' : undefined"
            copy-btn="hidden"
            size="sm"
          />
        </div>
      </div>
    </div>
  </details>
</template>

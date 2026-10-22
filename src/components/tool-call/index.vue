<script lang="ts" setup>
import type { ToolCallProps, ToolCallStatus } from './types'
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
import FunctionIcon from '@gdsicon/vue/function'
import { computed, shallowRef, watch } from 'vue'
import { useCollapseMotion } from '../../composables/_internal/use-collapse-motion.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import PBadge from '../badge/index.vue'

type JsonTokenType = 'key' | 'string' | 'number' | 'literal' | 'text'

interface JsonToken {
  type: JsonTokenType
  value: string
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

const STATUS_META: Record<
  ToolCallStatus,
  'green-subtle' | 'red-subtle' | 'blue-subtle' | 'gray-subtle'
> = {
  pending: 'gray-subtle',
  running: 'blue-subtle',
  completed: 'green-subtle',
  error: 'red-subtle',
}

const isOpen = shallowRef(props.expand)
const contentRef = shallowRef<HTMLElement>()
const inputText = computed(() => formatPayload(props.input))
const outputText = computed(() => formatPayload(props.output))
const inputTokens = computed(() => (inputText.value ? tokenizeJson(inputText.value) : []))
const outputTokens = computed(() => (outputText.value ? tokenizeJson(outputText.value) : []))

const configProvider = useConfigProvider()

const statusLabel = computed(() => configProvider.locale.toolCall[props.status])

const { detailsOpen, isLeaving, skipEnterMotion } = useCollapseMotion(contentRef, isOpen)

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
function tokenizeJson(source: string): JsonToken[] {
  const tokens: JsonToken[] = []
  const re =
    /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b|([^\s"]+)|(\s+)/g

  let match: RegExpExecArray | null

  while ((match = re.exec(source))) {
    const [, stringLiteral, keySuffix, numberLiteral, literal, punct, whitespace] = match

    if (stringLiteral) {
      tokens.push({
        type: keySuffix ? 'key' : 'string',
        value: keySuffix ? stringLiteral + keySuffix : stringLiteral,
      })
      continue
    }

    if (numberLiteral) {
      tokens.push({ type: 'number', value: numberLiteral })
      continue
    }

    if (literal) {
      tokens.push({ type: 'literal', value: literal })
      continue
    }

    tokens.push({ type: 'text', value: punct || whitespace || '' })
  }

  return tokens
}

function tokenClass(type: JsonTokenType) {
  switch (type) {
    case 'key':
      return 'text-blue-900'
    case 'string':
      return 'text-foreground'
    case 'number':
      return 'text-blue-700'
    case 'literal':
      return 'text-teal-900'
    default:
      return 'text-foreground-secondary'
  }
}

function onToggleClick() {
  isOpen.value = !isOpen.value
}

function onDetailsToggle(ev: Event) {
  const details = ev.currentTarget as HTMLDetailsElement

  if (details.open && !isOpen.value) {
    skipEnterMotion()
    isOpen.value = true
  }
}

// `expand` is a command: it applies whenever it changes, and the trigger stays free afterwards.
watch(
  () => props.expand,
  (expand) => {
    isOpen.value = expand
  },
)
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
      :class="variant === 'simple' ? '' : 'p-3 font-medium'"
      @click.prevent="onToggleClick"
    >
      <FunctionIcon class="size-3 shrink-0 text-foreground-secondary" />

      <span class="pxd-tool-call--name min-w-0 flex-1 truncate text-foreground">
        {{ name }}
      </span>

      <PBadge
        class="pxd-tool-call--status shrink-0"
        size="xs"
        shape="rounded"
        :variant="STATUS_META[status]"
      >
        {{ statusLabel }}
      </PBadge>

      <ChevronDownIcon
        class="size-3 shrink-0 text-foreground-secondary motion-safe:transition-transform"
        :class="{ '-rotate-180': isOpen }"
      />
    </summary>

    <div
      ref="contentRef"
      class="pxd-tool-call--content overflow-hidden"
      :class="{
        'border-t': variant === 'default',
        'ms-2 border-l': variant === 'simple',
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
          <pre
            class="pxd-tool-call--code m-0 p-3 text-xs leading-relaxed w-0 max-w-full min-w-full overflow-x-auto rounded-lg bg-gray-100 font-mono whitespace-pre"
          ><span
              v-for="(token, index) of inputTokens"
              :key="`input-${index}`"
              :class="tokenClass(token.type)"
            >{{ token.value }}</span></pre>
        </div>

        <div v-if="outputText" class="pxd-tool-call--section gap-2 flex flex-col">
          <div
            class="pxd-tool-call--label text-xs font-medium tracking-wide text-foreground-secondary uppercase"
          >
            {{ configProvider.locale.toolCall.output }}
          </div>
          <pre
            class="pxd-tool-call--code m-0 p-3 text-xs leading-relaxed w-0 max-w-full min-w-full overflow-x-auto rounded-lg bg-gray-100 font-mono whitespace-pre"
          ><span
              v-for="(token, index) of outputTokens"
              :key="`output-${index}`"
              :class="tokenClass(token.type)"
            >{{ token.value }}</span></pre>
        </div>
      </div>
    </div>
  </details>
</template>

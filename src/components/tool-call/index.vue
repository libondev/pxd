<script lang="ts" setup>
import type { ToolCallProps, ToolCallStatus } from './types'
import CheckCircleFillIcon from '@gdsicon/vue/check-circle-fill'
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
import ClockIcon from '@gdsicon/vue/clock'
import CrossCircleFillIcon from '@gdsicon/vue/cross-circle-fill'
import LoaderCircleIcon from '@gdsicon/vue/loader-circle'
import { computed, shallowRef } from 'vue'
import { useCollapseMotion } from '../../composables/_internal/use-collapse-motion.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import PBadge from '../badge/index.vue'

defineOptions({
  name: 'PToolCall',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ToolCallProps>(), {
  status: 'pending',
})

const isOpen = shallowRef(true)
const configProvider = useConfigProvider()
const { contentRef, detailsOpen, isLeaving, skipEnterMotion } = useCollapseMotion(isOpen)

const STATUS_META: Record<
  ToolCallStatus,
  {
    icon: typeof CheckCircleFillIcon
    iconClass: string
    badge: 'green-subtle' | 'red-subtle' | 'blue-subtle' | 'gray-subtle'
  }
> = {
  pending: {
    icon: ClockIcon,
    iconClass: 'text-foreground-secondary',
    badge: 'gray-subtle',
  },
  running: {
    icon: LoaderCircleIcon,
    iconClass: 'text-blue-900 motion-safe:animate-spin',
    badge: 'blue-subtle',
  },
  completed: {
    icon: CheckCircleFillIcon,
    iconClass: 'text-green-900',
    badge: 'green-subtle',
  },
  error: {
    icon: CrossCircleFillIcon,
    iconClass: 'text-red-900',
    badge: 'red-subtle',
  },
}

const statusMeta = computed(() => STATUS_META[props.status])
const statusLabel = computed(() => configProvider.locale.toolCall[props.status])

const inputText = computed(() => formatPayload(props.input))
const outputText = computed(() => formatPayload(props.output))
const inputTokens = computed(() => (inputText.value ? tokenizeJson(inputText.value) : []))
const outputTokens = computed(() => (outputText.value ? tokenizeJson(outputText.value) : []))

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

type JsonTokenType = 'key' | 'string' | 'number' | 'literal' | 'text'

interface JsonToken {
  type: JsonTokenType
  value: string
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
</script>

<template>
  <details
    class="pxd-tool-call w-full max-w-full overflow-hidden rounded-xl border bg-background-100"
    v-bind="$attrs"
    :open="detailsOpen"
    @toggle="onDetailsToggle"
  >
    <summary
      class="pxd-tool-call--trigger gap-2 px-4 py-3 text-sm flex w-full cursor-pointer touch-manipulation list-none appearance-none items-center self-focus-ring outline-none select-none"
      @click.prevent="onToggleClick"
    >
      <Component :is="statusMeta.icon" class="size-4 shrink-0" :class="statusMeta.iconClass" />

      <span class="pxd-tool-call--name min-w-0 font-medium flex-1 truncate text-foreground">
        {{ name }}
      </span>

      <PBadge
        class="pxd-tool-call--status shrink-0"
        size="sm"
        shape="rounded"
        :variant="statusMeta.badge"
      >
        {{ statusLabel }}
      </PBadge>

      <ChevronDownIcon
        class="size-4 shrink-0 text-foreground-secondary motion-safe:transition-transform"
        :class="{ '-rotate-180': isOpen }"
      />
    </summary>

    <div
      ref="contentRef"
      class="pxd-tool-call--content overflow-hidden"
      :class="{ 'motion-safe:transition-[height]': isOpen || isLeaving }"
    >
      <div class="gap-4 px-4 pb-4 flex flex-col">
        <div v-if="inputText" class="pxd-tool-call--section gap-2 flex flex-col">
          <div
            class="pxd-tool-call--label text-xs font-medium tracking-wide text-foreground-secondary uppercase"
          >
            {{ configProvider.locale.toolCall.input }}
          </div>
          <pre
            class="pxd-tool-call--code m-0 p-3 font-mono text-xs leading-relaxed max-w-full overflow-x-auto rounded-lg bg-gray-100 whitespace-pre"
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
            class="pxd-tool-call--code m-0 p-3 font-mono text-xs leading-relaxed max-w-full overflow-x-auto rounded-lg bg-gray-100 whitespace-pre"
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

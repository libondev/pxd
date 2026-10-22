<script lang="ts" setup>
import type { Reaction, ReactionsEmits, ReactionsProps } from './types'
import { computed, shallowRef } from 'vue'
import PPopover from '../popover/index.vue'

defineOptions({
  name: 'PReactions',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<ReactionsProps>(), {
  modelValue: () => [],
  emojis: () => ['👍', '❤️', '😂', '😮', '😢', '🙏'],
  trigger: 'click',
  position: 'top-start',
})

const emits = defineEmits<ReactionsEmits>()

const visible = shallowRef(false)

const reactions = computed(() => props.modelValue ?? [])

function commit(next: Reaction[], event: 'add' | 'remove', emoji: string) {
  if (event === 'add') {
    emits('add', emoji)
  } else {
    emits('remove', emoji)
  }

  emits('change', next)
  emits('update:modelValue', next)
}

function pick(emoji: string) {
  const current = reactions.value
  const existing = current.find((item) => item.emoji === emoji)

  visible.value = false

  if (existing?.mine) {
    return
  }

  commit(
    existing
      ? current.map((item) =>
          item.emoji === emoji ? { ...item, count: item.count + 1, mine: true } : item,
        )
      : [...current, { emoji, count: 1, mine: true }],
    'add',
    emoji,
  )
}

function toggle(emoji: string) {
  const current = reactions.value
  const existing = current.find((item) => item.emoji === emoji)

  if (!existing) {
    return
  }

  if (!existing.mine) {
    commit(
      current.map((item) =>
        item.emoji === emoji ? { ...item, count: item.count + 1, mine: true } : item,
      ),
      'add',
      emoji,
    )
    return
  }

  commit(
    existing.count > 1
      ? current.map((item) =>
          item.emoji === emoji ? { ...item, count: item.count - 1, mine: false } : item,
        )
      : current.filter((item) => item.emoji !== emoji),
    'remove',
    emoji,
  )
}
</script>

<template>
  <PPopover
    data-reactions
    v-model="visible"
    class="pxd-reactions flex-col items-start"
    :trigger="trigger"
    :position="position"
    :disabled="disabled"
    :fill-trigger-width="false"
    v-bind="$attrs"
  >
    <slot />

    <div
      v-if="reactions.length"
      data-popover-ignore
      class="pxd-reactions--chips mbs-1 gap-1 flex flex-wrap items-center"
    >
      <button
        v-for="item in reactions"
        :key="item.emoji"
        type="button"
        :data-emoji="item.emoji"
        :data-mine="item.mine || undefined"
        :aria-pressed="item.mine ? 'true' : 'false'"
        :aria-label="`${item.emoji} ${item.count}`"
        :disabled="disabled"
        class="pxd-reactions--chip ps-1.5 pe-2 h-6 gap-1 text-xs inline-flex shrink-0 cursor-pointer appearance-none items-center rounded-full border bg-background-100 text-foreground-secondary self-focus-ring outline-none hover:bg-background-hover disabled:cursor-not-allowed disabled:opacity-50 data-[mine=true]:border-primary data-[mine=true]:bg-gray-200 data-[mine=true]:text-foreground motion-safe:transition-colors"
        @click="toggle(item.emoji)"
      >
        <span aria-hidden="true">{{ item.emoji }}</span>
        <span class="tabular-nums">{{ item.count }}</span>
      </button>
    </div>

    <template #content>
      <div
        role="group"
        aria-label="Add a reaction"
        class="pxd-reactions--picker p-1 gap-0.5 shadow-lg flex items-center rounded-lg border border-gray-alpha-300 bg-background-100"
      >
        <button
          v-for="emoji in emojis"
          :key="emoji"
          type="button"
          :aria-label="emoji"
          class="size-8 p-0 text-base inline-flex cursor-pointer appearance-none items-center justify-center rounded-md border-0 bg-transparent font-inherit leading-none self-focus-ring outline-none hover:bg-background-hover motion-safe:transition-colors"
          @click="pick(emoji)"
        >
          {{ emoji }}
        </button>
      </div>
    </template>
  </PPopover>
</template>
